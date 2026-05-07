#!/usr/bin/env python3
"""Auto-enrich pending recipes from a skeleton with language-aware OCR cleanup.

Builds on the manual workflow used in PRs #211-#218 (Ensslin, Sloppy Joe's,
Cocktail Hour, NY Hand-Book, Hotel Martinique, Here's How, Barman Práctico,
Pillaert). Each language uses a tailored parser:

  en  Line-by-line "AMOUNT UNIT NAME" + "Juice of X Y" + "Shake/Stir"
      method detection. Used for ~6 books in the catalog.
  es  Single-line "NOMBRE: ing - ing - método - copa" extraction
      (Argentine/Cuban manuals).
  fr  Line-by-line with French fractions/units (`traits`, `gouttes`,
      `jus de`, `Zeste de`).

Reads:
    tools/euvs-archive/data/skeletons/<slug>.skeleton.json

Writes (one per recipe):
    tools/euvs-archive/data/enrichments/<slug>/recipes/<order:03d>.json

Each output is either:
    - {"category": ..., "name_es": ..., "ingredients": [...], "method_es": ...}
    - {"skip": "<reason>"}  # if --skip-mixed-case is set and name is mixed-case

This tool does NOT consume `meta.json` or `sections.json` — those are written
by the human in the same enrichment dir, then `finalize_book.py` merges
everything.

Usage:
    python auto_enrich.py <slug> --lang en
    python auto_enrich.py <slug> --lang es --skip-mixed-case
    python auto_enrich.py <slug> --lang fr
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent
SKEL_DIR = ROOT / "data" / "skeletons"
ENRICH_DIR = ROOT / "data" / "enrichments"

# ─────────────────────── OCR fraction normalization ────────────────────────
# Ordered: longer patterns first to avoid greedy partial matches.
OCR_FRACTIONS = [
    # Ensslin (1917)
    (r"¥%", "½"), (r"¥Y", "¾"), (r"¥4", "¼"), (r"¥,", "½"),
    (r"Y%", "¾"), (r"Y4", "¾"), (r"3%", "¾"), (r"24", "¾"),
    (r"M4", "¼"), (r"%4", "¼"),
    # Sloppy Joe's (1938) and Pillaert (1935)
    (r"\bV4\b", "¼"), (r"\bV2\b", "½"), (r"\bVj\b", "½"),
    (r"\bVs\b", "⅓"), (r"\bVa\b", "½"), (r"\bVi\b", "½"),
    (r"\bi/i\b", "½"), (r"\bi/2\b", "½"),
    # Native ASCII fractions
    (r"\b1/3\b", "⅓"), (r"\b2/3\b", "⅔"),
    (r"\b1/2\b", "½"), (r"\b1/4\b", "¼"), (r"\b3/4\b", "¾"),
    (r"\b1/6\b", "⅙"), (r"\b1/8\b", "⅛"),
    # Standalone Y / V at start of token (low priority, last)
    (r"\bY\b", "½"), (r"\bV\b", "½"),
]

# Common OCR typo fixes (book-specific extensions are appended in subclasses).
COMMON_OCR_FIXES = [
    (r"\btho\b", "the"), (r"\bcraced\b", "cracked"),
    (r"\bgiass\b", "glass"), (r"\bof\s+\+\s+", "of ½ "),
    (r"^(\+)\s+", "1 "),
    (r"\bI\s+jigger\b", "1 jigger"), (r"\bI\s+drink\b", "1 drink"),
    (r"\bt\s+jigger\b", "1 jigger"), (r"\bigger\b", "jigger"),
    # Sloppy Joe's typos
    (r"\bTeasijoonful\b", "Teaspoonful"), (r"\bTcaspoonful\b", "Teaspoonful"),
    (r"\bTcaspoonfui\b", "Teaspoonful"), (r"\bTeaspoonfui\b", "Teaspoonful"),
    (r"\bsiigai\b", "sugar"), (r"\bAproeit\b", "Apricot"),
]

FRAC_TO_DECIMAL = {
    "½": "0.5", "¼": "0.25", "¾": "0.75",
    "⅓": "0.333", "⅔": "0.667",
    "⅙": "0.167", "⅛": "0.125",
}

# ─────────────────────── Common ingredient table (EN→ES) ────────────────────
INGREDIENT_ES = {
    # Spirits
    "gin": "ginebra", "dry gin": "ginebra seca", "old tom gin": "Old Tom Gin",
    "tom gin": "Tom Gin", "el bart gin": "ginebra El Bart", "sloe gin": "Sloe Gin",
    "whiskey": "whisky", "rye whiskey": "whisky de centeno", "rye": "whisky de centeno",
    "scotch whiskey": "whisky escocés", "scotch": "whisky escocés",
    "bourbon whiskey": "whisky bourbon", "bourbon": "bourbon",
    "irish whiskey": "whisky irlandés", "canadian club": "Canadian Club",
    "canadian club whisky": "whisky Canadian Club", "wilson whiskey": "whisky Wilson",
    "rum": "ron", "bacardi rum": "ron Bacardí", "cuban rum": "ron cubano",
    "jamaica rum": "ron de Jamaica", "jamaican rum": "ron jamaicano",
    "st. croix rum": "ron de Santa Cruz",
    "porto rico rum": "ron de Puerto Rico", "puerto rico rum": "ron de Puerto Rico",
    "brandy": "brandy", "california brandy": "brandy de California",
    "apricot brandy": "brandy de albaricoque", "apple brandy": "brandy de manzana",
    "apple jack": "applejack", "applejack": "applejack",
    "cherry brandy": "brandy de cereza", "blackberry brandy": "brandy de mora",
    "prunelle brandy": "brandy de endrina",
    # Modifiers / liqueurs
    "absinthe": "absenta", "white absinthe": "absenta blanca",
    "anisette": "anís", "anizette": "anís",
    "angostura bitters": "amargo de Angostura", "aromatic bitters": "amargo aromático",
    "boker bitters": "amargo de Boker", "boker's bitters": "amargo de Boker",
    "peychaud bitters": "amargo Peychaud",
    "orange bitters": "amargo de naranja",
    "fernet branca": "Fernet Branca",
    "amer picon": "Amer Picon", "amer-picon": "Amer Picon",
    "benedictine": "Bénédictine",
    "chartreuse": "Chartreuse", "yellow chartreuse": "Chartreuse amarillo",
    "green chartreuse": "Chartreuse verde",
    "creme de cacao": "crema de cacao", "créme de cacao": "crema de cacao",
    "crème de cacao": "crema de cacao",
    "creme de menthe": "crema de menta", "créme de menthe": "crema de menta",
    "white creme de menthe": "crema de menta blanca",
    "creme de violette": "crema de violeta", "créme de violette": "crema de violeta",
    "creme yvette": "crema Yvette", "créme yvette": "crema Yvette",
    "curacao": "curaçao", "white curacao": "curaçao blanco",
    "orange curacao": "curaçao de naranja", "triple sec": "Triple Sec",
    "cointreau": "Cointreau", "dubonnet": "Dubonnet",
    "french vermouth": "vermut francés", "italian vermouth": "vermut italiano",
    "vermouth": "vermut",
    "maraschino": "maraschino", "kummel": "Kümmel",
    "swedish punch": "ponche sueco",
    # Wines / fortified
    "port wine": "oporto", "port": "oporto",
    "sherry": "jerez", "sherry wine": "jerez",
    "claret": "clarete", "rhine wine": "vino del Rin",
    "burgundy": "Borgoña", "champagne": "champán",
    # Sweeteners / mixers
    "gum syrup": "jarabe de goma", "grenadine": "granadina",
    "grenadine syrup": "jarabe de granadina", "raspberry syrup": "jarabe de frambuesa",
    "powdered sugar": "azúcar glas", "loaf sugar": "azúcar en terrón",
    "sugar": "azúcar", "molasses": "melaza", "honey": "miel",
    # Juices / fruits
    "lemon juice": "zumo de limón", "lime juice": "zumo de lima",
    "orange juice": "zumo de naranja", "pineapple juice": "zumo de piña",
    "blood orange": "naranja sanguina",
    "lemon": "limón", "lime": "lima", "orange": "naranja", "pineapple": "piña",
    "blackberry": "mora", "cherry": "cereza", "cherries": "cerezas",
    "lemon peel": "piel de limón", "orange peel": "piel de naranja",
    # Glassware / garnishes
    "olive": "aceituna", "mint": "menta", "fresh mint": "menta fresca",
    "nutmeg": "nuez moscada",
    # Bases
    "ice": "hielo", "cracked ice": "hielo picado", "shaved ice": "hielo escarchado",
    "cube of ice": "cubo de hielo",
    "egg": "huevo", "white of egg": "clara de huevo", "yolk of an egg": "yema de huevo",
    "sweet cream": "nata dulce", "cream": "nata", "milk": "leche",
    "soda water": "soda", "club soda": "soda", "water": "agua",
    "boiling water": "agua hirviendo",
}

# ─────────────────────── Unit pattern table ─────────────────────────────────
# (regex, schema_unit, amount_extractor)
UNIT_PATTERNS = [
    (r"^(\d+)\s+dash(es)?\s+", "dash", lambda m: m.group(1)),
    (r"^(\d+)\s+jigger(s)?\s+(of\s+)?", "jigger", lambda m: m.group(1)),
    (r"^(\d+)\s+pony(s)?\s+(of\s+)?", "pony", lambda m: m.group(1)),
    (r"^(\d+)\s+drink(s)?\s+(of\s+)?", "drink", lambda m: m.group(1)),
    (r"^(\d+)\s+bar\s+spoonful(s)?\s+", "tablespoon", lambda m: m.group(1)),
    (r"^(\d+)\s+(?:teaspoonful|teasijoonful|tcaspoonful|teaspoon)s?\s+(of\s+)?",
        "teaspoon", lambda m: m.group(1)),
    (r"^(\d+)\s+tablespoonful(s)?\s+", "tablespoon", lambda m: m.group(1)),
    (r"^(\d+)\s+slice(s)?\s+(of\s+)?", "slice", lambda m: m.group(1)),
    (r"^(\d+)\s+piece(s)?\s+(of\s+)?", "piece", lambda m: m.group(1)),
    (r"^(\d+)\s+cube(s)?\s+(of\s+)?", "piece", lambda m: m.group(1)),
    (r"^(\d+)\s+drop(s)?\s+(of\s+)?", "dash", lambda m: m.group(1)),
    (r"^(\d+)\s+gallon(s)?\s+(of\s+)?", "gallon", lambda m: m.group(1)),
    (r"^(\d+)\s+quart(s)?\s+(of\s+)?", "quart", lambda m: m.group(1)),
    (r"^(\d+)\s+gill(s)?\s+(of\s+)?", "gill", lambda m: m.group(1)),
    (r"^(\d+)\s+wine\s*-?\s*glass(es)?\s+(of\s+)?", "wine-glass", lambda m: m.group(1)),
    (r"^(\d+)\s+sprig\s+", "piece", lambda m: m.group(1)),
    # Sloppy Joe's / Hotel Martinique units
    (r"^(\d+)\s+oz\.?\s+(of\s+)?", "oz", lambda m: m.group(1)),
    (r"^(\d+)\s+ounce(s)?\s+(of\s+)?", "oz", lambda m: m.group(1)),
    # Here's How (1930) units
    (r"^(\d+)\s+shot(s)?\s+(of\s+)?", "oz", lambda m: m.group(1)),
    (r"^(½|¼|¾|⅓|⅔)\s+shot(s)?\s+(of\s+)?", "oz", lambda m: m.group(1)),
    (r"^(\d+)\s+barspoonfu[il]\s+(of\s+)?", "tablespoon", lambda m: m.group(1)),
    (r"^(\d+)\s+lump(s)?\s+(of\s+)?", "piece", lambda m: m.group(1)),
    (r"^(\d+)\s+pint(s)?\s+(of\s+)?", "gill", lambda m: m.group(1)),
    # Unicode-fraction prefixes
    (r"^(½|¼|¾|⅓|⅔)\s+jigger\s+(of\s+)?", "jigger", lambda m: m.group(1)),
    (r"^(½|¼|¾|⅓|⅔)\s+pony\s+(of\s+)?", "pony", lambda m: m.group(1)),
    (r"^(½|¼|¾|⅓|⅔)\s+drink\s+(of\s+)?", "drink", lambda m: m.group(1)),
    (r"^(½|¼|¾|⅓|⅔)\s+(?:oz|ounce)s?\.?\s+(of\s+)?", "oz", lambda m: m.group(1)),
    (r"^(½|¼|¾|⅓|⅔)\s+part\s+(of\s+)?", None, lambda m: m.group(1)),
    (r"^(½|¼|¾|⅓|⅔)\s+of\s+", None, lambda m: m.group(1)),
    (r"^(½|¼|¾|⅓|⅔)\s+", None, lambda m: m.group(1)),
]

METHOD_KEYWORDS_EN = (
    "shake", "stir", "muddle", "use", "made same as",
    "fill", "place", "break", "serve", "pour",
)

# Standard method translations (EN → ES)
STD_METHOD_TRANSLATIONS_EN = [
    (r"shake well in a mixing glass with cracked ice,?\s+strain\s+and\s+serve\.?",
     "Agitar bien en vaso mezclador con hielo picado, colar y servir."),
    (r"stir well in a mixing glass with cracked ice,?\s+strain\s+and\s+serve\.?",
     "Revolver bien en vaso mezclador con hielo picado, colar y servir."),
]


# ─────────────────────── Core utilities ─────────────────────────────────────

def normalize_ocr(text: str, extra_fixes: Optional[list] = None) -> str:
    out = text
    for pat, rep in OCR_FRACTIONS:
        out = re.sub(pat, rep, out)
    out = re.sub(r"(?m)^%\s+", "½ ", out)
    out = re.sub(r"(?m)^%4\s+", "¼ ", out)
    out = re.sub(r"¥", "½", out)
    out = re.sub(r"(?m)^Y\s+", "¾ ", out)
    for pat, rep in COMMON_OCR_FIXES:
        out = re.sub(pat, rep, out)
    for pat, rep in (extra_fixes or []):
        out = re.sub(pat, rep, out)
    return out


def translate_ingredient_en(name: str) -> Optional[str]:
    n = name.strip().lower().rstrip(",.;:")
    if n in INGREDIENT_ES:
        return INGREDIENT_ES[n]
    n2 = re.sub(r"\b(very dry|fresh|good|best|old|sweet|cold|hot)\s+", "", n)
    if n2 in INGREDIENT_ES:
        return INGREDIENT_ES[n2]
    n3 = re.sub(r"\s*\(.*?\)$", "", n).strip()
    if n3 in INGREDIENT_ES:
        return INGREDIENT_ES[n3]
    return None


def find_glassware(text: str) -> Optional[str]:
    t = text.lower()
    if "old fashioned" in t or "old-fashioned" in t:
        return "Old Fashioned"
    for kw in ("highball", "wine glass", "sherry glass", "cordial glass",
               "stem glass", "cocktail glass", "bar glass", "fancy glass",
               "fifth avenue glass", "long glass", "tumbler", "port wine glass"):
        if kw in t:
            return kw.replace(" ", " ").strip()
    return None


def find_garnish(text: str) -> Optional[str]:
    t = text.lower()
    parts = []
    m = re.search(r"twist of (lemon|orange) peel", t)
    if m:
        parts.append(f"twist of {m.group(1)} peel")
    if "with a cherry" in t or " a cherry" in t:
        parts.append("cherry")
    if "with an olive" in t or " an olive" in t:
        parts.append("olive")
    if "fresh mint" in t or "sprig" in t:
        parts.append("fresh mint")
    if "slice of pineapple" in t:
        parts.append("slice of pineapple")
    return " + ".join(parts) if parts else None


def infer_category(name: str, raw_text: str) -> str:
    n = name.lower()
    rt = raw_text.lower()[:100]
    table = [
        ("fizz", "fizz"), ("sour", "sour"), ("cobbler", "cobbler"),
        ("cup", "cup"), ("julep", "julep"), ("toddy", "toddy"),
        ("flip", "flip"), ("smash", "smash"), ("sling", "sling"),
        ("punch", "punch"), ("crusta", "crusta"), ("sangaree", "sangaree"),
        ("rickey", "other"), ("lemonade", "other"), ("highball", "other"),
        ("cooler", "other"), ("frappe", "other"), ("drip", "other"),
        ("cocktail", "cocktail"),
    ]
    for kw, cat in table:
        if kw in n or (cat == "cobbler" and "cobbler" in rt):
            return cat
    return "cocktail"


def title_case_es(name: str) -> str:
    s = re.sub(r"\s+", " ", name.strip().rstrip(",.").rstrip(":"))
    keep_lower = {"de", "del", "la", "el", "y", "of", "the", "and", "in", "on"}
    out = []
    for i, w in enumerate(s.split(" ")):
        out.append(w.lower() if i > 0 and w.lower() in keep_lower else w.capitalize())
    return " ".join(out)


def make_name_es(name_original: str) -> str:
    n = title_case_es(name_original)
    nl = n.lower()
    suffixes = [
        (" cocktail (dry)", lambda b: f"Cóctel {b} (seco)"),
        (" cocktail (sweet)", lambda b: f"Cóctel {b} (dulce)"),
        (" cocktail", lambda b: f"Cóctel {b}"),
        (" sour", lambda b: f"Sour de {b.lower()}"),
        (" fizz", lambda b: f"Fizz {b}"),
        (" cooler", lambda b: f"Cooler {b}"),
        (" cup", lambda b: f"Cup de {b.lower()}"),
        (" cobbler", lambda b: f"Cobbler {b}"),
        (" highball", lambda b: f"Highball {b}"),
        (" rickey", lambda b: f"Rickey {b}"),
        (" julep", lambda b: f"Julep {b}"),
        (" toddy", lambda b: f"Toddy {b}"),
        (" flip", lambda b: f"Flip {b}"),
        (" lemonade", lambda b: f"Limonada {b}"),
    ]
    for sfx, fmt in suffixes:
        if nl.endswith(sfx):
            return fmt(n[: -len(sfx)].strip())
    if " cocktail " in nl:
        return n.replace("Cocktail", "Cóctel").replace("COCKTAIL", "Cóctel")
    return n


# ─────────────────────── EN parser ──────────────────────────────────────────

def parse_ingredient_line_en(line: str) -> Optional[dict]:
    s = line.strip()
    if not s:
        return None
    sl = s.lower()
    if any(sl.startswith(k) for k in METHOD_KEYWORDS_EN):
        return None
    if "strain" in sl or "serve" in sl or sl.startswith("made same as"):
        return None
    # "Juice of N fruit"
    m = re.match(r"^juice\s+(?:and\s+rind\s+)?of\s+(\d+|½|¼|¾)\s+(.+?)[.,]?$", sl)
    if m:
        amount = m.group(1)
        fruit = m.group(2).strip().rstrip(",.")
        amt = FRAC_TO_DECIMAL.get(amount, amount)
        item_es = INGREDIENT_ES.get(f"{fruit} juice", INGREDIENT_ES.get(fruit, fruit))
        return {
            "item_original": f"juice of {amount} {fruit}",
            "item_es": f"zumo de {amt} {item_es}" if amt != "1" else f"zumo de {item_es}",
            "amount": amt, "unit": "piece", "notes": None,
        }
    # White/Yolk of egg
    m = re.match(r"^(white|yolk) of (\d+|an?|½|¼)\s+egg", sl)
    if m:
        part, amount = m.group(1), m.group(2)
        amt = {"½": "0.5", "¼": "0.25", "an": "1", "a": "1"}.get(amount, amount)
        es = "clara" if part == "white" else "yema"
        return {
            "item_original": s.rstrip(",."), "item_es": f"{es} de huevo",
            "amount": amt, "unit": "piece", "notes": None,
        }
    # Standard pattern
    for pattern, unit_default, get_amt in UNIT_PATTERNS:
        m = re.match(pattern, s, flags=re.I)
        if m:
            amount = get_amt(m)
            rest = s[m.end():].strip().rstrip(",.")
            rest = re.sub(r"^(of\s+|part\s+of\s+)", "", rest, flags=re.I).strip().rstrip(",.")
            if not rest:
                continue
            amt = FRAC_TO_DECIMAL.get(amount, amount)
            item_es = translate_ingredient_en(rest) or rest.lower()
            return {
                "item_original": rest, "item_es": item_es,
                "amount": amt, "unit": unit_default, "notes": None,
            }
    # Bare ingredient
    if re.match(r"^[A-Za-z][A-Za-z .'’\-]+\.?$", s) and len(s) < 60:
        item_es = translate_ingredient_en(s)
        if item_es is None:
            return None
        return {
            "item_original": s.rstrip(",."), "item_es": item_es,
            "amount": None, "unit": None, "notes": None,
        }
    return None


def split_ingredients_method_en(raw_text: str) -> tuple[list[str], list[str]]:
    cleaned = normalize_ocr(raw_text)
    lines = [l.rstrip() for l in cleaned.split("\n")]
    if lines:
        lines = lines[1:]  # drop name line
    ingredients, method = [], []
    in_method = False
    for line in lines:
        s = line.strip()
        if not s:
            continue
        sl = s.lower()
        if any(sl.startswith(k) for k in
               ("shake", "stir", "muddle", "fill", "place", "break", "pour", "serve")):
            in_method = True
        elif "made same as" in sl:
            in_method = True
        (method if in_method else ingredients).append(s)
    return ingredients, method


def translate_method_en(method_text: str) -> Optional[str]:
    if not method_text:
        return None
    m = method_text.lower().strip().rstrip(".")
    for pat, es in STD_METHOD_TRANSLATIONS_EN:
        if re.match(pat, m, flags=re.I | re.S):
            return es
    parts = []
    if "shake" in m:
        parts.append("Agitar bien con hielo picado")
    elif "stir" in m:
        parts.append("Revolver bien con hielo picado")
    elif "muddle" in m:
        parts.append("Macerar los ingredientes")
    if "strain" in m:
        parts.append("colar")
    if "serve" in m:
        parts.append("servir")
    return ", ".join(parts) + "." if parts else None


def parse_recipe_en(rec: dict) -> dict:
    name = rec["name_original"]
    raw = rec.get("raw_text", "")
    ing_lines, method_lines = split_ingredients_method_en(raw)
    method_original = " ".join(method_lines).strip() or None
    if method_original:
        method_original = re.sub(r"\s+", " ", method_original)
    ingredients = [p for p in (parse_ingredient_line_en(l) for l in ing_lines) if p]
    patch: dict = {
        "category": infer_category(name, raw),
        "name_es": make_name_es(name),
    }
    if ingredients:
        patch["ingredients"] = ingredients
    else:
        patch["ingredients"] = []
        patch["notes"] = "Receta con OCR demasiado dañado para extraer ingredientes; ver raw_text."
    if method_original:
        patch["method_original"] = method_original
        es = translate_method_en(method_original)
        if es:
            patch["method_es"] = es
    g = find_glassware(raw)
    if g:
        patch["glassware"] = g
    gar = find_garnish(raw)
    if gar:
        patch["garnish"] = gar
    return patch


# ─────────────────────── ES parser ──────────────────────────────────────────

ES_OCR_FIXES = {
    "Anissette": "Anisette", "Cogñac": "Cognac", "Cogñiac": "Cognac",
    "Cointrecu": "Cointreau", "Cointreoau": "Cointreau",
    "Croma": "Crema", "Curagao": "Curaçao", "Curacao": "Curaçao",
    "Marrasquino": "Maraschino", "Marrosquino": "Maraschino",
    "Pipermint": "Peppermint", "Pippermint": "Peppermint",
    "Charireuso": "Chartreuse", "Chartrouse": "Chartreuse",
    "Joréz": "Jerez", "Termíneso": "Termínese", "Rhum": "Ron",
    "Vermouts": "Vermouth", "Vermouih": "Vermouth", "Verrouth": "Vermouth",
    "Hieo": "Hielo", "Whisky Amoricano": "Whisky Americano",
    "Frutilta": "Frutilla", "Anand": "Anana", "Limén": "Limón",
}

ES_METHOD_KEYWORDS = (
    "batido", "revuelto", "mixto", "frappé", "frappe", "agitado",
    "termínese", "termineso", "termínase", "muddle", "termínelo",
    "agréguese", "complete", "rellénese", "decórese", "adórnese",
)


def parse_recipe_es(rec: dict) -> dict:
    raw = rec.get("raw_text", "")
    for bad, good in ES_OCR_FIXES.items():
        raw = raw.replace(bad, good)
    name = rec["name_original"]
    lines = raw.split("\n")
    body = " ".join(l.strip() for l in lines[1:] if l.strip())
    parts = [p.strip().rstrip(".,") for p in
             re.split(r"\s+[-+»]\s+|\s+[-+»]+\s*$|\s*[-+»]+\s*$", body) if p.strip()]
    ingredients, method, glass = [], [], None
    for p in parts:
        pl = p.lower()
        gm = re.search(r"\b(copa|vaso)\s+n[º°?]?\.?\s*(\d+)", pl)
        if gm:
            glass = f"{gm.group(1).capitalize()} N° {gm.group(2)}"
            continue
        if any(k in pl for k in ES_METHOD_KEYWORDS):
            method.append(p)
            continue
        if 1 <= len(p) <= 60:
            ingredients.append(p)
    patch: dict = {
        "category": infer_category(name, raw),
        "name_es": title_case_es(name),
    }
    if ingredients:
        patch["ingredients"] = [
            {"item_original": ing, "item_es": ing.lower(),
             "amount": None, "unit": None, "notes": None}
            for ing in ingredients
        ]
    else:
        patch["ingredients"] = []
        patch["notes"] = "Receta con OCR demasiado dañado para extraer ingredientes; ver raw_text."
    if method:
        method_text = "; ".join(method).strip()
        patch["method_original"] = method_text
        patch["method_es"] = method_text  # already Spanish
    if glass:
        patch["glassware"] = glass
    return patch


# ─────────────────────── FR parser ──────────────────────────────────────────

FR_TO_ES = {
    "gordon's dry gin": "Gordon's Dry Gin", "gordon's gin": "Gordon's Gin",
    "gordon's": "Gordon's",
    "vermouth martini": "Vermut Martini", "vermouth": "vermut",
    "noilly prat": "Noilly Prat", "rossi": "Rossi (vermut)",
    "fine martell": "Fine Martell (cognac)",
    "fine hennessy": "Fine Hennessy (cognac)",
    "fine tricoche": "Fine Tricoche (cognac)",
    "cognac martel": "Cognac Martell", "cognac": "cognac",
    "whisky canadian": "whisky canadiense",
    "canadian whisky": "whisky canadiense",
    "scotch whisky": "whisky escocés", "whisky": "whisky",
    "rhum": "ron", "ron": "ron", "rhum charleston": "ron Charleston",
    "gin": "ginebra", "dry gin": "ginebra seca",
    "old tom": "Old Tom Gin",
    "cointreau": "Cointreau", "curaçao": "curaçao",
    "curaçao blanc": "curaçao blanco",
    "marasquin": "maraschino", "maraskin": "maraschino",
    "angostura": "Angostura", "orange bitter": "amargo de naranja",
    "apricot brandy": "brandy de albaricoque",
    "kirsch": "Kirsch", "kirach": "Kirsch",
    "absinthe": "absenta", "fernet": "Fernet",
    "fernet branca": "Fernet Branca", "campari": "Campari",
    "dubonnet": "Dubonnet", "anisette": "Anisette",
    "bénédictine": "Bénédictine", "benedictine": "Bénédictine",
    "chartreuse": "Chartreuse", "drambuie": "Drambuie",
    "porto": "oporto", "champagne": "champán",
    "vin blanc": "vino blanco", "vin rouge": "vino tinto",
    "soda": "soda", "ginger ale": "ginger ale",
    "ginger beer": "ginger beer",
    "marie brizard": "Marie Brizard",
    "vermouth mart": "Vermut Martini",
    "vermouth matini": "Vermut Martini",
    "vermouth martini dry": "Vermut Martini Seco",
    "sucre": "azúcar", "azúcar": "azúcar",
}

FR_OCR_FIXES = [
    (r"\bGordon'a\b", "Gordon's"), (r"\bGordon'e\b", "Gordon's"),
    (r"\bMatini\b", "Martini"), (r"\bChampagnë\b", "Champagne"),
    (r"\b(\d+)\s*>\s+", r"\1 traits "),
    (r"\bBickey\b", "Rickey"), (r"\bKFizz\b", "Fizz"),
]

FR_METHOD_KW = (
    "passer shakers", "shakers", "verser", "agiter",
    "remuer", "secouer", "finir", "remplir",
)


def parse_recipe_fr(rec: dict) -> dict:
    raw = rec.get("raw_text", "")
    for pat, rep in FR_OCR_FIXES:
        raw = re.sub(pat, rep, raw)
    name = rec["name_original"]
    lines = [l.strip() for l in raw.split("\n") if l.strip()]
    if lines:
        lines = lines[1:]
    ingredients, method, glassware = [], [], None
    for line in lines:
        ll = line.lower()
        if "tumbler" in ll:
            glassware = "Tumbler"
            cleaned = re.sub(r"\btumbler\b", "", line, flags=re.I).strip()
            if not cleaned:
                continue
            line = cleaned
        if any(k in ll for k in FR_METHOD_KW):
            method.append(line)
            continue
        if len(line) < 2:
            continue
        m = re.match(r"^(\d+/\d+)\s+(.+)", line)
        if m:
            frac, rest = m.group(1), m.group(2).strip().rstrip(",.")
            amt = FRAC_TO_DECIMAL.get({"1/2": "½", "1/3": "⅓", "2/3": "⅔",
                                       "1/4": "¼", "3/4": "¾", "1/6": "⅙",
                                       "1/8": "⅛"}.get(frac, frac), frac)
            es = FR_TO_ES.get(rest.lower(), rest.lower())
            ingredients.append({
                "item_original": rest, "item_es": es,
                "amount": amt, "unit": None, "notes": None,
            })
            continue
        m = re.match(r"^(\d+)\s+(traits?|gouttes?|cuilliere?\s*\(s\)?|cuiller)\s+(.+)",
                     line, flags=re.I)
        if m:
            n_, unit_word, rest = m.group(1), m.group(2).lower(), m.group(3).strip().rstrip(",.")
            unit = "dash" if unit_word.startswith(("trait", "goutte")) else "teaspoon"
            es = FR_TO_ES.get(rest.lower(), rest.lower())
            ingredients.append({
                "item_original": rest, "item_es": es,
                "amount": n_, "unit": unit, "notes": None,
            })
            continue
        m = re.match(r"^le\s+jus\s+d'?\s*(?:une|un)?\s*(\d+/\d+)?\s*(\w+)",
                     line, flags=re.I)
        if m:
            frac = m.group(1) or "1"
            fruit = m.group(2).strip()
            amt = FRAC_TO_DECIMAL.get({"1/2": "½", "1/3": "⅓", "2/3": "⅔",
                                       "1/4": "¼"}.get(frac, frac), frac)
            ingredients.append({
                "item_original": f"jus d'une {frac} {fruit}",
                "item_es": f"zumo de {fruit.lower()}",
                "amount": amt, "unit": "piece", "notes": None,
            })
            continue
        m = re.match(r"^(?:un\s+(?:large\s+)?)?zeste\s+(?:de|d')\s*(\w+)",
                     line, flags=re.I)
        if m:
            fruit = m.group(1)
            ingredients.append({
                "item_original": f"Zeste de {fruit}",
                "item_es": f"piel de {fruit.lower()}",
                "amount": "1", "unit": "piece", "notes": None,
            })
            continue
        if re.match(r"^[\d\.\-\s]+$", line) or len(line) > 50:
            continue
        es = FR_TO_ES.get(line.lower(), line.lower())
        ingredients.append({
            "item_original": line.rstrip(".,"), "item_es": es,
            "amount": None, "unit": None, "notes": None,
        })
    patch: dict = {
        "category": infer_category(name, raw),
        "name_es": name.replace("Cocktail", "Cóctel").title(),
    }
    if ingredients:
        patch["ingredients"] = ingredients
    else:
        patch["ingredients"] = []
        patch["notes"] = "Receta con OCR demasiado dañado para extraer ingredientes; ver raw_text."
    if method:
        method_text = "; ".join(method).strip()
        patch["method_original"] = method_text
        method_es = method_text
        method_es = re.sub(r"passer shakers?", "pasar por la coctelera", method_es, flags=re.I)
        method_es = re.sub(r"\bagiter\b", "agitar", method_es, flags=re.I)
        method_es = re.sub(r"\bsecouer\b", "agitar", method_es, flags=re.I)
        method_es = re.sub(r"\bremuer\b", "remover", method_es, flags=re.I)
        method_es = re.sub(r"\bverser\b", "verter", method_es, flags=re.I)
        method_es = re.sub(r"\bfinir\b", "terminar", method_es, flags=re.I)
        patch["method_es"] = method_es
    if glassware:
        patch["glassware"] = glassware
    return patch


# ─────────────────────── Dispatcher ─────────────────────────────────────────

PARSERS = {"en": parse_recipe_en, "es": parse_recipe_es, "fr": parse_recipe_fr}


def enrich(slug: str, lang: str, skip_mixed_case: bool = False) -> tuple[int, int]:
    """Read skeleton, write per-recipe patches, return (n_written, n_no_ing)."""
    skel_path = SKEL_DIR / f"{slug}.skeleton.json"
    if not skel_path.is_file():
        raise FileNotFoundError(f"Skeleton not found: {skel_path}")
    skel = json.loads(skel_path.read_text(encoding="utf-8"))
    out_dir = ENRICH_DIR / slug / "recipes"
    out_dir.mkdir(parents=True, exist_ok=True)

    parser = PARSERS[lang]
    n_written = 0
    n_no_ing = 0
    for r in skel["recipes"]:
        order = r["order"]
        fname = out_dir / f"{order:03d}.json"
        # If a skip already exists, leave it alone
        if fname.is_file():
            try:
                existing = json.loads(fname.read_text(encoding="utf-8"))
                if existing.get("skip"):
                    continue
            except Exception:
                pass
        # Optional bulk-skip mixed-case (the heuristic that's worked for
        # most English books — names are ALL CAPS in real recipes).
        if skip_mixed_case and not r["name_original"].isupper():
            patch = {"skip": "ingredient_fragment"}
        else:
            patch = parser(r)
            if not patch.get("ingredients") and patch.get("notes"):
                n_no_ing += 1
        fname.write_text(json.dumps(patch, ensure_ascii=False, indent=2) + "\n",
                         encoding="utf-8")
        n_written += 1
    return n_written, n_no_ing


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("slug", help="Book slug (e.g. 1917-recipes-for-mixed-drinks-…)")
    p.add_argument("--lang", default="en", choices=("en", "es", "fr"),
                   help="Source language of the book (default: en)")
    p.add_argument("--skip-mixed-case", action="store_true",
                   help="Bulk-skip recipes with non-ALL-CAPS names as fragments. "
                        "Useful for English books where real recipes are in all-caps.")
    args = p.parse_args(argv)

    n_written, n_no_ing = enrich(args.slug, args.lang, args.skip_mixed_case)
    print(f"Wrote {n_written} patches; {n_no_ing} without ingredients")
    return 0


if __name__ == "__main__":
    sys.exit(main())
