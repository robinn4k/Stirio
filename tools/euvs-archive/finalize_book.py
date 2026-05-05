#!/usr/bin/env python3
"""Merge a skeleton + per-recipe enrichments into a final EUVS book JSON.

Input layout:

    tools/euvs-archive/data/skeletons/<slug>.skeleton.json
    tools/euvs-archive/data/enrichments/<slug>/
        meta.json                      # metadata patch (author, language…)
        sections.json                  # optional list of section translations
        recipes/<order:03d>.json       # one file per enriched recipe
                                       # OR a sentinel  {"skip": "<reason>"}

Output:

    data/euvs-books/<slug>.json

A recipe may be enriched (then its sentinel object overwrites the
skeleton's null fields), or skipped (then it's removed from the final
recipes list and recorded in metadata.notes). The final JSON is checked
against ``_SCHEMA.md``'s structural rules:

* ``book_id`` matches the file name.
* ``metadata.year`` is an int (or null) and ``source_file`` is set.
* ``recipes[]`` ids are unique and zero-padded ``<book_id>-NNN``.
* Every kept recipe has ``category`` and either ``ingredients`` (list,
  may be empty) or a non-empty ``notes`` field on the recipe explaining
  why ingredients couldn't be parsed.
* All recipes have a non-null ``raw_text``.

Usage:
    python finalize_book.py <slug>             # writes data/euvs-books/<slug>.json
    python finalize_book.py <slug> --dry-run   # print problems, write nothing
    python finalize_book.py --all              # process every skeleton with full enrichments
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent.parent
BOOKS_DIR = REPO_ROOT / "data" / "euvs-books"
SKELETON_DIR = ROOT / "data" / "skeletons"
ENRICHMENT_DIR = ROOT / "data" / "enrichments"

ALLOWED_CATEGORIES = {
    "cocktail", "punch", "cobbler", "cup", "julep", "sour", "fizz",
    "flip", "toddy", "sangaree", "smash", "sling", "crusta", "sangría",
    "other",
}
ALLOWED_LANGUAGES = {"en", "es", "fr", "it", "de", "la", "mixed"}
ALLOWED_SECTION_TYPES = {
    "front_matter", "preface", "introduction", "history", "explanation",
    "recipes_section", "appendix", "index", "advertisement", "other",
}


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def merge_recipe(skel_recipe: dict, patch: dict) -> dict:
    """Overlay enrichment fields onto the skeleton recipe."""
    out = dict(skel_recipe)
    for k, v in patch.items():
        if k in {"id", "order", "raw_text"}:
            continue  # never let an enrichment overwrite identity / audit fields
        out[k] = v
    return out


def validate_recipe(recipe: dict, problems: list[str], book_id: str) -> bool:
    rid = recipe.get("id", "?")
    ok = True
    expected_id = f"{book_id}-{int(recipe.get('order', 0)):03d}"
    if rid != expected_id:
        problems.append(f"recipe {rid}: id should be {expected_id}")
        ok = False
    if not recipe.get("raw_text"):
        problems.append(f"recipe {rid}: missing raw_text")
        ok = False
    cat = recipe.get("category")
    if cat not in ALLOWED_CATEGORIES:
        problems.append(f"recipe {rid}: category {cat!r} not in allowed set")
        ok = False
    if not recipe.get("name_original"):
        problems.append(f"recipe {rid}: missing name_original")
        ok = False
    if recipe.get("name_es") in (None, ""):
        problems.append(f"recipe {rid}: missing name_es")
        ok = False
    ingredients = recipe.get("ingredients")
    notes = recipe.get("notes")
    if (not isinstance(ingredients, list)
            or (len(ingredients) == 0 and not notes)):
        problems.append(
            f"recipe {rid}: empty ingredients[] requires explanatory notes"
        )
        ok = False
    if isinstance(ingredients, list):
        for idx, ing in enumerate(ingredients):
            if not isinstance(ing, dict):
                problems.append(f"recipe {rid}: ingredient #{idx} not an object")
                ok = False
                continue
            if not ing.get("item_original"):
                problems.append(
                    f"recipe {rid}: ingredient #{idx} missing item_original"
                )
                ok = False
            if ing.get("item_es") in (None, ""):
                problems.append(
                    f"recipe {rid}: ingredient #{idx} missing item_es"
                )
                ok = False
    return ok


def validate_book(book: dict, problems: list[str]) -> bool:
    ok = True
    book_id = book.get("book_id")
    if not isinstance(book_id, str) or not book_id:
        problems.append("missing book_id")
        ok = False
        return ok
    md = book.get("metadata") or {}
    if not md.get("title"):
        problems.append("metadata.title is empty")
        ok = False
    if not md.get("source_file"):
        problems.append("metadata.source_file is empty")
        ok = False
    lang = md.get("language")
    if lang is not None and lang not in ALLOWED_LANGUAGES:
        problems.append(f"metadata.language {lang!r} not in {sorted(ALLOWED_LANGUAGES)}")
        ok = False
    year = md.get("year")
    if year is not None and not isinstance(year, int):
        problems.append("metadata.year must be int or null")
        ok = False
    seen_ids: set[str] = set()
    for sec in book.get("sections") or []:
        t = sec.get("type")
        if t not in ALLOWED_SECTION_TYPES:
            problems.append(f"section type {t!r} not allowed")
            ok = False
    for r in book.get("recipes") or []:
        rid = r.get("id")
        if rid in seen_ids:
            problems.append(f"duplicate recipe id {rid}")
            ok = False
        else:
            seen_ids.add(rid)
        if not validate_recipe(r, problems, book_id):
            ok = False
    return ok


def finalize(slug: str, dry_run: bool = False) -> tuple[bool, list[str]]:
    skel_path = SKELETON_DIR / f"{slug}.skeleton.json"
    if not skel_path.is_file():
        return False, [f"skeleton missing: {skel_path}"]
    skel = load_json(skel_path)

    enrich_root = ENRICHMENT_DIR / slug

    # Metadata patch.
    if (enrich_root / "meta.json").is_file():
        meta_patch = load_json(enrich_root / "meta.json")
        for k, v in meta_patch.items():
            if k == "source_file":
                continue
            skel["metadata"][k] = v

    # Sections patch (optional).
    if (enrich_root / "sections.json").is_file():
        sec_patch = load_json(enrich_root / "sections.json")
        if isinstance(sec_patch, list):
            # Match by order.
            by_order = {s.get("order"): s for s in skel["sections"]}
            for entry in sec_patch:
                ord_ = entry.get("order")
                if ord_ in by_order:
                    by_order[ord_].update({k: v for k, v in entry.items()
                                           if k not in ("order", "type")})

    # Recipe enrichments / skips.
    skipped: list[tuple[str, str]] = []  # (name, reason)
    kept: list[dict] = []
    recipes_dir = enrich_root / "recipes"
    for r in skel["recipes"]:
        order = r["order"]
        patch_path = recipes_dir / f"{order:03d}.json"
        if not patch_path.is_file():
            kept.append(r)  # leave as-is; will fail validation → user knows
            continue
        patch = load_json(patch_path)
        if isinstance(patch, dict) and patch.get("skip"):
            skipped.append((r["name_original"], str(patch["skip"])))
            continue
        kept.append(merge_recipe(r, patch))

    # Re-number the kept recipes so ids are dense.
    for new_order, r in enumerate(kept, start=1):
        r["order"] = new_order
        r["id"] = f"{skel['book_id']}-{new_order:03d}"

    skel["recipes"] = kept

    # Drop the skeleton's "pending enrichment" note now that we're done.
    if skipped:
        skip_note = "Saltadas (no son recetas reales): " + "; ".join(
            f"{name} ({reason})" for name, reason in skipped
        )
        existing = skel["metadata"].get("notes") or ""
        # Replace the placeholder skeleton note if present.
        if "Skeleton extraído heurísticamente" in existing:
            skel["metadata"]["notes"] = skip_note
        else:
            skel["metadata"]["notes"] = (existing + " " + skip_note).strip()
    else:
        existing = skel["metadata"].get("notes") or ""
        if "Skeleton extraído heurísticamente" in existing:
            skel["metadata"]["notes"] = None

    problems: list[str] = []
    ok = validate_book(skel, problems)
    if not ok:
        return False, problems

    if not dry_run:
        out = BOOKS_DIR / f"{skel['book_id']}.json"
        out.write_text(json.dumps(skel, ensure_ascii=False, indent=2) + "\n",
                       encoding="utf-8")
    return True, []


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Finalize a skeleton + enrichments into a book JSON.")
    parser.add_argument("slug", nargs="?", help="Book slug (e.g. 1924-angostura-…)")
    parser.add_argument("--all", action="store_true",
                        help="Finalize every skeleton that has at least one enrichment file.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    targets: list[str] = []
    if args.all:
        for p in sorted(SKELETON_DIR.glob("*.skeleton.json")):
            slug = p.name[: -len(".skeleton.json")]
            if (ENRICHMENT_DIR / slug).is_dir():
                targets.append(slug)
    else:
        if not args.slug:
            parser.error("provide a slug or --all")
        targets.append(args.slug)

    n_ok = 0
    for slug in targets:
        ok, problems = finalize(slug, dry_run=args.dry_run)
        status = "OK" if ok else "FAIL"
        print(f"[{status}] {slug}")
        for p in problems:
            print(f"  - {p}")
        if ok:
            n_ok += 1
    print(f"Finalized {n_ok}/{len(targets)} book(s).", file=sys.stderr)
    return 0 if n_ok == len(targets) else 1


if __name__ == "__main__":
    sys.exit(main())
