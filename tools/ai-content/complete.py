"""`complete` mode — generate ES content for empty wiki stubs.

Workflow:
  1. Parse `js/wiki-data.js` to enumerate every (category, article_id) pair
     that the encyclopedia *expects* to render.
  2. For each pair, count matching keys in `i18n/es.json`. Articles with zero
     keys are "stubs" — they appear in WIKI_CATEGORIES but the wiki UI
     renders an empty card.
  3. For each stub, call Groq with the category + article_id and 1-2 sibling
     articles from the same category as few-shot. Ask for a JSON object
     keyed by section name.
  4. Validate, then merge into `i18n/es.json` (append-only — never overwrites).
  5. Emit a markdown report at reports/complete-<utc>.md.

The companion `translate` mode picks up the new ES keys on its next run, so
the recommended flow is: `complete` first, manually sample the generated
content, then `translate` to propagate to EN/FR/PT/DE.
"""

from __future__ import annotations

import datetime as dt
import json
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path

from rich.console import Console
from rich.table import Table

from groq_client import GroqClient
from i18n_io import (
    I18N_DIR,
    SOURCE_LANG,
    load_i18n,
    merge_translations,
    write_i18n,
)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
WIKI_DATA = REPO_ROOT / "js" / "wiki-data.js"
PROMPT_TEMPLATE = (Path(__file__).resolve().parent / "prompts" / "complete.txt").read_text()
REPORTS_DIR = Path(__file__).resolve().parent / "reports"

# Default sections per category. The model gets `sections_needed` so it knows
# exactly what to produce; categories where origin/production make no sense
# (e.g. techniques) just don't list those.
SECTIONS_BY_CATEGORY = {
    "spirits":    ["description", "history", "when_to_use", "how", "tips", "origin", "production", "sub"],
    "liqueurs":   ["description", "history", "production", "tips", "sub"],
    "amaros":     ["description", "history", "production", "tips", "sub"],
    "wines":      ["description", "history", "origin", "production", "sub"],
    "techniques": ["description", "when_to_use", "how", "tips", "history", "sub"],
    "tools":      ["description", "when_to_use", "how", "tips", "sub"],
    "history":    ["description", "sub"],
    "mixers":     ["description", "production", "tips", "sub"],
    "cocktails":  ["description", "history", "origin", "how", "tips", "sub"],
}
FALLBACK_SECTIONS = ["description", "history", "tips", "sub"]
FEW_SHOT_LIMIT = 2

logger = logging.getLogger("stirio.ai.complete")
console = Console()


@dataclass
class CompleteOptions:
    categories: tuple[str, ...] = ()  # empty = all categories
    dry_run: bool = False
    limit: int | None = None
    model: str | None = None
    out: Path | None = None


@dataclass
class Stub:
    category: str
    article_id: str
    sections_needed: list[str]
    generated: dict[str, str] = field(default_factory=dict)
    error: str | None = None


# ────────────────── wiki-data.js parsing ──────────────────

# A category block begins with `{ id: 'cat', ` and contains `articles: [ ... ]`.
# We balance brackets manually because nested arrays don't play well with greedy
# regex, but the file has no comments inside literals so simple bracket-counting
# works.
_CAT_HEADER_RE = re.compile(r"\{\s*id:\s*['\"]([^'\"]+)['\"]")
_ARTICLE_ID_RE = re.compile(r"\bid:\s*['\"]([^'\"]+)['\"]")


def parse_wiki_categories(text: str) -> list[tuple[str, list[str]]]:
    """Return [(category_id, [article_id, ...]), ...] in source order."""
    out: list[tuple[str, list[str]]] = []
    pos = 0
    while True:
        m = _CAT_HEADER_RE.search(text, pos)
        if not m:
            break
        cat = m.group(1)
        # Skip any 'id' that looks like an article (parent already consumed).
        # Categories are always followed by an `articles: [` chunk further down.
        articles_idx = text.find("articles:", m.end())
        if articles_idx == -1:
            pos = m.end()
            continue
        bracket_open = text.find("[", articles_idx)
        if bracket_open == -1:
            pos = m.end()
            continue
        depth = 1
        i = bracket_open + 1
        while i < len(text) and depth > 0:
            c = text[i]
            if c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
            i += 1
        body = text[bracket_open + 1 : i - 1]
        article_ids = _ARTICLE_ID_RE.findall(body)
        # First match-of-id-in-cat-header is the category itself, but we matched
        # via _CAT_HEADER_RE so we already have it. The block we just read is
        # only the articles array — every id here is an article.
        if article_ids:
            out.append((cat, article_ids))
        pos = i
    return out


# ────────────────── stub detection ──────────────────


def detect_stubs(es: dict[str, str], categories: list[tuple[str, list[str]]]) -> list[Stub]:
    """Return articles that have ZERO matching es.json keys."""
    stubs: list[Stub] = []
    for cat, articles in categories:
        sections = SECTIONS_BY_CATEGORY.get(cat, FALLBACK_SECTIONS)
        for art in articles:
            prefix = f"wiki.art.{cat}.{art}."
            if any(k.startswith(prefix) for k in es):
                continue
            stubs.append(Stub(category=cat, article_id=art, sections_needed=list(sections)))
    return stubs


def gather_few_shot(es: dict[str, str], category: str, exclude_ids: set[str]) -> list[dict]:
    """Pick up to FEW_SHOT_LIMIT existing articles in `category` to seed the prompt."""
    by_article: dict[str, dict[str, str]] = {}
    prefix = f"wiki.art.{category}."
    for k, v in es.items():
        if not k.startswith(prefix):
            continue
        rest = k[len(prefix):]
        if "." not in rest:
            continue
        art_id, section = rest.split(".", 1)
        if art_id in exclude_ids:
            continue
        # Only use articles that have a description — they're the most useful as style anchors.
        by_article.setdefault(art_id, {})[section] = v

    examples = [
        {"article_id": aid, "sections": secs}
        for aid, secs in by_article.items()
        if "description" in secs
    ]
    examples.sort(key=lambda e: len(e["sections"]), reverse=True)
    return examples[:FEW_SHOT_LIMIT]


# ────────────────── generation ──────────────────


def _generate_one(client: GroqClient, stub: Stub, examples: list[dict]) -> None:
    payload = {
        "category": stub.category,
        "article_id": stub.article_id,
        "sections_needed": stub.sections_needed,
        "examples": examples,
    }
    user = json.dumps(payload, ensure_ascii=False, indent=2)
    try:
        response = client.chat_json(system=PROMPT_TEMPLATE, user=user)
    except Exception as exc:  # noqa: BLE001
        stub.error = str(exc)
        return
    if not isinstance(response, dict):
        stub.error = f"Expected dict, got {type(response).__name__}"
        return
    cleaned: dict[str, str] = {}
    missing: list[str] = []
    for section in stub.sections_needed:
        val = response.get(section)
        if not isinstance(val, str) or not val.strip():
            missing.append(section)
            continue
        cleaned[section] = val.strip()
    # Tolerate one missing section (often `origin` doesn't fit niche items).
    # Beyond that the run is too lossy to keep.
    if len(missing) > 1:
        stub.error = f"missing sections: {missing}"
        return
    stub.generated = cleaned


def _flatten_to_i18n(stub: Stub) -> dict[str, str]:
    return {
        f"wiki.art.{stub.category}.{stub.article_id}.{section}": text
        for section, text in stub.generated.items()
    }


def _render_report(stubs: list[Stub], header_meta: dict) -> str:
    lines = [f"# Stirio complete — {header_meta['timestamp']}", ""]
    lines.append(f"Categories: `{header_meta['categories']}`")
    lines.append(f"Model: `{header_meta['model']}`")
    lines.append(
        f"Stubs detected: {header_meta['stubs_total']} · generated: "
        f"{header_meta['stubs_generated']} · errored: {header_meta['stubs_errored']}"
    )
    lines.append(f"Tokens in/out: {header_meta['tokens']}")
    lines.append("")

    if header_meta["stubs_total"] == 0:
        lines.append("_No stubs found. Every article in `wiki-data.js` already has ES content._")
        return "\n".join(lines)

    by_cat: dict[str, list[Stub]] = {}
    for s in stubs:
        by_cat.setdefault(s.category, []).append(s)
    for cat, items in sorted(by_cat.items()):
        lines.append(f"## {cat}")
        lines.append("")
        for s in items:
            badge = "✅" if s.generated and not s.error else "⚠️"
            label = ", ".join(sorted(s.generated.keys())) or "(none)"
            lines.append(f"- {badge} `{s.article_id}` — sections: {label}")
            if s.error:
                lines.append(f"    - error: {s.error}")
        lines.append("")

    lines.append("---")
    lines.append("Apply downstream: run `python cli.py translate` to propagate the new ES keys to EN/FR/PT/DE.")
    return "\n".join(lines)


# ────────────────── orchestrator ──────────────────


def run(opts: CompleteOptions) -> int:
    es = load_i18n(SOURCE_LANG)
    text = WIKI_DATA.read_text(encoding="utf-8")
    categories = parse_wiki_categories(text)
    if not categories:
        console.print("[red]Could not parse wiki-data.js — check the file format.[/red]")
        return 1

    if opts.categories:
        cat_filter = set(opts.categories)
        categories = [c for c in categories if c[0] in cat_filter]

    stubs = detect_stubs(es, categories)
    if opts.limit:
        stubs = stubs[: opts.limit]

    table = Table(title="Complete plan", show_header=True)
    table.add_column("category")
    table.add_column("articles total", justify="right")
    table.add_column("stubs", justify="right")
    by_cat_count: dict[str, list[int]] = {}
    for c, arts in categories:
        by_cat_count[c] = [len(arts), 0]
    for s in stubs:
        by_cat_count[s.category][1] += 1
    for c, (total, n_stubs) in by_cat_count.items():
        table.add_row(c, str(total), str(n_stubs))
    console.print(table)

    if not stubs:
        console.print("[green]No stubs detected — nothing to generate.[/green]")
        return 0

    if opts.dry_run:
        console.print("[cyan]Dry-run: no API calls or file writes.[/cyan]")
        return 0

    client = GroqClient(model=opts.model) if opts.model else GroqClient()
    console.log(f"[dim]Generating with {client.model}…[/dim]")

    for idx, stub in enumerate(stubs, 1):
        examples = gather_few_shot(es, stub.category, exclude_ids={stub.article_id})
        _generate_one(client, stub, examples)
        if stub.error:
            console.log(f"[red]✗[/red] {stub.category}/{stub.article_id}: {stub.error}")
        else:
            sec_count = len(stub.generated)
            console.log(
                f"[green]✓[/green] {stub.category}/{stub.article_id} "
                f"({sec_count} sections)  [{idx}/{len(stubs)}]"
            )

    # Merge generated keys into es.json (append-only).
    new_keys: dict[str, str] = {}
    for s in stubs:
        if s.generated and not s.error:
            new_keys.update(_flatten_to_i18n(s))
    if new_keys:
        merged = merge_translations(es, new_keys)
        write_i18n(SOURCE_LANG, merged)
        console.print(f"[green]+{len(new_keys)} keys[/green] appended to i18n/es.json")
    else:
        console.print("[yellow]No keys generated successfully — i18n/es.json unchanged.[/yellow]")

    sev_meta = {
        "stubs_generated": sum(1 for s in stubs if s.generated and not s.error),
        "stubs_errored": sum(1 for s in stubs if s.error),
    }
    header_meta = {
        "timestamp": dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ"),
        "categories": ", ".join(opts.categories) or "(all)",
        "model": client.model,
        "stubs_total": len(stubs),
        "tokens": f"{client.usage.prompt_tokens}/{client.usage.completion_tokens}",
        **sev_meta,
    }
    report = _render_report(stubs, header_meta)
    out_path = opts.out or (
        REPORTS_DIR / f"complete-{dt.datetime.utcnow().strftime('%Y%m%dT%H%MZ')}.md"
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(report, encoding="utf-8")
    console.print(f"Report → [cyan]{out_path}[/cyan]")
    return 0 if not sev_meta["stubs_errored"] else 1
