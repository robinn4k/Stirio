#!/usr/bin/env python3
"""List EUVS books that still need a structured JSON.

Scans ``data/euvs-books/`` for ``*.txt`` files that don't yet have a matching
``<slug>.json`` (and aren't sitting next to a same-name ``.pdf`` that hints at
needing OCR), and prints a tab-separated table:

    <byte-size>\\t<slug>\\t<source-stem>

Sorted ascending by size — process shortest first to validate the schema fast.

Usage:
    python build_pending.py                 # write data/euvs-pending.tsv
    python build_pending.py --limit 10      # only the 10 shortest
    python build_pending.py --stdout        # print to stdout instead of file
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import unicodedata
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent.parent
BOOKS_DIR = REPO_ROOT / "data" / "euvs-books"
DEFAULT_OUT = REPO_ROOT / "data" / "euvs-pending.tsv"

# Stems whose canonical slug deviates from the algorithmic output. Keep this
# small: only entries that are already-published JSONs whose slug we want to
# preserve. Pending books should rely on the algorithm so a future rerun is
# deterministic without editing this file.
ALIASES: dict[str, str] = {
    "1862 The Bar Tender's Guide price $1.50 by Jerry Thomas": "1862-jerry-thomas-bartenders-guide",
    "Bariana by Louis Fouquet (1896)": "1896-bariana-louis-fouquet",
}

YEAR_RE = re.compile(r"\b(1[7-9]\d{2}|20\d{2})\b")
APOSTROPHES_RE = re.compile(r"['‘’\"`]")
NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")


def slugify(name: str) -> str:
    """Return the canonical slug for a book stem (filename without extension)."""
    if name in ALIASES:
        return ALIASES[name]
    m = YEAR_RE.search(name)
    year = m.group(1) if m else None
    rest = YEAR_RE.sub("", name, count=1) if year else name
    rest = unicodedata.normalize("NFKD", rest).encode("ascii", "ignore").decode().lower()
    rest = APOSTROPHES_RE.sub("", rest)
    rest = NON_ALNUM_RE.sub("-", rest).strip("-")
    return f"{year}-{rest}".strip("-") if year else rest.strip("-")


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="List EUVS .txt files awaiting JSON conversion.")
    parser.add_argument("--books-dir", type=Path, default=BOOKS_DIR)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--limit", type=int, default=None, help="Only emit the N shortest entries")
    parser.add_argument("--stdout", action="store_true", help="Print to stdout instead of writing --out")
    parser.add_argument("--include-pdf-only", action="store_true",
                        help="Include stems where only a .pdf exists (needs re-OCR first)")
    args = parser.parse_args(argv)

    if not args.books_dir.is_dir():
        print(f"Books directory not found: {args.books_dir}", file=sys.stderr)
        return 1

    done_slugs = {p.stem for p in args.books_dir.glob("*.json")}

    pending: list[tuple[int, str, str, str]] = []  # (size, slug, stem, kind)
    for path in sorted(args.books_dir.glob("*.txt")):
        stem = path.stem
        slug = slugify(stem)
        if slug in done_slugs:
            continue
        size = path.stat().st_size
        pending.append((size, slug, stem, "txt"))

    if args.include_pdf_only:
        txt_stems = {p.stem for p in args.books_dir.glob("*.txt")}
        for path in sorted(args.books_dir.glob("*.pdf")):
            stem = path.stem
            if stem in txt_stems:
                continue
            slug = slugify(stem)
            if slug in done_slugs:
                continue
            size = path.stat().st_size
            pending.append((size, slug, stem, "pdf"))

    pending.sort(key=lambda r: (r[0], r[1]))
    if args.limit is not None:
        pending = pending[: args.limit]

    lines = [f"{size}\t{slug}\t{stem}\t{kind}" for size, slug, stem, kind in pending]
    output = "\n".join(lines) + ("\n" if lines else "")

    if args.stdout:
        sys.stdout.write(output)
    else:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(output, encoding="utf-8")
        print(f"Wrote {len(pending)} pending entries -> {args.out}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
