import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Mock Firebase imports used by achievements.js
vi.mock('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));

// Mock auth module
vi.mock('../js/auth.js', () => ({
  getDb: vi.fn(() => null),
  getCurrentUser: vi.fn(() => null),
  isFirebaseReady: vi.fn(() => false),
}));

const {
  ALL,
  getAchievements,
  checkAchievements,
  getStats,
  updateStats,
} = await import('../js/achievements.js');
const { preloadAllTranslations } = await import('../js/lang.js');

beforeAll(async () => {
  await preloadAllTranslations();
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('achievements.js', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('ALL definitions', () => {
    it('has 18 achievements', () => {
      expect(ALL.length).toBe(18);
    });

    it('each has id and icon', () => {
      for (const a of ALL) {
        expect(a.id).toBeTruthy();
        expect(a.icon).toBeTruthy();
      }
    });

    it('has unique ids', () => {
      const ids = ALL.map(a => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('getAchievements', () => {
    it('returns all achievements with unlocked status', () => {
      const achs = getAchievements();
      expect(achs.length).toBe(18);
      achs.forEach(a => {
        expect(a).toHaveProperty('unlocked');
        expect(a).toHaveProperty('id');
        expect(a).toHaveProperty('icon');
        expect(a).toHaveProperty('title');
        expect(a).toHaveProperty('desc');
      });
    });

    it('all start as locked', () => {
      const achs = getAchievements();
      expect(achs.every(a => !a.unlocked)).toBe(true);
    });

    it('returns localized titles (not raw keys)', () => {
      const achs = getAchievements();
      achs.forEach(a => {
        // Title should not be a raw key like "ach.first_game"
        expect(a.title).not.toMatch(/^ach\./);
        expect(a.desc).not.toMatch(/^ach\./);
      });
    });
  });

  describe('checkAchievements', () => {
    it('unlocks first_game when totalGames >= 1', () => {
      const newly = checkAchievements({ totalGames: 1 });
      expect(newly.length).toBe(1);
      expect(newly[0].id).toBe('first_game');
    });

    it('unlocks perfect_quiz when perfectQuiz is true', () => {
      const newly = checkAchievements({ totalGames: 1, perfectQuiz: true });
      const ids = newly.map(n => n.id);
      expect(ids).toContain('perfect_quiz');
    });

    it('unlocks speed_20 when speedMax >= 20', () => {
      const newly = checkAchievements({ speedMax: 25 });
      const ids = newly.map(n => n.id);
      expect(ids).toContain('speed_20');
    });

    it('unlocks speed_30 when speedMax >= 30', () => {
      const newly = checkAchievements({ speedMax: 35 });
      const ids = newly.map(n => n.id);
      expect(ids).toContain('speed_30');
    });

    it('does not re-unlock already unlocked achievements', () => {
      checkAchievements({ totalGames: 1 }); // Unlocks first_game
      const newly = checkAchievements({ totalGames: 2 }); // Should not re-unlock
      const ids = newly.map(n => n.id);
      expect(ids).not.toContain('first_game');
    });

    it('unlocks streak_3 when streak >= 3', () => {
      const newly = checkAchievements({ streak: 3 });
      const ids = newly.map(n => n.id);
      expect(ids).toContain('streak_3');
    });

    it('unlocks streak_7 when streak >= 7', () => {
      const newly = checkAchievements({ streak: 7 });
      const ids = newly.map(n => n.id);
      expect(ids).toContain('streak_7');
      expect(ids).toContain('streak_3'); // Should also unlock streak_3
    });

    it('unlocks all_rounds when roundsPlayed >= 10', () => {
      const newly = checkAchievements({ roundsPlayed: 10 });
      const ids = newly.map(n => n.id);
      expect(ids).toContain('all_rounds');
    });

    it('returns localized title/desc on newly unlocked', () => {
      const newly = checkAchievements({ totalGames: 1 });
      expect(newly[0].title).toBeTruthy();
      expect(newly[0].desc).toBeTruthy();
      expect(newly[0].title).not.toMatch(/^ach\./);
    });
  });

  describe('stats', () => {
    it('getStats returns empty object initially', () => {
      const stats = getStats();
      expect(stats).toEqual({});
    });

    it('updateStats persists stats', () => {
      updateStats({ totalGames: 5, best: 100 });
      const stats = getStats();
      expect(stats.totalGames).toBe(5);
      expect(stats.best).toBe(100);
    });

    it('updateStats merges with existing', () => {
      updateStats({ totalGames: 5 });
      updateStats({ best: 200 });
      const stats = getStats();
      expect(stats.totalGames).toBe(5);
      expect(stats.best).toBe(200);
    });
  });
});
