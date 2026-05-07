# Stirio AI Content Tooling

Dev-time CLI that uses the [Groq API](https://console.groq.com) to (a) translate
missing i18n keys, (b) review existing Spanish content for factual / consistency
issues, and (c) complete empty stubs in the wiki. Runs locally or in
`.github/workflows/ai-content.yml` (manual trigger).

The output (translated JSON, generated reports) is committed to the repo and
served as static content by the PWA — so end users get the content for free,
without ever calling the model.

## Setup (local)

```bash
cd tools/ai-content
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and paste GROQ_API_KEY=gsk_... — get a free key at
# https://console.groq.com/keys (Groq's free tier is generous enough for
# the whole encyclopedia).
```

## Modes

### `translate` — fill missing i18n keys

```bash
# Dry-run a small slice first to confirm scope detection works:
python cli.py translate --scope wiki.map. --dry-run

# Translate the 9 ES-only map regions into EN, FR, PT, DE:
python cli.py translate --scope wiki.map.

# Translate everything currently in PARITY_EXCLUDE_PREFIXES (~310+ keys × 4 langs).
# Default batch size 25 keeps each request well under Groq's per-call limits.
python cli.py translate

# Just one language, capped to 5 keys (smoke test):
python cli.py translate --scope wiki.brand. --lang en --limit 5
```

The source of truth for "what's missing" is
`tests/i18n-coverage.test.js → PARITY_EXCLUDE_PREFIXES`. Any key whose ES value
is present in `i18n/es.json` but missing from a target language file is a
candidate. Existing translations are never overwritten — to regenerate one,
remove the entry from the target file first.

After a run, sanity-check with:

```bash
cd ../..
npm test  # i18n-coverage.test.js verifies parity
```

### `review` and `complete`

Planned (see `/root/.claude/plans/ahora-podemos-meter-un-purrfect-robin.md` —
roadmap PRs 4 and 5). Not implemented in this initial drop.

## GitHub Actions

`.github/workflows/ai-content.yml` exposes a manual `workflow_dispatch` trigger
in the GitHub UI ("Run workflow" → fill the inputs → submit). Required:

- Repository secret `GROQ_API_KEY` (Settings → Secrets and variables → Actions).
- Push access to the `main` branch (the workflow opens a PR, doesn't push directly).

Inputs:

- `mode` — `translate` (only mode wired up so far).
- `scope` — optional prefix; leave blank to use every prefix in
  `PARITY_EXCLUDE_PREFIXES`.
- `limit` — optional integer cap per language for testing.

The workflow installs Python deps, runs the CLI, and opens a draft PR with the
i18n diff so you can review before merging.

## Files

| File | Purpose |
| --- | --- |
| `cli.py` | argparse entrypoint with subcommands |
| `groq_client.py` | Groq SDK wrapper with retries + usage tally |
| `i18n_io.py` | JSON load/write, parity-exclusion parser, merge helper |
| `translate.py` | `translate` mode logic |
| `prompts/translate.txt` | system prompt template (uses `{{TARGET_LANG_*}}` placeholders) |
| `reports/` | per-run markdown reports for `review` / `complete` (gitignored) |

## Cost

Groq's free tier covers a full corpus translation comfortably:

- Llama 3.3 70B versatile: ~30 req/min, ~14k req/day, ~6k tok/min.
- A full pass on `wiki.art.liqueurs.*` (~310 keys × 4 langs ÷ 25 batch ≈ 50 reqs)
  finishes in well under a minute and consumes <2% of the daily bucket.

If you ever hit a 429, the client backs off exponentially and retries up to 4
times. Rerun the same command — already-translated keys are skipped.
