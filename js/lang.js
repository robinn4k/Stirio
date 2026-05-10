// ─── Language Management Module ──────────────────────────────
import { PARITY_EXCLUDE_PREFIXES } from './i18n-exclusions.js';

const STORAGE_KEY = 'stirio_lang';
const DEFAULT_LANG = 'es';
export const SUPPORTED_LANGS = ['es', 'en', 'fr', 'pt', 'de'];

// Translation store — populated asynchronously via preloadAllTranslations()
const translations = {};

/** Load translations for a single language from its JSON file */
async function loadTranslations(lang) {
  if (translations[lang]) return;
  try {
    const resp = await fetch(`i18n/${lang}.json`);
    translations[lang] = await resp.json();
  } catch (e) {
    console.warn(`Failed to load translations for ${lang}`, e);
    translations[lang] = {};
  }
}

/** Preload all languages (files served from SW cache when offline) */
export async function preloadAllTranslations() {
  await Promise.all(SUPPORTED_LANGS.map(loadTranslations));
}

/** Detect a supported language from the browser, or null if none match. */
function detectBrowserLang() {
  try {
    const candidates = [];
    if (typeof navigator !== 'undefined') {
      if (navigator.language) candidates.push(navigator.language);
      if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
    }
    for (const raw of candidates) {
      if (!raw) continue;
      const short = String(raw).toLowerCase().split('-')[0];
      if (SUPPORTED_LANGS.includes(short)) return short;
    }
  } catch {}
  return null;
}

/** Get current language — respects stored preference, else auto-detects from
 *  the browser, else falls back to Spanish. The detected language is persisted
 *  so subsequent calls are stable (no flicker if navigator.languages changes). */
export function getLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  const detected = detectBrowserLang();
  if (detected) {
    try { localStorage.setItem(STORAGE_KEY, detected); } catch {}
    return detected;
  }
  return DEFAULT_LANG;
}

/** Set language and persist */
export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

/** Get list of supported languages */
export function getSupportedLangs() {
  return SUPPORTED_LANGS;
}

/**
 * Universal translation helper.
 *
 * Two modes:
 *   1. String key  → t('dashboard.best', { n: 5 })
 *      Looks up translations[currentLang][key], falls back to DEFAULT_LANG.
 *
 *   2. Multilingual object → t({ es: 'Agitado', en: 'Shaken', fr: 'Secoué', pt: 'Agitado', de: 'Geschüttelt' })
 *      Returns value for current language with fallback chain:
 *        currentLang → en → es → first available value → ''
 *
 * Both modes support param replacement: t({ es: 'Hola {name}' }, { name: 'Ana' })
 */
export function t(keyOrObj, params) {
  let str;

  if (keyOrObj !== null && typeof keyOrObj === 'object') {
    const lang = getLang();
    str = keyOrObj[lang] ?? keyOrObj.en ?? keyOrObj.es ?? Object.values(keyOrObj)[0] ?? '';
  } else {
    const lang = getLang();
    str = translations[lang]?.[keyOrObj] ?? translations[DEFAULT_LANG]?.[keyOrObj] ?? String(keyOrObj ?? '');
  }

  if (params) {
    Object.keys(params).forEach(k => {
      // Escape regex metacharacters in the key (a key like `key.with.dots`
      // would otherwise build an over-permissive pattern).
      const escapedKey = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Use a function replacement so `$&`, `$1`, `$$` in the param VALUE are
      // treated as literal characters instead of replacement-string patterns.
      const value = params[k];
      str = str.replace(new RegExp(`\\{${escapedKey}\\}`, 'g'), () => String(value ?? ''));
    });
  }
  return str;
}

/**
 * Translate all [data-i18n], [data-i18n-html], [data-i18n-placeholder] elements.
 */
export function translateHTML() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.documentElement.lang = getLang();
}

/**
 * Coverage metrics for the admin console. Compares each target language
 * against the ES baseline, EXCLUDING keys whose prefix is in
 * PARITY_EXCLUDE_PREFIXES (those are intentionally pending). Returns null
 * if translations haven't been loaded yet (callers should retry after
 * preloadAllTranslations resolves).
 *
 * Shape: { baseline, en: { translated, missing, percent }, fr: ..., pt: ..., de: ... }
 *   percent ∈ [0, 1]
 */
export async function getCoverage() {
  await preloadAllTranslations();
  const es = translations[DEFAULT_LANG] || {};
  const allEsKeys = Object.keys(es);
  const baselineKeys = allEsKeys.filter(k =>
    !PARITY_EXCLUDE_PREFIXES.some(p => k.startsWith(p))
  );
  const baseline = baselineKeys.length;
  const targets = ['en', 'fr', 'pt', 'de'];
  const out = { baseline };
  // ES is its own baseline — included so the admin panel can show the full
  // ES key count (allEsKeys.length, including pending) alongside the others.
  out.es = {
    translated: allEsKeys.length,
    missing: 0,
    percent: 1,
  };
  for (const lang of targets) {
    const dict = translations[lang] || {};
    let translated = 0;
    for (const k of baselineKeys) {
      if (Object.prototype.hasOwnProperty.call(dict, k)) translated++;
    }
    out[lang] = {
      translated,
      missing: baseline - translated,
      percent: baseline ? translated / baseline : 0,
    };
  }
  // Pending i18n debt — keys deliberately excluded from the baseline because
  // they ship ES-only while translation lands. Grouped by prefix so the admin
  // console can display a breakdown.
  const exclusions = PARITY_EXCLUDE_PREFIXES
    .map(prefix => ({
      prefix,
      count: allEsKeys.filter(k => k.startsWith(prefix)).length,
    }))
    .filter(e => e.count > 0)
    .sort((a, b) => b.count - a.count);
  out.pending = {
    total: exclusions.reduce((sum, e) => sum + e.count, 0),
    byPrefix: exclusions,
  };
  return out;
}
