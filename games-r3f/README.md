# Stirio Games — R3F PoC

A self-contained proof of concept that rebuilds the **three Stirio mini-games**
with React Three Fiber + Three.js + drei + postprocessing, replacing the
original Phaser implementation with a declarative JSX scene graph.

This subproject is **isolated** from the Stirio vanilla SPA — its own
`package.json`, its own Vite build, no shared dependencies. Once validated we
can plan a full migration.

## Games

| Icon | Title | Gameplay |
|---|---|---|
| 🔪 | **Ninja Shaker** | Orbs arc up with gravity; tap ONLY those that belong to the target cocktail. Combo × multiplier. |
| 🍸 | **Mixology Rush** | Drag ingredient cards onto the central shaker. 5 rounds, timer shrinks per round. |
| 💘 | **Cocktail Tinder** | Swipe ingredient cards right (belongs) or left (distractor). Streak bonus. |

All three share the same cocktail dataset (`src/data/cocktails.js`) and the
generic `<ResultScreen>` overlay.

## Run locally

```bash
cd games-r3f
npm install
npm run dev              # http://localhost:5173
npm run build            # writes ../games-r3f-demo/ (served on GH Pages)
```

## GH Pages deploy

`vite.config.js` sets `base: '/Stirio/games-r3f-demo/'` and `outDir: '../games-r3f-demo'`.
Running `npm run build` produces a ready-to-serve folder committed at repo root.
Deployed at https://robinn4k.github.io/Stirio/games-r3f-demo/ alongside the
vanilla SPA.

## File tree

```
games-r3f/
├─ package.json, vite.config.js, index.html, README.md
├─ src/
│  ├─ main.jsx, App.jsx, Menu.jsx
│  ├─ components/
│  │  └─ ResultScreen.jsx              # shared end-of-round overlay
│  ├─ data/
│  │  └─ cocktails.js                  # cocktails + ingredient emoji + distractor pool
│  └─ games/
│     ├─ NinjaShaker/
│     │  ├─ NinjaShaker.jsx            # Canvas + spawn loop
│     │  ├─ Orbs.jsx / Orb.jsx         # physics + 3D meshes with trails
│     │  ├─ SliceEffects.jsx
│     │  ├─ NinjaShakerHUD.jsx
│     │  └─ useNinjaShaker.js          # Zustand store
│     ├─ MixologyRush/
│     │  ├─ MixologyRush.jsx
│     │  ├─ Shaker.jsx                 # pulsing 3D target sphere
│     │  ├─ Card.jsx                   # draggable 3D card with spring-back
│     │  ├─ MixologyRushHUD.jsx
│     │  └─ useMixologyRush.js
│     └─ CocktailTinder/
│        ├─ CocktailTinder.jsx
│        ├─ SwipeCard.jsx              # horizontal swipe w/ YES/NOPE stamps
│        ├─ CocktailTinderHUD.jsx
│        └─ useCocktailTinder.js
```

## Stack

- React 18 + Vite 5
- Three.js 0.170
- `@react-three/fiber` — declarative renderer
- `@react-three/drei` — `Html`, `Trail`, `Stars`, `Environment`
- `@react-three/postprocessing` — `Bloom`, `Vignette`
- `zustand` — lightweight store, one per game

## Next steps if promoted

1. Share the cocktail dataset with the main Stirio SPA.
2. Wire the score / streak / combo into Stirio achievements + XP.
3. Decide: migrate the whole SPA to React + Vite, or keep `games-r3f` as an
   iframe embedded in the vanilla view.
4. Add sound (Web Audio) — the current PoC is silent.
