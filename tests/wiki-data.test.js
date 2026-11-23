import { describe, it, expect } from 'vitest';
import { WIKI_CATEGORIES } from '../js/wiki-data.js';

describe('wiki-data catalog', () => {
  it('has no duplicate article ids within a category', () => {
    // Duplicates render twice in the Enciclopedia and break React keys in Reels.
    const dups = [];
    for (const cat of WIKI_CATEGORIES) {
      const seen = new Set();
      for (const art of cat.articles || []) {
        if (seen.has(art.id)) dups.push(`${cat.id}/${art.id}`);
        seen.add(art.id);
      }
    }
    expect(dups).toEqual([]);
  });
});
