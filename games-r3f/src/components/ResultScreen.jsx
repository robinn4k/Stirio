/**
 * Generic end-of-round overlay. Each game passes its own title, stats and
 * handlers so this component has no knowledge of Zustand stores.
 */
export default function ResultScreen({ title, titleColor = '#34d399', stats = [], onRetry, onMenu }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14,
      background: 'radial-gradient(ellipse at center, rgba(10,25,15,.75), rgba(8,17,12,.95))',
      fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: 20,
      zIndex: 20,
    }}>
      <h1 style={{ color: titleColor, fontSize: 30, margin: 0 }}>{title}</h1>
      <div style={{ display: 'flex', gap: 20, margin: '10px 0 16px', color: '#f0e6d3', flexWrap: 'wrap', justifyContent: 'center' }}>
        {stats.map(s => <Stat key={s.label} {...s} />)}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {onRetry && <button onClick={onRetry} style={btn('#d4a44a', '#0d0508')}>↻ Otra vez</button>}
        {onMenu && <button onClick={onMenu} style={btn('transparent', '#d4a44a', '#d4a44a')}>← Menú</button>}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ minWidth: 80 }}>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#b0956e', letterSpacing: .5, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function btn(bg, color, border = 'transparent') {
  return {
    padding: '12px 22px', borderRadius: 20,
    border: `1px solid ${border}`, background: bg, color,
    fontWeight: 700, fontSize: 14, cursor: 'pointer', letterSpacing: 0.3,
  };
}
