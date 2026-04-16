const GAMES = [
  {
    id: 'ninja',
    icon: '🔪',
    title: 'Ninja Shaker',
    desc: 'Toca los ingredientes correctos mientras caen.',
    accent: '#34d399',
    accentDark: '#0f7a4b',
  },
  {
    id: 'mixology',
    icon: '🍸',
    title: 'Mixology Rush',
    desc: 'Arrastra los ingredientes al shaker antes de que se acabe el tiempo.',
    accent: '#a78bfa',
    accentDark: '#5b21b6',
  },
  {
    id: 'tinder',
    icon: '💘',
    title: 'Cocktail Tinder',
    desc: 'Swipe derecha si pertenece al cóctel, izquierda si no.',
    accent: '#f87171',
    accentDark: '#b91c1c',
  },
];

export default function Menu({ onPick }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 20, padding: '40px 20px',
      background: 'radial-gradient(ellipse at top, #1a0f25, #08110c 70%)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 46 }}>🍹</div>
        <h1 style={{ color: '#d4a44a', margin: '4px 0 6px', fontSize: 28, letterSpacing: 0.5 }}>
          Stirio Games
        </h1>
        <p style={{ color: '#b0956e', margin: 0, fontSize: 13 }}>
          R3F + Three.js PoC · 3 mini-juegos
        </p>
      </div>

      <div style={{
        display: 'grid', gap: 14, width: '100%', maxWidth: 360,
      }}>
        {GAMES.map(g => (
          <button
            key={g.id}
            onClick={() => onPick(g.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 16,
              borderRadius: 18,
              border: `1px solid ${g.accent}55`,
              background: `linear-gradient(135deg, ${g.accentDark}22, ${g.accentDark}08)`,
              color: '#f0e6d3',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'transform .2s, border-color .2s, background .2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = `${g.accent}cc`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = `${g.accent}55`;
            }}
          >
            <div style={{
              width: 58, height: 58, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
              background: `radial-gradient(circle at 30% 30%, ${g.accent}40, ${g.accentDark}20)`,
              border: `1px solid ${g.accent}66`,
              flexShrink: 0,
            }}>
              {g.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: g.accent, marginBottom: 3 }}>
                {g.title}
              </div>
              <div style={{ fontSize: 12, color: '#b0956e', lineHeight: 1.35 }}>
                {g.desc}
              </div>
            </div>
            <span style={{ color: g.accent, fontSize: 20 }}>→</span>
          </button>
        ))}
      </div>

      <a
        href="../"
        style={{
          marginTop: 8, padding: '10px 18px', borderRadius: 999,
          border: '1px solid #d4a44a55', background: 'rgba(8,17,12,.5)',
          color: '#d4a44a', fontWeight: 700, fontSize: 13,
          textDecoration: 'none', letterSpacing: 0.3,
        }}
      >
        ← Volver a Stirio
      </a>

      <p style={{ fontSize: 10, color: '#8c7b58', marginTop: 10, maxWidth: 320, textAlign: 'center' }}>
        Vanilla React + Three.js declarativo · drei · postprocessing · Zustand
      </p>
    </div>
  );
}
