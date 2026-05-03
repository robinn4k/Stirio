import { describe, it, expect } from 'vitest';
import {
  decadeOf,
  parseEntry,
  parseCatalog,
  filterByDecade,
  filterByLanguage,
  uniqueDecades,
  uniqueLanguages,
} from '../js/euvs-archive-utils.js';

const fixture = [
  { id: 'a', year: 1862, title: 'How to Mix Drinks', author: 'Jerry Thomas', language: 'eng', pages: 248 },
  { id: 'b', year: 1869, title: 'Haney Manual', author: null, language: 'eng' },
  { id: 'c', year: 1871, title: 'Manual del cantinero', author: null, language: 'spa' },
  { id: 'd', year: 1894, title: "L'Art du mélange", author: 'Émile Lefeuvre', language: 'fra' },
  { id: 'e', year: 1922, title: 'Harry ABC', author: 'Harry MacElhone', language: 'eng' },
  { id: 'f', year: 1930, title: 'Savoy', author: 'Harry Craddock', language: 'eng' },
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
      pages: null,
      sizeMb: null,
      localPath: null,
    });
    expect(out.archiveUrl).toBe('https://archive.org/details/x');
  });

  it('rejects malformed entries', () => {
    expect(parseEntry(null)).toBeNull();
    expect(parseEntry({})).toBeNull();
    expect(parseEntry({ id: '', title: 'T', year: 1900 })).toBeNull();
    expect(parseEntry({ id: 'x', title: '', year: 1900 })).toBeNull();
    expect(parseEntry({ id: 'x', title: 'T', year: '1900' })).toBeNull();
  });

  it('preserves an explicit archiveUrl', () => {
    const out = parseEntry({
      id: 'x', title: 'T', year: 1900,
      archiveUrl: 'https://example.org/y',
    });
    expect(out.archiveUrl).toBe('https://example.org/y');
  });

  it('uses the provided decade only when it matches the YYYYs pattern', () => {
    expect(parseEntry({ id: 'x', title: 'T', year: 1900, decade: '1900s' }).decade).toBe('1900s');
    expect(parseEntry({ id: 'x', title: 'T', year: 1900, decade: 'bogus' }).decade).toBe('1900s');
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
    expect(filterByDecade(parsed, '1860s').map(e => e.id)).toEqual(['a', 'b']);
    expect(filterByDecade(parsed, '1920s').map(e => e.id)).toEqual(['e']);
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
    expect(filterByLanguage(parsed, 'eng').map(e => e.id)).toEqual(['a', 'b', 'e', 'f']);
    expect(filterByLanguage(parsed, 'ENG').map(e => e.id)).toEqual(['a', 'b', 'e', 'f']);
    expect(filterByLanguage(parsed, 'spa').map(e => e.id)).toEqual(['c']);
    expect(filterByLanguage(parsed, 'fra').map(e => e.id)).toEqual(['d']);
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
    expect(uniqueLanguages(parsed)).toEqual(['eng', 'fra', 'spa']);
  });
});
