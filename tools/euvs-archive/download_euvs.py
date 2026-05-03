#!/usr/bin/env python3
"""Download PDFs from the EUVS Vintage Cocktail Books collection on
Internet Archive.

Resumable, with exponential-backoff retries. PDFs land under
data/downloads/{decade}/{year}_{slug}/. Logs go to data/logs/download.log.
The downloaded files are NEVER committed to the repository (see .gitignore
and tools/euvs-archive/README.md).

Usage:
    python download_euvs.py --year-from 1860 --year-to 1929 --max-items 20
    python download_euvs.py --dry-run --max-items 5
"""

from __future__ import annotations

import argparse
import logging
import re
import sys
from pathlib import Path
from typing import Iterable, Optional

try:
    import internetarchive as ia
except ImportError:
    sys.stderr.write(
        "ERROR: internetarchive library not installed. Run "
        "`pip install -r requirements.txt` first.\n"
    )
    sys.exit(1)

try:
    from tenacity import (
        retry,
        stop_after_attempt,
        wait_exponential,
        retry_if_exception_type,
    )
except ImportError:
    sys.stderr.write(
        "ERROR: tenacity library not installed. Run "
        "`pip install -r requirements.txt` first.\n"
    )
    sys.exit(1)


COLLECTION_ID = "vintage-cocktail-books-euvs"

ROOT = Path(__file__).resolve().parent
DOWNLOADS_DIR = ROOT / "data" / "downloads"
LOGS_DIR = ROOT / "data" / "logs"
LOG_FILE = LOGS_DIR / "download.log"

SIZE_CONFIRM_THRESHOLD_BYTES = 50 * 1024 ** 3  # 50 GB

logger = logging.getLogger("euvs.download")


def setup_logging() -> None:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    logger.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
    fh = logging.FileHandler(LOG_FILE, encoding="utf-8")
    fh.setFormatter(fmt)
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(fmt)
    logger.handlers = [fh, sh]


def slugify(s: str, max_len: int = 60) -> str:
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE).strip().lower()
    s = re.sub(r"[-\s]+", "-", s)
    return s[:max_len] or "untitled"


def decade_of(year: int) -> str:
    return f"{(year // 10) * 10}s"


def build_query(year_from: Optional[int], year_to: Optional[int], language: Optional[str]) -> str:
    parts = [f'collection:({COLLECTION_ID})']
    if year_from is not None and year_to is not None:
        parts.append(f"year:[{year_from} TO {year_to}]")
    elif year_from is not None:
        parts.append(f"year:[{year_from} TO 9999]")
    elif year_to is not None:
        parts.append(f"year:[0 TO {year_to}]")
    if language:
        parts.append(f"language:{language}")
    return " AND ".join(parts)


def first_pdf_file(item: ia.item.Item) -> Optional[dict]:
    """Pick the largest PDF file in the item, preferring the original."""
    pdfs = [f for f in item.files if str(f.get("name", "")).lower().endswith(".pdf")]
    if not pdfs:
        return None
    pdfs.sort(key=lambda f: int(f.get("size", 0) or 0), reverse=True)
    return pdfs[0]


def parse_year(metadata: dict) -> Optional[int]:
    raw = metadata.get("date") or metadata.get("year") or ""
    m = re.search(r"(\d{4})", str(raw))
    if not m:
        return None
    try:
        return int(m.group(1))
    except ValueError:
        return None


@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=8),
    retry=retry_if_exception_type(Exception),
)
def download_file(item: ia.item.Item, file_name: str, dest_dir: Path) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    item.download(
        files=[file_name],
        destdir=str(dest_dir),
        no_directory=True,
        ignore_existing=True,
        retries=0,  # we wrap with tenacity
    )
    return dest_dir / file_name


def iter_collection(query: str, max_items: Optional[int]) -> Iterable[ia.item.Item]:
    search = ia.search_items(query)
    for i, hit in enumerate(search):
        if max_items is not None and i >= max_items:
            break
        identifier = hit.get("identifier")
        if not identifier:
            continue
        try:
            yield ia.get_item(identifier)
        except Exception as exc:
            logger.warning("Could not load item %s: %s", identifier, exc)
            continue


def estimate_total_bytes(items: list[ia.item.Item]) -> int:
    total = 0
    for it in items:
        pdf = first_pdf_file(it)
        if pdf:
            total += int(pdf.get("size", 0) or 0)
    return total


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Download EUVS books from Internet Archive.")
    parser.add_argument("--year-from", type=int, default=None)
    parser.add_argument("--year-to", type=int, default=None)
    parser.add_argument("--language", type=str, default=None, help="ISO 639-3 code (eng, fra, spa, ...)")
    parser.add_argument("--max-items", type=int, default=None)
    parser.add_argument("--dry-run", action="store_true", help="List items without downloading.")
    parser.add_argument("--yes", action="store_true", help="Skip the >50GB confirmation prompt.")
    args = parser.parse_args(argv)

    setup_logging()
    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)

    query = build_query(args.year_from, args.year_to, args.language)
    logger.info("Query: %s", query)

    items = list(iter_collection(query, args.max_items))
    logger.info("Resolved %d items.", len(items))

    if args.dry_run:
        for it in items:
            year = parse_year(it.metadata)
            title = it.metadata.get("title", "<untitled>")
            pdf = first_pdf_file(it)
            size_mb = (int(pdf.get("size", 0)) / 1024 / 1024) if pdf else 0
            logger.info("[dry-run] %s | %s | %s | %.1f MB", it.identifier, year, title, size_mb)
        return 0

    estimated = estimate_total_bytes(items)
    logger.info("Estimated download: %.2f GB", estimated / 1024 ** 3)

    if estimated > SIZE_CONFIRM_THRESHOLD_BYTES and not args.yes:
        sys.stderr.write(
            f"\nWARNING: estimated download is {estimated / 1024 ** 3:.1f} GB, "
            f"above the {SIZE_CONFIRM_THRESHOLD_BYTES / 1024 ** 3:.0f} GB threshold.\n"
            "Pass --yes to skip this prompt next time. Continue? [y/N] "
        )
        sys.stderr.flush()
        try:
            answer = input().strip().lower()
        except EOFError:
            answer = ""
        if answer not in {"y", "yes"}:
            logger.info("Aborted by user.")
            return 1

    failures = 0
    for it in items:
        year = parse_year(it.metadata)
        if year is None:
            logger.warning("Skipping %s: missing year.", it.identifier)
            continue
        title = it.metadata.get("title", it.identifier)
        slug = slugify(str(title))
        target_dir = DOWNLOADS_DIR / decade_of(year) / f"{year}_{slug}"
        pdf = first_pdf_file(it)
        if not pdf:
            logger.warning("Skipping %s: no PDF file in item.", it.identifier)
            continue
        file_name = pdf["name"]
        remote_size = int(pdf.get("size", 0) or 0)
        local_file = target_dir / file_name
        if local_file.exists() and local_file.stat().st_size == remote_size:
            logger.info("Skip (already complete): %s", local_file.relative_to(ROOT))
            continue
        try:
            logger.info("Downloading %s (%.1f MB) → %s",
                        it.identifier, remote_size / 1024 / 1024,
                        target_dir.relative_to(ROOT))
            download_file(it, file_name, target_dir)
        except Exception as exc:
            failures += 1
            logger.error("Failed %s after retries: %s", it.identifier, exc)

    logger.info("Done. Failures: %d", failures)
    return 0 if failures == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
