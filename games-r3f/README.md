# Stirio Games — R3F PoC

A self-contained proof of concept that rebuilds the **Ninja Shaker** mini-game
with React Three Fiber + Three.js + drei + postprocessing, replacing the
original Phaser implementation with a declarative JSX scene graph.

This subproject is **isolated** from the Stirio vanilla SPA — its own
`package.json`, its own Vite build, no shared dependencies. Once validated we
can plan a full migration.

## Why R3F

- Declarative JSX scene graph (`<mesh>`, `<directionalLight>`, `<EffectComposer>`).
- `@react-three/drei` ships high-quality helpers (`Stars`, `Environment`,
  `Trail`, `Html`).
- `@react-three/postprocessing` adds bloom, vignette, etc. in a few lines.
- Real 3D: orbs are spheres with emissive materials and glass highlights, trails
  are real post-processed curves, physics runs in the render loop.

## Run locally

```bash
cd games-r3f
npm install
npm run dev
```

Opens on http://localhost:5173.

## Gameplay

- A random cocktail from `src/data/cocktails.js` is picked.
- Orbs arc up from the bottom with gravity. Each carries one ingredient:
  green glow = belongs to the cocktail, grey = distractor.
- Tap a green orb to slice it (+10 pts × combo multiplier).
- Tap a grey orb → –1 ❤️ and combo reset.
- Let a green orb fall off-screen → –1 ❤️.
- 35 spawns per round, combo tiers at ×5 (🔥) and ×8 (LEGENDARY).

## Files

| Path | Role |
|---|---|
| `src/NinjaShaker.jsx` | Scene root: Canvas, lighting, postprocessing, spawn loop |
| `src/components/Orbs.jsx` | Physics tick (gravity + culling), renders each `<Orb>` |
| `src/components/Orb.jsx` | One ingredient: sphere + glass highlight + emoji/label via `<Html>` |
| `src/components/SliceEffects.jsx` | Transient particle bursts on slice |
| `src/components/HUD.jsx` | DOM overlay: score, lives, combo, progress bar, flair |
| `src/components/TitleScreen.jsx` | Splash before starting |
| `src/components/ResultScreen.jsx` | End-of-round summary + retry |
| `src/hooks/useGame.js` | Zustand store — single source of truth for session state |
| `src/data/cocktails.js` | Simplified cocktail + ingredient data (local PoC copy) |

## Next steps if promoted to the main app

1. Share cocktail data with the SPA instead of duplicating it.
2. Wire score + combo to Stirio's achievements and XP flow.
3. Port the other two Phaser games (Mixology Rush, Cocktail Tinder) to R3F.
4. Decide whether to switch the whole SPA to React + Vite, or keep the games
   subproject as an iframe embedded in the vanilla view.
