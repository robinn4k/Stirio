#!/usr/bin/env bash
# Re-OCR a single image-only EUVS PDF whose original .txt came out empty/garbled.
#
# Usage:
#   tools/euvs-archive/reocr_book.sh <pdf-path> <lang> [--dpi 200] [--psm 3] [--workers 4]
#
# Examples:
#   reocr_book.sh "data/euvs-books/1862 The Bar Tender's Guide price \$2.50 by Jerry Thomas.pdf" eng
#   reocr_book.sh "data/euvs-books/1936 Gran Manual de Cocktails by Raymond Porta Mingot.pdf" spa --dpi 250
#
# Output: writes a sibling "<stem>.txt" next to the .pdf in data/euvs-books/.
# Intermediate page renders + per-page OCR text live in /tmp/euvs-ocr/<stem>/.
#
# Required system packages (install once):
#   sudo apt install tesseract-ocr poppler-utils \
#                    tesseract-ocr-eng tesseract-ocr-fra tesseract-ocr-spa \
#                    tesseract-ocr-deu tesseract-ocr-lat
#
# Resumable: skips pages whose .txt already exists (delete the work dir to redo).
set -euo pipefail

usage() {
  sed -n '2,18p' "$0" >&2
  exit 1
}

[[ $# -lt 2 ]] && usage

PDF="$1"; shift
LANG="$1"; shift
DPI=200
PSM=3
WORKERS=4

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dpi)     DPI="$2"; shift 2 ;;
    --psm)     PSM="$2"; shift 2 ;;
    --workers) WORKERS="$2"; shift 2 ;;
    *) echo "Unknown flag: $1" >&2; usage ;;
  esac
done

[[ -f "$PDF" ]] || { echo "PDF not found: $PDF" >&2; exit 2; }
command -v pdftoppm  >/dev/null || { echo "pdftoppm missing — install poppler-utils" >&2; exit 3; }
command -v tesseract >/dev/null || { echo "tesseract missing — install tesseract-ocr" >&2; exit 3; }

STEM=$(basename "$PDF" .pdf)
OUT_DIR=$(dirname "$PDF")
OUT_TXT="$OUT_DIR/$STEM.txt"
WORK="/tmp/euvs-ocr/$STEM"
mkdir -p "$WORK"

echo "[reocr] PDF:    $PDF"
echo "[reocr] lang:   $LANG  dpi=$DPI psm=$PSM workers=$WORKERS"
echo "[reocr] work:   $WORK"
echo "[reocr] output: $OUT_TXT"

# 1. Render every page to grayscale PNG (skip already-rendered pages).
if ! ls "$WORK"/p-*.png >/dev/null 2>&1; then
  pdftoppm -r "$DPI" -gray -png "$PDF" "$WORK/p"
fi

# 2. OCR each PNG. Tesseract emits a non-fatal warning on some pages
#    (e.g. "box outside rectangle") and exits non-zero even when it
#    wrote useful output, so we treat *empty .txt* as the only failure
#    signal and let the script be fully resumable. Use NUL-separated
#    paths so spaces in $WORK survive xargs.
export TESS_LANG="$LANG" TESS_PSM="$PSM"
find "$WORK" -maxdepth 1 -name 'p-*.png' -print0 | sort -z | \
  xargs -0 -I{} -P "$WORKERS" bash -c '
    in="$1"
    out="${in%.png}.txt"
    [[ -s "$out" ]] && exit 0
    timeout 120 tesseract "$in" "${in%.png}" -l "$TESS_LANG" --psm "$TESS_PSM" >/dev/null 2>&1 || true
    [[ -s "$out" ]] || echo "[reocr] WARN: empty OCR for $(basename "$in")" >&2
  ' _ {}

# 3. Retry once, sequentially, any pages that still came up empty.
#    Parallel tesseract under memory pressure occasionally truncates
#    output; a serial retry recovers most of those.
shopt -s nullglob
for png in "$WORK"/p-*.png; do
  out="${png%.png}.txt"
  if [[ ! -s "$out" ]]; then
    echo "[reocr] retry $(basename "$png") sequentially"
    timeout 180 tesseract "$png" "${png%.png}" -l "$LANG" --psm "$PSM" >/dev/null 2>&1 || true
  fi
done

# 4. Concatenate page texts in order, separated by blank lines.
: > "$OUT_TXT"
for f in "$WORK"/p-*.txt; do
  [[ -e "$f" ]] || continue
  cat "$f" >> "$OUT_TXT"
  printf '\n\n' >> "$OUT_TXT"
done
shopt -u nullglob

CHARS=$(wc -c < "$OUT_TXT")
echo "[reocr] done — $CHARS chars in $OUT_TXT"
