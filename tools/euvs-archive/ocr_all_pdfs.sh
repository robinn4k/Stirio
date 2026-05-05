#!/usr/bin/env bash
# Run ocrmypdf on every image-only EUVS PDF that doesn't yet have a
# non-empty sibling .txt. Idempotent: skips PDFs whose .txt already
# has content. Sequential by default; pass --jobs N for parallelism.
#
# Languages and the small per-PDF settings live in the table below
# inside this script — easier than carrying CLI args for every book.
#
# Usage:
#   tools/euvs-archive/ocr_all_pdfs.sh           # serial
#   tools/euvs-archive/ocr_all_pdfs.sh --jobs 4  # 4 PDFs in parallel
set -euo pipefail

JOBS=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --jobs) JOBS="$2"; shift 2 ;;
    *) echo "Unknown flag: $1" >&2; exit 2 ;;
  esac
done

ROOT=$(cd "$(dirname "$0")/../.." && pwd)
BOOKS="$ROOT/data/euvs-books"
WORK="/tmp/euvs-ocrmypdf"
mkdir -p "$WORK"

# stem (without .pdf) → tesseract language code(s) understood by ocrmypdf.
declare -A LANGS=(
  ["1862 The Bar Tender's Guide price \$2.50 by Jerry Thomas"]="eng"
  ["1896 Drinks of All Kinds For All Seasons by Frederick and Seymour Davies"]="eng"
  ["1900 Harry Johnson's New and Improved Bartenders' Manual"]="eng"
  ["1902 156 Recettes de Boissons Américaines by N Larsen"]="fra"
  ["1904 Stuart's Fancy Drinks and How To Mix Them"]="eng"
  ["1912 156 Recettes de Boissons Américaines by N Larsen"]="fra"
  ["1917 Recipes for Mixed Drinks by Hugo R Ensslin (second edition)"]="eng"
  ["1920 156 recettes de boissons américaines by N Larsen"]="fra"
  ["1930 Cocktails (Art Deco Manuscript Book East Bar Hotel Esplanade Prague) by F Koki"]="deu+fra"
  ["1935 Le Bar Américan Cocktails by George Pillaert"]="fra"
  ["1936 Gran Manual de Cocktails by Raymond Porta Mingot"]="spa"
  ["1950 El Barman Practico de Julio Cesar Clavé"]="spa"
  ["1954 Anis Esprit de Joie et de Santé by André Montagard"]="fra"
  ["The Complete Distiller by Ambrose Cooper (1757)"]="eng+lat"
)

run_one() {
  local stem="$1"
  local lang="$2"
  local pdf="$BOOKS/$stem.pdf"
  local out="$BOOKS/$stem.txt"
  local work="$WORK/$stem.pdf"

  if [[ ! -f "$pdf" ]]; then
    echo "[ocr] skip $stem — no PDF" >&2
    return 0
  fi
  if [[ -s "$out" ]] && [[ $(wc -c < "$out") -gt 1024 ]]; then
    echo "[ocr] skip $stem — .txt already has content" >&2
    return 0
  fi
  echo "[ocr] start $stem ($lang)" >&2
  ocrmypdf \
    --output-type pdf \
    --skip-text \
    --rotate-pages \
    --deskew \
    --sidecar "$out" \
    -l "$lang" \
    --jobs 4 \
    "$pdf" "$work" >/dev/null 2>&1 || \
    { echo "[ocr] FAIL $stem (exit $?)" >&2; return 0; }
  local size
  size=$(wc -c < "$out" 2>/dev/null || echo 0)
  echo "[ocr] done  $stem — $size bytes" >&2
}

export -f run_one
export BOOKS WORK

# Build a NUL-separated list of "stem<TAB>lang" pairs and dispatch.
{
  for stem in "${!LANGS[@]}"; do
    printf "%s\t%s\0" "$stem" "${LANGS[$stem]}"
  done
} | xargs -0 -I{} -P "$JOBS" bash -c '
  IFS=$"\t" read -r stem lang <<< "{}"
  run_one "$stem" "$lang"
'

echo "[ocr] all done"