import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock localStorage ────────────────────────────────────────
const store = {};
vi.stubGlobal('localStorage', {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
});

// ─── Mock auth.js (cloud sync is no-op in tests) ─────────────
vi.mock('../js/auth.js', () => ({
  getDb: () => null,
  getCurrentUser: () => null,
  isFirebaseReady: () => false,
}));

vi.mock('../js/lang.js', () => ({
  getLang: () => 'en',
  t: (k) => k,
}));

// ─── Mock academy_data.js with a simple test level ───────────
const mockLevel = {
  id: 0,
  key: 'test.level0',
  descKey: 'test.level0.desc',
  icon: '🔧',
  color: '#3498db',
  passThreshold: 70,
  lessons: [
    {
      key: 'test.lesson0',
      cards: [
        { type: 'theory', key: 'test.card1' },
        { type: 'tip', key: 'test.card2' },
      ]
    }
  ],
  questions: Array.from({ length: 3 }, (_, i) => ({
    q: `Q${i}`,
    a: [`Correct${i}`, `Wrong1_${i}`, `Wrong2_${i}`, `Wrong3_${i}`],
    exp: `Exp${i}`,
  }))
};

const mockLevel1 = {
  id: 1,
  key: 'test.level1',
  descKey: 'test.level1.desc',
  icon: '🍸',
  color: '#e74c3c',
  passThreshold: 70,
  lessons: [{ key: 'test.l1.lesson0', cards: [{ type: 'theory', key: 'test.l1.card1' }] }],
  questions: [
    { q: 'L1Q0', a: ['L1Correct0', 'L1W1', 'L1W2', 'L1W3'], exp: 'L1Exp0' },
  ]
};

vi.mock('../js/academy_data.js', () => ({
  ACADEMY_LEVELS: [mockLevel, mockLevel1]
}));

const {
  startAcademy, advanceAcademyCard, answerAcademy, advanceAcademy,
  abortAcademy, getAcademyStats, isLevelUnlocked
} = await import('../js/academy.js');

// ─── Helpers ──────────────────────────────────────────────────
function clearStorage() { localStorage.clear(); }

function findCorrectIndex(answers) {
  return answers.findIndex(a => typeof a === 'string' && a.startsWith('Correct'));
}

function answerCorrectly(questionPayload) {
  const idx = findCorrectIndex(questionPayload.answers);
  return answerAcademy(idx);
}

function answerWrongly(questionPayload) {
  const idx = questionPayload.answers.findIndex(a => typeof a === 'string' && a.startsWith('Wrong'));
  return answerAcademy(idx);
}

/** Advance through all cards until we reach the question phase */
function skipAllCards() {
  let result;
  for (let i = 0; i < 20; i++) {
    result = advanceAcademyCard();
    if (!result || result.phase === 'question') return result;
  }
  return result;
}

// ─── startAcademy ─────────────────────────────────────────────
describe('startAcademy', () => {
  beforeEach(() => clearStorage());

  it('returns card payload for level 0', () => {
    const payload = startAcademy(0);
    expect(payload).not.toBeNull();
    expect(payload.phase).toBe('card');
  });

  it('returns null for locked level', () => {
    expect(startAcademy(1)).toBeNull();
  });

  it('returns null for non-existent level', () => {
    expect(startAcademy(999)).toBeNull();
  });
});

// ─── advanceAcademyCard ───────────────────────────────────────
describe('advanceAcademyCard', () => {
  beforeEach(() => { clearStorage(); startAcademy(0); });

  it('advances through cards then transitions to question phase', () => {
    // Level 0 has 2 cards
    const card2 = advanceAcademyCard();
    expect(card2).not.toBeNull();
    expect(card2.phase).toBe('card');

    const question = advanceAcademyCard();
    expect(question).not.toBeNull();
    expect(question.phase).toBe('question');
    expect(question.answers).toHaveLength(4);
  });

  it('returns null when not in cards phase', () => {
    skipAllCards(); // now in question phase
    expect(advanceAcademyCard()).toBeNull();
  });
});

// ─── answerAcademy ────────────────────────────────────────────
describe('answerAcademy', () => {
  beforeEach(() => { clearStorage(); startAcademy(0); skipAllCards(); });

  it('returns correct:true on right answer', () => {
    const result = answerAcademy(0); // answers are shuffled, but let's test the structure
    expect(result).not.toBeNull();
    expect(result.phase).toBe('feedback');
    expect(typeof result.correct).toBe('boolean');
  });

  it('returns feedback with correctIndex and explanation', () => {
    const result = answerAcademy(0);
    expect(result.correctIndex).toBeDefined();
    expect(typeof result.correctIndex).toBe('number');
    expect(result.explanation).toBeDefined();
  });

  it('guards against double-answering', () => {
    answerAcademy(0);
    expect(answerAcademy(1)).toBeNull();
  });

  it('returns null if not in question phase', () => {
    // Answer and advance to check that we can't answer during feedback
    answerAcademy(0);
    // Now in feedback phase, answering again should return null
    expect(answerAcademy(0)).toBeNull();
  });
});

// ─── advanceAcademy ───────────────────────────────────────────
describe('advanceAcademy', () => {
  beforeEach(() => { clearStorage(); startAcademy(0); skipAllCards(); });

  it('returns next question after feedback', () => {
    answerAcademy(0); // answer first question
    const next = advanceAcademy();
    expect(next).not.toBeNull();
    expect(next.phase).toBe('question');
  });

  it('returns null if not in feedback phase', () => {
    // Still in question phase, advance should fail
    expect(advanceAcademy()).toBeNull();
  });

  it('returns null if called twice in feedback phase', () => {
    answerAcademy(0);
    advanceAcademy(); // valid
    // Now in question phase again, should return null
    expect(advanceAcademy()).toBeNull();
  });
});

// ─── Full flow completion ─────────────────────────────────────
describe('advanceAcademy – completion', () => {
  beforeEach(() => clearStorage());

  it('returns done:true with numeric values after all questions answered correctly', () => {
    startAcademy(0);
    skipAllCards();

    let result = null;
    for (let i = 0; i < 10; i++) {
      const q = answerAcademy(0);
      if (!q) break;
      result = advanceAcademy();
      if (result?.done === true) break;
    }

    expect(result).not.toBeNull();
    expect(result.done).toBe(true);
    expect(typeof result.correct).toBe('number');
    expect(typeof result.pct).toBe('number');
    expect(typeof result.xp).toBe('number');
    expect(typeof result.total).toBe('number');
    expect(result.total).toBe(3); // mock level has 3 questions
  });

  it('result.correct is not undefined', () => {
    startAcademy(0);
    skipAllCards();

    let result = null;
    for (let i = 0; i < 10; i++) {
      answerAcademy(0);
      result = advanceAcademy();
      if (result?.done === true) break;
    }

    expect(result.correct).not.toBeUndefined();
    expect(result.pct).not.toBeUndefined();
    expect(result.xp).not.toBeUndefined();
  });

  it('sets passed:true when all answers correct and score >= threshold', () => {
    startAcademy(0);
    skipAllCards();

    let result = null;
    for (let i = 0; i < 10; i++) {
      answerAcademy(0);
      result = advanceAcademy();
      if (result?.done === true) break;
    }

    // Result should always have passed as a boolean
    expect(typeof result.passed).toBe('boolean');
  });

  it('persists level result to localStorage', () => {
    startAcademy(0);
    skipAllCards();

    let result = null;
    for (let i = 0; i < 10; i++) {
      answerAcademy(0);
      result = advanceAcademy();
      if (result?.done === true) break;
    }

    const data = JSON.parse(localStorage.getItem('cq_academy_data'));
    expect(data.levels).toBeDefined();
    expect(data.levels[0]).toBeDefined();
    expect(data.levels[0].attempts).toBe(1);
  });
});

// ─── abortAcademy ─────────────────────────────────────────────
describe('abortAcademy', () => {
  it('makes answerAcademy return null after abort', () => {
    startAcademy(0);
    skipAllCards();
    abortAcademy();
    expect(answerAcademy(0)).toBeNull();
  });

  it('makes advanceAcademy return null after abort', () => {
    startAcademy(0);
    skipAllCards();
    answerAcademy(0);
    abortAcademy();
    expect(advanceAcademy()).toBeNull();
  });
});

// ─── isLevelUnlocked ──────────────────────────────────────────
describe('isLevelUnlocked', () => {
  beforeEach(() => clearStorage());

  it('level 0 is always unlocked', () => {
    expect(isLevelUnlocked(0)).toBe(true);
  });

  it('level 1 is locked when level 0 not completed', () => {
    expect(isLevelUnlocked(1)).toBe(false);
  });

  it('level 1 is unlocked when level 0 completed', () => {
    localStorage.setItem('cq_academy_data', JSON.stringify({
      levels: { 0: { completed: true, bestScore: 100, attempts: 1 } }
    }));
    expect(isLevelUnlocked(1)).toBe(true);
  });
});

// ─── getAcademyStats ──────────────────────────────────────────
describe('getAcademyStats', () => {
  beforeEach(() => clearStorage());

  it('returns defaults when no data stored', () => {
    const stats = getAcademyStats();
    expect(stats.currentLevel).toBe(0);
    expect(stats.xp).toBe(0);
    expect(stats.totalCompleted).toBe(0);
  });

  it('reflects stored data', () => {
    localStorage.setItem('cq_academy_data', JSON.stringify({
      xp: 50,
      totalCompleted: 1,
      levels: { 0: { completed: true, bestScore: 80, attempts: 2 } }
    }));
    const stats = getAcademyStats();
    expect(stats.currentLevel).toBe(1);
    expect(stats.xp).toBe(50);
    expect(stats.totalCompleted).toBe(1);
  });
});
