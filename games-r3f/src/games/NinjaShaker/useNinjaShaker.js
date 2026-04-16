import { create } from 'zustand';
import { COCKTAILS, getDistractors, shuffle } from '../../data/cocktails.js';

const MAX_SPAWN = 35;
const MAX_LIVES = 3;
const COMBO_FIRE = 5;
const COMBO_LEGENDARY = 8;

function buildPool(cocktail) {
  return shuffle([
    ...cocktail.ingredients.map(n => ({ name: n, correct: true })),
    ...cocktail.ingredients.map(n => ({ name: n, correct: true })),
    ...getDistractors(cocktail, 15).map(n => ({ name: n, correct: false })),
  ]);
}

function pickCocktail() {
  return COCKTAILS[Math.floor(Math.random() * COCKTAILS.length)];
}

export const useNinjaShaker = create((set, get) => ({
  // Session
  cocktail: null,
  pool: [],
  poolIdx: 0,

  // Progress
  score: 0,
  combo: 0,
  bestCombo: 0,
  correct: 0,
  lives: MAX_LIVES,
  totalSpawned: 0,
  maxSpawn: MAX_SPAWN,
  status: 'idle', // 'idle' | 'playing' | 'over' | 'win'

  // Active orbs — keyed by id so re-renders stay cheap
  orbs: [],

  // Derived label for the HUD
  flair: null, // { text, color, ttl }

  start() {
    const cocktail = pickCocktail();
    set({
      cocktail,
      pool: buildPool(cocktail),
      poolIdx: 0,
      score: 0,
      combo: 0,
      bestCombo: 0,
      correct: 0,
      lives: MAX_LIVES,
      totalSpawned: 0,
      status: 'playing',
      orbs: [],
      flair: null,
    });
  },

  reset() {
    set({ status: 'idle', orbs: [] });
  },

  /** Spawn the next ingredient orb. Called on a game timer. */
  spawn() {
    const s = get();
    if (s.status !== 'playing' || s.totalSpawned >= s.maxSpawn) return;
    const ing = s.pool[s.poolIdx % s.pool.length];
    const id = `${s.poolIdx}-${Date.now()}`;
    // Spawn near bottom edge, arc upward. Position in world units (camera at 0,0,10).
    const spawnX = (Math.random() - 0.5) * 6;  // -3..3
    const vx = (Math.random() - 0.5) * 1.4;
    const vy = 5.5 + Math.random() * 1.2;
    const spin = (Math.random() - 0.5) * 3;
    const orb = {
      id,
      ingredient: ing.name,
      correct: ing.correct,
      position: [spawnX, -4.5, 0],
      velocity: [vx, vy, 0],
      spin,
      alive: true,
    };
    set({
      orbs: [...s.orbs, orb],
      poolIdx: s.poolIdx + 1,
      totalSpawned: s.totalSpawned + 1,
    });
  },

  /** Remove an orb without scoring (fell off-screen). Miss penalty applies if it was correct. */
  despawn(id) {
    const s = get();
    const orb = s.orbs.find(o => o.id === id);
    if (!orb) return;
    const remaining = s.orbs.filter(o => o.id !== id);
    if (orb.correct && s.status === 'playing') {
      const lives = s.lives - 1;
      set({
        orbs: remaining,
        lives,
        combo: 0,
        flair: { text: '−1 ❤️', color: '#e74c3c', ttl: performance.now() + 700 },
        status: lives <= 0 ? 'over' : s.status,
      });
    } else {
      set({ orbs: remaining });
    }
    get()._checkEnd();
  },

  /** User sliced an orb (tap / swipe). */
  slice(id) {
    const s = get();
    const orb = s.orbs.find(o => o.id === id);
    if (!orb || !orb.alive) return;
    const remaining = s.orbs.filter(o => o.id !== id);
    if (orb.correct) {
      const combo = s.combo + 1;
      const multiplier = combo >= COMBO_LEGENDARY ? 3 : combo >= COMBO_FIRE ? 2 : 1;
      const gained = 10 * multiplier;
      const flairText = combo >= COMBO_LEGENDARY
        ? `LEGENDARY ×${combo}`
        : combo >= COMBO_FIRE
          ? `🔥 ON FIRE ×${combo}`
          : combo > 1
            ? `×${combo}`
            : '+10';
      set({
        orbs: remaining,
        score: s.score + gained,
        correct: s.correct + 1,
        combo,
        bestCombo: Math.max(s.bestCombo, combo),
        flair: { text: flairText, color: '#d4a44a', ttl: performance.now() + 800 },
      });
    } else {
      // Wrong slice — penalty + combo break.
      const lives = s.lives - 1;
      set({
        orbs: remaining,
        lives,
        combo: 0,
        flair: { text: '✗ wrong!', color: '#e74c3c', ttl: performance.now() + 800 },
        status: lives <= 0 ? 'over' : s.status,
      });
    }
    get()._checkEnd();
  },

  _checkEnd() {
    const s = get();
    if (s.status !== 'playing') return;
    if (s.totalSpawned >= s.maxSpawn && s.orbs.length === 0) {
      set({ status: 'win' });
    }
  },
}));
