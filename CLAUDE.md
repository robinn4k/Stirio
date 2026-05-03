# Stirio — Project Guide

Stirio is a cocktail learning Progressive Web App. Users master mixology through quizzes, flashcards, daily challenges, speed rounds, blind tastings, and a 3D encyclopedia. The app is built for mobile-first usage with offline support.

## Project Values

- **i18n with pragmatic fallbacks**: Target is full coverage in es/en/fr/pt/de. New screens
  may ship ES-only if the copy is wired through `t(key, fallback)` or a local
  `tOr(key, fb)` helper — translations land in follow-up PRs. Never hardcode raw
  user-visible strings without a `t()` key.
- **Impeccable UX**: Smooth transitions, clear feedback, responsive across all devices.
- **Offline-first**: The app must work without an internet connection. Cloud sync is optional.
- **Clean, modular code**: Each JS module owns one responsibility. No monolith functions.

## Tech Stack

- **Runtime**: React 18 via UMD CDN + Babel Standalone (in-browser JSX compilation, no build step). JSX files use `Object.assign(window, {...})` to expose components as globals.
- **Styling**: `css/tokens.css` (OKLCH design tokens, 6 themes) + `css/style.css` (base styles). Themes applied via `[data-theme]`, `[data-density]`, `[data-featured]`, `[data-device]` HTML attributes.
- **Backend**: Firebase (Auth, Firestore, Realtime Database, Storage)
- **PWA**: Service Worker (`sw.js`) caches all static assets for offline use
- **3D**: React Three Fiber (`wiki.html` standalone page via iframe) using importmap CDN
- **Testing**: Vitest (`npm test`)

## Architecture

```
index.html          React SPA root — single <div id="root">, React CDN + Babel scripts
css/tokens.css      OKLCH design tokens: 6 themes, density, featured, device overrides
css/style.css       Base styles: reset, .card, .btn, .chip, animations
js/repo-data.js     IIFE: 180 IBA cocktails + 24 trivia rounds → window.StirioRepo
js/data.js          Bridge: LESSONS (10 cocktail 60s rounds), TRIVIA_ROUNDS, ACADEMY_LEVELS helpers
js/ficha-images.js  IIFE: window.FICHA_IMAGES + getFichaImage() — ~30 Unsplash URLs for IBA cocktails
js/ui.jsx           UI primitives: Icon, XPPop, StreakBadge, Placeholder, Prompt, confettiBurst, playChord
js/lesson.jsx       LessonPlayer: step types (intro, choice, multi, ratio, earTrain, cutWords, colorMatch, timing) + guard fallback
js/screens.jsx      Onboarding, Home, Profile, ModeSheet, FeaturedCard, RefTileLarge (Referencia rápida 2×2)
js/reference.jsx    AcademyScreen, LevelDetail, FichasScreen (aka Recetas), FichaDetail, FreeQuizScreen
js/legacy-modes.jsx BlindScreen, ConstructorScreen (wrap stBlind / stConstructor ES modules)
js/duel.jsx         DuelScreen (1v1 multiplayer + bot via stRivals / stBot)
js/glossary.jsx     GlossaryScreen — 32 bartending terms (ES), searchable list
js/euvs-archive.jsx EuvsArchiveScreen — catalog viewer for EUVS Vintage Cocktail Books
js/euvs-archive-utils.js  Pure helpers for the EUVS catalog (ES module, also testable from Vitest)
data/euvs-catalog.json    EUVS catalog metadata (network-first via runtime cache; not precached)
tools/euvs-archive/ Python CLI scripts to download EUVS PDFs and (re)build the catalog (dev-only)
js/map.jsx          MapScreen — iframe wrapper to map.html (interactive Leaflet spirit map)
js/library.jsx      LibraryScreen — iframe wrapper to wiki.html?filter=3d
js/arcade.jsx       ArcadeScreen — Garnish Catcher mini-game (60s rAF)
js/memory.jsx       MemoryScreen — pair-matching 4×4 memory game
js/rhythm.jsx       RhythmScreen — tap-on-beat shaker rhythm (100 BPM)
js/app.jsx          App root: router, BottomNav FAB, ErrorBoundary wrapper, theme/density state
map.html            Standalone Leaflet page (CDN) loading initSpiritMap from wiki-map.js
wiki.html           Standalone R3F wiki page (iframe from WikiScreen / LibraryScreen)
js/lang.js          i18n runtime: t(), getLang(), setLang(), loader for i18n/*.json
i18n/{lang}.json    Per-language flat key-value translation stores (es/en/fr/pt/de)
js/quiz.js          Quiz round engine (state, timer, scoring)
js/learn.js         Learning XP store (cq_learn_data) — canonical XP + streak; exports addXp()
js/daily.js         Daily challenge (seeded RNG for consistent questions per day)
js/speed.js         Speed mode (60-second timed challenge)
js/blind.js         Blind tasting mode (clue-based spirit identification)
js/constructor.js   Constructor / ingredient-based cocktail guessing
js/fichas.js        IBA cocktail flashcard data (legacy, superseded by repo-data.js)
js/rivals.js        Real-time 1v1 multiplayer via Firebase RTDB
js/bot.js           Bot opponent for Duel
js/auth.js          Firebase Auth (Google + guest mode)
js/leaderboard.js   Score persistence (localStorage + Firestore); reads xpTotal from stLearn
js/achievements.js  Achievement tracking; strings via `ach.<id>` / `ach.<id>.desc` keys
js/wiki-map.js      Spirit regions data (100+) + initSpiritMap (Leaflet) used by map.html & wiki.html
js/wiki-data.js     Wiki article catalog (techniques, spirits, glassware, tools, 3D models…)
js/i18n/            Per-language question files + fichas translation lookup
sw.js               Service Worker (bump STATIC_CACHE_VERSION + version.json + window.STIRIO_VERSION on asset changes)
```

### Cross-module globals (shared via `window`)

Classic `<script>` and `<script type="text/babel">` files share top-level scope.
Data/module modules expose APIs through `window.X` to avoid ES-module scoping:

- `window.LESSONS`, `window.TRIVIA_ROUNDS`, `window.ALL_FICHAS`, `window.DAILY_LESSON`,
  `window.SPEED_LESSON`, `window.buildLessonFromRound`, `window.buildAcademyLesson`,
  `window.buildAcademyPractice`, `window.getAcademyLevels` — from `data.js`
- `window.FICHA_IMAGES`, `window.getFichaImage(name)` — from `ficha-images.js`
- `window.MAP_REGIONS` — from `map.jsx` (condensed region list for Home preview)
- `window.stLang`, `window.stAuth`, `window.stAcademy`, `window.stLearn`, `window.stRivals`,
  `window.stBot`, `window.stBlind`, `window.stConstructor`, `window.stAchievements`,
  `window.stLeaderboard`, `window.stDaily`, `window.stActivity` — from async-imported ES modules
- `window.stEuvsUtils` — from `euvs-archive-utils.js` (ES module: `parseCatalog`,
  `filterByDecade`, `filterByLanguage`, `decadeOf`, `uniqueDecades`, `uniqueLanguages`)
- Screen components: `window.AcademyScreen`, `window.FichasScreen`, `window.FichaDetail`,
  `window.FreeQuizScreen`, `window.BlindScreen`, `window.ConstructorScreen`, `window.DuelScreen`,
  `window.GlossaryScreen`, `window.MapScreen`, `window.LibraryScreen`, `window.ArcadeScreen`,
  `window.MemoryScreen`, `window.RhythmScreen`, `window.EuvsArchiveScreen` — from respective `.jsx` files

### Error handling

`js/app.jsx` mounts `<App />` inside an `ErrorBoundary` class component. Any uncaught
exception during descendant render shows a "Algo falló" card with message + short
stack instead of blanking the SPA (React 18 createRoot default). Always prefer
guarding obvious failure modes (`lesson?.steps?.[idx]` style) over relying on the
boundary.

## Internationalization (i18n)

### How it works

Translations live in **`i18n/{es,en,fr,pt,de}.json`** (flat key → string maps).
`js/lang.js` is the runtime that loads them (`preloadAllTranslations()` fetches
all five at startup; SW caches them for offline).

The `t()` function supports two modes:

1. **String keys**: `t('login.tagline')` → looks up in `translations[currentLang]`
2. **Multilingual objects**: `t({es: 'Hola', en: 'Hello'})` → returns value for current language

Both modes support interpolation: `t('blind.question', { n: 3, total: 10 })`
replaces `{n}` / `{total}` placeholders.

**Fallback chain**: current lang → Spanish (DEFAULT_LANG) → the key itself.

If no translation exists for a key, `t()` returns the key verbatim. Prefer adding
the key to all 5 JSON files over relying on the deprecated `tOr(key, 'spanish')`
pattern — that pattern silently hides missing translations from non-ES users.

`tOr()` is still acceptable as a *defensive* safety net when:
- A screen is mid-refactor and keys are being added incrementally.
- A value is genuinely dynamic (e.g. titleCasing an ID that has no translation yet).

Other sanctioned i18n "pockets" outside `i18n/*.json`:
- **Quiz rounds**: `js/i18n/questions_{lang}.js` — one file per language.
- **Fichas metadata**: `js/i18n/fichas_i18n.js` — inline dictionaries for
  `CATEGORIES`, `FAMILIES`, `GLASSES`, `METHODS`, `GARNISHES`.
- **Blind tasting clues**: `js/blind.js` uses inline `{es, en, fr, pt, de}`
  objects passed to `t()`.

### Adding translations

- **UI strings**: Add the key to ALL 5 files in `i18n/{es,en,fr,pt,de}.json`
- **Quiz questions**: Add the question to ALL 5 files in `js/i18n/questions_{lang}.js`
- **Cocktail data**: Add Spanish entry to `js/fichas.js`, translations to `js/i18n/fichas_i18n.js`
- **Blind tasting**: Add multilingual objects directly in `js/blind.js`

### Adding a new language

1. Add lang code to `SUPPORTED_LANGS` in `js/lang.js`
2. Create `i18n/<lang>.json` mirroring the keys from `i18n/es.json`
3. Create `js/i18n/questions_{lang}.js` with all 24 rounds
4. Add entries to `js/i18n/fichas_i18n.js` lookup dictionaries
5. Add entries to `js/blind.js` multilingual objects

## How to Add New Content

### New quiz round

1. Choose a unique numeric `id` (next available after 24)
2. Add the round object to all 5 files: `js/i18n/questions_{es,en,fr,pt,de}.js`
3. Each round needs: `id`, `title`, `subtitle`, `icon`, `color`, and 10 `questions`
4. Each question: `{ q: "...", a: ["correct", "wrong1", "wrong2", "wrong3"], exp: "..." }`
5. The first answer `a[0]` is always the correct one

### New cocktail (fichas)

1. Add the Spanish entry to `js/fichas.js` inside the `FICHAS` array
2. Add translations for glass, method, garnish, ingredients, story to `js/i18n/fichas_i18n.js`
3. If using a new glass/method type, add it to the respective `GLASSES`/`METHODS` dictionary

### New 60-second cocktail lesson (Home queue)

1. Append a new object to `LESSONS` at the top of `js/data.js`
2. Required fields: `id`, `category` (usually `'Cocktails'`), `title`, `subtitle`, `emoji`,
   `accent`, `xp`, `difficulty`, `game`, `steps: [...]`
3. Step kinds supported by `LessonPlayer`: `intro`, `multi`, `ratio`, `choice`,
   `timing`. (`earTrain`, `cutWords`, `colorMatch` exist but are music/text/art
   specific — avoid for cocktail content.)
4. Add a matching `LESSON_IMAGES[id] = 'https://images.unsplash.com/<photo-id>?…'`
   entry in `js/screens.jsx` so the Featured hero uses a cocktail-specific photo;
   otherwise it falls back to the Negroni image.

### Cocktail photo for Recetas grid & detail

1. Open `js/ficha-images.js`
2. Add an entry `'Cocktail Name': U('photo-xxxxxxxxxxxx'),` using the Unsplash
   photo ID. The key must match the `name` field in `FICHAS` exactly.
3. Fichas without an entry keep the gradient+emoji fallback automatically.

### New screen / mode tile

1. Create `js/<mode>.jsx` exposing a component via `Object.assign(window, { XScreen })`
2. Register it in `index.html` as `<script type="text/babel" data-presets="react" src="js/<mode>.jsx"></script>`
   *after* `ui.jsx`/`screens.jsx` and *before* `app.jsx`
3. In `js/app.jsx` `openMode()`: add `if (m === '<mode>') { setSubScreen('<mode>'); return; }`
4. Add a conditional renderer: `{subScreen === '<mode>' && <XScreen onBack={() => setSubScreen(null)} />}`
5. Add the mode metadata to the `modes` object inside `ModeSheet` (`js/screens.jsx`)
6. Cache the new script in `sw.js` `CACHE_PATHS` and bump the app version in
   `sw.js` (`STATIC_CACHE_VERSION`), `version.json`, and `index.html`
   (`window.STIRIO_VERSION`) — see [Service Worker](#service-worker)

⚠️ **Naming collisions**: classic Babel scripts share top-level scope, so a
`const Foo = …` declared in two files throws `SyntaxError` at load time. Prefix
internal helpers (`DuelModeCard`, not `ModeCard`) when unsure.

### Regenerating the EUVS catalog

`data/euvs-catalog.json` is the metadata catalog consumed by `EuvsArchiveScreen`.
Initial seed is hand-curated; to (re)generate it from Internet Archive:

```bash
cd tools/euvs-archive
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python build_catalog.py            # rewrites <repo>/data/euvs-catalog.json
```

The catalog is committed to the repo (it's just public metadata, KB-sized).
The actual PDFs are downloaded by `download_euvs.py` to a gitignored folder
under `tools/euvs-archive/data/downloads/` and **never committed or cached
by the SW** (they're up to tens of GB). The screen only links out to
`archive.org/details/<id>` — it never embeds PDFs.

## Service Worker

Any time you add, rename, or remove a JS/CSS/asset file:
1. Add/update the path in `CACHE_PATHS` in `sw.js`
2. Bump the app version **in all three places at once** — they must always match,
   otherwise the boot-time mismatch detector won't trigger an update reload:
   - `STATIC_CACHE_VERSION` in `sw.js` (e.g., `Stirio-v11.23` → `Stirio-v11.24`)
   - `"version"` in `version.json` (e.g., `"11.23"` → `"11.24"`)
   - `window.STIRIO_VERSION` in `index.html` (e.g., `'11.23'` → `'11.24'`)

## Git Workflow

**Always squash merge** feature branches into `main` (one clean commit per PR):

```bash
git checkout main
git pull origin main
git merge --squash <feature-branch>
git commit -m "Descriptive single-line summary of everything in the branch"
git push -u origin main
```

Commit message format:
```
<verb>: <short summary>

- Bullet 1
- Bullet 2

https://claude.ai/code/session_<id>
```

Never merge with `--no-ff` or fast-forward multiple commits directly into main.

## Development Guidelines

- **Never rewrite large files in a single pass.** Work in small, sequential steps.
- **All user-visible text goes through `t()`** — no hardcoded strings.
- **Test with `npm test`** before pushing.
- **Test i18n manually**: Toggle language in the app and verify all modes display correctly.
- **Preserve offline functionality**: Any new fetch/import must be cached by the service worker.
