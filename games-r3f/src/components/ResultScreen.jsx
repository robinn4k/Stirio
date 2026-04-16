import { useGame } from '../hooks/useGame.js';

export default function ResultScreen() {
  const status = useGame(s => s.status);
  const score = useGame(s => s.score);
  const correct = useGame(s => s.correct);
  const bestCombo = useGame(s => s.bestCombo);
  const start = useGame(s => s.start);
  const reset = useGame(s => s.reset);

  const isWin = status === 'win';
  const title = isWin ? '¡Perfecto shaker!' : '¡Sin vidas!';
  const titleColor = isWin ? '#34d399' : '#e74c3c';

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14,
      background: 'radial-gradient(ellipse at center, rgba(10,25,15,.75), rgba(8,17,12,.95))',
      fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: 20,
    }}>
      <h1 style={{ color: titleColor, fontSize: 30, margin: 0 }}>{title}</h1>
      <div style={{ display: 'flex', gap: 20, margin: '10px 0 16px', color: '#f0e6d3' }}>
        <Stat label="Puntos" value={score} />
        <Stat label="Aciertos" value={correct} />
        <Stat label="Mejor combo" value={`×${bestCombo}`} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={start} style={btn('#d4a44a', '#0d0508')}>↻ Otra vez</button>
        <button onClick={reset} style={btn('transparent', '#d4a44a', '#d4a44a')}>← Menú</button>
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
