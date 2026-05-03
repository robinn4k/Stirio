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

function isPositiveNumberOrNull(v) {
  return v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0);
}

export function parseEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || !raw.id) return null;
  if (typeof raw.title !== 'string' || !raw.title) return null;
  if (typeof raw.year !== 'number' || !Number.isFinite(raw.year)) return null;

  const author    = typeof raw.author === 'string' && raw.author ? raw.author : null;
  const language  = typeof raw.language === 'string' && raw.language ? raw.language : null;
  const pages     = isPositiveNumberOrNull(raw.pages)  ? raw.pages  : null;
  const sizeMb    = isPositiveNumberOrNull(raw.sizeMb) ? raw.sizeMb : null;
  const archiveUrl = typeof raw.archiveUrl === 'string' && raw.archiveUrl
    ? raw.archiveUrl
    : `https://archive.org/details/${encodeURIComponent(raw.id)}`;
  const localPath = typeof raw.localPath === 'string' && raw.localPath ? raw.localPath : null;
  const decade    = typeof raw.decade === 'string' && /^\d{3,4}s$/.test(raw.decade)
    ? raw.decade
    : decadeOf(raw.year);

  return {
    id: raw.id,
    year: raw.year,
    decade,
    title: raw.title,
    author,
    language,
    pages,
    sizeMb,
    archiveUrl,
    localPath,
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

function firstString(v) {
  if (Array.isArray(v)) v = v.length > 0 ? v[0] : null;
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s : null;
}

function parseYearFromString(raw) {
  if (raw == null) return null;
  const m = String(raw).match(/(\d{4})/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

// Convert one document from the Internet Archive Search API
// (https://archive.org/advancedsearch.php) into a CatalogEntry.
// Returns null only when identifier or title is missing — we accept
// items without a parseable year because the search API often omits
// `year`/`date` for older items even when fl[] requests them.
export function archiveDocToEntry(doc) {
  if (!doc || typeof doc !== 'object') return null;
  const id = firstString(doc.identifier);
  const title = firstString(doc.title);
  if (!id || !title) return null;

  const year =
    parseYearFromString(doc.year) ??
    parseYearFromString(doc.date) ??
    parseYearFromString(doc.publicdate);
  const decade = year != null ? decadeOf(year) : null;

  const author = firstString(doc.creator);
  const langRaw = firstString(doc.language);
  const language = langRaw ? langRaw.toLowerCase().slice(0, 3) : null;

  let pages = null;
  const ic = doc.imagecount;
  if (typeof ic === 'number' && Number.isFinite(ic) && ic >= 0) pages = ic;
  else if (typeof ic === 'string' && /^\d+$/.test(ic)) pages = parseInt(ic, 10);

  let sizeMb = null;
  const sz = doc.item_size;
  let bytes = null;
  if (typeof sz === 'number' && Number.isFinite(sz) && sz >= 0) bytes = sz;
  else if (typeof sz === 'string' && /^\d+$/.test(sz)) bytes = parseInt(sz, 10);
  if (bytes != null) sizeMb = Math.round((bytes / 1024 / 1024) * 10) / 10;

  return {
    id,
    year,
    decade: decadeOf(year),
    title,
    author,
    language,
    pages,
    sizeMb,
    archiveUrl: `https://archive.org/details/${encodeURIComponent(id)}`,
    localPath: null,
  };
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
