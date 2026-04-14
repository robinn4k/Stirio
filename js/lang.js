// ─── Language Management Module ──────────────────────────────
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

/** Get current language */
export function getLang() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
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
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
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
