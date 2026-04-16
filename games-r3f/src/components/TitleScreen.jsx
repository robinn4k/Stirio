export default function TitleScreen({ onStart }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'radial-gradient(ellipse at center, rgba(10,25,15,.55), rgba(8,17,12,.9))',
      fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: 20,
    }}>
      <div style={{ fontSize: 56 }}>🔪</div>
      <h1 style={{ fontSize: 32, color: '#d4a44a', margin: 0 }}>Ninja Shaker</h1>
      <p style={{ color: '#b0956e', maxWidth: 320, margin: 0, lineHeight: 1.4 }}>
        Toca sólo los ingredientes que pertenecen al cóctel objetivo.
        Rompe tu combo si fallas: −1 ❤️.
      </p>
      <button
        onClick={onStart}
        style={{
          marginTop: 8, padding: '14px 28px', borderRadius: 24,
          border: '1px solid rgba(212,164,74,.6)',
          background: 'linear-gradient(135deg, #d4a44a, #a47a2e)',
          color: '#0d0508', fontWeight: 800, fontSize: 16,
          cursor: 'pointer', letterSpacing: 0.4,
          boxShadow: '0 6px 24px rgba(212,164,74,.35)',
        }}
      >
        ▶ Empezar
      </button>
      <p style={{ fontSize: 11, color: '#8c7b58', marginTop: 20, maxWidth: 320 }}>
        R3F PoC · React + Three.js declarativo · Post-processing con bloom y vignette.
      </p>
    </div>
  );
}
