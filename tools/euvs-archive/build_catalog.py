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
    import requests
except ImportError:
    sys.stderr.write(
        "ERROR: requests library not installed. Run "
        "`pip install -r requirements.txt` first.\n"
    )
    sys.exit(1)


COLLECTION_ID = "vintage-cocktail-books-euvs"
SCRAPE_URL = "https://archive.org/services/search/v1/scrape"

# Solr (archive.org's search backend) treats hyphens as boolean NOT inside
# a bare term. We try multiple escape forms in order until one returns hits;
# the first form that works wins. Logged so failure modes are diagnosable
# from the workflow output.
_ESCAPED_ID = COLLECTION_ID.replace("-", r"\-")
QUERY_FORMS: list[str] = [
    f'collection:"{COLLECTION_ID}"',          # quoted phrase
    f"collection:({COLLECTION_ID})",           # parens (legacy)
    f"collection:{_ESCAPED_ID}",               # escaped hyphens
    f"collection:{COLLECTION_ID}",             # bare (rarely works)
]

SCRAPE_FIELDS = [
    "identifier", "title", "date", "year",
    "creator", "language", "imagecount", "item_size",
]

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


def parse_size_mb(raw) -> Optional[float]:
    """item_size is bytes; round to MB."""
    if raw is None:
        return None
    try:
        size = int(raw)
    except (TypeError, ValueError):
        return None
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


def build_entry(doc: dict) -> Optional[dict]:
    """Convert a scrape-API doc to our CatalogEntry shape.

    Returns None only when the doc lacks an identifier or a parseable title.
    Year/decade default to None for items archive.org doesn't fully describe;
    we'd rather render an undated book than drop it entirely.
    """
    identifier = doc.get("identifier")
    title = doc.get("title")
    if isinstance(title, list):
        title = title[0] if title else None
    if not identifier or not title:
        return None
    title = str(title).strip()
    if not title:
        return None
    year = parse_year(doc)
    decade = decade_of(year) if year is not None else None
    return {
        "id": identifier,
        "year": year,
        "decade": decade,
        "title": title,
        "author": normalize_author(doc.get("creator")),
        "language": normalize_language(doc.get("language")),
        "pages": parse_pages(doc),
        "sizeMb": parse_size_mb(doc.get("item_size")),
        "archiveUrl": f"https://archive.org/details/{identifier}",
        "localPath": find_local_path(identifier, year, title) if year else None,
    }


def fetch_scrape(query: str, count: int = 500) -> dict:
    """One round-trip to archive.org's scrape API."""
    params = {
        "q": query,
        "fields": ",".join(SCRAPE_FIELDS),
        "count": count,
    }
    r = requests.get(SCRAPE_URL, params=params, timeout=60)
    r.raise_for_status()
    return r.json()


def discovery_probe() -> None:
    """Run when every collection query form returns 0. Search by known EUVS
    titles and log the items' actual `collection` field — that's the value
    we should be querying for. Embedded into the failing step's stdout so
    it's right next to the RuntimeError, no need to hunt for the diagnostic
    step's output separately.
    """
    titles = [
        "Bariana",
        "Cafe Royal Cocktail Book",
        "Savoy Cocktail Book",
        "Harry Johnson's New",
    ]
    logger.error("=" * 60)
    logger.error("DISCOVERY PROBES — looking up known EUVS titles to find")
    logger.error("the actual indexed `collection` value:")
    logger.error("=" * 60)
    for title in titles:
        # advancedsearch.php (legacy API) instead of /services/search/v1/scrape
        # because the scrape API returns 400 if `fields` includes `collection`
        # (it's a multi-value field that scrape's whitelist forbids). The legacy
        # endpoint has no such restriction. Same Solr backend, different
        # parameter handling. requests accepts a list of tuples so we can
        # repeat `fl[]` cleanly.
        params = [
            ("q", f'title:"{title}"'),
            ("fl[]", "identifier"),
            ("fl[]", "title"),
            ("fl[]", "year"),
            ("fl[]", "collection"),
            ("rows", 3),
            ("output", "json"),
        ]
        try:
            r = requests.get(
                "https://archive.org/advancedsearch.php",
                params=params,
                timeout=60,
            )
            r.raise_for_status()
            items = r.json().get("response", {}).get("docs") or []
        except Exception as exc:
            logger.error('  title:"%s" probe failed: %s', title, exc)
            continue
        logger.error('  title:"%s" → %d hits', title, len(items))
        for item in items[:3]:
            logger.error("    - identifier=%s", item.get("identifier"))
            logger.error("      collection=%s", item.get("collection"))
    logger.error("=" * 60)
    logger.error("Look for a `collection` value above that contains 'euvs',")
    logger.error("'vintage', or 'cocktail' — that's what build_catalog.py")
    logger.error("should query for instead.")
    logger.error("=" * 60)


def search_with_fallback() -> list[dict]:
    """Try each query form in order; return docs from the first one with hits."""
    last_response: Optional[dict] = None
    for q in QUERY_FORMS:
        logger.info("Trying query: q=%s", q)
        try:
            data = fetch_scrape(q)
        except Exception as exc:
            logger.warning("  → request failed: %s", exc)
            continue
        items = data.get("items") or []
        total = data.get("total")
        logger.info("  → items=%d, total=%s", len(items), total)
        last_response = data
        if items:
            logger.info("✓ using this query form")
            return items
    # All forms returned 0. Run discovery probes BEFORE raising so the actual
    # indexed `collection` value appears in the build step's log next to the
    # error — the user shouldn't have to navigate to a different step's output.
    if last_response is not None:
        logger.error("All query forms returned 0 items. Last response keys: %s",
                     list(last_response.keys()))
    discovery_probe()
    raise RuntimeError(
        f"No query form returned hits for collection {COLLECTION_ID}. "
        "See discovery probes above for the actual indexed `collection` value."
    )


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Build EUVS catalog JSON.")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

    docs = search_with_fallback()
    if args.limit is not None:
        docs = docs[: args.limit]

    entries: list[dict] = []
    for doc in docs:
        entry = build_entry(doc)
        if entry:
            entries.append(entry)
        else:
            logger.debug("Dropping malformed doc: %s", doc.get("identifier"))

    # Sort by year (None → end), then title for stability.
    entries.sort(key=lambda e: (e["year"] is None, e["year"] or 0, e["title"]))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
        f.write("\n")
    logger.info("Wrote %d entries → %s", len(entries), args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
