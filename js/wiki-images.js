// ─── Stirio — Wiki category photos + lookup helpers ───────────────
//
// Provides one hero photo per WIKI_CATEGORIES entry so the Reels mode and
// the Article overlay never fall back to the gradient + emoji treatment
// alone. Per-article specific photos still live in `js/articles.js` POOL
// and take precedence (POOL → CATEGORY_PHOTOS → null).
//
// Every photo URL below has been verified to return HTTP 200 from the
// Unsplash CDN at creation time — they are reused from the curated POOL
// in articles.js, which is why each one is a known-good image. New IDs
// should be vetted the same way (open the photo page, confirm load).
//
// Each entry carries an optional `credit` object surfaced by article.jsx
// when the article opens. The `source_url` always points to the canonical
// Unsplash photo page so users can see the author + license details with
// one tap. Per-photographer attribution can be filled in incrementally as
// follow-up PRs (the article caption gracefully handles both shapes).
//
// Exposes: window.stWikiImages = { getReelPhoto(cat, art), getPhotoCredit(cat, art) }.

(function () {
  const U = (id) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;
  const PAGE = (id) => `https://unsplash.com/photos/${id}`;

  // Helper to build a credit object with consistent shape. `source_url`
  // is derived from the Unsplash slug so the user can click through to
  // attribution at any time — no per-photographer lookup required to ship.
  const credit = (slug, photographer) => ({
    source: 'unsplash',
    source_url: PAGE(slug),
    photographer: photographer || null,
    photographer_url: null,
  });

  // Default photo per category. Picked from the verified-good POOL so we
  // never serve a broken URL. Categories without an obvious thematic photo
  // borrow the closest visually-fitting image.
  const CATEGORY_PHOTOS = {
    techniques: { slug: 'photo-1611266353853-d370b67187ed' }, // shaker
    spirits:    { slug: 'photo-1615887023544-3a566f29d822' }, // whisky amber
    history:    { slug: 'photo-1518188770546-efd25d4ca263' }, // vintage timeline
    tools:      { slug: 'photo-1622758665277-05e973af4395' }, // bar tools
    wines:      { slug: 'photo-1609933498072-b298ffcd033f' }, // grapes / wine vibe
    liqueurs:   { slug: 'photo-1610307540315-0d3f322403ff' }, // aperol orange
    amaros:     { slug: 'photo-1582457601528-5f8757143fb1' }, // campari red
    mixers:     { slug: 'photo-1644809818390-9a441722ae24' }, // strained clear
    beer:       { slug: 'photo-1567850809572-96538630a0ec' }, // foamy egg-shake (beer foam stand-in)
    families:   { slug: 'photo-1746422029245-f3d4384d1acc' }, // cognac (brown-spirits family)
    glossary:   { slug: 'photo-1470337458703-46ad1756a187' }, // golden-age, books vibe
    bartenders: { slug: 'photo-1566417713940-fe7c737a9ef2' }, // stir bartender
    bars:       { slug: 'photo-1572116469696-31de0f17cc34' }, // legendary bar interior
    regions:    { slug: 'photo-1547650125-d91dac00a6cb' },    // tiki / region-specific
    ice:        { slug: 'photo-1671713682257-359a1baf806e' }, // vodka, ice-cold
    garnishes:  { slug: 'photo-1614285344553-fbb89a8e68ea' }, // infusion herbs
    science:    { slug: 'photo-1541795083-1b160cf4f3d7' },    // molecular
    cocktails:  { slug: 'photo-1574096079513-d8259312b785' }, // renaissance cocktail
    pairings:   { slug: 'photo-1770164491209-067448c9a51e' }, // bottles on bar
  };

  function getReelPhoto(cat, art) {
    // POOL takes precedence — look up the article-specific photo first.
    try {
      const pool = (window.stArticles && window.stArticles.POOL) || [];
      const hit = pool.find(e => e.cat === cat && e.art === art);
      if (hit && hit.image) return hit.image;
    } catch {}
    const fallback = CATEGORY_PHOTOS[cat];
    if (!fallback) return null;
    return U(fallback.slug);
  }

  function getPhotoCredit(cat, art) {
    try {
      const pool = (window.stArticles && window.stArticles.POOL) || [];
      const hit = pool.find(e => e.cat === cat && e.art === art);
      if (hit && hit.credit) return hit.credit;
    } catch {}
    const fallback = CATEGORY_PHOTOS[cat];
    if (!fallback) return null;
    return credit(fallback.slug, fallback.photographer);
  }

  window.stWikiImages = { getReelPhoto, getPhotoCredit, CATEGORY_PHOTOS };
})();
