// Stirio — Wiki quality scoring.
//
// Capa 1 del wiki quality overhaul. Recorre los 303 artículos del wiki con
// contenido ES completo (título + descripción presentes) y asigna a cada uno
// un score 0-100 según el voice guide acordado:
//
//   - Description length (25 pts): gauss alrededor del rango ideal 250-400.
//   - Tips length (15 pts): gauss alrededor de 200, premia presencia.
//   - Sources presentes (10 pts): regex de "Autor, *Título* (Año)" con count ≥2.
//   - Secciones extras (15 pts): 3 pts por history/origin/how/when/production.
//   - Parity EN/FR/PT/DE (20 pts): 5 pts por idioma con todas las claves.
//   - Translation no-identical-to-ES (10 pts): penaliza % de claves byte-idénticas.
//   - Hook detectado (5 pts): la 1ª frase no empieza por "El/La X es" / "X es un...".
//
// Output:
//   - tmp/quality-scores.csv  (cat,art,score,issues,priority)
//   - resumen a stdout (top 20 peor, distribución por bucket, por categoría).
//
// Uso: `node scripts/quality-score.mjs [--limit N]`.
// El script es read-only — no modifica ningún archivo del proyecto.

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const { WIKI_CATEGORIES } = await import(join(ROOT, 'js/wiki-data.js'));

const langs = ['es', 'en', 'fr', 'pt', 'de'];
const i18n = {};
for (const l of langs) {
  i18n[l] = JSON.parse(readFileSync(join(ROOT, `i18n/${l}.json`), 'utf8'));
}

const EXCLUSION_FILE = readFileSync(join(ROOT, 'js/i18n-exclusions.js'), 'utf8');
const EXCLUDE_PREFIXES = [...EXCLUSION_FILE.matchAll(/'([^']+)'/g)]
  .map(m => m[1])
  .filter(s => s.startsWith('wiki.') || s.startsWith('knowledge.'));

const isExcluded = (key) => EXCLUDE_PREFIXES.some(p => key.startsWith(p));

// Gauss-like scoring: returns 1.0 at center, falls off either side. Sigma
// determines tolerance — wider sigma is more forgiving.
function gauss(value, center, sigma) {
  if (!Number.isFinite(value)) return 0;
  const z = (value - center) / sigma;
  return Math.exp(-(z * z) / 2);
}

const norm = (s) => String(s || '').trim().toLowerCase();

// Heuristic: detect a generic "X is..." opening that fails the hook test.
// Catches "El X es...", "La X consiste en...", "X es un...", "X es una...",
// "X es el/la...", in ES/EN/FR/PT/DE roughly.
function hasHook(description) {
  if (!description) return false;
  const first = description.trim().split(/[.!?]/)[0].trim();
  const low = first.toLowerCase();
  const dull = [
    /^el [a-záéíóúñ-]+ es /i,
    /^la [a-záéíóúñ-]+ es /i,
    /^[a-záéíóúñ-]+ es un[a]? /i,
    /^[a-záéíóúñ-]+ es el [a-z]/i,
    /^[a-záéíóúñ-]+ es la [a-z]/i,
    /^[a-záéíóúñ-]+ consiste en /i,
    /^the [a-z-]+ is /i,
    /^[a-z-]+ is a /i,
    /^[a-z-]+ is an /i,
    /^le [a-zéàèùœ-]+ est /i,
    /^la [a-zéàèùœ-]+ est /i,
    /^o [a-záéíóúãâê-]+ é /i,
    /^a [a-záéíóúãâê-]+ é /i,
    /^der [a-zäöü-]+ ist /i,
    /^die [a-zäöü-]+ ist /i,
    /^das [a-zäöü-]+ ist /i,
  ];
  return !dull.some(re => re.test(low));
}

// Sources heuristic: looks for citation-like patterns. We're permissive —
// any of: "Author, *Title*", "Author (Year)", italic markdown, or 2+
// distinct citation-like fragments.
function sourcesScore(text) {
  if (!text) return 0;
  // Count citation-shaped fragments.
  const re = /([A-Z][a-zA-ZáéíóúñàâäæéèêëîïôöœùûüÿçßÄÖÜ-]+(?:\s+[A-Z][a-zA-ZáéíóúñàâäæéèêëîïôöœùûüÿçßÄÖÜ-]+)?)\s*[,(]\s*(\*[^*]+\*|[^()]+\(\d{4}\)|\d{4})/g;
  const hits = [...text.matchAll(re)].length;
  if (hits >= 2) return 10;
  if (hits === 1) return 5;
  // Italic markdown alone counts as partial credit.
  if (text.includes('*')) return 3;
  return 0;
}

// Walk every populated article (with ES title + description) and score it.
const all = [];
let populated = 0;

for (const cat of WIKI_CATEGORIES) {
  if (!Array.isArray(cat.articles)) continue;
  for (const art of cat.articles) {
    if (!art?.id) continue;
    const base = `wiki.art.${cat.id}.${art.id}`;
    const titleEs = i18n.es[base];
    const descEs  = i18n.es[`${base}.description`];
    if (!titleEs || !descEs || titleEs.length < 4) continue;
    populated++;

    const tipsEs   = i18n.es[`${base}.tips`] || '';
    const sourcesEs = i18n.es[`${base}.sources`] || '';
    const subEs    = i18n.es[`${base}.sub`] || '';

    const issues = [];
    let score = 0;

    // Description length — 25 pts, gauss around 325 (range 250-400).
    const descPts = Math.round(25 * gauss(descEs.length, 325, 120));
    score += descPts;
    if (descEs.length < 180) issues.push('desc:too-short');
    else if (descEs.length > 600) issues.push('desc:too-long');

    // Tips — 15 pts, gauss around 200.
    let tipsPts = 0;
    if (!tipsEs) { issues.push('tips:missing'); }
    else if (tipsEs.length < 50) { tipsPts = 3; issues.push('tips:too-short'); }
    else { tipsPts = Math.round(15 * gauss(tipsEs.length, 200, 100)); }
    score += tipsPts;

    // Sources — 10 pts.
    const srcPts = sourcesScore(sourcesEs);
    score += srcPts;
    if (srcPts === 0) issues.push('sources:missing');
    else if (srcPts < 5) issues.push('sources:weak');

    // Extra sections — 3 pts each (max 15).
    const extras = ['history', 'origin', 'how', 'when', 'when_to_use', 'production'];
    const extrasPresent = extras.filter(k => i18n.es[`${base}.${k}`]);
    const extraPts = Math.min(15, extrasPresent.length * 3);
    score += extraPts;
    if (extrasPresent.length === 0) issues.push('extras:none');

    // Parity EN/FR/PT/DE — 5 pts per lang with full coverage.
    // Skip if the article's base prefix is excluded (ES-only debt).
    let parityPts = 0;
    let identicalCount = 0;
    let translatedCount = 0;
    const subKeys = Object.keys(i18n.es).filter(k => k === base || k.startsWith(base + '.'));
    for (const l of ['en', 'fr', 'pt', 'de']) {
      let langHasAll = true;
      for (const k of subKeys) {
        if (isExcluded(k)) continue;
        const v = i18n[l][k];
        const ves = i18n.es[k];
        if (v === undefined) { langHasAll = false; }
        else if (typeof v === 'string' && typeof ves === 'string' && ves.length >= 12) {
          translatedCount++;
          if (norm(v) === norm(ves)) identicalCount++;
        }
      }
      if (langHasAll) parityPts += 5;
      else issues.push(`parity:${l}-missing`);
    }
    score += parityPts;

    // Translation quality — 10 pts, penalize % identical.
    let translationPts = 10;
    if (translatedCount > 0) {
      const identicalRatio = identicalCount / translatedCount;
      translationPts = Math.round(10 * (1 - identicalRatio));
      if (identicalRatio > 0.30) issues.push('trans:too-identical');
    } else if (parityPts > 0) {
      translationPts = 10; // nothing to compare, but parity OK — neutral
    } else {
      translationPts = 0;
      issues.push('trans:no-data');
    }
    score += translationPts;

    // Hook — 5 pts.
    const hookPts = hasHook(descEs) ? 5 : 0;
    score += hookPts;
    if (!hookPts) issues.push('hook:dull');

    // Priority bucket.
    let priority;
    if (score < 40) priority = 'critical';
    else if (score < 60) priority = 'high';
    else if (score < 75) priority = 'medium';
    else if (score < 90) priority = 'low';
    else priority = 'good';

    all.push({
      cat: cat.id,
      art: art.id,
      score,
      breakdown: { desc: descPts, tips: tipsPts, src: srcPts, extras: extraPts, parity: parityPts, trans: translationPts, hook: hookPts },
      issues,
      priority,
      lengths: { desc: descEs.length, tips: tipsEs.length, sources: sourcesEs.length, sub: subEs.length },
    });
  }
}

all.sort((a, b) => a.score - b.score);

// Write CSV.
mkdirSync(join(ROOT, 'tmp'), { recursive: true });
const csv = ['cat,art,score,priority,issues,desc_len,tips_len'];
for (const a of all) {
  csv.push([
    a.cat, a.art, a.score, a.priority,
    `"${a.issues.join(';')}"`,
    a.lengths.desc, a.lengths.tips,
  ].join(','));
}
writeFileSync(join(ROOT, 'tmp/quality-scores.csv'), csv.join('\n'));

// stdout summary.
console.log(`# Stirio Wiki Quality Score\n`);
console.log(`Total artículos con contenido ES: ${populated}\n`);

console.log(`## Distribución por bucket de prioridad\n`);
const byPriority = { critical: 0, high: 0, medium: 0, low: 0, good: 0 };
for (const a of all) byPriority[a.priority]++;
console.log(`| Bucket | Count | Acción sugerida |`);
console.log(`|---|---:|---|`);
console.log(`| critical (<40) | ${byPriority.critical} | Capa 4 batch 1 — rewrite urgente |`);
console.log(`| high (40-59)   | ${byPriority.high}   | Capa 4 batch 2 |`);
console.log(`| medium (60-74) | ${byPriority.medium} | Capa 4 batch 3 |`);
console.log(`| low (75-89)    | ${byPriority.low}    | Capa 4 batch 4 (polish) |`);
console.log(`| good (90+)     | ${byPriority.good}   | Skip o solo polish leve |`);
console.log('');

console.log(`## Distribución por categoría (count, avg score)\n`);
console.log(`| Categoría | Count | Avg score | Min | Max |`);
console.log(`|---|---:|---:|---:|---:|`);
const byCat = {};
for (const a of all) {
  if (!byCat[a.cat]) byCat[a.cat] = [];
  byCat[a.cat].push(a.score);
}
const catKeys = Object.keys(byCat).sort((a, b) => {
  const avgA = byCat[a].reduce((s, x) => s + x, 0) / byCat[a].length;
  const avgB = byCat[b].reduce((s, x) => s + x, 0) / byCat[b].length;
  return avgA - avgB;
});
for (const c of catKeys) {
  const arr = byCat[c];
  const avg = (arr.reduce((s, x) => s + x, 0) / arr.length).toFixed(1);
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  console.log(`| ${c} | ${arr.length} | ${avg} | ${min} | ${max} |`);
}
console.log('');

console.log(`## Top 20 peor (los más críticos)\n`);
console.log(`| # | Categoría / Artículo | Score | Priority | Issues |`);
console.log(`|---:|---|---:|---|---|`);
for (let i = 0; i < Math.min(20, all.length); i++) {
  const a = all[i];
  console.log(`| ${i + 1} | \`${a.cat}/${a.art}\` | ${a.score} | ${a.priority} | ${a.issues.join(', ')} |`);
}
console.log('');

console.log(`CSV: tmp/quality-scores.csv`);
