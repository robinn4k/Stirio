#!/usr/bin/env python3
"""Heuristic OCR -> skeleton JSON for an EUVS book.

Reads a single ``data/euvs-books/<stem>.txt`` file and emits a partial
JSON in the shape of the schema (``tools/euvs-archive/_SCHEMA.md``):

    {
      "book_id": "<slug>",
      "metadata": { "title": ..., "year": ..., "source_file": ..., ...},
      "sections": [{ "order": 1, "type": "recipes_section", ... }],
      "recipes":  [{ "id": "...", "order": 1, "name_original": "...",
                     "raw_text": "...", "category": null, ...}, ...]
    }

The skeleton has every recipe block we can confidently detect, with
``raw_text`` populated and every other "interpreted" field left null. A
follow-up LLM pass fills in name_es, ingredients[], method_*, glassware,
garnish, yield, category. ``finalize_book.py`` then validates and
promotes the skeleton into ``data/euvs-books/<slug>.json``.

Detection heuristic (tuned against the 26 already-finished books):

* A recipe header is a line that, after stripping leading/trailing
  whitespace and decorative punctuation, is mostly UPPERCASE letters
  and digits, ≥3 chars, ≤60 chars, and isn't an obvious section
  divider ("INDEX", "CHAPTER", page numbers, brand banners).
* Each recipe spans from its header to the line before the next
  header (or to the next blank-line gap of ≥3 lines).
* A leading "section banner" header (e.g. "GIN COCKTAILS",
  "WHISKY DRINKS") starts a new ``sections`` entry of type
  ``recipes_section`` instead of becoming a recipe of its own.

The heuristic is intentionally conservative: it would rather miss a
recipe than invent one. Anything missed shows up in the final book
JSON's ``metadata.notes`` for human review.

Usage:
    python extract_skeleton.py <stem-or-slug>
    python extract_skeleton.py --all-pending
    python extract_skeleton.py --stem "1924 Angostura..." --print
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional

# Reuse slugify + ALIASES from sibling script.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_pending import slugify, ALIASES  # noqa: E402

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent.parent
BOOKS_DIR = REPO_ROOT / "data" / "euvs-books"
SKELETON_DIR = ROOT / "data" / "skeletons"

# Regexes.
YEAR_RE = re.compile(r"\b(1[7-9]\d{2}|20\d{2})\b")
PAGE_NUM_RE = re.compile(r"^\s*[—-]?\s*\d{1,3}\s*[—-]?\s*$")
# ALL-CAPS line (decorative banners + many Sloppy-Joe-style recipe titles).
HEADER_RE_UPPER = re.compile(r"^\s*([A-ZÁÉÍÓÚÑÇ0-9][A-ZÁÉÍÓÚÑÇ0-9 .'’&\-/!,()]{2,58})\s*$")
LOWER_RE = re.compile(r"[a-záéíóúñç]")
# Joining words that may appear lowercase inside a Title-Case header.
TITLE_JOINS = {"of", "and", "the", "a", "an", "in", "on", "for", "to",
               "with", "from", "de", "la", "el", "du", "au", "or"}
# First-word patterns that mark a candidate as an ingredient continuation
# rather than a recipe title. OCR commonly mangles ½ → "Yz" / "Y2" / "Y:í"
# and ¼ → "X" / "Y4". Numeric quantities ("1", "Two") followed by units
# (Glass, Teaspoonful, Dash, …) are ingredients, not titles.
INGREDIENT_FIRST_TOKENS = {
    "yz", "y2", "y:", "y4", "yi", "ys", "y;", "y/2", "y/4",
    "½", "¼", "¾", "⅓", "⅔", "⅛", "⅜",
    "x", "x.", "x'",
}
INGREDIENT_PREFIX_RE = re.compile(
    r"^(?:\d+/\d+|\d+(?:[.,]\d+)?\s+|"
    r"(?:one|two|three|four|five|six|half|quarter|several|few|some)\s+"
    r")", re.IGNORECASE)
# Title-Case candidates whose remainder is just a known ingredient noun
# (sugar, gin, ice, …) are usually fragment lines, not recipe titles.
INGREDIENT_NOUNS = {
    "sugar", "ice", "gin", "rum", "whisky", "whiskey", "brandy",
    "vermouth", "cognac", "absinthe", "champagne", "sherry", "port",
    "wine", "cointreau", "curacao", "curaçao", "grenadine", "syrup",
    "maraschino", "mint", "lemon", "lime", "orange", "pineapple",
    "egg", "milk", "cream", "soda", "water", "ginger",
    "calvados", "kirsch", "cassis", "anisette", "anissette",
    "menthe", "amaretto", "cacao", "chartreuse", "benedictine",
    "dubonnet", "drambuie", "schnapps", "mezcal", "tequila",
    "vodka", "cider", "ale", "beer", "porter",
}
INGREDIENT_UNIT_WORDS = {
    "glass", "glasses", "teaspoonful", "teaspoon", "tablespoonful",
    "tablespoon", "dash", "dashes", "drop", "drops", "part", "parts",
    "wineglass", "wineglassful", "ounce", "ounces", "oz", "gill",
    "lump", "lumps", "slice", "slices", "piece", "pieces",
    "cup", "bottle", "quart", "gallon", "pint", "pints",
}

# Strings that look like recipe headers but are actually structural
# elements; never promote them to a recipe.
HEADER_BLACKLIST_SUBSTR = {
    "INDEX", "CONTENTS", "CHAPTER", "APPENDIX", "PREFACE",
    "INTRODUCTION", "PUBLISHED BY", "PRINTED IN",
    "ASK FOR SLOPPY", "ASK FOE SLOPPY",       # repeated banners
    "HAVANA - CIGARS", "FACTORY PRICE",
    "MEMORANDUM", "MEMOEANDUM",
    "TAKE YOUR FRIENDS", "REAL GIFT",
    "COPYRIGHT", "ALL RIGHTS RESERVED",
    # Brand / address noise that looks header-shaped on promo booklets:
    "BITTERS", "ANGOSTURA", "CINZANO", "CALVERT",
    "PEYCHAUD", "GODERHAM", "SCHENLEY",
    "LIMITED", "LTD", "INC.", "& CO", "& SONS", "S. A.",
    "STREET", "AVENUE", "PAVEMENT", "FACTORY", "FINSBURY",
    "LONDON", "E.C.2", "LONDON, E.C", "NEW YORK",
    "TRINIDAD", "PORT OF SPAIN", "HAVANA, CUBA",
    "MENENDEZ", "GARCIA", "SIEGERT",
    "HENDERSON", "VIRTUDES", "O'REILLY", "AGUACATE",
    "GIFT BOOK", "CENTENARY", "EDITION",
}

# Indicators that a body is a real recipe (case-insensitive substring on
# the body text). At least one must be present, or the candidate is
# rejected as decorative noise.
RECIPE_BODY_SIGNALS = (
    " oz", " ozs", " oz.", "wine glass", "wineglass", "wine-glass",
    "tea spoon", "teaspoon", "table spoon", "tablespoon",
    " dash", "dashes",
    " gill", " glass", " glasses", " bottle", " quart", " gallon",
    "cracked ice", "shaved ice", "small lump",
    "shake well", "shake with", "stir well", "stir with",
    "strain into", "fill the glass", "fill glass", "fill up",
    "serve in", "serve with", "served in", "serve into",
    "pour", "mix well", "mix with",
    "dash of", "drops of", "few drops",
    "1/2", "1/3", "1/4", "2/3", "3/4", "1/6", "1/8", "1/7",
    "½", "¼", "¾", "⅓", "⅔",
    "yz ", "y2 ", "yi ", "y4 ",          # OCR variants of ½ / ¼
    "rum", "gin", "whisky", "whiskey", "brandy", "vermouth",
    "cognac", "absinthe", "champagne", "sherry", "port", "wine",
    "cointreau", "curacao", "curaçao", "grenadine", "syrup",
    "angostura", "maraschino", "bitter",
    "lime", "lemon", "orange", "pineapple", "sugar", "egg",
    "ice ", " ice", "milk", "cream",
    "manhattan glass", "old fashion", "highball", "tumbler",
    "cocktail glass", "cordial glass",
)


def looks_like_recipe_body(body: str) -> bool:
    """A real recipe block has measurement / verb / ingredient signals."""
    text = body.lower()
    return any(sig in text for sig in RECIPE_BODY_SIGNALS)

# Recipe section banners we want to surface as `sections[]` rather than
# treat as a single recipe. Match is substring, case-insensitive on the
# stripped header.
SECTION_BANNERS = (
    "RUM DRINKS", "RON DRINKS", "GIN DRINKS", "GIN COCKTAILS",
    "WHISKY DRINKS", "WHISKEY DRINKS", "BRANDY DRINKS",
    "VERMOUTH DRINKS", "ABSINTHE DRINKS", "CHAMPAGNE",
    "FANCY DRINKS", "POUSSE", "POUSSES", "PUNCH", "PUNCHES",
    "COCKTAILS", "COBBLERS", "FIZZES", "FLIPS", "JULEPS",
    "SOURS", "TODDIES", "SLINGS", "DAISIES", "COLLINS",
    "EGG NOGG", "OLD FASHION", "OTHER RUM DRINKS",
    "CUBAN DRINKS", "SPECIAL COCKTAILS", "MARTINI & ROSSI",
    "COCTELERA COCKTAILS", "DAIQUIRI COCKTAIL",
    "OTHER COCTELERA", "RECIPES", "MIXED DRINKS",
)


def is_header_candidate(stripped: str) -> bool:
    """True if ``stripped`` looks like a recipe / section title.

    Accepts two flavours:
    1. ALL-CAPS lines (Sloppy Joe's style, "GIN COCKTAIL.").
    2. Title Case lines (1917 Seventy Recipes / 1898 Before & After style:
       "West Indian Swizzle.", "The Dream.").
    """
    if not stripped or len(stripped) < 3 or len(stripped) > 60:
        return False
    if PAGE_NUM_RE.match(stripped):
        return False
    upper = stripped.upper()
    for bad in HEADER_BLACKLIST_SUBSTR:
        if bad in upper:
            return False
    letter_count = sum(c.isalpha() for c in stripped)
    if letter_count < 2:
        return False

    has_lower = bool(LOWER_RE.search(stripped))
    if not has_lower:
        # ALL-CAPS form
        return bool(HEADER_RE_UPPER.match(stripped))

    # Mixed case → must look Title Case AND not be a sentence.
    body = stripped.rstrip(" .:")
    words = body.split()
    if not (1 <= len(words) <= 8):
        return False
    # No commas inside the candidate (those mark prose / lists).
    if "," in body:
        return False
    # Reject "ingredient continuation" lines — first token is an OCR
    # mangled fraction or a quantity word.
    first = words[0].lower().strip(".':-—")
    if first in INGREDIENT_FIRST_TOKENS:
        return False
    if INGREDIENT_PREFIX_RE.match(stripped):
        return False
    # First word must start with a letter and start uppercase.
    if not words[0][:1].isalpha() or not words[0][:1].isupper():
        return False
    # Every word must either start with uppercase, be a known small
    # joining word, or be a digit / Roman numeral.
    for w in words:
        wclean = w.strip(".':-—")
        if not wclean:
            continue
        if wclean[:1].isupper():
            continue
        if wclean.lower() in TITLE_JOINS:
            continue
        if wclean.isdigit():
            continue
        return False
    # Reject "<ingredient-adjective> <ingredient-noun>" pairs ("Powdered
    # Sugar.", "Cracked Ice.", "Yellow Chartreuse."). The adjective set is
    # small on purpose so cocktail names like "Tigers Milk" or "Sloppy Joe"
    # survive.
    INGREDIENT_ADJ = {
        "powdered", "cracked", "shaved", "broken", "crushed",
        "yellow", "green", "white", "red", "dark",
        "half", "quarter", "whole", "double", "single",
        "several", "few", "some", "fresh", "old",
    }
    if len(words) == 2:
        first_l = words[0].lower().strip(".':-—")
        last_l = words[-1].lower().strip(".':-—")
        if first_l in INGREDIENT_ADJ and last_l in INGREDIENT_NOUNS:
            return False
        # Pure "<unit-word>" or single ingredient-noun line.
        if last_l in INGREDIENT_UNIT_WORDS and first_l in INGREDIENT_ADJ:
            return False
    if len(words) == 1:
        only = words[0].lower().strip(".':-—")
        if only in INGREDIENT_NOUNS or only in INGREDIENT_UNIT_WORDS:
            return False
    return True


def is_section_banner(stripped: str) -> bool:
    upper = stripped.upper()
    return any(b in upper for b in SECTION_BANNERS)


def detect_year(stem: str) -> Optional[int]:
    m = YEAR_RE.search(stem)
    return int(m.group(1)) if m else None


def collect_recipe_blocks(lines: list[str]) -> list[dict]:
    """Return [{name, raw_text, line_no, is_section_banner}, ...].

    A block survives only if either (a) it's a recognised section banner,
    or (b) its body contains at least one ``RECIPE_BODY_SIGNALS`` token.
    """
    blocks: list[dict] = []
    n = len(lines)
    i = 0
    while i < n:
        stripped = lines[i].strip()
        if is_header_candidate(stripped):
            name = re.sub(r"\s+", " ", stripped)
            # Walk forward until next header candidate OR ≥3 blank lines.
            body: list[str] = []
            blank_run = 0
            j = i + 1
            while j < n:
                line = lines[j]
                s = line.strip()
                if not s:
                    blank_run += 1
                    if blank_run >= 3:
                        break
                    body.append("")
                    j += 1
                    continue
                blank_run = 0
                if is_header_candidate(s):
                    break
                body.append(line.rstrip())
                j += 1
            body_text = "\n".join(body).strip()
            raw = (name + "\n" + body_text).strip()
            banner = is_section_banner(name)
            keep = banner or (body_text and looks_like_recipe_body(body_text))
            if keep:
                blocks.append({
                    "name": name,
                    "raw_text": raw,
                    "line_no": i + 1,
                    "is_section_banner": banner,
                })
            i = j
        else:
            i += 1
    return blocks


def build_skeleton(stem: str) -> dict:
    txt_path = BOOKS_DIR / f"{stem}.txt"
    if not txt_path.is_file():
        raise FileNotFoundError(f"Missing OCR text: {txt_path}")
    raw_text = txt_path.read_text(encoding="utf-8", errors="replace")
    lines = raw_text.splitlines()
    slug = slugify(stem)
    year = detect_year(stem)

    blocks = collect_recipe_blocks(lines)

    sections: list[dict] = []
    recipes: list[dict] = []
    current_section_title: Optional[str] = None
    section_order = 0
    recipe_order = 0
    section_seen: set[str] = set()

    # Always start with a synthetic front_matter section that captures
    # everything before the first header, for the LLM to translate later.
    first_header_line = blocks[0]["line_no"] if blocks else len(lines)
    front_matter = "\n".join(lines[: first_header_line - 1]).strip()
    if front_matter:
        section_order += 1
        sections.append({
            "order": section_order,
            "type": "front_matter",
            "title": None,
            "title_es": None,
            "content_original": front_matter,
            "content_es": None,
        })

    for blk in blocks:
        if blk["is_section_banner"]:
            current_section_title = blk["name"]
            if current_section_title in section_seen:
                continue
            section_seen.add(current_section_title)
            section_order += 1
            sections.append({
                "order": section_order,
                "type": "recipes_section",
                "title": current_section_title,
                "title_es": None,
                "content_original": None,
                "content_es": None,
            })
            continue
        recipe_order += 1
        recipes.append({
            "id": f"{slug}-{recipe_order:03d}",
            "order": recipe_order,
            "section_title": current_section_title,
            "category": None,
            "name_original": blk["name"],
            "name_es": None,
            "yield": None,
            "ingredients": [],
            "method_original": None,
            "method_es": None,
            "glassware": None,
            "garnish": None,
            "page_reference": None,
            "raw_text": blk["raw_text"],
        })

    if not any(s["type"] == "recipes_section" for s in sections) and recipes:
        section_order += 1
        sections.append({
            "order": section_order,
            "type": "recipes_section",
            "title": None,
            "title_es": None,
            "content_original": None,
            "content_es": None,
        })
        for r in recipes:
            r["section_title"] = None

    notes_bits = [
        "Skeleton extraído heurísticamente desde OCR; pendiente de "
        "enriquecimiento (traducciones, ingredientes estructurados, "
        "categorías, vasos, decoraciones, métodos)."
    ]
    if not blocks:
        notes_bits.append(
            "ATENCION: la heurística no detectó cabeceras de receta; "
            "revisión manual necesaria."
        )

    return {
        "book_id": slug,
        "metadata": {
            "title": stem,
            "author": None,
            "year": year,
            "language": None,
            "language_name": None,
            "publisher": None,
            "city": None,
            "edition": None,
            "source_file": f"{stem}.txt",
            "notes": " ".join(notes_bits),
        },
        "sections": sections,
        "recipes": recipes,
    }


def write_skeleton(stem: str, out_dir: Path = SKELETON_DIR) -> Path:
    sk = build_skeleton(stem)
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{sk['book_id']}.skeleton.json"
    out.write_text(json.dumps(sk, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Extract skeleton JSON from EUVS OCR text.")
    parser.add_argument("stem", nargs="?", help="Book stem (without .txt) or known slug.")
    parser.add_argument("--all-pending", action="store_true",
                        help="Process every .txt that has no .json yet.")
    parser.add_argument("--out-dir", type=Path, default=SKELETON_DIR)
    parser.add_argument("--print", action="store_true",
                        help="Also print summary stats per book.")
    args = parser.parse_args(argv)

    if not args.all_pending and not args.stem:
        parser.error("provide a stem or --all-pending")

    stems: list[str] = []
    if args.all_pending:
        done = {p.stem for p in BOOKS_DIR.glob("*.json")}
        for p in sorted(BOOKS_DIR.glob("*.txt")):
            if slugify(p.stem) in done:
                continue
            stems.append(p.stem)
    else:
        stem = args.stem
        if (BOOKS_DIR / f"{stem}.txt").is_file():
            stems = [stem]
        else:
            # try as slug → resolve back to stem via reverse alias / scan
            target_slug = stem
            matched: Optional[str] = None
            for p in BOOKS_DIR.glob("*.txt"):
                if slugify(p.stem) == target_slug:
                    matched = p.stem
                    break
            if not matched:
                parser.error(f"No .txt found for {stem!r}")
            stems = [matched]

    n_ok = 0
    n_recipes = 0
    for stem in stems:
        try:
            out = write_skeleton(stem, args.out_dir)
        except Exception as exc:
            print(f"FAIL {stem}: {exc}", file=sys.stderr)
            continue
        n_ok += 1
        if args.print:
            d = json.loads(out.read_text(encoding="utf-8"))
            n_recipes += len(d["recipes"])
            print(f"{stem} -> {out.name}: "
                  f"{len(d['sections'])} sections, {len(d['recipes'])} recipes")
    print(f"Wrote {n_ok} skeleton(s) to {args.out_dir}", file=sys.stderr)
    if args.print and stems:
        print(f"Total recipes detected: {n_recipes}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
