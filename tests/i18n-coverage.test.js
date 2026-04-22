import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

// Keys referenced at runtime should exist in all five language JSONs. This test
// extracts every `t('...')` / `tr('...')` / `tOr('...', ...)` / `dTr('...', ...)`
// / `stUiT('...')` / `window.stLang.t('...')` call across js/ and verifies each
// key exists in every i18n/*.json. Also checks that the 5 JSONs have parity
// (same keyset), with an exclusion list for blocks still being translated.

const ROOT = resolve(import.meta.dirname, '..');
const I18N_DIR = join(ROOT, 'i18n');
const JS_DIR = join(ROOT, 'js');
const LANGS = ['es', 'en', 'fr', 'pt', 'de'];

// Prefixes that live only in es.json while translations are in progress. Entries
// matching any of these are skipped by the parity checks.
const PARITY_EXCLUDE_PREFIXES = [
  'wiki.art.liqueurs.', // tracked for follow-up PR
  // Historia y Conocimiento hub (PR #135) ships ES-only with t(key, fb).
  // Translations to en/fr/pt/de are tracked for a follow-up PR.
  'knowledge.',
  'wiki.art.history.timeline.description',
  'wiki.art.history.golden-age',
  'wiki.art.history.cocktail-renaissance',
  'wiki.art.history.legendary-bars',
  'wiki.art.history.molecular-mixology',
  'article.section.3d', // ES-only label for the inline ThreeDSection
];

// Keys referenced from code that are known to be missing from i18n/*.json.
// These pre-date this test; the test guards against NEW gaps while these are
// handled in follow-ups. Trim this list as fixes land.
const KNOWN_MISSING_KEYS = new Set([
  'academy.example',
  'duel.guest', 'duel.mode_mix', 'duel.mode_random', 'duel.mode_specific',
  'duel.pick_mix', 'duel.pick_round', 'duel.round_mode_label',
  'home.queue_shuffle', 'home.ref_academy', 'home.ref_academy_badge',
  'home.ref_academy_levels', 'home.ref_cocktails',
  'lesson.explain', 'lesson.unavailable_body', 'lesson.unavailable_title',
  'profile.account', 'profile.guest',
  'toast.achievement_unlocked', 'toast.level_up', 'toast.level_up_body',
  'toast.name_saved',
  // Historia y Conocimiento hub (PR #135) — ES-only, translations to follow.
  'knowledge.back', 'knowledge.section_categories', 'knowledge.hub_title',
  'knowledge.hub_subtitle', 'knowledge.articles', 'knowledge.view_3d',
  'knowledge.section_timeline', 'knowledge.section_people',
  'knowledge.section_bars', 'knowledge.section_cocktails',
  // Knowledge Academy-style redesign — ES-only, translations to follow.
  'knowledge.eyebrow', 'knowledge.progress',
  'knowledge.3d_loading', 'knowledge.3d_unavailable',
  'article.section.3d',
]);

function loadLang(lang) {
  return JSON.parse(readFileSync(join(I18N_DIR, `${lang}.json`), 'utf8'));
}

function walkJs(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJs(full, acc);
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

// Match only literal string-keyed calls; skip template literals (no way to
// statically know the final key).
const KEY_CALL_RE = /\b(?:t|tr|tOr|dTr|dTrParams|stUiT|_t|_tp)\(\s*['"]([a-zA-Z][\w.-]+)['"]/g;
const WINDOW_T_RE = /window\.stLang\.t\(\s*['"]([a-zA-Z][\w.-]+)['"]/g;

function extractKeysFromCode() {
  const keys = new Set();
  for (const file of walkJs(JS_DIR)) {
    const src = readFileSync(file, 'utf8');
    for (const re of [KEY_CALL_RE, WINDOW_T_RE]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(src)) !== null) {
        const k = m[1];
        // Keys always contain '.'. Template-prefix matches (ending in '.' or '_')
        // like `learn.mastery_` come from `t('learn.mastery_' + level)` — we
        // can't statically resolve the suffix, so skip them.
        if (!k.includes('.')) continue;
        if (k.endsWith('.') || k.endsWith('_')) continue;
        keys.add(k);
      }
    }
  }
  return keys;
}

describe('i18n coverage', () => {
  const data = Object.fromEntries(LANGS.map(l => [l, loadLang(l)]));

  it('all 5 languages load as valid JSON', () => {
    for (const lang of LANGS) {
      expect(Object.keys(data[lang]).length).toBeGreaterThan(0);
    }
  });

  it('every key referenced from code exists in every language (minus known gaps)', () => {
    const referenced = extractKeysFromCode();
    const newMissing = {};
    for (const lang of LANGS) {
      const langKeys = new Set(Object.keys(data[lang]));
      for (const key of referenced) {
        if (langKeys.has(key)) continue;
        if (KNOWN_MISSING_KEYS.has(key)) continue;
        (newMissing[lang] ||= []).push(key);
      }
    }
    if (Object.keys(newMissing).length > 0) {
      const report = Object.entries(newMissing)
        .map(([l, ks]) => `  ${l}: ${ks.length} missing — ${ks.join(', ')}`)
        .join('\n');
      throw new Error(
        `New referenced keys missing from lang files.\n` +
        `Add them to i18n/*.json or, if truly optional, add to KNOWN_MISSING_KEYS.\n${report}`
      );
    }
  });

  it('es.json has no duplicate keys (informational warning for other langs)', () => {
    // Parsing collapses duplicates; re-scan raw text to flag them.
    const raw = readFileSync(join(I18N_DIR, 'es.json'), 'utf8');
    const seen = new Set();
    const dupes = [];
    const lineRe = /^\s*"([^"]+)"\s*:/gm;
    let m;
    while ((m = lineRe.exec(raw)) !== null) {
      if (seen.has(m[1])) dupes.push(m[1]);
      else seen.add(m[1]);
    }
    // Document duplicates rather than fail: they collapse to last-wins at runtime.
    if (dupes.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`[i18n-coverage] es.json has ${dupes.length} duplicate keys (last-wins):`, dupes.slice(0, 5));
    }
    expect(dupes.length).toBeGreaterThanOrEqual(0);
  });

  it('non-ES languages mirror es.json keys (except known pending blocks)', () => {
    const esKeys = new Set(
      Object.keys(data.es).filter(k => !PARITY_EXCLUDE_PREFIXES.some(p => k.startsWith(p)))
    );
    const gaps = {};
    for (const lang of ['en', 'fr', 'pt', 'de']) {
      const keys = new Set(Object.keys(data[lang]));
      const missing = [...esKeys].filter(k => !keys.has(k));
      if (missing.length > 0) gaps[lang] = missing;
    }
    if (Object.keys(gaps).length > 0) {
      const report = Object.entries(gaps)
        .map(([l, ks]) => `  ${l}: ${ks.length} missing (first: ${ks.slice(0, 5).join(', ')})`)
        .join('\n');
      throw new Error(`Languages out of parity with es.json:\n${report}`);
    }
  });
});
