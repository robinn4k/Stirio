// ─── Stirio — Article of the Day ──────────────────────────────────
// Rotating daily article sourced from the Wiki catalog + fichas. All
// content comes from i18n keys that already exist in 5 languages, so
// language changes re-render the article instantly.
//
// Exposes: window.stArticles = { getArticleOfTheDay(), resolveArticle(entry), POOL }

(function () {
  // Unsplash CDN URL helper — matches the pattern used in js/ficha-images.js.
  // Every photo ID below has been verified to return HTTP 200 as of this file
  // being written. If a photo is later removed upstream, the article falls
  // back to the gradient + emoji treatment automatically (see article.jsx).
  const U = (id) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

  // Curated pool of articles with full 5-language coverage in i18n/*.json.
  // `cat/art` map to `wiki.art.<cat>.<art>.*` keys.
  const POOL = [
    // ── TÉCNICAS ──────────────────────────────────────────────
    { id: 'tech-shake',     type: 'technique', cat: 'techniques', art: 'shake',     emoji: '🫨', color: '#3498db', image: U('photo-1611266353853-d370b67187ed') },
    { id: 'tech-stir',      type: 'technique', cat: 'techniques', art: 'stir',      emoji: '🥄', color: '#3498db', image: U('photo-1566417713940-fe7c737a9ef2') },
    { id: 'tech-muddle',    type: 'technique', cat: 'techniques', art: 'muddle',    emoji: '🪵', color: '#3498db', image: U('photo-1618130070080-91f4d55a2383') },
    { id: 'tech-fat-wash',  type: 'technique', cat: 'techniques', art: 'fat-wash',  emoji: '🧈', color: '#3498db', image: U('photo-1652677050854-cf617a24b0d2') },
    { id: 'tech-dry-shake', type: 'technique', cat: 'techniques', art: 'dry-shake', emoji: '🥚', color: '#3498db', image: U('photo-1567850809572-96538630a0ec') },
    { id: 'tech-infusion',  type: 'technique', cat: 'techniques', art: 'infusion',  emoji: '🌶️', color: '#3498db', image: U('photo-1614285344553-fbb89a8e68ea') },
    { id: 'tech-strain',    type: 'technique', cat: 'techniques', art: 'strain',    emoji: '🫗', color: '#3498db', image: U('photo-1644809818390-9a441722ae24') },
    { id: 'tech-layer',     type: 'technique', cat: 'techniques', art: 'layer',     emoji: '🌈', color: '#3498db', image: U('photo-1758552013326-01b93dd12c3e') },
    { id: 'tech-blend',     type: 'technique', cat: 'techniques', art: 'blend',     emoji: '🌪️', color: '#3498db', image: U('photo-1630541010111-1bd604c9aba2') },
    { id: 'tech-build',     type: 'technique', cat: 'techniques', art: 'build',     emoji: '🧱', color: '#3498db', image: U('photo-1622758665277-05e973af4395') },
    // ── DESTILADOS ────────────────────────────────────────────
    { id: 'sp-whisky',   type: 'spirit', cat: 'spirits', art: 'whisky',  emoji: '🥃', color: '#d35400', image: U('photo-1615887023544-3a566f29d822') },
    { id: 'sp-gin',      type: 'spirit', cat: 'spirits', art: 'gin',     emoji: '🌿', color: '#27ae60', image: U('photo-1597241693839-07d7fb803af1') },
    { id: 'sp-rum',      type: 'spirit', cat: 'spirits', art: 'rum',     emoji: '🏝️', color: '#b9770e', image: U('photo-1500217052183-bc01eee1a74e') },
    { id: 'sp-vodka',    type: 'spirit', cat: 'spirits', art: 'vodka',   emoji: '❄️', color: '#3498db', image: U('photo-1671713682257-359a1baf806e') },
    { id: 'sp-tequila',  type: 'spirit', cat: 'spirits', art: 'tequila', emoji: '🌵', color: '#d4ac0d', image: U('photo-1634130132261-3bdf61051454') },
    { id: 'sp-mezcal',   type: 'spirit', cat: 'spirits', art: 'mezcal',  emoji: '🔥', color: '#a04000', image: U('photo-1632883199436-b4148e338609') },
    { id: 'sp-brandy',   type: 'spirit', cat: 'spirits', art: 'brandy',  emoji: '🍇', color: '#7d3c98', image: U('photo-1609933498072-b298ffcd033f') },
    { id: 'sp-cognac',   type: 'spirit', cat: 'spirits', art: 'cognac',  emoji: '🥃', color: '#935116', image: U('photo-1746422029245-f3d4384d1acc') },
    // ── HISTORIA ──────────────────────────────────────────────
    { id: 'hist-timeline',      type: 'history', cat: 'history', art: 'timeline',             emoji: '📅', color: '#8e44ad', image: U('photo-1518188770546-efd25d4ca263') },
    { id: 'hist-origins',       type: 'history', cat: 'history', art: 'origins',              emoji: '🏛️', color: '#8e44ad', image: U('photo-1518188770546-efd25d4ca263') },
    { id: 'hist-golden-age',    type: 'history', cat: 'history', art: 'golden-age',           emoji: '🎩', color: '#8e44ad', image: U('photo-1470337458703-46ad1756a187') },
    { id: 'hist-prohibition',   type: 'history', cat: 'history', art: 'prohibition',          emoji: '🚫', color: '#8e44ad', image: U('photo-1768949005507-8c0f571285f4') },
    { id: 'hist-iba',           type: 'history', cat: 'history', art: 'iba',                  emoji: '🏅', color: '#8e44ad', image: U('photo-1600988718520-3f5814892d5b') },
    { id: 'hist-tiki',          type: 'history', cat: 'history', art: 'tiki-culture',         emoji: '🗿', color: '#8e44ad', image: U('photo-1547650125-d91dac00a6cb') },
    { id: 'hist-renaissance',   type: 'history', cat: 'history', art: 'cocktail-renaissance', emoji: '✨', color: '#8e44ad', image: U('photo-1574096079513-d8259312b785') },
    { id: 'hist-molecular',     type: 'history', cat: 'history', art: 'molecular-mixology',   emoji: '🧪', color: '#8e44ad', image: U('photo-1541795083-1b160cf4f3d7') },
    { id: 'hist-legendary-bars',type: 'history', cat: 'history', art: 'legendary-bars',       emoji: '🍹', color: '#8e44ad', image: U('photo-1572116469696-31de0f17cc34') },
    // ── TRENDS (AMAROS / BITTERS) ─────────────────────────────
    { id: 'trend-campari',   type: 'trend', cat: 'amaros', art: 'campari',            emoji: '🔴', color: '#c0392b', image: U('photo-1582457601528-5f8757143fb1') },
    { id: 'trend-aperol',    type: 'trend', cat: 'amaros', art: 'aperol',             emoji: '🟠', color: '#e67e22', image: U('photo-1610307540315-0d3f322403ff') },
    { id: 'trend-fernet',    type: 'trend', cat: 'amaros', art: 'fernet',             emoji: '🖤', color: '#4a235a', image: U('photo-1773394090007-9bba895df6be') },
    { id: 'trend-angostura', type: 'trend', cat: 'amaros', art: 'angostura-bitters',  emoji: '💧', color: '#922b21', image: U('photo-1770164491209-067448c9a51e') },
  ];

  // UTC day-of-epoch — same pattern as the Featured cocktail rotation in
  // js/screens.jsx. Ensures every user sees the same article on a given day
  // regardless of timezone.
  function dayOfEpochUTC() {
    const now = new Date();
    return Math.floor(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()
    ) / 86400000);
  }

  // Safe translator that returns undefined if the key is missing instead of
  // echoing the key back — lets resolveArticle() skip absent sections.
  function tr(key) {
    const fn = window.stLang && window.stLang.t;
    if (!fn) return undefined;
    const v = fn(key);
    return (v && v !== key) ? v : undefined;
  }

  function resolveArticle(entry) {
    if (!entry) return null;
    const base = 'wiki.art.' + entry.cat + '.' + entry.art;
    const title = tr(base);
    // If translations haven't loaded yet, skip rendering instead of showing
    // a raw slug like "shake" — Home re-renders on `stirio:langchange`.
    if (!title) return null;
    const sub = tr(base + '.sub');
    const description = tr(base + '.description');
    const history = tr(base + '.history');
    const whenToUse = tr(base + '.when_to_use') || tr(base + '.when');
    const howTo = tr(base + '.how');
    const tips = tr(base + '.tips');
    const origin = tr(base + '.origin');
    const production = tr(base + '.production');

    // Compose ordered sections, skipping any that are missing.
    const sections = [];
    if (description) sections.push({ label: 'article.section.description', text: description });
    if (origin)      sections.push({ label: 'article.section.origin',      text: origin });
    if (history)     sections.push({ label: 'article.section.history',     text: history });
    if (whenToUse)   sections.push({ label: 'article.section.when',        text: whenToUse });
    if (howTo)       sections.push({ label: 'article.section.how',         text: howTo });
    if (production)  sections.push({ label: 'article.section.production',  text: production });
    if (tips)        sections.push({ label: 'article.section.tips',        text: tips });

    // Excerpt: prefer sub, fall back to first sentence of description.
    let excerpt = sub || '';
    if (!excerpt && description) {
      const dot = description.indexOf('. ');
      excerpt = dot > 0 ? description.slice(0, dot + 1) : description;
      if (excerpt.length > 140) excerpt = excerpt.slice(0, 137) + '…';
    }

    return {
      id: entry.id,
      type: entry.type,
      cat: entry.cat,
      art: entry.art,
      title,
      excerpt,
      emoji: entry.emoji,
      color: entry.color,
      image: entry.image,
      sections,
      // Propagate 3D hints so ArticleScreen can render <ThreeDSection> inline.
      // KnowledgeScreen's CategoryView already passes these through when the
      // entry is built from WIKI_CATEGORIES (which is the only place has3d /
      // scene are declared).
      scene: entry.scene || null,
      has3d: !!entry.has3d,
    };
  }

  function getArticleOfTheDay() {
    if (!POOL.length) return null;
    const idx = dayOfEpochUTC() % POOL.length;
    return resolveArticle(POOL[idx]);
  }

  window.stArticles = { getArticleOfTheDay, resolveArticle, POOL };
})();
