// Stirio — LibraryScreen: 3D model library (iframe wrapper to wiki.html)
// Depends on: ui.jsx (Icon)

const LibraryScreen = ({ onBack }) => {
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
          {tr('library.header', 'Biblioteca 3D')}
        </div>
      </div>
      <iframe
        src="wiki.html?filter=3d"
        style={{ flex: 1, border: 'none', width: '100%' }}
        title="Library 3D"
      />
    </div>
  );
};

Object.assign(window, { LibraryScreen });
