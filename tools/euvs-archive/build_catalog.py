#!/usr/bin/env python3
"""Build data/euvs-catalog.json from the per-book JSON files.

Each book lives at data/euvs-books/<book_id>.json and follows the schema
documented in tools/euvs-archive/_SCHEMA.md (metadata + sections + recipes).
This script reads all of them and emits a lightweight index that
js/euvs-archive.jsx fetches at boot.

Usage:
    python build_catalog.py
    python build_catalog.py --out /tmp/catalog.json
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent.parent
BOOKS_DIR = REPO_ROOT / "data" / "euvs-books"
DEFAULT_OUT = REPO_ROOT / "data" / "euvs-catalog.json"

logger = logging.getLogger("euvs.build_catalog")


def decade_of(year) -> Optional[str]:
    if not isinstance(year, int):
        return None
    return f"{(year // 10) * 10}s"


def build_entry(book: dict, file_name: str) -> Optional[dict]:
    book_id = book.get("book_id")
    md = book.get("metadata") or {}
    title = md.get("title")
    if not isinstance(book_id, str) or not book_id:
        return None
    if not isinstance(title, str) or not title:
        return None
    year = md.get("year") if isinstance(md.get("year"), int) else None
    return {
        "id": book_id,
        "year": year,
        "decade": decade_of(year),
        "title": title.strip(),
        "author": md.get("author"),
        "language": md.get("language"),
        "languageName": md.get("language_name"),
        "publisher": md.get("publisher"),
        "city": md.get("city"),
        "edition": md.get("edition"),
        "notes": md.get("notes"),
        "sectionCount": len(book.get("sections") or []),
        "recipeCount": len(book.get("recipes") or []),
        "bookFile": f"data/euvs-books/{file_name}",
    }


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Build EUVS catalog JSON from local books.")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--books-dir", type=Path, default=BOOKS_DIR)
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

    if not args.books_dir.is_dir():
        logger.error("Books directory not found: %s", args.books_dir)
        return 1

    entries: list[dict] = []
    skipped: list[str] = []
    for path in sorted(args.books_dir.glob("*.json")):
        try:
            book = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            logger.warning("Skipping %s: invalid JSON (%s)", path.name, exc)
            skipped.append(path.name)
            continue
        entry = build_entry(book, path.name)
        if entry is None:
            logger.warning("Skipping %s: missing book_id or metadata.title", path.name)
            skipped.append(path.name)
            continue
        entries.append(entry)

    entries.sort(key=lambda e: (e.get("year") if e.get("year") is not None else 9999, e["id"]))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
        f.write("\n")
    logger.info("Wrote %d entries → %s", len(entries), args.out)
    if skipped:
        logger.warning("Skipped %d files: %s", len(skipped), ", ".join(skipped))
    return 0


if __name__ == "__main__":
    sys.exit(main())
