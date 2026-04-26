import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Firebase CDN imports ────────────────────────────────
// rivals.js dynamically imports Firebase; mock them so tests work offline
vi.mock('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js', () => ({
  getApp: vi.fn(),
}));
vi.mock('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(),
}));
vi.mock('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  onValue: vi.fn(),
  onDisconnect: vi.fn(() => ({ remove: vi.fn(), update: vi.fn() })),
}));

// ─── Mock questions + lang ────────────────────────────────────
const mockRound = {
  id: 'round-test',
  title: 'Test Round',
  questions: Array.from({ length: 15 }, (_, i) => ({
    q: `Question ${i + 1}`,
    a: [`Correct${i}`, `Wrong1_${i}`, `Wrong2_${i}`, `Wrong3_${i}`],
    exp: `Explanation ${i + 1}`,
  })),
};

vi.mock('../js/questions.js', () => ({
  getLocalizedRounds: () => [mockRound],
}));
vi.mock('../js/lang.js', () => ({
  getLang: () => 'en',
  t: (k) => k,
}));

const {
  generateCode,
  prepareDuelSetup,
  loadDuelQuestionsFromSetup,
  prepareDuelQuestions,
  calcScore,
  clampedAnswerPoints,
  MAX_POINTS_PER_ANSWER,
  QUESTIONS_PER_DUEL,
} = await import('../js/rivals.js');

// ─── Helpers ──────────────────────────────────────────────────

/** Simulate Firebase RTDB serialization: arrays → numeric-keyed objects */
function firebaseSerialize(obj) {
  if (Array.isArray(obj)) {
    const out = {};
    obj.forEach((v, i) => { out[i] = firebaseSerialize(v); });
    return out;
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = firebaseSerialize(v);
    return out;
  }
  return obj;
}

// ─── generateCode ─────────────────────────────────────────────
describe('generateCode', () => {
  it('returns a 6-character string', () => {
    expect(generateCode()).toHaveLength(6);
  });

  it('uses only the allowed charset (no ambiguous chars like 0, O, I, 1)', () => {
    const allowed = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
    for (let i = 0; i < 50; i++) {
      expect(generateCode()).toMatch(allowed);
    }
  });

  it('generates unique codes (probabilistic check)', () => {
    const codes = new Set(Array.from({ length: 100 }, generateCode));
    expect(codes.size).toBeGreaterThan(90);
  });
});

// ─── calcScore ────────────────────────────────────────────────
describe('calcScore', () => {
  it('returns 0 for wrong answer regardless of time left', () => {
    expect(calcScore(false, 20)).toBe(0);
    expect(calcScore(false, 0)).toBe(0);
    expect(calcScore(false, 15)).toBe(0);
  });

  it('returns base points + time bonus for correct answer', () => {
    // 100 base + 20s * 5 = 200
    expect(calcScore(true, 20)).toBe(200);
    // 100 base + 0s * 5 = 100
    expect(calcScore(true, 0)).toBe(100);
    // 100 base + 10s * 5 = 150
    expect(calcScore(true, 10)).toBe(150);
    // 100 base + 1s * 5 = 105
    expect(calcScore(true, 1)).toBe(105);
  });

  it('minimum correct score is 100 (no negative time)', () => {
    expect(calcScore(true, 0)).toBe(100);
  });
});

// ─── clampedAnswerPoints — F4 manipulation guard ─────────────
// submitAnswer used to trust whatever timeLeft / correct the client sent.
// clampedAnswerPoints centralizes the defense so any future caller benefits.
describe('clampedAnswerPoints', () => {
  it('clamps timeLeft above 60 down to 60', () => {
    const { clampedTime, earnedPoints } = clampedAnswerPoints(true, 9999);
    expect(clampedTime).toBe(60);
    expect(earnedPoints).toBe(MAX_POINTS_PER_ANSWER);
  });

  it('clamps negative timeLeft up to 0', () => {
    const { clampedTime, earnedPoints } = clampedAnswerPoints(true, -50);
    expect(clampedTime).toBe(0);
    expect(earnedPoints).toBe(100);
  });

  it('coerces non-numeric timeLeft to 0', () => {
    const { clampedTime, earnedPoints } = clampedAnswerPoints(true, 'forever');
    expect(clampedTime).toBe(0);
    expect(earnedPoints).toBe(100);
  });

  it('coerces NaN timeLeft to 0', () => {
    const { clampedTime, earnedPoints } = clampedAnswerPoints(true, NaN);
    expect(clampedTime).toBe(0);
    expect(earnedPoints).toBe(100);
  });

  it('coerces non-boolean correct truthily', () => {
    expect(clampedAnswerPoints('yes', 10).earnedPoints).toBe(150);
    expect(clampedAnswerPoints(0, 10).earnedPoints).toBe(0);
    expect(clampedAnswerPoints(null, 10).earnedPoints).toBe(0);
  });

  it('caps earnedPoints at MAX_POINTS_PER_ANSWER even if calcScore inflates', () => {
    const { earnedPoints } = clampedAnswerPoints(true, 60);
    expect(earnedPoints).toBeLessThanOrEqual(MAX_POINTS_PER_ANSWER);
  });

  it('returns 0 points for wrong answer regardless of timeLeft', () => {
    expect(clampedAnswerPoints(false, 60).earnedPoints).toBe(0);
    expect(clampedAnswerPoints(false, 0).earnedPoints).toBe(0);
  });

  it('MAX_POINTS_PER_ANSWER is bounded by the natural ceiling (100 + 60*5 = 400)', () => {
    expect(MAX_POINTS_PER_ANSWER).toBe(400);
  });
});

// ─── prepareDuelSetup ─────────────────────────────────────────
describe('prepareDuelSetup', () => {
  it('returns correct shape with roundId and questions array', () => {
    const setup = prepareDuelSetup(mockRound);
    expect(setup).toHaveProperty('roundId', 'round-test');
    expect(Array.isArray(setup.questions)).toBe(true);
  });

  it(`selects exactly ${QUESTIONS_PER_DUEL} questions`, () => {
    const setup = prepareDuelSetup(mockRound);
    expect(setup.questions).toHaveLength(QUESTIONS_PER_DUEL);
  });

  it('each question entry has idx, answerPerm, and correctIndex', () => {
    const setup = prepareDuelSetup(mockRound);
    for (const q of setup.questions) {
      expect(q).toHaveProperty('idx');
      expect(q).toHaveProperty('answerPerm');
      expect(q).toHaveProperty('correctIndex');
    }
  });

  it('all question indices are valid (within round.questions bounds)', () => {
    const setup = prepareDuelSetup(mockRound);
    for (const q of setup.questions) {
      expect(q.idx).toBeGreaterThanOrEqual(0);
      expect(q.idx).toBeLessThan(mockRound.questions.length);
    }
  });

  it('no duplicate question indices', () => {
    const setup = prepareDuelSetup(mockRound);
    const indices = setup.questions.map(q => q.idx);
    expect(new Set(indices).size).toBe(indices.length);
  });

  it('answerPerm is a permutation of [0,1,2,3]', () => {
    const setup = prepareDuelSetup(mockRound);
    for (const q of setup.questions) {
      const sorted = [...q.answerPerm].sort((a, b) => a - b);
      expect(sorted).toEqual([0, 1, 2, 3]);
    }
  });

  it('correctIndex matches position of 0 in answerPerm (a[0] is always correct)', () => {
    const setup = prepareDuelSetup(mockRound);
    for (const q of setup.questions) {
      expect(q.correctIndex).toBe(q.answerPerm.indexOf(0));
    }
  });
});

// ─── loadDuelQuestionsFromSetup ───────────────────────────────
describe('loadDuelQuestionsFromSetup', () => {
  it('reconstructs the correct number of questions', () => {
    const setup = prepareDuelSetup(mockRound);
    const qs = loadDuelQuestionsFromSetup(setup);
    expect(qs).toHaveLength(QUESTIONS_PER_DUEL);
  });

  it('each question has the required fields', () => {
    const setup = prepareDuelSetup(mockRound);
    const qs = loadDuelQuestionsFromSetup(setup);
    for (const q of qs) {
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('answers');
      expect(q).toHaveProperty('correctIndex');
      expect(q).toHaveProperty('explanation');
    }
  });

  it('returns [] when roundId does not exist in local data', () => {
    const badSetup = { roundId: 'nonexistent', questions: [] };
    expect(loadDuelQuestionsFromSetup(badSetup)).toEqual([]);
  });

  it('answers array contains all 4 answer texts from the source question', () => {
    const setup = prepareDuelSetup(mockRound);
    const qs = loadDuelQuestionsFromSetup(setup);
    for (const q of qs) {
      expect(q.answers).toHaveLength(4);
    }
  });

  it('the answer at correctIndex is actually the correct answer (a[0])', () => {
    const setup = prepareDuelSetup(mockRound);
    const qs = loadDuelQuestionsFromSetup(setup);
    // For each reconstructed question, find the original question by matching text
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      const originalQ = mockRound.questions.find(orig => orig.q === q.question);
      expect(q.answers[q.correctIndex]).toBe(originalQ.a[0]);
    }
  });

  it('question text and explanation match the original round data', () => {
    const setup = prepareDuelSetup(mockRound);
    const qs = loadDuelQuestionsFromSetup(setup);
    for (const q of qs) {
      const orig = mockRound.questions.find(o => o.q === q.question);
      expect(orig).toBeDefined();
      expect(q.explanation).toBe(orig.exp);
    }
  });
});

// ─── Round-trip: prepare → Firebase serialization → load ─────
describe('prepareDuelSetup + loadDuelQuestionsFromSetup round-trip', () => {
  it('survives Firebase serialization (arrays become numeric-keyed objects)', () => {
    const setup = prepareDuelSetup(mockRound);
    // Simulate what Firebase RTDB does to the stored data
    const serialized = firebaseSerialize(setup);
    const qs = loadDuelQuestionsFromSetup(serialized);
    expect(qs).toHaveLength(QUESTIONS_PER_DUEL);
    for (const q of qs) {
      expect(q.answers).toHaveLength(4);
      const orig = mockRound.questions.find(o => o.q === q.question);
      expect(q.answers[q.correctIndex]).toBe(orig.a[0]);
    }
  });

  it('two players loading the same setup get identical questions', () => {
    const setup = prepareDuelSetup(mockRound);
    const p1Qs = loadDuelQuestionsFromSetup(setup, 'en');
    const p2Qs = loadDuelQuestionsFromSetup(setup, 'en');
    expect(p1Qs).toEqual(p2Qs);
  });

  it('correctIndex is valid (within answers array bounds)', () => {
    const setup = prepareDuelSetup(mockRound);
    const serialized = firebaseSerialize(setup);
    const qs = loadDuelQuestionsFromSetup(serialized);
    for (const q of qs) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.answers.length);
    }
  });
});

// ─── prepareDuelQuestions (bot mode) ─────────────────────────
describe('prepareDuelQuestions (bot mode)', () => {
  it(`selects exactly ${QUESTIONS_PER_DUEL} questions`, () => {
    const qs = prepareDuelQuestions(mockRound);
    expect(qs).toHaveLength(QUESTIONS_PER_DUEL);
  });

  it('each question has question, answers, correctIndex, explanation', () => {
    const qs = prepareDuelQuestions(mockRound);
    for (const q of qs) {
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('answers');
      expect(q).toHaveProperty('correctIndex');
      expect(q).toHaveProperty('explanation');
    }
  });

  it('the answer at correctIndex is the original a[0]', () => {
    const qs = prepareDuelQuestions(mockRound);
    for (const q of qs) {
      const orig = mockRound.questions.find(o => o.q === q.question);
      expect(q.answers[q.correctIndex]).toBe(orig.a[0]);
    }
  });
});
