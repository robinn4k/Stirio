// Stirio — MapScreen: iframe wrapper to the real Leaflet map (map.html)
// The interactive Leaflet map lives in map.html and uses initSpiritMap() from
// wiki-map.js, which contains 100+ spirit/wine/liqueur production regions.

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
          {tr('map.header', 'Mapa de destilados')}
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
