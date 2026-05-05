#!/usr/bin/env bash
# Run ocrmypdf on every image-only EUVS PDF that doesn't yet have a
# non-empty sibling .txt. Idempotent: skips PDFs whose .txt already
# has content. Sequential by default; pass --jobs N for parallelism.
#
# Usage:
#   tools/euvs-archive/ocr_all_pdfs.sh           # serial
#   tools/euvs-archive/ocr_all_pdfs.sh --jobs 4  # 4 PDFs in parallel
#
# Note: ocrmypdf on Ubuntu 24.04 ships with a /usr/bin/python3 shebang
# that may break if python3-pil's C extensions were built for a
# different Python version (e.g. 3.12 vs the system 3.11). If you see
# "ImportError: cannot import name '_imaging' from 'PIL'", patch the
# shebang to `#!/usr/bin/env python3.12` (or whichever Python has the
# matching PIL build).
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

# stem (without .pdf, no quoting) → tesseract language code(s).
# Each line: <lang>\t<stem>.
QUEUE=$(cat <<'EOF'
eng	1862 The Bar Tender's Guide price $2.50 by Jerry Thomas
eng	1896 Drinks of All Kinds For All Seasons by Frederick and Seymour Davies
eng	1900 Harry Johnson's New and Improved Bartenders' Manual
fra	1902 156 Recettes de Boissons Américaines by N Larsen
eng	1904 Stuart's Fancy Drinks and How To Mix Them
fra	1912 156 Recettes de Boissons Américaines by N Larsen
eng	1917 Recipes for Mixed Drinks by Hugo R Ensslin (second edition)
fra	1920 156 recettes de boissons américaines by N Larsen
deu+fra	1930 Cocktails (Art Deco Manuscript Book East Bar Hotel Esplanade Prague) by F Koki
fra	1935 Le Bar Américan Cocktails by George Pillaert
spa	1936 Gran Manual de Cocktails by Raymond Porta Mingot
spa	1950 El Barman Practico de Julio Cesar Clavé
fra	1954 Anis Esprit de Joie et de Santé by André Montagard
eng+lat	The Complete Distiller by Ambrose Cooper (1757)
EOF
)

run_one() {
  local lang="$1"
  local stem="$2"
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
  if ocrmypdf \
       --output-type pdf \
       --skip-text \
       --rotate-pages \
       --deskew \
       --sidecar "$out" \
       -l "$lang" \
       --jobs 4 \
       "$pdf" "$work" >>"$WORK/ocrmypdf.log" 2>&1; then
    local size
    size=$(wc -c < "$out" 2>/dev/null || echo 0)
    echo "[ocr] done  $stem — $size bytes" >&2
  else
    local code=$?
    echo "[ocr] FAIL  $stem (exit $code) — see $WORK/ocrmypdf.log" >&2
    return 0  # don't abort the whole batch
  fi
}

export -f run_one
export BOOKS WORK

# Dispatch sequentially or in parallel via xargs.
echo "$QUEUE" | grep -v '^[[:space:]]*$' | \
  xargs -d '\n' -P "$JOBS" -n 1 -I{} bash -c '
    line="{}"
    lang="${line%%	*}"
    stem="${line#*	}"
    run_one "$lang" "$stem"
  '

echo "[ocr] all done" >&2