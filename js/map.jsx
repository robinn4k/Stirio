// Stirio — MapScreen: iframe wrapper to the real Leaflet map (map.html)
// The interactive Leaflet map lives in map.html and uses initSpiritMap() from
// wiki-map.js, which contains 100+ spirit/wine/liqueur production regions.

// Seed window.MAP_REGIONS (used by Home → Referencia rápida for preview + count).
// wiki-map.js is otherwise only loaded inside the map.html iframe, so without
// this the SPA never sees the region list. Dispatch an event so Home can
// re-render once the async import resolves.
if (typeof window !== 'undefined' && !window.MAP_REGIONS) {
  import('./wiki-map.js')
    .then(m => {
      if (m.SPIRIT_REGIONS && !window.MAP_REGIONS) {
        window.MAP_REGIONS = m.SPIRIT_REGIONS;
        window.dispatchEvent(new CustomEvent('stirio:mapregionsready'));
      }
    })
    .catch(() => {});
}

const MapScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'var(--bg-0)',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn .3s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px',
        borderBottom: '1px solid var(--line-soft)',
        background: 'var(--bg-1)',
      }}>
        <button className="btn ghost" onClick={onBack} style={{ padding: 8 }} aria-label="Volver">
          <Icon name="arrowL" size={18} />
        </button>
        <div style={{ fontFamily: 'var(--f-serif)', fontSize: 20 }}>
          {tr('map.header', 'Mapa de bebidas')}
        </div>
      </div>
      <iframe
        src="map.html"
        style={{ flex: 1, border: 'none', width: '100%' }}
        title="Mapa de destilados"
      />
    </div>
  );
};

Object.assign(window, { MapScreen });
