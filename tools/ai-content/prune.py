#!/usr/bin/env python3
"""Prune fully-translated prefixes from js/i18n-exclusions.js.

For each prefix in PARITY_EXCLUDE_PREFIXES, check whether every ES key with
that prefix exists in en/fr/pt/de. If yes, the prefix is "settled" — strip
its line from the exclusions module so the i18n-coverage test starts
enforcing parity for those keys and the admin coverage panel reflects
reality.

Stale prefixes (zero matching ES keys) are also pruned — they were tracking
keys that no longer exist.

Idempotent: prints "No prefixes to prune." when run twice in a row. Designed
to be a workflow step right after `translate` so the auto chain converges.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
EXCLUSIONS_JS = ROOT / "js" / "i18n-exclusions.js"
I18N_DIR = ROOT / "i18n"
TARGET_LANGS = ("en", "fr", "pt", "de")

_BLOCK_RE = re.compile(
    r"export\s+const\s+PARITY_EXCLUDE_PREFIXES\s*=\s*\[(.*?)\];",
    re.DOTALL,
)
_ITEM_RE = re.compile(r"['\"]([^'\"]+)['\"]")


def load_lang(lang: str) -> dict:
    return json.loads((I18N_DIR / f"{lang}.json").read_text(encoding="utf-8"))


def settled_prefixes(prefixes: list[str], es: dict, targets: list[dict]) -> list[str]:
    """Return prefixes that are either fully translated in all targets, or
    no longer match any ES key (stale)."""
    out: list[str] = []
    for p in prefixes:
        keys = [k for k in es if k.startswith(p)]
        if not keys:
            # Stale entry — nothing in ES matches it any more.
            out.append(p)
            continue
        if all(all(k in t for k in keys) for t in targets):
            out.append(p)
    return out


def remove_prefix_line(text: str, prefix: str) -> tuple[str, bool]:
    """Delete the first line that contains `'<prefix>'` (with optional
    trailing comma + comment). Returns (new_text, removed?)."""
    pattern = re.compile(
        r"^[^\S\n]*['\"]" + re.escape(prefix) + r"['\"]\s*,?[^\n]*\n",
        re.MULTILINE,
    )
    new_text, n = pattern.subn("", text, count=1)
    return new_text, n > 0


def main() -> int:
    text = EXCLUSIONS_JS.read_text(encoding="utf-8")
    block = _BLOCK_RE.search(text)
    if not block:
        print(
            f"PARITY_EXCLUDE_PREFIXES export not found in {EXCLUSIONS_JS}",
            file=sys.stderr,
        )
        return 1
    prefixes = _ITEM_RE.findall(block.group(1))
    if not prefixes:
        print("Exclusion list already empty.")
        return 0

    es = load_lang("es")
    targets = [load_lang(lang) for lang in TARGET_LANGS]
    settled = settled_prefixes(prefixes, es, targets)
    if not settled:
        print("No prefixes to prune.")
        return 0

    new_text = text
    removed: list[str] = []
    for p in settled:
        new_text, ok = remove_prefix_line(new_text, p)
        if ok:
            removed.append(p)
        else:
            print(f"Warning: could not locate line for prefix {p!r}", file=sys.stderr)

    if not removed:
        print("Nothing was actually removed (regex didn't match — formatting drift?)")
        return 0

    EXCLUSIONS_JS.write_text(new_text, encoding="utf-8")
    print(f"Pruned {len(removed)} prefix(es):")
    for p in removed:
        print(f"  - {p}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
