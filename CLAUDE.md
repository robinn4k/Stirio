# Stirio — Project Guide

Stirio is a cocktail learning Progressive Web App. Users master mixology through quizzes, flashcards, daily challenges, speed rounds, blind tastings, and a 3D encyclopedia. The app is built for mobile-first usage with offline support.

## Project Values

- **Flawless i18n**: Every user-visible string must be translated into all 5 supported languages (es, en, fr, pt, de). Never ship Spanish-only content.
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
js/data.js          Bridge: builds LESSONS, ACADEMY_FAMILIES etc. from StirioRepo globals
js/ui.jsx           UI primitives: Icon, XPPop, StreakBadge, Placeholder, Prompt, confettiBurst, playChord
js/lesson.jsx       LessonPlayer: 7 step types (intro, choice, multi, ratio, earTrain, cutWords, colorMatch, timing)
js/screens.jsx      Onboarding, Home (FeaturedCard, mode grid), Profile (settings), ModeSheet
js/reference.jsx    AcademyScreen, FichasScreen (150+ IBA), FreeQuizScreen, FichaDetail
js/app.jsx          App root: router, BottomNav FAB, TweaksPanel, 6 themes, localStorage state
wiki.html           Standalone R3F wiki page (iframe from app.jsx WikiScreen)
js/lang.js          i18n core: t(), getLang(), setLang(), all translation keys
js/quiz.js          Quiz round engine (state, timer, scoring)
js/learn.js         Learning mode (mastery, XP, streaks, spaced repetition)
js/daily.js         Daily challenge (seeded RNG for consistent questions per day)
js/speed.js         Speed mode (60-second timed challenge)
js/blind.js         Blind tasting mode (clue-based spirit identification)
js/fichas.js        IBA cocktail flashcard data (legacy, superseded by repo-data.js)
js/rivals.js        Real-time 1v1 multiplayer via Firebase RTDB
js/auth.js          Firebase Auth (Google + guest mode)
js/leaderboard.js   Score persistence (localStorage + Firestore)
js/achievements.js  Achievement tracking
js/i18n/            Per-language question files + fichas translation lookup
sw.js               Service Worker (bump STATIC_CACHE_VERSION on asset changes)
```

## Internationalization (i18n)

### How it works

The `t()` function in `lang.js` supports two modes:

1. **String keys**: `t('login.tagline')` → looks up in `translations[currentLang]`
2. **Multilingual objects**: `t({es: 'Hola', en: 'Hello'})` → returns value for current language

**Fallback chain**: current lang → English → Spanish → first available → empty string

### Adding translations

- **UI strings**: Add the key to ALL 5 language blocks in `js/lang.js`
- **Quiz questions**: Add the question to ALL 5 files in `js/i18n/questions_{lang}.js`
- **Cocktail data**: Add Spanish entry to `js/fichas.js`, translations to `js/i18n/fichas_i18n.js`
- **Blind tasting**: Add multilingual objects directly in `js/blind.js`

### Adding a new language

1. Add lang code to `SUPPORTED_LANGS` in `js/lang.js`
2. Add a new translation block in `js/lang.js`
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

## Service Worker

Any time you add, rename, or remove a JS/CSS/asset file:
1. Add/update the path in `CACHE_PATHS` in `sw.js`
2. Bump `STATIC_CACHE_VERSION` (e.g., `Stirio-v3.4` → `Stirio-v3.5`)

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
