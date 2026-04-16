import { create } from 'zustand';
import { COCKTAILS, getDistractors, shuffle } from '../../data/cocktails.js';

const WRONG_CARDS = 10;

function buildDeck() {
  const cocktail = COCKTAILS[Math.floor(Math.random() * COCKTAILS.length)];
  const correct = cocktail.ingredients.map((name, i) => ({
    id: `ok-${i}-${name}`, ingredient: name, belongs: true,
  }));
  const wrong = getDistractors(cocktail, WRONG_CARDS).map((name, i) => ({
    id: `no-${i}-${name}`, ingredient: name, belongs: false,
  }));
  return { cocktail, deck: shuffle([...correct, ...wrong]) };
}

export const useCocktailTinder = create((set, get) => ({
  status: 'idle',      // 'idle' | 'playing' | 'done'
  cocktail: null,
  deck: [],
  index: 0,
  score: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  flair: null,         // { text, color, ttl }

  start() {
    const { cocktail, deck } = buildDeck();
    set({
      status: 'playing',
      cocktail, deck, index: 0,
      score: 0, correct: 0, streak: 0, bestStreak: 0,
      flair: null,
    });
  },

  reset() { set({ status: 'idle' }); },

  /** direction: 'left' (no) | 'right' (sí) */
  decide(direction) {
    const s = get();
    if (s.status !== 'playing') return;
    const card = s.deck[s.index];
    if (!card) return;
    const saysYes = direction === 'right';
    const ok = saysYes === card.belongs;
    if (ok) {
      const streak = s.streak + 1;
      const pts = 10 + (streak >= 5 ? 10 : streak >= 3 ? 5 : 0);
      set({
        score: s.score + pts,
        correct: s.correct + 1,
        streak,
        bestStreak: Math.max(s.bestStreak, streak),
        flair: { text: streak >= 5 ? `🔥 LEGEND ×${streak}` : streak >= 3 ? `🔥 ×${streak}` : `+${pts}`, color: '#34d399', ttl: performance.now() + 650 },
      });
    } else {
      set({
        streak: 0,
        flair: { text: '✗ incorrecto', color: '#e74c3c', ttl: performance.now() + 650 },
      });
    }
    // Advance after the swipe animation completes (card component handles the visual).
    const nextIndex = s.index + 1;
    if (nextIndex >= s.deck.length) {
      set({ index: nextIndex, status: 'done' });
    } else {
      set({ index: nextIndex });
    }
  },
}));
