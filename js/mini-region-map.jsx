// ═══════════════════════════════════════════════════════════
// mini-region-map.jsx — Mini-mapa de origen embebido en artículo
//
// Renders a small Leaflet iframe (map.html?mini=1&spirit=…&focus=…) inside
// a spirit article so the user can see where this drink comes from. The
// iframe is lazy-mounted via IntersectionObserver so the heavy Leaflet +
// tiles payload only loads when the user scrolls the section into view.
// Tapping the "Ver mapa →" CTA dispatches a 'stirio:open-map' event that
// app.jsx routes to the in-app MapScreen with the same focus/spirit params
// (stays inside the PWA instead of opening a new browser tab).
// ═══════════════════════════════════════════════════════════

const MiniRegionMap = ({ articleId }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [visible, setVisible] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    if (visible) return;
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // No IO support → render eagerly.
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
          return;
        }
      }
    }, { rootMargin: '200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  if (!articleId) return null;
  const regions = (window.MAP_REGIONS || []);
  // Articles can map to either a specific region (e.g. 'cognac', 'scotch',
  // 'rhum-agricole') or a top-level spirit type (e.g. 'rum', 'whisky').
  const region = regions.find(r => r.id === articleId);
  const spirits = new Set(regions.map(r => r.spirit));
  const params = new URLSearchParams({ mini: '1' });
  let focus = null;
  let spirit = null;
  if (region) {
    focus = region.id;
    spirit = region.spirit;
    params.set('focus', focus);
    params.set('spirit', spirit);
  } else if (spirits.has(articleId)) {
    spirit = articleId;
    params.set('spirit', spirit);
  } else {
    return null;
  }
  const src = `map.html?${params.toString()}`;

  const openFullMap = () => {
    try {
      window.dispatchEvent(new CustomEvent('stirio:open-map', { detail: { focus, spirit } }));
    } catch {}
  };

  return (
    <div ref={wrapRef} style={{
      marginTop: 16, borderRadius: 'var(--r-lg)', overflow: 'hidden',
      border: '1px solid var(--line-soft)', background: 'var(--bg-1)',
    }}>
      <div style={{
        padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg-2)', borderBottom: '1px solid var(--line-soft)',
      }}>
        <div className="mono caps" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--amber)' }}>
          {tr('wiki.label.origin_map', 'Región de origen')}
        </div>
        <button
          type="button"
          onClick={openFullMap}
          className="mono"
          style={{
            background: 'transparent', border: 'none', color: 'var(--ink-2)',
            fontSize: 11, cursor: 'pointer', padding: '2px 4px',
          }}
        >
          {tr('wiki.label.open_full_map', 'Ver mapa →')}
        </button>
      </div>
      {visible ? (
        <iframe
          src={src}
          title={tr('wiki.label.origin_map', 'Región de origen')}
          loading="lazy"
          style={{ display: 'block', width: '100%', height: 260, border: 'none', background: 'var(--bg-0)' }}
        />
      ) : (
        <div style={{
          width: '100%', height: 260, display: 'grid', placeItems: 'center',
          color: 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--f-mono)',
          background: 'var(--bg-0)',
        }}>
          {tr('wiki.label.map_loading', 'Cargando mapa…')}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { MiniRegionMap });
