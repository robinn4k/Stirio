import { create } from 'zustand';
import { COCKTAILS, getDistractors, shuffle } from '../../data/cocktails.js';

const TOTAL_ROUNDS = 5;

/** Base time per round decreases as difficulty ramps up. */
function baseTimeFor(round) {
  return Math.max(18, 30 - round * 3);
}

function pickCocktail(previous) {
  // Avoid repeating the same cocktail back-to-back.
  const pool = previous ? COCKTAILS.filter(c => c.name !== previous.name) : COCKTAILS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Build cards for a round: all correct ingredients + N distractors, shuffled. */
function buildCards(cocktail, round) {
  const distractorCount = Math.min(3 + round, 6);
  const distractors = getDistractors(cocktail, distractorCount);
  return shuffle([
    ...cocktail.ingredients.map((name, i) => ({
      id: `c-${round}-ok-${i}`, ingredient: name, correct: true,
    })),
    ...distractors.map((name, i) => ({
      id: `c-${round}-bad-${i}`, ingredient: name, correct: false,
    })),
  ]);
}

export const useMixologyRush = create((set, get) => ({
  // Session
  status: 'idle',        // 'idle' | 'playing' | 'between' | 'over' | 'win'
  round: 0,
  totalRounds: TOTAL_ROUNDS,
  cocktail: null,
  cards: [],             // still on the board
  correctNeeded: 0,
  correctThisRound: 0,

  // Scoring
  score: 0,
  correctTotal: 0,
  combo: 0,
  bestCombo: 0,

  // Timer
  timeLeft: 30,
  maxTime: 30,

  // Transient flair / feedback
  flair: null,           // { text, color, ttl }

  start() {
    const cocktail = pickCocktail();
    set({
      status: 'playing',
      round: 0,
      cocktail,
      cards: buildCards(cocktail, 0),
      correctNeeded: cocktail.ingredients.length,
      correctThisRound: 0,
      score: 0, correctTotal: 0, combo: 0, bestCombo: 0,
      timeLeft: baseTimeFor(0), maxTime: baseTimeFor(0),
      flair: null,
    });
  },

  reset() { set({ status: 'idle' }); },

  tick() {
    const s = get();
    if (s.status !== 'playing') return;
    const next = s.timeLeft - 1;
    if (next <= 0) {
      set({ timeLeft: 0 });
      get()._roundEnd(false);
    } else {
      set({ timeLeft: next });
    }
  },

  /** Called when a card is dropped on the shaker. */
  dropOnShaker(cardId) {
    const s = get();
    if (s.status !== 'playing') return;
    const card = s.cards.find(c => c.id === cardId);
    if (!card) return;
    const remaining = s.cards.filter(c => c.id !== cardId);
    if (card.correct) {
      const combo = s.combo + 1;
      const mult = combo >= 4 ? 3 : combo >= 3 ? 2 : combo >= 2 ? 1.5 : 1;
      const pts = Math.floor((100 + Math.floor(s.timeLeft * 3)) * mult);
      const correctThisRound = s.correctThisRound + 1;
      set({
        cards: remaining,
        correctThisRound,
        score: s.score + pts,
        correctTotal: s.correctTotal + 1,
        combo,
        bestCombo: Math.max(s.bestCombo, combo),
        flair: { text: combo >= 3 ? `🔥 ×${combo}  +${pts}` : `+${pts}`, color: '#34d399', ttl: performance.now() + 800 },
      });
      if (correctThisRound >= s.correctNeeded) get()._roundEnd(true);
    } else {
      set({
        combo: 0,
        flair: { text: '✗ distractor', color: '#e74c3c', ttl: performance.now() + 700 },
      });
    }
  },

  /** Dropped outside the shaker (or card cancelled) — no effect. */
  cardCancel() { /* no-op placeholder for future haptics */ },

  _roundEnd(success) {
    const s = get();
    const nextRound = s.round + 1;
    if (nextRound >= s.totalRounds) {
      set({ status: success ? 'win' : 'over' });
      return;
    }
    // Small transition window before the next round.
    set({
      status: 'between',
      flair: { text: success ? `✓ Ronda ${s.round + 1} completada` : `⏱ Tiempo agotado`, color: success ? '#34d399' : '#e74c3c', ttl: performance.now() + 1200 },
    });
    setTimeout(() => {
      const cur = get();
      if (cur.status !== 'between') return;
      const cocktail = pickCocktail(s.cocktail);
      cur && set({
        status: 'playing',
        round: nextRound,
        cocktail,
        cards: buildCards(cocktail, nextRound),
        correctNeeded: cocktail.ingredients.length,
        correctThisRound: 0,
        combo: 0,
        timeLeft: baseTimeFor(nextRound),
        maxTime: baseTimeFor(nextRound),
        flair: null,
      });
    }, 1200);
  },
}));
