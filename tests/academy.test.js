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

// ─── Mock academy_data.js with per-lesson questions ──────────
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
      ],
      passThreshold: 70,
      questions: [
        { q: 'Q0', a: ['Correct0', 'Wrong1_0', 'Wrong2_0', 'Wrong3_0'], exp: 'Exp0' },
        { q: 'Q1', a: ['Correct1', 'Wrong1_1', 'Wrong2_1', 'Wrong3_1'], exp: 'Exp1' },
      ],
    },
    {
      key: 'test.lesson1',
      cards: [
        { type: 'theory', key: 'test.card3' },
      ],
      passThreshold: 70,
      questions: [
        { q: 'Q2', a: ['Correct2', 'Wrong1_2', 'Wrong2_2', 'Wrong3_2'], exp: 'Exp2' },
      ],
    },
  ],
  questions: [],
};

const mockLevel1 = {
  id: 1,
  key: 'test.level1',
  descKey: 'test.level1.desc',
  icon: '🍸',
  color: '#e74c3c',
  passThreshold: 70,
  lessons: [
    {
      key: 'test.l1.lesson0',
      cards: [{ type: 'theory', key: 'test.l1.card1' }],
      passThreshold: 70,
      questions: [
        { q: 'L1Q0', a: ['L1Correct0', 'L1W1', 'L1W2', 'L1W3'], exp: 'L1Exp0' },
      ],
    },
  ],
  questions: [],
};

vi.mock('../js/academy_data.js', () => ({
  ACADEMY_LEVELS: [mockLevel, mockLevel1]
}));

const {
  startAcademy, startAcademyLesson, advanceAcademyCard, answerAcademy,
  advanceAcademy, abortAcademy, getAcademyStats, getAcademyLevels,
  isLevelUnlocked, isLessonUnlocked
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

/** Complete all questions correctly starting from the current question payload */
function completeAllCorrectly(firstQuestion) {
  let qPayload = firstQuestion || skipAllCards();
  let result = null;
  for (let i = 0; i < 20; i++) {
    if (!qPayload || qPayload.done) { result = qPayload; break; }
    const idx = findCorrectIndex(qPayload.answers);
    answerAcademy(idx >= 0 ? idx : 0);
    result = advanceAcademy();
    if (result?.done === true) break;
    qPayload = result; // next question payload
  }
  return result;
}

// ─── startAcademyLesson ──────────────────────────────────────
describe('startAcademyLesson', () => {
  beforeEach(() => clearStorage());

  it('returns card payload for lesson 0 of level 0', () => {
    const payload = startAcademyLesson(0, 0);
    expect(payload).not.toBeNull();
    expect(payload.phase).toBe('card');
  });

  it('returns card payload for lesson 1 when lesson 0 completed', () => {
    // Complete lesson 0 first
    startAcademyLesson(0, 0);
    const q = skipAllCards();
    completeAllCorrectly(q);
    // Now lesson 1 should be unlocked
    const payload = startAcademyLesson(0, 1);
    expect(payload).not.toBeNull();
    expect(payload.phase).toBe('card');
  });

  it('returns null for locked lesson', () => {
    expect(startAcademyLesson(0, 1)).toBeNull();
  });

  it('returns null for locked level', () => {
    expect(startAcademyLesson(1, 0)).toBeNull();
  });

  it('returns null for non-existent level', () => {
    expect(startAcademyLesson(999, 0)).toBeNull();
  });

  it('returns null for non-existent lesson', () => {
    expect(startAcademyLesson(0, 99)).toBeNull();
  });
});

// ─── startAcademy (backward compat) ──────────────────────────
describe('startAcademy', () => {
  beforeEach(() => clearStorage());

  it('returns card payload for level 0 (starts lesson 0)', () => {
    const payload = startAcademy(0);
    expect(payload).not.toBeNull();
    expect(payload.phase).toBe('card');
  });

  it('returns null for locked level', () => {
    expect(startAcademy(1)).toBeNull();
  });
});

// ─── isLessonUnlocked ────────────────────────────────────────
describe('isLessonUnlocked', () => {
  beforeEach(() => clearStorage());

  it('lesson 0 of level 0 is always unlocked', () => {
    expect(isLessonUnlocked(0, 0)).toBe(true);
  });

  it('lesson 1 is locked when lesson 0 not completed', () => {
    expect(isLessonUnlocked(0, 1)).toBe(false);
  });

  it('lesson 1 is unlocked when lesson 0 completed', () => {
    localStorage.setItem('cq_academy_data', JSON.stringify({
      _version: 2,
      levels: { 0: { lessons: { 0: { completed: true, bestScore: 100, attempts: 1 } } } }
    }));
    expect(isLessonUnlocked(0, 1)).toBe(true);
  });

  it('lesson in locked level is always locked', () => {
    expect(isLessonUnlocked(1, 0)).toBe(false);
  });
});

// ─── advanceAcademyCard ──────────────────────────────────────
describe('advanceAcademyCard', () => {
  beforeEach(() => { clearStorage(); startAcademyLesson(0, 0); });

  it('advances through cards then transitions to question phase', () => {
    const card2 = advanceAcademyCard();
    expect(card2).not.toBeNull();
    expect(card2.phase).toBe('card');

    const question = advanceAcademyCard();
    expect(question).not.toBeNull();
    expect(question.phase).toBe('question');
    expect(question.answers).toHaveLength(4);
  });

  it('returns null when not in cards phase', () => {
    skipAllCards();
    expect(advanceAcademyCard()).toBeNull();
  });
});

// ─── answerAcademy ───────────────────────────────────────────
describe('answerAcademy', () => {
  beforeEach(() => { clearStorage(); startAcademyLesson(0, 0); skipAllCards(); });

  it('returns feedback with correct/incorrect status', () => {
    const result = answerAcademy(0);
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
});

// ─── advanceAcademy ──────────────────────────────────────────
describe('advanceAcademy', () => {
  beforeEach(() => { clearStorage(); startAcademyLesson(0, 0); skipAllCards(); });

  it('returns next question after feedback', () => {
    answerAcademy(0);
    const next = advanceAcademy();
    expect(next).not.toBeNull();
    expect(next.phase).toBe('question');
  });

  it('returns null if not in feedback phase', () => {
    expect(advanceAcademy()).toBeNull();
  });
});

// ─── Per-lesson completion ───────────────────────────────────
describe('per-lesson completion', () => {
  beforeEach(() => clearStorage());

  it('returns done:true with lesson info after all questions', () => {
    startAcademyLesson(0, 0);
    const q = skipAllCards();
    const result = completeAllCorrectly(q);

    expect(result).not.toBeNull();
    expect(result.done).toBe(true);
    expect(result.lessonIndex).toBe(0);
    expect(result.levelId).toBe(0);
    expect(typeof result.pct).toBe('number');
    expect(result.total).toBe(2); // lesson 0 has 2 questions
  });

  it('persists lesson result to localStorage', () => {
    startAcademyLesson(0, 0);
    const q = skipAllCards();
    completeAllCorrectly(q);

    const data = JSON.parse(localStorage.getItem('cq_academy_data'));
    expect(data.levels[0].lessons[0]).toBeDefined();
    expect(data.levels[0].lessons[0].attempts).toBe(1);
  });

  it('unlocks next lesson when passed', () => {
    startAcademyLesson(0, 0);
    const q = skipAllCards();
    const result = completeAllCorrectly(q);

    expect(result.unlockNextLesson).toBe(true);
    expect(result.nextLessonIndex).toBe(1);
    expect(isLessonUnlocked(0, 1)).toBe(true);
  });

  it('does NOT complete level until all lessons done', () => {
    startAcademyLesson(0, 0);
    const q = skipAllCards();
    const result = completeAllCorrectly(q);

    expect(result.levelCompleted).toBe(false);
    expect(isLevelUnlocked(1)).toBe(false);
  });

  it('completes level when all lessons done', () => {
    // Complete lesson 0
    startAcademyLesson(0, 0);
    let q = skipAllCards();
    completeAllCorrectly(q);

    // Complete lesson 1
    startAcademyLesson(0, 1);
    q = skipAllCards();
    const result = completeAllCorrectly(q);

    expect(result.levelCompleted).toBe(true);
    expect(result.unlockNextLevel).toBe(true);
    expect(isLevelUnlocked(1)).toBe(true);
  });
});

// ─── isLevelUnlocked ─────────────────────────────────────────
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
      _version: 2,
      levels: { 0: { completed: true, bestScore: 100, attempts: 1, lessons: {} } }
    }));
    expect(isLevelUnlocked(1)).toBe(true);
  });
});

// ─── getAcademyStats ─────────────────────────────────────────
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
      _version: 2,
      xp: 50,
      totalCompleted: 1,
      levels: { 0: { completed: true, bestScore: 80, attempts: 2, lessons: {} } }
    }));
    const stats = getAcademyStats();
    expect(stats.currentLevel).toBe(1);
    expect(stats.xp).toBe(50);
    expect(stats.totalCompleted).toBe(1);
  });
});

// ─── getAcademyLevels ────────────────────────────────────────
describe('getAcademyLevels', () => {
  beforeEach(() => clearStorage());

  it('returns per-lesson progress', () => {
    localStorage.setItem('cq_academy_data', JSON.stringify({
      _version: 2,
      levels: { 0: { lessons: { 0: { completed: true, bestScore: 90, attempts: 1 } } } }
    }));
    const levels = getAcademyLevels();
    expect(levels[0].lessons[0].completed).toBe(true);
    expect(levels[0].lessons[0].bestScore).toBe(90);
    expect(levels[0].lessons[1].completed).toBe(false);
    expect(levels[0].lessonsCompleted).toBe(1);
    expect(levels[0].lessonsTotal).toBe(2);
  });
});

// ─── Data migration ──────────────────────────────────────────
describe('data migration', () => {
  beforeEach(() => clearStorage());

  it('migrates old format (no lessons) to new format', () => {
    localStorage.setItem('cq_academy_data', JSON.stringify({
      levels: { 0: { completed: true, bestScore: 100, attempts: 2 } }
    }));
    // getData() triggers migration
    const levels = getAcademyLevels();
    expect(levels[0].lessons[0].completed).toBe(true);
    expect(levels[0].lessons[1].completed).toBe(true);
    expect(levels[0].lessons[0].bestScore).toBe(100);
  });

  it('does not re-migrate already migrated data', () => {
    localStorage.setItem('cq_academy_data', JSON.stringify({
      _version: 2,
      levels: { 0: { completed: false, lessons: { 0: { completed: true, bestScore: 80, attempts: 1 } } } }
    }));
    const levels = getAcademyLevels();
    expect(levels[0].lessons[0].completed).toBe(true);
    expect(levels[0].lessons[1].completed).toBe(false);
  });
});

// ─── abortAcademy ────────────────────────────────────────────
describe('abortAcademy', () => {
  it('makes answerAcademy return null after abort', () => {
    startAcademyLesson(0, 0);
    skipAllCards();
    abortAcademy();
    expect(answerAcademy(0)).toBeNull();
  });

  it('makes advanceAcademy return null after abort', () => {
    startAcademyLesson(0, 0);
    skipAllCards();
    answerAcademy(0);
    abortAcademy();
    expect(advanceAcademy()).toBeNull();
  });
});
