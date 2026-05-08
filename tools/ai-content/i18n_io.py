"""i18n JSON loading + parity-exclusion parsing.

Encapsulates the only two read concerns the CLI has:
  1. Read i18n/{lang}.json preserving key order so writes are minimal-diff.
  2. Parse `PARITY_EXCLUDE_PREFIXES` out of js/i18n-exclusions.js so
     translate.py knows which key prefixes are still ES-only debt. The
     same module is imported by tests/i18n-coverage.test.js (Vitest) and
     loaded at runtime by js/screens/Admin.jsx — single source of truth.

We parse the JS file with a deliberately narrow regex instead of importing
a JS engine — the file shape has been stable for months and the test would
catch a parser drift immediately.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Iterable

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
I18N_DIR = REPO_ROOT / "i18n"
EXCLUSIONS_JS = REPO_ROOT / "js" / "i18n-exclusions.js"

LANGS = ("es", "en", "fr", "pt", "de")
SOURCE_LANG = "es"
TARGET_LANGS = ("en", "fr", "pt", "de")


def load_i18n(lang: str) -> dict[str, str]:
    """Read i18n/{lang}.json. Preserves insertion order via Python 3.7+ dict."""
    path = I18N_DIR / f"{lang}.json"
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def write_i18n(lang: str, data: dict[str, str]) -> None:
    """Write i18n/{lang}.json with the project's house style.

    Stirio's i18n files are JSON with 2-space indent + trailing newline. The
    existing files are NOT alphabetically sorted (they reflect organic
    insertion order over time and the order doesn't even mirror es.json), so
    we preserve `data`'s insertion order verbatim. Callers should append new
    keys at the end via `merge_translations` to keep diffs minimal.
    """
    path = I18N_DIR / f"{lang}.json"
    with path.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def merge_translations(
    existing: dict[str, str],
    new: dict[str, str],
) -> dict[str, str]:
    """Append `new` keys to `existing`, skipping any already present.

    Returns a NEW dict with insertion order = existing keys (in their original
    order) followed by net-new keys (in `new`'s order). Never overwrites an
    existing translation — the caller is responsible for explicitly removing
    a key if they want it regenerated.
    """
    merged = dict(existing)
    for k, v in new.items():
        if k not in merged:
            merged[k] = v
    return merged


_PREFIX_BLOCK_RE = re.compile(
    r"export\s+const\s+PARITY_EXCLUDE_PREFIXES\s*=\s*\[(.*?)\];",
    re.DOTALL,
)
_PREFIX_ITEM_RE = re.compile(r"['\"]([^'\"]+)['\"]")


def parse_parity_exclusions() -> list[str]:
    """Extract the PARITY_EXCLUDE_PREFIXES list from js/i18n-exclusions.js."""
    text = EXCLUSIONS_JS.read_text(encoding="utf-8")
    block_match = _PREFIX_BLOCK_RE.search(text)
    if not block_match:
        raise RuntimeError(
            f"PARITY_EXCLUDE_PREFIXES export not found in {EXCLUSIONS_JS}. "
            "Did the file format change?"
        )
    return _PREFIX_ITEM_RE.findall(block_match.group(1))


def keys_matching(es: dict[str, str], prefixes: Iterable[str]) -> list[str]:
    """Return ES keys that match any of the given prefixes."""
    prefixes = tuple(prefixes)
    if not prefixes:
        return []
    return sorted(k for k in es if k.startswith(prefixes))
