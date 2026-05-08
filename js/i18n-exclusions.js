// Stirio — i18n exclusion list shared between the parity test and the
// runtime admin console.
//
// Each entry is a key prefix from i18n/es.json that is intentionally ES-only
// while translation work is in progress. The Vitest parity test
// (tests/i18n-coverage.test.js) skips them; the admin coverage panel
// (js/screens/Admin.jsx) subtracts them from the "missing translations" count
// so we don't flag pending-debt as live regression. The Python translate CLI
// (tools/ai-content/i18n_io.py) also reads this list to know what to translate.
//
// Trim this list as translations land. The shape is intentionally a flat
// array of strings so all three consumers (Vitest in Node, browser PWA,
// Python via regex) parse it the same way.

export const PARITY_EXCLUDE_PREFIXES = [
  'wiki.art.liqueurs.', // tracked for follow-up PR (pre-existing debt)
  // Knowledge hub narrative content — long-form bios/descriptions/timeline
  // still ES-only. The short UI labels (section_*, hub_title, progress,
  // back, 3d_*, articles, eyebrow, tap_hint, view_3d) are now translated.
  'knowledge.timeline.',
  'knowledge.person.',
  'knowledge.bar.',
  // New history articles — long-form descriptions still ES-only.
  'wiki.art.history.timeline.description',
  'wiki.art.history.golden-age',
  'wiki.art.history.cocktail-renaissance',
  'wiki.art.history.legendary-bars',
  'wiki.art.history.molecular-mixology',
  // New map regions (Lote D) ship with ES copy; non-ES localization lands
  // in follow-up PRs. The map UI falls back to titleCase via tOrTitleCase.
  'wiki.map.tennessee-whisky',
  'wiki.map.highland-park-orkney',
  'wiki.map.speyside',
  'wiki.map.ron-filipinas',
  'wiki.map.rum-australia',
  'wiki.map.rum-mauritius',
  'wiki.map.sake-niigata',
  'wiki.map.sake-hiroshima',
  'wiki.map.cerveza-trappist',
  // New spirit brand bios (tasting / story) ship ES-only; translations land
  // in follow-up PRs. Existing barcelo-anejo entries remain translated.
  'wiki.brand.bacardi-carta-blanca.',
  'wiki.brand.havana-club-7.',
  'wiki.brand.diplomatico-reserva-exclusiva.',
  'wiki.brand.zacapa-23.',
  'wiki.brand.mount-gay-xo.',
  'wiki.brand.appleton-estate-8.',
  'wiki.brand.macallan-12-sherry.',
  'wiki.brand.glenfiddich-12.',
  'wiki.brand.lagavulin-16.',
  'wiki.brand.yamazaki-12.',
  'wiki.brand.buffalo-trace.',
  'wiki.brand.tanqueray-london-dry.',
  'wiki.brand.bombay-sapphire.',
  'wiki.brand.hendricks.',
  'wiki.brand.beefeater.',
  'wiki.brand.patron-silver.',
  'wiki.brand.don-julio-reposado.',
  'wiki.brand.casamigos-blanco.',
  'wiki.brand.herradura-reposado.',
];

/**
 * Returns true if `key` is covered by any prefix in the exclusion list.
 * Useful when computing live coverage % on the admin screen.
 */
export function isExcluded(key) {
  for (const p of PARITY_EXCLUDE_PREFIXES) {
    if (key.startsWith(p)) return true;
  }
  return false;
}
