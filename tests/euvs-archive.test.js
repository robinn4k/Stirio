import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  decadeOf,
  parseEntry,
  parseCatalog,
  filterByDecade,
  filterByLanguage,
  uniqueDecades,
  uniqueLanguages,
} from '../js/euvs-archive-utils.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const fixture = [
  { id: '1862-thomas', year: 1862, title: 'How to Mix Drinks', author: 'Jerry Thomas', language: 'en', languageName: 'Inglés', sectionCount: 25, recipeCount: 50, bookFile: 'data/euvs-books/1862-thomas.json' },
  { id: '1869-haney',  year: 1869, title: 'Haney Manual', language: 'en' },
  { id: '1871-cantinero', year: 1871, title: 'Manual del cantinero', language: 'es', languageName: 'Español' },
  { id: '1894-lefeuvre', year: 1894, title: "L'Art du mélange", author: 'Émile Lefeuvre', language: 'fr', languageName: 'Francés' },
  { id: '1922-macelhone', year: 1922, title: 'Harry ABC', author: 'Harry MacElhone', language: 'en' },
  { id: '1930-craddock', year: 1930, title: 'Savoy', author: 'Harry Craddock', language: 'en' },
];

describe('decadeOf', () => {
  it('rounds down to the start of the decade', () => {
    expect(decadeOf(1862)).toBe('1860s');
    expect(decadeOf(1875)).toBe('1870s');
    expect(decadeOf(1900)).toBe('1900s');
    expect(decadeOf(1929)).toBe('1920s');
    expect(decadeOf(2000)).toBe('2000s');
  });

  it('returns null for non-finite or non-numeric input', () => {
    expect(decadeOf(NaN)).toBeNull();
    expect(decadeOf(Infinity)).toBeNull();
    expect(decadeOf('1900')).toBeNull();
    expect(decadeOf(undefined)).toBeNull();
  });
});

describe('parseEntry', () => {
  it('accepts a minimal valid entry and fills defaults', () => {
    const out = parseEntry({ id: 'x', title: 'T', year: 1900 });
    expect(out).toMatchObject({
      id: 'x',
      title: 'T',
      year: 1900,
      decade: '1900s',
      author: null,
      language: null,
      languageName: null,
      publisher: null,
      city: null,
      edition: null,
      notes: null,
      sectionCount: 0,
      recipeCount: 0,
      bookFile: null,
    });
  });

  it('accepts an entry without year (year and decade null)', () => {
    const out = parseEntry({ id: 'x', title: 'T' });
    expect(out).not.toBeNull();
    expect(out.year).toBeNull();
    expect(out.decade).toBeNull();
  });

  it('rejects malformed entries', () => {
    expect(parseEntry(null)).toBeNull();
    expect(parseEntry({})).toBeNull();
    expect(parseEntry({ id: '', title: 'T', year: 1900 })).toBeNull();
    expect(parseEntry({ id: 'x', title: '', year: 1900 })).toBeNull();
  });

  it('preserves explicit decade when it matches the YYYYs pattern', () => {
    expect(parseEntry({ id: 'x', title: 'T', year: 1900, decade: '1900s' }).decade).toBe('1900s');
    expect(parseEntry({ id: 'x', title: 'T', year: 1900, decade: 'bogus' }).decade).toBe('1900s');
  });

  it('captures the new metadata fields', () => {
    const out = parseEntry({
      id: 'x', title: 'T', year: 1900,
      author: 'Author', language: 'en', languageName: 'Inglés',
      publisher: 'Pub', city: 'NYC', edition: '1st',
      notes: 'note', sectionCount: 12, recipeCount: 30,
      bookFile: 'data/euvs-books/x.json',
    });
    expect(out).toMatchObject({
      author: 'Author',
      language: 'en',
      languageName: 'Inglés',
      publisher: 'Pub',
      city: 'NYC',
      edition: '1st',
      notes: 'note',
      sectionCount: 12,
      recipeCount: 30,
      bookFile: 'data/euvs-books/x.json',
    });
  });
});

describe('parseCatalog', () => {
  it('returns [] for non-array input', () => {
    expect(parseCatalog(null)).toEqual([]);
    expect(parseCatalog({})).toEqual([]);
    expect(parseCatalog('not an array')).toEqual([]);
  });

  it('drops malformed entries silently', () => {
    const out = parseCatalog([
      { id: 'x', title: 'T', year: 1900 },
      { id: 'broken' },
      null,
      { id: 'y', title: 'U', year: 1910 },
    ]);
    expect(out).toHaveLength(2);
    expect(out.map(e => e.id)).toEqual(['x', 'y']);
  });
});

describe('filterByDecade', () => {
  const parsed = parseCatalog(fixture);

  it('returns the slice for a known decade', () => {
    expect(filterByDecade(parsed, '1860s').map(e => e.id)).toEqual(['1862-thomas', '1869-haney']);
    expect(filterByDecade(parsed, '1920s').map(e => e.id)).toEqual(['1922-macelhone']);
  });

  it('returns all entries for "all" or empty', () => {
    expect(filterByDecade(parsed, 'all')).toHaveLength(parsed.length);
    expect(filterByDecade(parsed, '')).toHaveLength(parsed.length);
  });

  it('returns [] for a decade with no matches', () => {
    expect(filterByDecade(parsed, '2010s')).toEqual([]);
  });
});

describe('filterByLanguage', () => {
  const parsed = parseCatalog(fixture);

  it('filters case-insensitively', () => {
    expect(filterByLanguage(parsed, 'en').map(e => e.id))
      .toEqual(['1862-thomas', '1869-haney', '1922-macelhone', '1930-craddock']);
    expect(filterByLanguage(parsed, 'EN').map(e => e.id))
      .toEqual(['1862-thomas', '1869-haney', '1922-macelhone', '1930-craddock']);
    expect(filterByLanguage(parsed, 'es').map(e => e.id)).toEqual(['1871-cantinero']);
    expect(filterByLanguage(parsed, 'fr').map(e => e.id)).toEqual(['1894-lefeuvre']);
  });

  it('returns all entries for "all" or empty', () => {
    expect(filterByLanguage(parsed, 'all')).toHaveLength(parsed.length);
    expect(filterByLanguage(parsed, '')).toHaveLength(parsed.length);
  });
});

describe('unique helpers', () => {
  const parsed = parseCatalog(fixture);

  it('uniqueDecades returns sorted unique decades', () => {
    expect(uniqueDecades(parsed)).toEqual(['1860s', '1870s', '1890s', '1920s', '1930s']);
  });

  it('uniqueLanguages returns sorted unique languages', () => {
    expect(uniqueLanguages(parsed)).toEqual(['en', 'es', 'fr']);
  });
});

// Catalog ↔ books drift detector. If someone adds/edits a book in
// data/euvs-books/ but forgets to regenerate the catalog (via
// `python tools/euvs-archive/build_catalog.py`), this test catches it.
describe('committed catalog matches data/euvs-books/', () => {
  const catalog = JSON.parse(readFileSync(join(REPO_ROOT, 'data/euvs-catalog.json'), 'utf-8'));
  const bookFiles = readdirSync(join(REPO_ROOT, 'data/euvs-books'))
    .filter(f => f.endsWith('.json'))
    .sort();

  it('has one catalog entry per book file', () => {
    expect(catalog.length).toBe(bookFiles.length);
  });

  it('every catalog entry references an existing book file', () => {
    for (const entry of catalog) {
      expect(entry.bookFile).toBe(`data/euvs-books/${entry.id}.json`);
      expect(bookFiles).toContain(`${entry.id}.json`);
    }
  });

  it('every catalog entry parses successfully under parseEntry', () => {
    const parsed = parseCatalog(catalog);
    expect(parsed.length).toBe(catalog.length);
  });
});
