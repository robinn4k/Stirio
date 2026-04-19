// Stirio — MapScreen (placeholder, regions wired in follow-up commit)
const MapScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button className="btn" onClick={onBack} aria-label="Volver" style={{ padding: '6px 10px', minWidth: 40 }}>
          <Icon name="arrowL" size={18} />
        </button>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>{tr('map.eyebrow', 'referencia')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 28, margin: 0 }}>{tr('map.header', 'Mapa de destilados')}</h1>
        </div>
      </div>
      <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-2)' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🗺️</div>
        <p>{tr('map.loading', 'Cargando mapa…')}</p>
      </div>
    </div>
  );
};

Object.assign(window, { MapScreen });
