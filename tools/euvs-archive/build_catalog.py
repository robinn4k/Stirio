#!/usr/bin/env python3
"""Build data/euvs-catalog.json from Internet Archive metadata.

The catalog is the bridge between the Python download tooling and the
Stirio web app: the JSON file is committed to the repository and consumed
by js/euvs-archive.jsx (via fetch). Only public metadata is included; PDFs
are NEVER copied here.

Usage:
    python build_catalog.py
    python build_catalog.py --limit 10 --out /tmp/catalog.json
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Optional

try:
    import internetarchive as ia
except ImportError:
    sys.stderr.write(
        "ERROR: internetarchive library not installed. Run "
        "`pip install -r requirements.txt` first.\n"
    )
    sys.exit(1)


COLLECTION_ID = "vintage-cocktail-books-euvs"

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent.parent
DOWNLOADS_DIR = ROOT / "data" / "downloads"
DEFAULT_OUT = REPO_ROOT / "data" / "euvs-catalog.json"

logger = logging.getLogger("euvs.build_catalog")


def slugify(s: str, max_len: int = 60) -> str:
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE).strip().lower()
    s = re.sub(r"[-\s]+", "-", s)
    return s[:max_len] or "untitled"


def decade_of(year: int) -> str:
    return f"{(year // 10) * 10}s"


def parse_year(metadata: dict) -> Optional[int]:
    raw = metadata.get("date") or metadata.get("year") or ""
    m = re.search(r"(\d{4})", str(raw))
    if not m:
        return None
    try:
        return int(m.group(1))
    except ValueError:
        return None


def find_local_path(identifier: str, year: int, title: str) -> Optional[str]:
    """Return the relative path of a downloaded PDF for this item, if any."""
    slug = slugify(title)
    target_dir = DOWNLOADS_DIR / decade_of(year) / f"{year}_{slug}"
    if not target_dir.is_dir():
        return None
    for pdf in target_dir.glob("*.pdf"):
        return str(pdf.relative_to(REPO_ROOT))
    return None


def first_pdf_size_mb(item: ia.item.Item) -> Optional[float]:
    pdfs = [f for f in item.files if str(f.get("name", "")).lower().endswith(".pdf")]
    if not pdfs:
        return None
    pdfs.sort(key=lambda f: int(f.get("size", 0) or 0), reverse=True)
    size = int(pdfs[0].get("size", 0) or 0)
    if size <= 0:
        return None
    return round(size / 1024 / 1024, 1)


def parse_pages(metadata: dict) -> Optional[int]:
    raw = metadata.get("imagecount") or metadata.get("pages")
    if not raw:
        return None
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None


def normalize_language(raw) -> Optional[str]:
    if not raw:
        return None
    if isinstance(raw, list):
        raw = raw[0] if raw else None
    if not raw:
        return None
    return str(raw).strip().lower()[:3] or None


def normalize_author(raw) -> Optional[str]:
    if not raw:
        return None
    if isinstance(raw, list):
        raw = raw[0] if raw else None
    if not raw:
        return None
    return str(raw).strip() or None


def build_entry(item: ia.item.Item) -> Optional[dict]:
    md = item.metadata
    year = parse_year(md)
    title = md.get("title")
    if not year or not title:
        return None
    title = str(title).strip()
    return {
        "id": item.identifier,
        "year": year,
        "decade": decade_of(year),
        "title": title,
        "author": normalize_author(md.get("creator")),
        "language": normalize_language(md.get("language")),
        "pages": parse_pages(md),
        "sizeMb": first_pdf_size_mb(item),
        "archiveUrl": f"https://archive.org/details/{item.identifier}",
        "localPath": find_local_path(item.identifier, year, title),
    }


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Build EUVS catalog JSON.")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

    query = f"collection:({COLLECTION_ID})"
    logger.info("Querying Internet Archive: %s", query)

    entries: list[dict] = []
    search = ia.search_items(query)
    for i, hit in enumerate(search):
        if args.limit is not None and len(entries) >= args.limit:
            break
        identifier = hit.get("identifier")
        if not identifier:
            continue
        try:
            item = ia.get_item(identifier)
        except Exception as exc:
            logger.warning("Skipping %s: %s", identifier, exc)
            continue
        entry = build_entry(item)
        if entry:
            entries.append(entry)

    entries.sort(key=lambda e: (e["year"], e["title"]))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
        f.write("\n")
    logger.info("Wrote %d entries → %s", len(entries), args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
