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

### `review` — fact-check ES content

```bash
# Smoke-test on 5 spirit articles using the cheaper free-tier model:
python cli.py review --scope wiki.art.spirits. --limit 5 --model llama-3.1-8b-instant

# Full review of the freshly-translated content (default = PARITY_EXCLUDE_PREFIXES):
python cli.py review

# Just one article family with the better reasoning model (default for review):
python cli.py review --scope wiki.art.history.
```

Output: `reports/review-<utc-timestamp>.md` with issues sorted by severity
(high → medium → low). The mode never modifies `i18n/*.json` — apply fixes
manually based on the suggestions, then run `translate` again if you want
to re-sync the other languages. The GitHub Actions workflow uploads the
report as an artifact (downloadable for 30 days from the run page).

Default model is `llama-3.3-70b-versatile` because review needs reasoning;
override with `--model llama-3.1-8b-instant` if you're rate-limited.

### `complete` — generate ES content for empty wiki articles

```bash
# Smoke-test on a single category, capping to 3 stubs:
python cli.py complete --category liqueurs --limit 3 --dry-run

# Generate ES content for every empty article in the encyclopedia:
python cli.py complete

# Just the techniques category:
python cli.py complete --category techniques
```

`complete` parses `js/wiki-data.js` to enumerate every `(category, article_id)`
pair the wiki UI expects, then flags articles with **zero** keys in
`i18n/es.json` as stubs. For each stub it sends the category id, article id,
and 1-2 sibling articles (few-shot) to Groq and asks for a JSON object keyed
by section (`description`, `history`, `how`, `tips`, `origin`, `production`,
`sub` — the canonical set varies by category).

Generated keys are appended to `i18n/es.json` (never overwriting). Then run
`translate` to propagate the new ES content to EN/FR/PT/DE.

The workflow opens a draft PR with the `i18n/es.json` diff, plus uploads a
markdown summary as an artifact.

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

- **Default model**: `llama-3.1-8b-instant` — 30k TPM (vs 6k on 70b), 30 RPM,
  14k RPD. Great for short-string translation; the 70b advantage doesn't show
  up on this task.
- Pass `--model llama-3.3-70b-versatile` for review/complete-style workloads
  where reasoning matters more than throughput.
- A full pass on `wiki.art.liqueurs.*` (~310 keys × 4 langs ÷ 15 batch ≈ 84 reqs)
  finishes in ≈3 minutes with the default 1.5s spacing and consumes <2% of the
  daily bucket.

The client paces requests at `min_request_spacing_s = 1.5s` by default, which
keeps us well under both the RPM cap and the TPM bucket so 429 retries become
rare. Override with `GROQ_REQUEST_SPACING_S=0.5` env var if your tier was
upgraded. If you still hit a 429, tenacity backs off exponentially up to 60s
across 4 attempts. Rerun the same command — already-translated keys are
skipped on the second pass.
