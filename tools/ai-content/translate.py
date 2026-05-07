"""`translate` mode — fill missing i18n keys in EN/FR/PT/DE from ES.

Workflow:
  1. Determine which keys to translate. The user can pass an explicit `--scope`
     prefix (e.g. `wiki.art.liqueurs.`); otherwise we use the union of every
     entry in `PARITY_EXCLUDE_PREFIXES` from tests/i18n-coverage.test.js.
  2. For each target language, find which scoped keys are missing.
  3. Batch them (default 25) and call Groq once per batch with a JSON-mode
     prompt. Validate that every requested key comes back.
  4. Merge into the language file via i18n_io.merge_translations (append-only,
     preserves existing key order so diffs stay minimal).
  5. Print a summary with usage tally.

Dry-run mode prints the plan and a sample output without writing files.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from rich.console import Console
from rich.table import Table

from groq_client import GroqClient
from i18n_io import (
    I18N_DIR,
    SOURCE_LANG,
    TARGET_LANGS,
    keys_matching,
    load_i18n,
    merge_translations,
    parse_parity_exclusions,
    write_i18n,
)

DEFAULT_BATCH_SIZE = 25
PROMPT_TEMPLATE = (Path(__file__).resolve().parent / "prompts" / "translate.txt").read_text()

LANG_NAMES = {
    "en": "English",
    "fr": "French",
    "pt": "Portuguese",
    "de": "German",
}

logger = logging.getLogger("stirio.ai.translate")
console = Console()


@dataclass
class TranslateOptions:
    scopes: tuple[str, ...]
    target_langs: tuple[str, ...]
    batch_size: int = DEFAULT_BATCH_SIZE
    dry_run: bool = False
    limit: int | None = None  # cap keys per language, useful for smoke tests


def _batched(items: list[str], size: int) -> Iterable[list[str]]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


def _translate_batch(
    client: GroqClient,
    target_lang: str,
    payload: dict[str, str],
) -> dict[str, str]:
    """Call Groq once with `payload` and return the translated mapping.

    Raises if Groq omits keys or returns non-string values — the caller treats
    that as a per-batch failure and skips it (preserving the rest of the run).
    """
    system = (
        PROMPT_TEMPLATE
        .replace("{{TARGET_LANG_CODE}}", target_lang)
        .replace("{{TARGET_LANG_NAME}}", LANG_NAMES[target_lang])
    )
    import json as _json
    user = _json.dumps(payload, ensure_ascii=False, indent=2)
    response = client.chat_json(system=system, user=user)
    missing = [k for k in payload if k not in response]
    if missing:
        raise RuntimeError(
            f"Groq omitted {len(missing)} keys from response (lang={target_lang}). "
            f"First missing: {missing[:3]}"
        )
    bad = [k for k, v in response.items() if not isinstance(v, str) or not v.strip()]
    if bad:
        raise RuntimeError(
            f"Groq returned empty / non-string values for keys (lang={target_lang}): {bad[:3]}"
        )
    # Drop any extra keys Groq invented.
    return {k: response[k] for k in payload}


def run(opts: TranslateOptions) -> int:
    """Execute the translate mode. Returns process exit code."""
    es = load_i18n(SOURCE_LANG)
    if opts.scopes:
        scopes = opts.scopes
    else:
        scopes = tuple(parse_parity_exclusions())
        console.log(
            f"[dim]No --scope given; using {len(scopes)} prefixes from "
            "PARITY_EXCLUDE_PREFIXES in i18n-coverage.test.js[/dim]"
        )

    candidate_keys = keys_matching(es, scopes)
    if not candidate_keys:
        console.print(
            f"[yellow]No ES keys match the given scopes: {scopes}[/yellow]"
        )
        return 0

    table = Table(title="Translate plan", show_header=True)
    table.add_column("lang")
    table.add_column("missing", justify="right")
    table.add_column("batches", justify="right")

    plan: dict[str, list[str]] = {}
    for lang in opts.target_langs:
        existing = load_i18n(lang)
        missing = [k for k in candidate_keys if k not in existing]
        if opts.limit:
            missing = missing[: opts.limit]
        plan[lang] = missing
        n_batches = (len(missing) + opts.batch_size - 1) // opts.batch_size
        table.add_row(lang, str(len(missing)), str(n_batches))

    console.print(table)

    if opts.dry_run:
        console.print("[cyan]Dry-run: no API calls or file writes.[/cyan]")
        return 0

    if not any(plan.values()):
        console.print("[green]Nothing to translate — every target lang is up to date.[/green]")
        return 0

    client = GroqClient()
    failed_batches: list[tuple[str, int]] = []

    for lang, keys in plan.items():
        if not keys:
            continue
        existing = load_i18n(lang)
        for batch_idx, batch_keys in enumerate(_batched(keys, opts.batch_size)):
            payload = {k: es[k] for k in batch_keys}
            try:
                translated = _translate_batch(client, lang, payload)
            except Exception as exc:  # noqa: BLE001 — we want to skip + continue
                logger.warning(
                    "lang=%s batch=%d failed: %s", lang, batch_idx, exc
                )
                failed_batches.append((lang, batch_idx))
                continue
            existing = merge_translations(existing, translated)
            console.log(
                f"[green]+{len(translated)}[/green] {lang} "
                f"(batch {batch_idx + 1})"
            )
        write_i18n(lang, existing)

    console.print(
        f"\n[bold]Done.[/bold] Requests: {client.usage.requests} "
        f"Tokens in/out: {client.usage.prompt_tokens}/{client.usage.completion_tokens}"
    )
    if failed_batches:
        console.print(
            f"[red]{len(failed_batches)} batch(es) failed; rerun to retry just the misses.[/red]"
        )
        return 1
    return 0
