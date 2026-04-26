// ═══════════════════════════════════════════════════════════
// mini-region-map.jsx — Mini-mapa de origen embebido en artículo
//
// Renders a small Leaflet iframe (map.html?mini=1&spirit=…&focus=…) inside
// a spirit article so the user can see where this drink comes from. Tapping
// the "Ver mapa completo" CTA opens the full map page focused on the same
// region.
// ═══════════════════════════════════════════════════════════

const MiniRegionMap = ({ articleId, onOpenFullMap }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  if (!articleId) return null;
  const regions = (window.MAP_REGIONS || []);
  // Articles can map to either a specific region (e.g. 'cognac', 'scotch',
  // 'rhum-agricole') or a top-level spirit type (e.g. 'rum', 'whisky'). Pick
  // the right query params accordingly.
  const region = regions.find(r => r.id === articleId);
  const spirits = new Set(regions.map(r => r.spirit));
  const params = new URLSearchParams({ mini: '1' });
  let target = null;
  if (region) {
    params.set('focus', region.id);
    params.set('spirit', region.spirit);
    target = region.id;
  } else if (spirits.has(articleId)) {
    params.set('spirit', articleId);
    target = articleId;
  } else {
    return null; // Nothing meaningful to show.
  }
  const src = `map.html?${params.toString()}`;
  const fullSrc = `map.html?${new URLSearchParams({
    ...(region ? { focus: region.id } : {}),
    ...(region ? { spirit: region.spirit } : { spirit: articleId }),
  }).toString()}`;

  return (
    <div style={{
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
          onClick={() => {
            if (typeof onOpenFullMap === 'function') {
              onOpenFullMap(target);
            } else {
              window.open(fullSrc, '_blank', 'noopener');
            }
          }}
          className="mono"
          style={{
            background: 'transparent', border: 'none', color: 'var(--ink-2)',
            fontSize: 11, cursor: 'pointer', padding: '2px 4px',
          }}
        >
          {tr('wiki.label.open_full_map', 'Ver mapa →')}
        </button>
      </div>
      <iframe
        src={src}
        title={tr('wiki.label.origin_map', 'Región de origen')}
        loading="lazy"
        style={{ display: 'block', width: '100%', height: 260, border: 'none', background: 'var(--bg-0)' }}
      />
    </div>
  );
};

Object.assign(window, { MiniRegionMap });
