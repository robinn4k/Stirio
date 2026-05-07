#!/usr/bin/env python3
"""Stirio AI content tooling — entrypoint.

Subcommands:
  translate   Fill missing i18n keys in EN/FR/PT/DE from ES (MVP).
  review      Fact-check ES content, emit a markdown report (planned).
  complete    Generate ES content for empty stubs (planned).

Run `python cli.py translate --help` for flags. Reads tools/ai-content/.env
for GROQ_API_KEY (copy .env.example).
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

# When invoked as a script the module's directory isn't on sys.path; add it
# so `from groq_client import ...` works without packaging.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from i18n_io import TARGET_LANGS  # noqa: E402
from translate import TranslateOptions, run as translate_run  # noqa: E402


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ai-content",
        description="Stirio AI content tooling (Groq-powered)",
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="enable debug logging"
    )
    sub = parser.add_subparsers(dest="mode", required=True)

    p_translate = sub.add_parser(
        "translate",
        help="Fill missing i18n keys in EN/FR/PT/DE from the ES source.",
    )
    p_translate.add_argument(
        "--scope",
        action="append",
        default=[],
        help=(
            "Only translate keys with this prefix. Pass multiple times for "
            "multiple prefixes. Default: every prefix in PARITY_EXCLUDE_PREFIXES."
        ),
    )
    p_translate.add_argument(
        "--lang",
        action="append",
        default=[],
        choices=TARGET_LANGS,
        help="Target language(s). Default: all four (en, fr, pt, de).",
    )
    p_translate.add_argument(
        "--batch-size",
        type=int,
        default=25,
        help="Keys per Groq request (default 25).",
    )
    p_translate.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Cap keys per language — useful for smoke tests.",
    )
    p_translate.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the plan without calling Groq or writing files.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    if args.mode == "translate":
        opts = TranslateOptions(
            scopes=tuple(args.scope),
            target_langs=tuple(args.lang) if args.lang else TARGET_LANGS,
            batch_size=args.batch_size,
            dry_run=args.dry_run,
            limit=args.limit,
        )
        return translate_run(opts)

    raise SystemExit(f"Unknown mode: {args.mode}")


if __name__ == "__main__":
    sys.exit(main())
