// Stirio — RhythmScreen (placeholder, shaker-beat game in follow-up commit)
const RhythmScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button className="btn" onClick={onBack} aria-label="Volver" style={{ padding: '6px 10px', minWidth: 40 }}>
          <Icon name="arrowL" size={18} />
        </button>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>{tr('rhythm.eyebrow', 'arcade')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 28, margin: 0 }}>{tr('rhythm.header', 'Ritmo de Shaker')}</h1>
        </div>
      </div>
      <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-2)' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🥁</div>
        <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 6px' }}>{tr('rhythm.soon_title', 'Próximamente')}</h2>
        <p>{tr('rhythm.soon_body', 'Sigue el ritmo perfecto para emulsionar tu cóctel.')}</p>
      </div>
    </div>
  );
};

Object.assign(window, { RhythmScreen });
