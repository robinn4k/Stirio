# EUVS Archive — Pending Work

Snapshot of what's still pending in the EUVS bulk-conversion
pipeline. Update this file at the end of each session.

Last updated: 2026-05-05 (after wave 6 — 1827 Oxford Night Caps).

## State as of the last commit

- **Catalog**: 34 entries in `data/euvs-catalog.json`.
- **Books with JSON**: 34 in `data/euvs-books/*.json`.
- **OCR**: all 14 originally image-only PDFs now have non-empty
  `.txt` sidecars next to their PDFs. None pending re-OCR.
- **App version**: v11.40 (`sw.js` / `version.json` / `index.html` —
  must stay in sync; the boot-time mismatch detector relies on it).
- **Open PRs on the branch**:
  - **#206** (draft) — recovers 14 commits lost when PR #205 was
    squash-merged via the GitHub MCP API and only included the first
    commit. Once #206 is merged, waves 3–6 (5 follow-up commits not
    yet in any PR) need a follow-up PR or a force-push amendment.
  - Always squash-merge **via the GitHub UI** for this archive — the
    API merge call ate PR #205's content silently.

## Pending: JSON conversion of remaining `.txt` files

Run `python3 tools/euvs-archive/build_pending.py --stdout` for the
current authoritative list. Approximate counts at last snapshot:

- ~319 `.txt` files in `data/euvs-books/` have no matching `.json`.
- 13 of those are the just-OCR'd PDF sidecars from the OCR round
  (1862 Thomas $2.50, 1896 Davies, 1900 Harry Johnson, 1902 Larsen,
  1904 Stuart, 1912 Larsen, 1917 Ensslin, 1920 Larsen, 1930
  Esplanade Prague manuscript, 1935 Pillaert, 1936 Porta Mingot,
  1950 Clavé, 1757 Cooper Distiller).

### Suggested pick order for the next session

| Priority | Slug | Why |
|---|---|---|
| High | `1917-recipes-for-mixed-drinks-by-hugo-r-ensslin-second-edition` | Famous Ensslin manual, 75 KB OCR. ~394 skeleton candidates — heavy, plan ~30+ enrichment agents. |
| High | `1900-harry-johnsons-new-and-improved-bartenders-manual` | Iconic Johnson manual, 209 KB OCR. |
| High | `1862-the-bar-tenders-guide-price-2-50-by-jerry-thomas` | Larger Thomas $2.50 ed (218 KB OCR), complements the $1.50 already in catalog. |
| Medium | `1896-drinks-of-all-kinds-for-all-seasons-by-frederick-and-seymour-davies` | 159 KB. |
| Medium | `1904-stuarts-fancy-drinks-and-how-to-mix-them` | 123 KB. |
| Medium | `1935-le-bar-american-cocktails-by-george-pillaert` | 33 KB but 162 candidates detected. |
| Medium | `1902-156-recettes-de-boissons-americaines-by-n-larsen`, `1912-...`, `1920-...` | Three Larsen French editions. |
| Medium | `1950-el-barman-practico-de-julio-cesar-clave` | 52 KB Spanish. |
| Low | `1757-the-complete-distiller-by-ambrose-cooper` | 317 KB OCR but 18th-century English with long-s glyphs and Latin botanicals — expect lots of cleanup. |

## Pending: special-case books (don't process with current pipeline)

- **1898 Before & after dinner beverages** — multi-column OCR jumble;
  the heuristic only finds 1 candidate. Needs either a re-OCR with
  layout segmentation hints or manual transcription.
- **1928 Here's How by Judge Jr (3rd printing)** — humorous toasts
  interleaved with recipes (~13 candidates, mostly Toasts). Worth
  retrying after teaching the heuristic to recognise "Toast:"
  prefixes as non-recipes.
- **1929 A Mixer by Shurger Rezso** — Hungarian; tesseract output is
  mostly garbage. Re-OCR with `-l hun` (needs `tesseract-ocr-hun`).
- **1930 Cocktails (East Bar Hotel Esplanade Prague) by F. Koki** —
  hand-written art-deco manuscript; OCR yield 14 KB. Recipes need
  human transcription if we want them.
- **1936 Gran Manual de Cocktails by Raymond Porta Mingot** — 388
  pages but only 134 KB OCR yield (low chars/page). The art-deco
  display type defeats tesseract's segmentation. Try `--psm 1`
  (auto with OSD) at higher DPI before processing.

## Pending: tooling improvements (no token cost)

- **`ocr_all_pdfs.sh` should scan `data/euvs-books/*.pdf` at runtime**
  instead of carrying the hardcoded NFC queue. The 1862 Thomas
  $2.50 and 1902 Larsen PDFs were silently skipped on the first
  parallel run because their filenames use NFD-normalised Unicode
  (combining acute on "é"). Reading `find data/euvs-books -name
  '*.pdf'` makes that class of bug impossible.
- **`tools/euvs-archive/README.md` is out of date**: it documents
  `build_catalog.py` + `download_euvs.py` only. Add sections for
  `build_pending.py`, `extract_skeleton.py`, `finalize_book.py`,
  `reocr_book.sh`, `ocr_all_pdfs.sh`, plus a one-paragraph overview
  of the skeleton-first pipeline (extract → enrich-via-subagents →
  finalize).
- **`process_book.sh` end-to-end wrapper** scoped in the original
  design plan was never built. Now that the workflow is settled, a
  one-shot `process_book.sh <slug> [N-agents]` wrapper would reduce
  the per-book ceremony.
- **Skeleton heuristic still picks up some ingredient fragments**
  (e.g. `Cube of Ice`, `White of 1 Egg`, `Juice of N Lime` — common
  in Ensslin). Consider extending `INGREDIENT_FIRST_TOKENS` in
  `extract_skeleton.py` to cover `cube`, `juice`, `white`, etc.

## Pending: validation / smoke testing

- No manual smoke test of any of the new books in the live app
  (catalog list, book-detail screen, ES/Original toggle, sections +
  recipe rendering). Each wave's commit message claims tests pass
  but only the drift detector + parser tests run; no UI checks.

## Token cap notes

- The org's monthly token cap was hit mid-wave-2 (1917 Seventy
  Recipes) but reset before wave 3. Keep an eye on this for the
  larger books — Ensslin alone (~394 candidates / ~30+ agents) will
  consume a noticeable slice.
- Subagent stream-idle timeout (~5 min) is comfortably avoided as
  long as each enrichment call processes ≤10 recipes.

## How to resume next session

```bash
# 0. Make sure PR #206 was merged via the GitHub UI (squash). If
#    not, do that first — otherwise these waves will sit in a draft
#    PR until then.

# 1. Confirm pending list and pick the next book.
python3 tools/euvs-archive/build_pending.py --stdout --limit 10

# 2. Extract the skeleton for the chosen book.
python3 tools/euvs-archive/extract_skeleton.py "<book stem>"

# 3. Inspect counts; create enrichment workspace.
ls tools/euvs-archive/data/skeletons/<slug>.skeleton.json
mkdir -p tools/euvs-archive/data/enrichments/<slug>/recipes

# 4. Dispatch ~1 metadata agent + ~N recipe-batch agents in parallel
#    via the Agent tool (10 recipes per batch is a good unit).

# 5. Finalize + regen catalog + bump version + tests + commit.
python3 tools/euvs-archive/finalize_book.py <slug>
python3 tools/euvs-archive/build_catalog.py
# bump STATIC_CACHE_VERSION (sw.js) + version.json + window.STIRIO_VERSION (index.html)
npm test -- euvs-archive
git add data/euvs-books/<slug>.json data/euvs-catalog.json sw.js version.json index.html
git commit -m "Add <book title> + bump app to vX.Y"
git push
```
