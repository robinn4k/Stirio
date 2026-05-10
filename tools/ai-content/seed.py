#!/usr/bin/env python3
"""Seed new article stubs from `backlog.json` into `js/wiki-data.js`.

Each cron tick pulls N items (default 3) from the backlog using a
round-robin across categories, inserts them as `{ id: '...', icon: '...',
has3d: false }` entries inside the matching category's `articles: [ ... ]`
block, and removes them from the backlog so the next run picks fresh items.

The downstream `complete` step then generates ES content for the new
articles, and `translate` propagates to the other 4 languages.

Idempotent: items already present in wiki-data.js are skipped, not
duplicated.
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
WIKI_DATA = ROOT / "js" / "wiki-data.js"
BACKLOG = Path(__file__).resolve().parent / "backlog.json"

DEFAULT_ICONS = {
    "techniques": "🔧",
    "spirits": "🥃",
    "liqueurs": "🍷",
    "wines": "🍇",
    "amaros": "🌿",
    "mixers": "🥤",
    "tools": "🔧",
    "beer": "🍺",
    "history": "📜",
    "families": "👨‍👩‍👧‍👦",
    "bartenders": "👤",
    "bars": "🍸",
    "regions": "🌍",
    "ice": "🧊",
    "garnishes": "🌿",
    "science": "🧪",
    "glossary": "📚",
    "cocktails": "🍹",
    "pairings": "🍴",
}

logger = logging.getLogger("stirio.ai.seed")


def load_backlog() -> dict:
    return json.loads(BACKLOG.read_text(encoding="utf-8"))


def save_backlog(data: dict) -> None:
    BACKLOG.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def existing_ids_for_category(text: str, category: str) -> set[str]:
    """Return the set of article IDs already in wiki-data.js for `category`."""
    block = _find_category_block(text, category)
    if not block:
        return set()
    body = text[block[0]:block[1]]
    return set(re.findall(r"id:\s*['\"]([^'\"]+)['\"]", body))


def _find_category_block(text: str, category: str) -> tuple[int, int] | None:
    """Return (start, end) index range covering the category's `articles: [`
    array body (excluding brackets), or None if not found."""
    # Find each `id: 'category'` and check the surrounding object has an
    # articles array. Simpler approach: find the category header, then locate
    # the next `articles:` and balance brackets to find the closing `]`.
    pattern = re.compile(r"id:\s*['\"]" + re.escape(category) + r"['\"]")
    m = pattern.search(text)
    if not m:
        return None
    articles_idx = text.find("articles:", m.end())
    if articles_idx == -1:
        return None
    open_idx = text.find("[", articles_idx)
    if open_idx == -1:
        return None
    depth = 1
    i = open_idx + 1
    while i < len(text) and depth > 0:
        c = text[i]
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
        i += 1
    if depth != 0:
        return None
    return (open_idx + 1, i - 1)


def insert_article(text: str, category: str, article_id: str, icon: str) -> tuple[str, bool]:
    """Insert a `{ id: '...', icon: '...', has3d: false },` line at the end
    of the category's articles array. Returns (new_text, inserted?).

    Skips if the article ID already exists in that category.
    """
    if article_id in existing_ids_for_category(text, category):
        return text, False
    block = _find_category_block(text, category)
    if not block:
        return text, False
    inner_start, inner_end = block
    inner = text[inner_start:inner_end]
    # Find the proper indentation by sniffing existing entries.
    indent = "      "  # default for the file's 2-space hierarchy
    existing = re.search(r"\n(\s+)\{\s*id:", inner)
    if existing:
        indent = existing.group(1)
    new_entry = f"{indent}{{ id: '{article_id}', icon: '{icon}', has3d: false }},\n"
    if inner.strip() == "":
        # Empty array — write `\n<entry>\n  ` so the closing `]` is on its own line.
        new_inner = "\n" + new_entry + "    "
    else:
        # Append before the trailing whitespace before the closing bracket.
        # inner ends in something like ",\n    " — we want our entry inserted
        # before the trailing indentation.
        stripped = inner.rstrip()
        if not stripped.endswith(","):
            stripped += ","
        new_inner = stripped + "\n" + new_entry + "    "
    new_text = text[:inner_start] + new_inner + text[inner_end:]
    return new_text, True


def round_robin_pick(backlog: dict, n: int) -> list[tuple[str, str]]:
    """Pick `n` (category, article_id) pairs from backlog, round-robin
    across categories. Removes picked items from backlog (mutates in place)."""
    cats = [k for k in backlog if not k.startswith("_") and backlog[k]]
    picks: list[tuple[str, str]] = []
    while len(picks) < n and cats:
        next_cats: list[str] = []
        for cat in cats:
            if len(picks) >= n:
                break
            if backlog[cat]:
                article_id = backlog[cat].pop(0)
                picks.append((cat, article_id))
                if backlog[cat]:
                    next_cats.append(cat)
        cats = next_cats
    return picks


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="seed", description=__doc__)
    parser.add_argument("--limit", type=int, default=3, help="How many items to seed (default 3).")
    parser.add_argument("--dry-run", action="store_true", help="Print the plan without writing files.")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO, format="%(message)s")

    backlog = load_backlog()
    if args.dry_run:
        # Don't mutate the file copy — pick on a deep copy instead.
        scratch = json.loads(json.dumps(backlog))
        picks = round_robin_pick(scratch, args.limit)
    else:
        picks = round_robin_pick(backlog, args.limit)

    if not picks:
        print("Backlog empty — nothing to seed. Add items to tools/ai-content/backlog.json.")
        return 0

    text = WIKI_DATA.read_text(encoding="utf-8")
    inserted: list[tuple[str, str]] = []
    skipped: list[tuple[str, str]] = []
    for cat, art_id in picks:
        icon = DEFAULT_ICONS.get(cat, "📖")
        text, ok = insert_article(text, cat, art_id, icon)
        if ok:
            inserted.append((cat, art_id))
        else:
            skipped.append((cat, art_id))

    print(f"Seed plan: {len(picks)} item(s) — {len(inserted)} insert, {len(skipped)} skipped (duplicate).")
    for cat, art_id in inserted:
        print(f"  + {cat}/{art_id}")
    for cat, art_id in skipped:
        print(f"  ~ {cat}/{art_id} (already in wiki-data.js)")

    if args.dry_run:
        print("Dry-run: wiki-data.js and backlog.json not modified.")
        return 0

    if inserted:
        WIKI_DATA.write_text(text, encoding="utf-8")
    save_backlog(backlog)
    return 0


if __name__ == "__main__":
    sys.exit(main())
