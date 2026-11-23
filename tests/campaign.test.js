import { describe, it, expect } from 'vitest';
import { slugify, parseCampaign, findFichaBySlug, stripCampaignParams, mergeAttribution } from '../js/campaign.js';

describe('slugify', () => {
  it('handles accents, spaces and ampersands', () => {
    expect(slugify('Piña Colada')).toBe('pina-colada');
    expect(slugify('Old Fashioned')).toBe('old-fashioned');
    expect(slugify('Gin & Tonic')).toBe('gin-and-tonic');
    expect(slugify("Tommy's Margarita")).toBe('tommy-s-margarita');
  });
});

describe('parseCampaign', () => {
  it('returns null without ref or c', () => {
    expect(parseCampaign('')).toBeNull();
    expect(parseCampaign('?invite=ABC123')).toBeNull();
  });
  it('maps daily aliases', () => {
    expect(parseCampaign('?ref=ig&c=reto-diario').action).toEqual({ type: 'mode', mode: 'daily' });
    expect(parseCampaign('?c=velocidad').action).toEqual({ type: 'mode', mode: 'speed' });
  });
  it('maps known modes only', () => {
    expect(parseCampaign('?c=mode-blind').action).toEqual({ type: 'mode', mode: 'blind' });
    expect(parseCampaign('?c=mode-admin').action).toBeNull();
  });
  it('maps quiz/ficha to a slug', () => {
    expect(parseCampaign('?ref=ig&c=quiz-negroni').action).toEqual({ type: 'ficha', slug: 'negroni' });
    expect(parseCampaign('?c=ficha-old-fashioned').action).toEqual({ type: 'ficha', slug: 'old-fashioned' });
  });
  it('sanitises and records unknown campaigns', () => {
    const p = parseCampaign('?ref=IG<script>&c=Black%20Friday!');
    expect(p.ref).toBe('igscript');
    expect(p.c).toBe('blackfriday');
    expect(p.action).toBeNull();
  });
});

describe('findFichaBySlug', () => {
  it('finds by slugified name', () => {
    const fichas = [{ name: 'Negroni' }, { name: 'Piña Colada' }];
    expect(findFichaBySlug(fichas, 'pina-colada')).toBe(fichas[1]);
    expect(findFichaBySlug(fichas, 'mojito')).toBeNull();
  });
});

describe('stripCampaignParams', () => {
  it('keeps unrelated params', () => {
    expect(stripCampaignParams('?ref=ig&c=quiz-negroni&daily=2026-11-23')).toBe('?daily=2026-11-23');
    expect(stripCampaignParams('?ref=ig')).toBe('');
  });
});

describe('mergeAttribution', () => {
  it('keeps first touch and updates last', () => {
    const a = mergeAttribution(null, { ref: 'ig', c: 'quiz-negroni' }, 1);
    const b = mergeAttribution(a, { ref: 'tt', c: 'reto-diario' }, 2);
    expect(b.first).toEqual({ ref: 'ig', c: 'quiz-negroni', ts: 1 });
    expect(b.last).toEqual({ ref: 'tt', c: 'reto-diario', ts: 2 });
    expect(b.visits).toBe(2);
  });
});
