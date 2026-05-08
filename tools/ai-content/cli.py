#!/usr/bin/env python3
"""Stirio AI content tooling — entrypoint.

Subcommands:
  translate   Fill missing i18n keys in EN/FR/PT/DE from ES.
  review      Fact-check / consistency review of ES content; emits markdown report.
  complete    Generate ES content for empty stubs (planned).

Run `python cli.py <mode> --help` for flags. Reads tools/ai-content/.env
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
from review import ReviewOptions, run as review_run  # noqa: E402
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
        default=15,
        help="Keys per Groq request (default 15).",
    )
    p_translate.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Cap keys per language — useful for smoke tests.",
    )
    p_translate.add_argument(
        "--model",
        default=None,
        help=(
            "Override Groq model (default: llama-3.1-8b-instant; high TPM "
            "headroom). Use llama-3.3-70b-versatile if you've upgraded the "
            "Groq tier or are running review/complete-style workloads."
        ),
    )
    p_translate.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the plan without calling Groq or writing files.",
    )

    p_review = sub.add_parser(
        "review",
        help="Fact-check ES articles and emit a markdown report (no i18n writes).",
    )
    p_review.add_argument(
        "--scope",
        action="append",
        default=[],
        help=(
            "Only review keys with this prefix (e.g. wiki.art.spirits.). "
            "Default: every prefix in PARITY_EXCLUDE_PREFIXES, which is the "
            "freshly-translated content most worth sanity-checking."
        ),
    )
    p_review.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Cap the number of articles reviewed (smoke test).",
    )
    p_review.add_argument(
        "--model",
        default=None,
        help=(
            "Override Groq model. Default: llama-3.3-70b-versatile (review is "
            "reasoning-heavy, low-volume — the 70b TPM cap rarely matters)."
        ),
    )
    p_review.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Custom report path. Default: tools/ai-content/reports/review-<ts>.md",
    )
    p_review.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the plan without calling Groq or writing the report.",
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
            model=args.model,
        )
        return translate_run(opts)

    if args.mode == "review":
        opts = ReviewOptions(
            scopes=tuple(args.scope),
            dry_run=args.dry_run,
            limit=args.limit,
            model=args.model,
            out=args.out,
        )
        return review_run(opts)

    raise SystemExit(f"Unknown mode: {args.mode}")


if __name__ == "__main__":
    sys.exit(main())
