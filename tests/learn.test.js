import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock localStorage ────────────────────────────────────────
const store = {};
vi.stubGlobal('localStorage', {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
});

// ─── Mock questions.js ────────────────────────────────────────
const mockRound = {
  id: 42,
  title: 'Learn Round',
  icon: '🍸',
  questions: Array.from({ length: 5 }, (_, i) => ({
    q: `Q${i}`,
    a: [`Correct${i}`, `W1_${i}`, `W2_${i}`, `W3_${i}`],
    exp: `Exp${i}`,
    theory: `Theory${i}`
  }))
};

vi.mock('../js/questions.js', () => ({
  rounds: [mockRound],
  getLocalizedRounds: () => [mockRound]
}));

vi.mock('../js/lang.js', () => ({
  getLang: () => 'en',
  t: (k) => k,
}));

const {
  getLevelInfo, getLearnStats,
  startLesson, answerLesson, advanceLesson, advanceFromTheory, abortLesson,
  getRoundMasteryScore, getMasteryLevel, MASTERY_LEVELS,
  addXp, MAX_XP_PER_CALL, MAX_XP_TOTAL,
} = await import('../js/learn.js');

// ─── Helpers ──────────────────────────────────────────────────
function clearStorage() { localStorage.clear(); }

/** Complete one full theory→question→feedback cycle answering correctly */
function answerCorrectly(qPayload) {
  const correctIdx = qPayload.answers.findIndex(a => a.startsWith('Correct'));
  return answerLesson(correctIdx);
}

/** Complete one full theory→question→feedback cycle answering wrongly */
function answerWrongly(qPayload) {
  const wrongIdx = qPayload.answers.findIndex(a => a.startsWith('W1'));
  return answerLesson(wrongIdx);
}

// ─── Level info ───────────────────────────────────────────────
// Curve: [0, 80, 200, 360, 560, 800, 1100, 1450, 1850, 2300, 2800, 3400, 4100, 5000, 6200, 8000]
describe('getLevelInfo', () => {
  it('returns level 1 at 0 xp', () => {
    expect(getLevelInfo(0).level).toBe(1);
  });

  it('returns level 2 at 100 xp', () => {
    expect(getLevelInfo(100).level).toBe(2);
  });

  it('returns level 3 at 250 xp', () => {
    expect(getLevelInfo(250).level).toBe(3);
  });

  it('returns level 4 at 500 xp', () => {
    expect(getLevelInfo(500).level).toBe(4);
  });

  it('returns level 9 at 1850 xp', () => {
    expect(getLevelInfo(1850).level).toBe(9);
  });

  it('returns level 13 at 4100 xp', () => {
    expect(getLevelInfo(4100).level).toBe(13);
  });

  it('pct is 0 at level start', () => {
    expect(getLevelInfo(0).pct).toBe(0);
  });

  it('pct is 99 just before level 3', () => {
    expect(getLevelInfo(199).pct).toBe(99);
  });

  it('pct is ~50 at midpoint of level 1', () => {
    const info = getLevelInfo(40);
    expect(info.pct).toBeCloseTo(50, 0);
  });

  it('returns level 16 at 8000 xp (max level)', () => {
    expect(getLevelInfo(8000).level).toBe(16);
  });

  it('sets maxLevel:true at 8000 xp', () => {
    expect(getLevelInfo(8000).maxLevel).toBe(true);
  });

  it('pct is 100 at max level', () => {
    expect(getLevelInfo(8000).pct).toBe(100);
  });

  it('maxLevel:true for xp beyond 8000', () => {
    expect(getLevelInfo(9999).maxLevel).toBe(true);
    expect(getLevelInfo(9999).level).toBe(16);
  });

  it('maxLevel:false below max level', () => {
    expect(getLevelInfo(0).maxLevel).toBe(false);
    expect(getLevelInfo(7999).maxLevel).toBe(false);
  });
});

// ─── startLesson ──────────────────────────────────────────────
describe('startLesson', () => {
  beforeEach(() => clearStorage());

  it('returns a theory payload as first phase', () => {
    const payload = startLesson(42);
    expect(payload).not.toBeNull();
    expect(payload.phase).toBe('theory');
    expect(payload.theory).toBeDefined();
    expect(payload.sessionProgress).toBeDefined();
  });

  it('returns null for unknown roundId', () => {
    expect(startLesson(999)).toBeNull();
  });
});

// ─── advanceFromTheory ────────────────────────────────────────
describe('advanceFromTheory', () => {
  beforeEach(() => { clearStorage(); startLesson(42); });

  it('transitions to question phase', () => {
    const q = advanceFromTheory();
    expect(q.phase).toBe('question');
    expect(q.answers).toHaveLength(4);
    expect(q.question).toBeDefined();
  });

  it('returns null if not in theory phase', () => {
    advanceFromTheory(); // move to question
    expect(advanceFromTheory()).toBeNull();
  });
});

// ─── answerLesson ─────────────────────────────────────────────
describe('answerLesson', () => {
  beforeEach(() => { clearStorage(); startLesson(42); });

  it('returns correct:true on right answer', () => {
    const q = advanceFromTheory();
    const result = answerCorrectly(q);
    expect(result.correct).toBe(true);
    expect(result.phase).toBe('feedback');
  });

  it('returns correct:false on wrong answer', () => {
    const q = advanceFromTheory();
    const result = answerWrongly(q);
    expect(result.correct).toBe(false);
  });

  it('includes explanation in feedback', () => {
    const q = advanceFromTheory();
    const result = answerCorrectly(q);
    expect(result.explanation).toBeDefined();
  });

  it('does not answer twice (guard)', () => {
    const q = advanceFromTheory();
    answerCorrectly(q);
    expect(answerLesson(0)).toBeNull();
  });

  it('returns null before advancing to question phase', () => {
    // Still in theory phase — answer should be null
    expect(answerLesson(0)).toBeNull();
  });
});

// ─── advanceLesson ────────────────────────────────────────────
describe('advanceLesson – navigation', () => {
  beforeEach(() => clearStorage());

  it('returns next theory phase (or done) after answering a question', () => {
    startLesson(42);
    const q = advanceFromTheory(); // theory → question
    answerCorrectly(q);
    const next = advanceLesson(); // feedback → next theory or done
    expect(next).not.toBeNull();
    expect(next.phase === 'theory' || next.done === true).toBe(true);
  });

  it('returns null if called while in theory phase', () => {
    startLesson(42);
    // In theory phase — feedback advance is invalid
    expect(advanceLesson()).toBeNull();
  });
});

describe('advanceLesson – completion', () => {
  beforeEach(() => clearStorage());

  it('returns done:true after completing all session questions', () => {
    startLesson(42);
    let result = null;

    // Cycle: theory phase → advanceFromTheory → question → answer → feedback → advanceLesson → repeat
    for (let attempt = 0; attempt < 30; attempt++) {
      const q = advanceFromTheory(); // must be called while in theory phase
      if (!q) break;
      answerCorrectly(q);
      result = advanceLesson();
      if (result?.done) break;
      // result.phase === 'theory' → loop continues
    }

    expect(result).not.toBeNull();
    expect(result.done).toBe(true);
    expect(result.correct).toBeGreaterThan(0);
    expect(result.xp).toBeGreaterThan(0);
  });
});

// ─── abortLesson ──────────────────────────────────────────────
describe('abortLesson', () => {
  it('makes answerLesson return null after abort', () => {
    startLesson(42);
    advanceFromTheory();
    abortLesson();
    expect(answerLesson(0)).toBeNull();
  });
});

// ─── Mastery system ───────────────────────────────────────────
describe('getMasteryLevel', () => {
  it('returns novato at 0 score', () => {
    expect(getMasteryLevel(0).level).toBe(0);
    expect(getMasteryLevel(0).key).toBe('novato');
  });

  it('returns familiarizado at 0.33 score', () => {
    expect(getMasteryLevel(0.33).level).toBe(1);
    expect(getMasteryLevel(0.33).key).toBe('familiarizado');
  });

  it('returns maestro at 0.67 score', () => {
    expect(getMasteryLevel(0.67).level).toBe(2);
    expect(getMasteryLevel(0.67).key).toBe('maestro');
  });

  it('returns maestro at 1.0 score', () => {
    expect(getMasteryLevel(1.0).level).toBe(2);
  });
});

describe('getRoundMasteryScore', () => {
  it('returns 0 with no concepts data', () => {
    expect(getRoundMasteryScore(mockRound, {})).toBe(0);
  });

  it('returns 1.0 when all questions have 3+ hits', () => {
    const concepts = {};
    mockRound.questions.forEach((_, i) => { concepts[i] = { hits: 3, misses: 0 }; });
    expect(getRoundMasteryScore(mockRound, { concepts })).toBe(1);
  });

  it('returns ~0.33 when all questions have 1 hit', () => {
    const concepts = {};
    mockRound.questions.forEach((_, i) => { concepts[i] = { hits: 1, misses: 0 }; });
    const score = getRoundMasteryScore(mockRound, { concepts });
    expect(score).toBeCloseTo(1 / 3, 5);
  });
});

// ─── Stats ────────────────────────────────────────────────────
describe('getLearnStats', () => {
  beforeEach(() => clearStorage());

  it('returns defaults when no data stored', () => {
    const stats = getLearnStats();
    expect(stats.xp).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.rounds).toEqual({});
  });
});

// ─── addXp — manipulation guards ──────────────────────────────
// Defends the canonical XP store from the obvious devtools attacks:
// `addXp(Infinity)`, `addXp(NaN)`, `addXp(-1)`, `addXp(1e15)`. Without the
// guards, any of those would propagate into Firestore via syncLearnToCloud
// and pollute the leaderboard.
describe('addXp — input validation', () => {
  beforeEach(() => clearStorage());

  it('ignores NaN', () => {
    addXp(NaN);
    expect(getLearnStats().xp).toBe(0);
  });

  it('ignores Infinity', () => {
    addXp(Infinity);
    expect(getLearnStats().xp).toBe(0);
  });

  it('ignores negative amounts', () => {
    addXp(-50);
    expect(getLearnStats().xp).toBe(0);
  });

  it('ignores zero', () => {
    addXp(0);
    expect(getLearnStats().xp).toBe(0);
  });

  it('ignores non-numeric input', () => {
    addXp('999');
    addXp(null);
    addXp(undefined);
    addXp({ valueOf: () => 1e9 });
    expect(getLearnStats().xp).toBe(0);
  });

  it('caps a single call at MAX_XP_PER_CALL', () => {
    addXp(Number.MAX_SAFE_INTEGER);
    expect(getLearnStats().xp).toBe(MAX_XP_PER_CALL);
  });

  it('caps absurdly large values at MAX_XP_PER_CALL', () => {
    addXp(1e15);
    expect(getLearnStats().xp).toBe(MAX_XP_PER_CALL);
  });

  it('truncates fractional amounts via Math.floor', () => {
    addXp(10.9);
    expect(getLearnStats().xp).toBe(10);
  });

  it('accumulates legitimate amounts normally', () => {
    addXp(15);
    addXp(20);
    expect(getLearnStats().xp).toBe(35);
  });

  it('clamps a tampered local total back under MAX_XP_TOTAL on next write', () => {
    // Simulate a manipulated localStorage with a poisoned total
    localStorage.setItem('cq_learn_data', JSON.stringify({ xp: 1e18, streak: 0 }));
    addXp(10);
    const { xp } = getLearnStats();
    expect(xp).toBeLessThanOrEqual(MAX_XP_TOTAL);
    expect(Number.isFinite(xp)).toBe(true);
  });
});

// ─── safeSetItem — quota / SecurityError resilience ──────────
// addXp must not throw even when localStorage is unwritable (private mode,
// quota exceeded). Without safeSetItem, the QuotaExceededError bubbles up
// and breaks the lesson finish flow.
describe('addXp — storage failure resilience', () => {
  beforeEach(() => clearStorage());

  it('does not throw when localStorage.setItem throws QuotaExceededError', () => {
    const orig = localStorage.setItem;
    localStorage.setItem = () => { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; };
    try {
      expect(() => addXp(10)).not.toThrow();
    } finally {
      localStorage.setItem = orig;
    }
  });
});
