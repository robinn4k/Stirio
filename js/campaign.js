// Stirio — campaign deep links (Instagram Reels, link-in-bio, etc.)
//
// URL shape:  ?ref=<source>&c=<campaign>
//   ref  traffic source, e.g. "ig" (Instagram), "tt" (TikTok). Free text, 20 chars max.
//   c    what to open once the user reaches Home:
//          reto-diario | daily          → today's Daily Challenge
//          velocidad   | speed          → Speed mode
//          mode-<id>                    → any mode in MODE_ROUTES (mode-blind, mode-academy…)
//          quiz-<slug> | ficha-<slug>   → that cocktail's recipe card (slug of its name,
//                                         e.g. quiz-negroni, ficha-old-fashioned)
//        anything else is still recorded for attribution, it just opens nothing.
//
// Pure helpers (no DOM) so they are unit-testable from Vitest; app.jsx wires them.

export const ATTRIBUTION_KEY = 'stirio::attribution';

const KNOWN_MODES = new Set([
  'academy', 'iba', 'freequiz', 'wiki', 'blind', 'builder', 'duel', 'arcade', 'memory',
  'rhythm', 'comanda', 'glossary', 'map', 'euvs', 'reels', 'daily', 'speed',
]);

const ALIASES = { 'reto-diario': 'daily', 'daily': 'daily', 'velocidad': 'speed', 'speed': 'speed' };

const clean = (v, max) => String(v || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, max);

/** "Piña Colada" → "pina-colada" */
export function slugify(name) {
  return String(name || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse a location.search string.
 * @returns {null | { ref: string, c: string, action: null | {type:'mode', mode:string} | {type:'ficha', slug:string} }}
 */
export function parseCampaign(search) {
  let params;
  try { params = new URLSearchParams(search || ''); } catch { return null; }
  const ref = clean(params.get('ref'), 20);
  const c = clean(params.get('c'), 60);
  if (!ref && !c) return null;

  let action = null;
  if (ALIASES[c]) action = { type: 'mode', mode: ALIASES[c] };
  else if (c.startsWith('mode-') && KNOWN_MODES.has(c.slice(5))) action = { type: 'mode', mode: c.slice(5) };
  else if (/^(quiz|ficha)-[a-z0-9-]+$/.test(c)) action = { type: 'ficha', slug: c.replace(/^(quiz|ficha)-/, '') };

  return { ref, c, action };
}

/** Find the ficha whose name slugifies to `slug`. */
export function findFichaBySlug(fichas, slug) {
  if (!Array.isArray(fichas) || !slug) return null;
  return fichas.find(f => f && slugify(f.name) === slug) || null;
}

/** Query string with ref/c removed (for history.replaceState). */
export function stripCampaignParams(search) {
  const params = new URLSearchParams(search || '');
  params.delete('ref');
  params.delete('c');
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Merge a visit into the stored attribution record: first touch is kept forever,
 * last touch and the visit count are updated.
 */
export function mergeAttribution(prev, campaign, now = Date.now()) {
  const touch = { ref: campaign.ref, c: campaign.c, ts: now };
  const base = prev && typeof prev === 'object' ? prev : {};
  return {
    first: base.first || touch,
    last: touch,
    visits: (base.visits || 0) + 1,
  };
}

/** Read params, persist attribution, clean the URL. Returns the parsed campaign or null. */
export function captureCampaignFromLocation(win = globalThis.window) {
  if (!win || !win.location) return null;
  const campaign = parseCampaign(win.location.search);
  if (!campaign) return null;
  try {
    const prev = JSON.parse(win.localStorage.getItem(ATTRIBUTION_KEY) || 'null');
    win.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(mergeAttribution(prev, campaign)));
  } catch {}
  try {
    win.history.replaceState({}, '', win.location.pathname + stripCampaignParams(win.location.search) + win.location.hash);
  } catch {}
  return campaign;
}
