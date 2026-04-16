# Stirio

A mobile-first Progressive Web App for mastering mixology. Quizzes, flashcards,
daily challenges, speed rounds, blind tastings, a 3D spirits encyclopedia, and
real-time 1v1 duels — all offline-capable and available in 5 languages.

## Features

- **Cocktail Academy** — structured lessons with spaced repetition
- **Quiz Libre** — 24 rounds covering history, IBA cocktails, techniques & tools
- **Daily Challenge** — 10 seeded questions, same for every player each day
- **Speed Mode** — 60-second timed sprint
- **Blind Tasting** — identify spirits from aroma & flavor clues
- **Constructor** — match ingredient lists to the cocktail name
- **Recipe Book** — 90 official IBA cocktail sheets
- **3D Wiki** — explore a distillery and spirits in Three.js
- **Rivals** — real-time 1v1/3/4 player duels over Firebase RTDB
- **Leaderboard & achievements** — localStorage + Firestore sync

## Tech stack

Vanilla JavaScript ES6 modules, no build step. Single-page app with view
switching, CSS custom properties for 4 themes, Firebase (Auth, Firestore,
Realtime DB, Storage), Three.js for 3D, Vitest for tests, and a hand-rolled
service worker for offline support.

## Languages

UI, questions and cocktail data are fully translated into: **Spanish, English,
French, Portuguese, German**.

## Getting started

```bash
# Serve locally (any static server works)
npx http-server .

# Run tests
npm install
npm test
```

## Project guide

See [CLAUDE.md](CLAUDE.md) for the complete project guide, architecture, i18n
rules, how to add new content, and the git workflow.

## License

See [COPYING](COPYING).
