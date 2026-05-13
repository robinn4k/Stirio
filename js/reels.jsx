// Stirio — ReelsScreen: TikTok-style vertical feed of every wiki article.
//
// The full catalog (~1,186 articles across 19 categories from WIKI_CATEGORIES)
// is flattened, shuffled per-session with a persisted seed, and rendered with
// CSS scroll-snap-y. Only the ±VIRT_WINDOW reels around the visible one paint
// their full content — far slots are 100dvh placeholders so the scroll position
// stays stable. Tap a reel to push the 'article' overlay (reuses article.jsx).
//
// Persists `stirio::reels::idx` and `stirio::reels::seed` so reopening returns
// to the same reel in the same order.

const REELS_LS_IDX  = 'stirio::reels::idx';
const REELS_LS_SEED = 'stirio::reels::seed';
const REELS_VIRT_WINDOW = 3;

function reelsMulberry32(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function reelsShuffle(arr, seed) {
  const rng = reelsMulberry32(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function reelsLoadSeed() {
  try {
    const raw = localStorage.getItem(REELS_LS_SEED);
    const n = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(n) && n > 0) return n;
  } catch {}
  const seed = ((Date.now() & 0xffffffff) >>> 0) || 1;
  try { localStorage.setItem(REELS_LS_SEED, String(seed)); } catch {}
  return seed;
}

function reelsLoadIdx() {
  try {
    const raw = localStorage.getItem(REELS_LS_IDX);
    const n = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(n) && n >= 0) return n;
  } catch {}
  return 0;
}

function reelsTitleCase(slug) {
  return String(slug || '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildReelsFeed(categories) {
  const out = [];
  if (!Array.isArray(categories)) return out;
  const lookupPhoto = (cat, art) => {
    try { return window.stWikiImages?.getReelPhoto(cat, art) || null; }
    catch { return null; }
  };
  for (const cat of categories) {
    if (!cat || !Array.isArray(cat.articles)) continue;
    for (const art of cat.articles) {
      if (!art || !art.id) continue;
      out.push({
        cat: cat.id,
        art: art.id,
        catIcon: cat.icon || '📜',
        artIcon: art.icon || cat.icon || '📜',
        gradient: cat.gradient || 'linear-gradient(135deg, var(--bg-1), var(--bg-2))',
        has3d: !!(art.has3d || cat.has3d),
        image: lookupPhoto(cat.id, art.id),
      });
    }
  }
  return out;
}

// Tries to find the rich POOL entry (with image + verified emoji/color) so the
// article overlay opens with the same hero asset wiki uses. Falls back to an
// ad-hoc entry — same pattern as knowledge.jsx CategoryView.openArticle. Also
// propagates the photo credit from POOL or the category-level catalog so the
// article overlay can render attribution under the hero image.
function buildReelEntry(slot) {
  const pool = (window.stArticles && window.stArticles.POOL) || [];
  const hit  = pool.find(e => e.cat === slot.cat && e.art === slot.art);
  if (hit) return { ...hit, has3d: !!(hit.has3d || slot.has3d) };
  const catCredit = (() => {
    try { return window.stWikiImages?.getPhotoCredit(slot.cat, slot.art) || null; }
    catch { return null; }
  })();
  return {
    id: slot.cat + '-' + slot.art,
    type: slot.cat === 'history' ? 'history' : (slot.cat === 'techniques' ? 'technique' : 'spirit'),
    cat: slot.cat,
    art: slot.art,
    emoji: slot.artIcon,
    color: 'var(--amber)',
    has3d: !!slot.has3d,
    image: slot.image || null,
    credit: catCredit,
  };
}

const ReelCard = ({ slot, tr, onOpen }) => {
  const base = 'wiki.art.' + slot.cat + '.' + slot.art;
  const rawTitle = tr(base, '');
  const title = (rawTitle && rawTitle !== base) ? rawTitle : reelsTitleCase(slot.art);

  const subRaw = tr(base + '.sub', '');
  const sub = (subRaw && subRaw !== base + '.sub') ? subRaw : '';

  const descRaw = tr(base + '.description', '');
  const description = (descRaw && descRaw !== base + '.description') ? descRaw : '';

  const tipsRaw = tr(base + '.tips', '');
  const tipsFull = (tipsRaw && tipsRaw !== base + '.tips') ? tipsRaw : '';
  // Split the whole tips block into individual bullets (sentences or
  // newline-separated chunks). Cap at 4 chips so a verbose tips field doesn't
  // overflow the scrollable body too much.
  const tipsList = tipsFull
    ? tipsFull
        .split(/\n+|(?<=\.)\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 5)
        .slice(0, 4)
    : [];

  // History / origin snippet — first sentence of whichever exists. Surfaces
  // narrative context inside the reel without forcing the user to tap through.
  const histRaw = tr(base + '.history', '');
  const historyText = (histRaw && histRaw !== base + '.history') ? histRaw : '';
  const originRaw = tr(base + '.origin', '');
  const originText = (originRaw && originRaw !== base + '.origin') ? originRaw : '';
  const narrativeSource = historyText || originText;
  const historySnippet = narrativeSource
    ? (narrativeSource.split(/\n+|(?<=\.)\s+/).find(s => s.trim().length > 0) || '').trim()
    : '';

  const catLabel = tr('wiki.cat.' + slot.cat, '');
  const catLabelSafe = (catLabel && catLabel !== 'wiki.cat.' + slot.cat) ? catLabel : reelsTitleCase(slot.cat);

  const hasPhoto = !!slot.image;

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        background: slot.gradient,
        border: 'none', textAlign: 'left',
        color: 'white', cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={title}
    >
      {/* Photo background — fills the reel. Gradient stays underneath as a
          fallback if the request 404s. */}
      {hasPhoto && (
        <img
          src={slot.image}
          loading="lazy"
          decoding="async"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top overlay — keeps the badge legible without darkening the whole
          hero. Skipped on no-photo so the gradient color stays vivid. */}
      {hasPhoto && (
        <div style={{
          position: 'absolute', inset: '0 0 auto 0', height: '32%',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Bottom overlay — anchors the text block to the lower third with a
          fade strong enough to keep clamp(28px, 7vw, 40px) headings readable. */}
      <div style={{
        position: 'absolute', inset: 'auto 0 0 0', height: hasPhoto ? '62%' : '50%',
        background: hasPhoto
          ? 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.88) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content layer — absolute over the photo + overlays. */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        height: '100%', width: '100%',
        padding: 'calc(24px + env(safe-area-inset-top, 0)) 22px calc(96px + env(safe-area-inset-bottom, 0)) 22px',
      }}>
        {/* Top: category badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          alignSelf: 'flex-start',
          padding: '6px 12px', borderRadius: 999,
          background: 'rgba(0,0,0,0.42)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          fontSize: 11, fontFamily: 'var(--f-mono)',
          textTransform: 'uppercase', letterSpacing: 0.8,
        }}>
          <span style={{ fontSize: 14 }}>{slot.catIcon}</span>
          <span>{catLabelSafe}</span>
        </div>

        {/* Center spacer — emoji only appears when there's no photo to fill
            the hero area. With a photo the image is the hero. */}
        {!hasPhoto && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(96px, 28vw, 160px)',
            lineHeight: 1, filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.35))',
            userSelect: 'none', pointerEvents: 'none',
          }}>
            {slot.artIcon}
          </div>
        )}
        {hasPhoto && <div style={{ flex: 1 }} />}

        {/* Bottom panel — header fixed (title + sub) + body scrollable
            (description + history snippet + tips chips) + footer fixed (CTA).
            The nested scroll uses overscroll-behavior:contain so reaching the
            top/bottom of the inner content doesn't chain into the outer
            scroll-snap-y reel switcher. */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          maxHeight: '60vh',
          textShadow: hasPhoto ? '0 2px 14px rgba(0,0,0,0.55)' : 'none',
        }}>
          {/* HEADER — title + sub, never scrolled */}
          <div style={{ flexShrink: 0 }}>
            <h2 style={{
              margin: 0, fontFamily: 'var(--f-serif)',
              fontSize: 'clamp(28px, 7vw, 40px)',
              lineHeight: 1.05, fontWeight: 700,
            }}>
              {title}
            </h2>
            {sub && (
              <div style={{
                marginTop: 6,
                fontSize: 17, opacity: 0.95, lineHeight: 1.35,
                fontStyle: 'italic',
              }}>
                {sub}
              </div>
            )}
          </div>

          {/* BODY — full description + history snippet + all tips. Scrolls
              internally when it overflows; the outer reel switcher stays put.
              A stationary tap still bubbles up to the parent <button> so the
              article opens; only an actual scroll gesture suppresses the
              click (iOS Safari handles that distinction natively via the
              touch-movement threshold). */}
          {(description || historySnippet || tipsList.length > 0) && (
            <div
              style={{
                flex: 1, minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                display: 'flex', flexDirection: 'column', gap: 10,
                paddingRight: 2,
                // Subtle fade at the bottom to hint at more content when
                // overflow is present. When everything fits, the mask is
                // invisible because no content reaches the gradient end.
                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              }}
            >
              {description && (
                <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.94 }}>
                  {description}
                </div>
              )}

              {historySnippet && (
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                  fontSize: 12, lineHeight: 1.4,
                  textShadow: 'none',
                }}>
                  <span style={{ fontSize: 14 }}>📜</span>
                  <span style={{ flex: 1 }}>{historySnippet}</span>
                </div>
              )}

              {tipsList.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                  fontSize: 12, lineHeight: 1.4,
                  textShadow: 'none',
                }}>
                  <span style={{ fontSize: 14 }}>💡</span>
                  <span style={{ flex: 1 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* FOOTER — CTA, never scrolled */}
          <div style={{
            flexShrink: 0, marginTop: 4,
            fontSize: 12, fontFamily: 'var(--f-mono)',
            textTransform: 'uppercase', letterSpacing: 0.8,
            opacity: 0.9,
          }}>
            {tr('reels.tap_to_read', 'Toca para leer →')}
          </div>
        </div>
      </div>
    </button>
  );
};

const ReelsScreen = ({ onBack, onOpenArticle }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));

  const [categories, setCategories] = React.useState(window.WIKI_CATEGORIES || null);

  React.useEffect(() => {
    if (categories) return;
    let alive = true;
    import('./js/wiki-data.js')
      .then((mod) => { if (alive) setCategories(mod.WIKI_CATEGORIES || []); })
      .catch((err) => { console.warn('[reels] wiki-data import failed', err); if (alive) setCategories([]); });
    return () => { alive = false; };
  }, [categories]);

  // Re-render on language change so all reels pick up the new translations.
  const [, forceLang] = React.useState(0);
  React.useEffect(() => {
    const h = () => forceLang(n => (n + 1) | 0);
    window.addEventListener('stirio:langchange', h);
    return () => window.removeEventListener('stirio:langchange', h);
  }, []);

  const feed = React.useMemo(() => {
    if (!categories) return [];
    const seed = reelsLoadSeed();
    return reelsShuffle(buildReelsFeed(categories), seed);
  }, [categories]);

  const [activeIdx, setActiveIdx] = React.useState(() => reelsLoadIdx());
  const containerRef = React.useRef(null);
  const slotRefs = React.useRef([]);

  // Persist the active index on every change so reopening resumes here.
  React.useEffect(() => {
    if (!feed.length) return;
    try { localStorage.setItem(REELS_LS_IDX, String(activeIdx)); } catch {}
  }, [activeIdx, feed.length]);

  // Restore scroll to the saved index once the feed is rendered. Using
  // scrollIntoView with block:'start' lines the reel up with snap perfectly.
  React.useEffect(() => {
    if (!feed.length) return;
    const initial = Math.min(reelsLoadIdx(), feed.length - 1);
    const node = slotRefs.current[initial];
    if (node && containerRef.current) {
      // Use scrollTop instead of scrollIntoView so the page below doesn't shift.
      const top = node.offsetTop - containerRef.current.offsetTop;
      containerRef.current.scrollTop = top;
      setActiveIdx(initial);
    }
  }, [feed.length]);

  // IntersectionObserver: track which reel is visible (>= 60% in view).
  React.useEffect(() => {
    if (!feed.length || !containerRef.current) return;
    const root = containerRef.current;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          const idx = Number(e.target.getAttribute('data-reel-idx'));
          if (Number.isFinite(idx)) setActiveIdx(idx);
        }
      }
    }, { root, threshold: [0.6] });
    slotRefs.current.forEach(n => { if (n) obs.observe(n); });
    return () => obs.disconnect();
  }, [feed.length]);

  const handleOpen = (slot) => {
    const entry = buildReelEntry(slot);
    if (onOpenArticle) onOpenArticle(entry);
    else if (window.stRouter) window.stRouter.navigate('article', { entry });
  };

  if (!categories) {
    return (
      <div style={{
        minHeight: '100dvh', background: 'var(--bg-0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-2)', fontSize: 14,
      }}>
        {tr('reels.loading', 'Cargando reels…')}
      </div>
    );
  }

  if (!feed.length) {
    return (
      <div style={{
        minHeight: '100dvh', background: 'var(--bg-0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, padding: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>📭</div>
        <div style={{ color: 'var(--ink-2)' }}>
          {tr('reels.empty', 'No hay artículos disponibles')}
        </div>
        <button className="btn" onClick={onBack} style={{ marginTop: 8 }}>
          {tr('common.back', 'Volver')}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-0)',
      animation: 'fadeIn .25s ease',
    }}>
      {/* Floating back button */}
      <button
        onClick={onBack}
        aria-label={tr('common.back', 'Volver')}
        style={{
          position: 'fixed',
          top: 'calc(14px + env(safe-area-inset-top, 0))',
          left: 14, zIndex: 5,
          width: 40, height: 40, borderRadius: '50%',
          border: 'none',
          background: 'rgba(0,0,0,0.42)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, lineHeight: 1,
        }}
      >
        ‹
      </button>

      {/* Counter pill */}
      <div style={{
        position: 'fixed',
        top: 'calc(20px + env(safe-area-inset-top, 0))',
        right: 16, zIndex: 5,
        padding: '6px 12px', borderRadius: 999,
        background: 'rgba(0,0,0,0.42)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        color: 'white',
        fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: 0.8,
      }}>
        {(activeIdx + 1) + ' / ' + feed.length}
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'absolute', inset: 0,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {feed.map((slot, i) => {
          const inWindow = Math.abs(i - activeIdx) <= REELS_VIRT_WINDOW;
          return (
            <div
              key={slot.cat + '/' + slot.art}
              ref={(el) => { slotRefs.current[i] = el; }}
              data-reel-idx={i}
              style={{
                position: 'relative',
                height: '100dvh',
                width: '100%',
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
              }}
            >
              {inWindow && <ReelCard slot={slot} tr={tr} onOpen={() => handleOpen(slot)} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

Object.assign(window, { ReelsScreen });
