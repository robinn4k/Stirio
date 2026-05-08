"""`review` mode — fact-check / consistency review of ES content.

Workflow:
  1. Group ES keys under `wiki.art.{cat}.{id}.{section}` (and similar
     prefix-shaped bundles like `wiki.brand.{id}.{section}`) into "articles".
  2. For each article, send the bundle to Groq with the review prompt and
     parse the returned JSON `{issues: [{severity, section, problem, suggestion}]}`.
  3. Emit a markdown report at `reports/review-YYYYMMDDTHHMM.md` summarising
     all issues, sorted by severity. Never modifies i18n.

Default model is `llama-3.3-70b-versatile` because the task is reasoning-heavy
and the volume is low (a single review pass is dozens of articles, not
thousands of small strings). Override with `--model`.
"""

from __future__ import annotations

import datetime as dt
import json
import logging
import re
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

from rich.console import Console
from rich.table import Table

from groq_client import GroqClient
from i18n_io import SOURCE_LANG, keys_matching, load_i18n, parse_parity_exclusions

REVIEW_MODEL = "llama-3.3-70b-versatile"
REPORTS_DIR = Path(__file__).resolve().parent / "reports"
PROMPT_TEMPLATE = (Path(__file__).resolve().parent / "prompts" / "review.txt").read_text()
SEVERITY_ORDER = {"high": 0, "medium": 1, "low": 2}

# Match e.g. `wiki.art.spirits.gin.description` → article id "wiki.art.spirits.gin",
# section "description". Also handles `wiki.brand.tanqueray-london-dry.tasting`.
_ARTICLE_RE = re.compile(r"^(wiki\.(?:art\.[^.]+\.[^.]+|brand\.[^.]+))\.([^.]+)$")

logger = logging.getLogger("stirio.ai.review")
console = Console()


@dataclass
class ReviewOptions:
    scopes: tuple[str, ...]
    dry_run: bool = False
    limit: int | None = None  # cap articles, useful for smoke tests
    model: str | None = None
    out: Path | None = None  # custom report path; default reports/review-<ts>.md


@dataclass
class Issue:
    severity: str
    section: str
    problem: str
    suggestion: str


@dataclass
class ArticleReview:
    article_id: str  # e.g. "wiki.art.spirits.gin"
    sections: dict[str, str] = field(default_factory=dict)
    issues: list[Issue] = field(default_factory=list)
    error: str | None = None


def _bundle_articles(es: dict[str, str], scoped_keys: list[str]) -> list[ArticleReview]:
    """Group ES keys into per-article bundles via _ARTICLE_RE."""
    by_article: dict[str, dict[str, str]] = defaultdict(dict)
    for k in scoped_keys:
        m = _ARTICLE_RE.match(k)
        if not m:
            # Outside the article-shaped namespace (e.g. wiki.map.*, knowledge.*).
            # Skip — review is article-centric. translate handles those.
            continue
        article_id, section = m.group(1), m.group(2)
        by_article[article_id][section] = es[k]
    return [
        ArticleReview(article_id=aid, sections=secs)
        for aid, secs in sorted(by_article.items())
    ]


def _review_article(client: GroqClient, article: ArticleReview) -> None:
    """Mutates `article.issues` / `article.error` based on the model's response."""
    user_payload = {
        "article_id": article.article_id,
        "sections": article.sections,
    }
    user = json.dumps(user_payload, ensure_ascii=False, indent=2)
    try:
        response = client.chat_json(system=PROMPT_TEMPLATE, user=user)
    except Exception as exc:  # noqa: BLE001 — record + continue on failure
        article.error = str(exc)
        return
    raw_issues = response.get("issues", [])
    if not isinstance(raw_issues, list):
        article.error = f"Expected list of issues, got {type(raw_issues).__name__}"
        return
    for raw in raw_issues:
        if not isinstance(raw, dict):
            continue
        sev = (raw.get("severity") or "low").lower()
        if sev not in SEVERITY_ORDER:
            sev = "low"
        article.issues.append(
            Issue(
                severity=sev,
                section=str(raw.get("section") or ""),
                problem=str(raw.get("problem") or "").strip(),
                suggestion=str(raw.get("suggestion") or "").strip(),
            )
        )


def _render_report(articles: list[ArticleReview], header_meta: dict) -> str:
    """Render a markdown report. One section per article that had findings."""
    lines: list[str] = []
    lines.append(f"# Stirio review — {header_meta['timestamp']}")
    lines.append("")
    lines.append(f"Scope: `{header_meta['scope']}`")
    lines.append(f"Model: `{header_meta['model']}`")
    lines.append(
        f"Articles reviewed: {header_meta['articles_total']}, "
        f"with findings: {header_meta['articles_with_issues']}, "
        f"errored: {header_meta['articles_errored']}"
    )
    lines.append(
        f"Issues by severity — high: {header_meta['high']}, "
        f"medium: {header_meta['medium']}, low: {header_meta['low']}"
    )
    lines.append("")
    lines.append("---")
    lines.append("")

    # High → medium → low across the whole report; within a severity, group by article.
    flat: list[tuple[ArticleReview, Issue]] = [
        (a, i) for a in articles for i in a.issues
    ]
    flat.sort(key=lambda pair: (SEVERITY_ORDER[pair[1].severity], pair[0].article_id))

    if not flat:
        lines.append("_No issues found in this scope. Either the content is solid or the scope was too narrow — try widening it._")
    else:
        last_article = None
        for article, issue in flat:
            if article.article_id != last_article:
                lines.append(f"## `{article.article_id}`")
                lines.append("")
                last_article = article.article_id
            badge = {"high": "🔴", "medium": "🟡", "low": "🟢"}[issue.severity]
            lines.append(f"- {badge} **{issue.severity.upper()}** · `{issue.section}` — {issue.problem}")
            if issue.suggestion:
                lines.append(f"    - Sugerencia: {issue.suggestion}")
        lines.append("")

    errored = [a for a in articles if a.error]
    if errored:
        lines.append("## Errores de revisión")
        lines.append("")
        for a in errored:
            lines.append(f"- `{a.article_id}` — {a.error}")
        lines.append("")

    lines.append("---")
    lines.append(f"Generado por `tools/ai-content/cli.py review`. Tokens in/out: {header_meta['tokens']}.")
    lines.append("")
    return "\n".join(lines)


def run(opts: ReviewOptions) -> int:
    es = load_i18n(SOURCE_LANG)
    scopes = opts.scopes if opts.scopes else tuple(parse_parity_exclusions())
    if not opts.scopes:
        console.log(
            f"[dim]No --scope given; defaulting to {len(scopes)} prefixes from "
            "PARITY_EXCLUDE_PREFIXES (the bits we already know are pending).[/dim]"
        )
    scoped_keys = keys_matching(es, scopes)
    articles = _bundle_articles(es, scoped_keys)
    if opts.limit:
        articles = articles[: opts.limit]

    table = Table(title="Review plan", show_header=True)
    table.add_column("scope")
    table.add_column("articles", justify="right")
    table.add_column("sections (avg)", justify="right")
    avg_sections = (
        round(sum(len(a.sections) for a in articles) / len(articles), 1)
        if articles else 0
    )
    table.add_row(", ".join(scopes), str(len(articles)), str(avg_sections))
    console.print(table)

    if not articles:
        console.print("[yellow]No article-shaped keys in scope. (Review skips wiki.map.*, knowledge.*, etc.)[/yellow]")
        return 0

    if opts.dry_run:
        console.print("[cyan]Dry-run: no API calls or report written.[/cyan]")
        return 0

    client = GroqClient(model=opts.model or REVIEW_MODEL)
    console.log(f"[dim]Reviewing with {client.model}…[/dim]")
    for idx, article in enumerate(articles, 1):
        _review_article(client, article)
        flagged = len(article.issues)
        suffix = f" ({flagged} issue{'s' if flagged != 1 else ''})" if flagged else ""
        if article.error:
            console.log(f"[red]✗[/red] {article.article_id}: {article.error}")
        else:
            console.log(f"[green]✓[/green] {article.article_id}{suffix}  [{idx}/{len(articles)}]")

    sev_counts = {"high": 0, "medium": 0, "low": 0}
    for a in articles:
        for i in a.issues:
            sev_counts[i.severity] += 1
    header_meta = {
        "timestamp": dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ"),
        "scope": ", ".join(scopes) or "(default exclusion list)",
        "model": client.model,
        "articles_total": len(articles),
        "articles_with_issues": sum(1 for a in articles if a.issues),
        "articles_errored": sum(1 for a in articles if a.error),
        "tokens": f"{client.usage.prompt_tokens}/{client.usage.completion_tokens}",
        **sev_counts,
    }
    report = _render_report(articles, header_meta)

    out_path = opts.out or (
        REPORTS_DIR
        / f"review-{dt.datetime.utcnow().strftime('%Y%m%dT%H%MZ')}.md"
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(report, encoding="utf-8")
    console.print(
        f"\n[bold]Done.[/bold] Report → [cyan]{out_path}[/cyan]\n"
        f"Issues: {sev_counts['high']} high · {sev_counts['medium']} medium · {sev_counts['low']} low"
    )
    return 0
