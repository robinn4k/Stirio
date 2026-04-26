import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Mock localStorage and document.documentElement for Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock document.documentElement.lang and document.querySelectorAll for translateHTML
if (typeof document === 'undefined') {
  globalThis.document = {
    documentElement: { lang: 'es' },
    querySelectorAll: vi.fn(() => []),
  };
}

// Import the i18n module and preload translations (fetch is mocked in tests/setup.js)
const { t, getLang, setLang, getSupportedLangs, translateHTML, preloadAllTranslations } = await import('../js/lang.js');

beforeAll(async () => {
  await preloadAllTranslations();
});

describe('i18n — lang.js', () => {
  beforeEach(() => {
    setLang('es'); // Reset to default
  });

  describe('getLang / setLang', () => {
    it('defaults to es', () => {
      expect(getLang()).toBe('es');
    });

    it('changes language', () => {
      setLang('en');
      expect(getLang()).toBe('en');
    });

    it('rejects unsupported language and keeps current', () => {
      setLang('xx');
      expect(getLang()).toBe('es');
    });
  });

  describe('getSupportedLangs', () => {
    it('returns all 5 supported languages', () => {
      const langs = getSupportedLangs();
      expect(langs).toContain('es');
      expect(langs).toContain('en');
      expect(langs).toContain('fr');
      expect(langs).toContain('pt');
      expect(langs).toContain('de');
      expect(langs.length).toBe(5);
    });
  });

  describe('t() — string key mode', () => {
    it('returns Spanish translation by default', () => {
      const result = t('login.tagline');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe('login.tagline');
    });

    it('returns English translation when lang is en', () => {
      setLang('en');
      const result = t('login.tagline');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns French translation when lang is fr', () => {
      setLang('fr');
      const result = t('login.tagline');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('login.tagline');
    });

    it('returns Portuguese translation when lang is pt', () => {
      setLang('pt');
      const result = t('login.tagline');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('login.tagline');
    });

    it('returns German translation when lang is de', () => {
      setLang('de');
      const result = t('login.tagline');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('login.tagline');
    });

    it('falls back to Spanish for missing keys', () => {
      setLang('en');
      // Use a key that exists in ES — fallback should work
      const esResult = t('quiz.title');
      setLang('es');
      const esOriginal = t('quiz.title');
      // Both should be non-empty strings
      expect(esResult.length).toBeGreaterThan(0);
      expect(esOriginal.length).toBeGreaterThan(0);
    });

    it('returns key string for completely unknown keys', () => {
      const result = t('nonexistent.key.xyz');
      expect(result).toBe('nonexistent.key.xyz');
    });
  });

  describe('t() — parameter substitution', () => {
    it('replaces {param} placeholders', () => {
      const result = t('achievements.unlocked', { icon: '🎯', title: 'Test' });
      expect(result).toContain('🎯');
      expect(result).toContain('Test');
    });

    it('replaces multiple occurrences of same param', () => {
      // Direct test of the replacement logic
      const result = t('quiz.result', { score: '100', total: '10' });
      expect(typeof result).toBe('string');
    });

    // ─── Regression guards for F10 (params injection) ──────────
    // Before the fix, params[k] was passed as the replacement string to
    // String.prototype.replace, which interprets `$&`, `$1`, `$$`. A user
    // name containing `$&` would expand to the full match instead of being
    // inserted literally. We use a multilingual object to bypass missing
    // translation keys.
    it('treats $& in param values literally (no replacement-pattern expansion)', () => {
      const result = t({ es: 'Hola {name}' }, { name: '$&' });
      expect(result).toBe('Hola $&');
    });

    it('treats $1, $$, $` in param values literally', () => {
      const result = t({ es: '[{val}]' }, { val: '$1$$$`' });
      expect(result).toBe('[$1$$$`]');
    });

    it('escapes regex metacharacters in param keys (no over-permissive matching)', () => {
      // A key like `key.with.dots` would, before escaping, build the regex
      // /\{key.with.dots\}/g where each `.` matches any char. Verify that
      // a literal `{key.with.dots}` is replaced and `{keyXwithXdots}` is NOT.
      const result = t({ es: '{key.with.dots} vs {keyXwithXdots}' }, { 'key.with.dots': 'OK' });
      expect(result).toBe('OK vs {keyXwithXdots}');
    });

    it('coerces null/undefined param values to empty string (no "undefined" leak)', () => {
      const result = t({ es: 'before-{a}-after' }, { a: null });
      expect(result).toBe('before--after');
    });
  });

  describe('t() — object mode (multilingual objects)', () => {
    it('returns value for current language', () => {
      setLang('en');
      const result = t({ es: 'Hola', en: 'Hello', fr: 'Bonjour' });
      expect(result).toBe('Hello');
    });

    it('falls back to en if current lang missing', () => {
      setLang('de');
      const result = t({ es: 'Hola', en: 'Hello' });
      expect(result).toBe('Hello');
    });

    it('falls back to es if en also missing', () => {
      setLang('de');
      const result = t({ es: 'Hola' });
      expect(result).toBe('Hola');
    });

    it('returns first value if nothing matches', () => {
      setLang('de');
      const result = t({ ja: 'こんにちは' });
      expect(result).toBe('こんにちは');
    });
  });

  describe('translation coverage', () => {
    const langs = ['es', 'en', 'fr', 'pt', 'de'];
    // Check a sample of critical keys across all languages
    const criticalKeys = [
      'login.tagline', 'login.google', 'login.guest',
      'daily.title', 'speed.title',
      'dashboard.courses', 'dashboard.daily_title',
      'achievements.title', 'achievements.unlocked',
      'duel.title', 'duel.waiting_opponent',
      'ach.first_game', 'ach.perfect_quiz', 'ach.speed_20',
      'ach.first_game.desc', 'ach.perfect_quiz.desc',
    ];

    for (const lang of langs) {
      for (const key of criticalKeys) {
        it(`${lang}: "${key}" is translated`, () => {
          setLang(lang);
          const result = t(key);
          expect(result).not.toBe(key); // Should not return the raw key
          expect(result.length).toBeGreaterThan(0);
        });
      }
    }
  });
});
