// Stirio — EUVS Archive helpers (pure JS, ES module).
//
// Lives outside euvs-archive.jsx so Vitest can import these functions
// without the Babel JSX runtime. Consumers inside .jsx files read them
// from window.stEuvsUtils after the loader registers the module (see
// the <script type="module"> block in index.html).

export function decadeOf(year) {
  if (typeof year !== 'number' || !Number.isFinite(year)) return null;
  const start = Math.floor(year / 10) * 10;
  return `${start}s`;
}

function nonEmptyString(v) {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function nonNegativeInt(v) {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && Number.isInteger(v) ? v : null;
}

export function parseEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || !raw.id) return null;
  if (typeof raw.title !== 'string' || !raw.title) return null;

  const year =
    typeof raw.year === 'number' && Number.isFinite(raw.year) ? raw.year : null;
  const decade =
    typeof raw.decade === 'string' && /^\d{3,4}s$/.test(raw.decade)
      ? raw.decade
      : decadeOf(year);

  return {
    id: raw.id,
    year,
    decade,
    title: raw.title,
    author: nonEmptyString(raw.author),
    language: nonEmptyString(raw.language),
    languageName: nonEmptyString(raw.languageName),
    publisher: nonEmptyString(raw.publisher),
    city: nonEmptyString(raw.city),
    edition: nonEmptyString(raw.edition),
    notes: nonEmptyString(raw.notes),
    sectionCount: nonNegativeInt(raw.sectionCount) ?? 0,
    recipeCount: nonNegativeInt(raw.recipeCount) ?? 0,
    bookFile: nonEmptyString(raw.bookFile),
  };
}

export function parseCatalog(json) {
  if (!Array.isArray(json)) return [];
  const out = [];
  for (const raw of json) {
    const entry = parseEntry(raw);
    if (entry) out.push(entry);
  }
  return out;
}

export function filterByDecade(entries, decade) {
  if (!decade || decade === 'all') return entries.slice();
  return entries.filter(e => e.decade === decade);
}

export function filterByLanguage(entries, lang) {
  if (!lang || lang === 'all') return entries.slice();
  const target = lang.toLowerCase();
  return entries.filter(e => (e.language || '').toLowerCase() === target);
}

export function uniqueDecades(entries) {
  const set = new Set();
  for (const e of entries) if (e.decade) set.add(e.decade);
  return Array.from(set).sort();
}

export function uniqueLanguages(entries) {
  const set = new Set();
  for (const e of entries) if (e.language) set.add(e.language);
  return Array.from(set).sort();
}
