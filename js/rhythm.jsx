// Stirio — RhythmScreen: tap on beat game (shaker rhythm)
// 20 beats at 100 BPM (600ms/beat). User taps, timing windows:
//   ±80ms = perfect (100 pts), ±180ms = good (50 pts), else miss.

const BPM = 100;
const BEAT_MS = 60000 / BPM;
const TOTAL_BEATS = 20;
const WINDOW_PERFECT = 80;
const WINDOW_GOOD = 180;

const RhythmScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [phase, setPhase] = useState('menu'); // menu | playing | done
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState({ perfect: 0, good: 0, miss: 0 });
  const [beatIdx, setBeatIdx] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const beatsRef = useRef([]);
  const startedAtRef = useRef(0);
  const rafRef = useRef(0);

  const start = () => {
    setScore(0);
    setHits({ perfect: 0, good: 0, miss: 0 });
    setBeatIdx(0);
    setLastResult(null);
    const t0 = performance.now() + 1500;
    startedAtRef.current = t0;
    beatsRef.current = Array.from({ length: TOTAL_BEATS }, (_, i) => ({ t: t0 + i * BEAT_MS, hit: false }));
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const loop = (now) => {
      const beats = beatsRef.current;
      let idx = 0;
      for (let i = 0; i < beats.length; i++) {
        if (now < beats[i].t) { idx = i; break; }
        idx = i + 1;
      }
      setBeatIdx(idx);
      setPulse(((now - startedAtRef.current) % BEAT_MS) / BEAT_MS);

      // Handle missed beats
      beats.forEach(b => {
        if (!b.hit && now - b.t > WINDOW_GOOD) {
          b.hit = 'miss';
          setHits(h => ({ ...h, miss: h.miss + 1 }));
        }
      });

      if (idx >= TOTAL_BEATS && now > beats[beats.length - 1].t + WINDOW_GOOD + 200) {
        setPhase('done');
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const tap = () => {
    if (phase !== 'playing') return;
    const now = performance.now();
    const beats = beatsRef.current;
    // find nearest unhit beat
    let best = -1, bestDelta = Infinity;
    beats.forEach((b, i) => {
      if (b.hit) return;
      const d = Math.abs(now - b.t);
      if (d < bestDelta) { bestDelta = d; best = i; }
    });
    if (best < 0 || bestDelta > WINDOW_GOOD) {
      setLastResult({ kind: 'miss', delta: bestDelta });
      setHits(h => ({ ...h, miss: h.miss + 1 }));
      return;
    }
    beats[best].hit = bestDelta <= WINDOW_PERFECT ? 'perfect' : 'good';
    const pts = bestDelta <= WINDOW_PERFECT ? 100 : 50;
    setScore(s => s + pts);
    setHits(h => ({ ...h, [beats[best].hit]: h[beats[best].hit] + 1 }));
    setLastResult({ kind: beats[best].hit, delta: Math.round(bestDelta) });
    try { if (window.playChord) window.playChord(); } catch {}
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); tap(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button className="btn" onClick={onBack} aria-label="Volver" style={{ padding: '6px 10px', minWidth: 40 }}>
          <Icon name="arrowL" size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>{tr('rhythm.eyebrow', 'arcade')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 26, margin: 0 }}>{tr('rhythm.header', 'Ritmo de Shaker')}</h1>
        </div>
        <div className="mono" style={{ fontSize: 14, color: 'var(--ink-2)' }}>{score}</div>
      </div>

      {phase === 'menu' && (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🥁</div>
          <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 8px' }}>{tr('rhythm.menu_title', 'Sigue el compás')}</h2>
          <p style={{ color: 'var(--ink-2)', marginBottom: 16, fontSize: 14 }}>
            {tr('rhythm.menu_body', 'Toca en cada beat. 100 BPM · 20 compases. Perfecto = 100 pts, bien = 50 pts.')}
          </p>
          <button className="btn primary" onClick={start}>{tr('rhythm.start', 'Empezar')}</button>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <div style={{ marginBottom: 16, textAlign: 'center', color: 'var(--ink-2)', fontSize: 13 }}>
            {tr('rhythm.progress', 'Beat')} {Math.min(beatIdx + 1, TOTAL_BEATS)} / {TOTAL_BEATS}
          </div>
          <button onClick={tap} style={{
            width: '100%', aspectRatio: '1 / 1', maxHeight: 360,
            borderRadius: '50%', border: '3px solid var(--amber)',
            background: `radial-gradient(circle, var(--amber-soft) ${30 + pulse * 50}%, var(--bg-2))`,
            fontSize: 80, cursor: 'pointer',
            transform: `scale(${1 - pulse * 0.08})`,
            transition: 'none',
            boxShadow: '0 0 40px var(--amber-glow)',
          }}>
            🥁
          </button>
          <div style={{ marginTop: 16, textAlign: 'center', minHeight: 28 }}>
            {lastResult && (
              <span className="mono caps" style={{
                fontSize: 13,
                color: lastResult.kind === 'perfect' ? 'var(--amber)' : lastResult.kind === 'good' ? 'var(--cyan)' : 'var(--ink-3)',
              }}>
                {lastResult.kind === 'perfect' ? tr('rhythm.perfect', '¡Perfecto!')
                  : lastResult.kind === 'good' ? tr('rhythm.good', 'Bien')
                  : tr('rhythm.miss', 'Fallado')}
                {' '}±{Math.round(lastResult.delta)}ms
              </span>
            )}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-3)', textAlign: 'center' }}>
            {tr('rhythm.hint', 'Toca el círculo o pulsa Espacio')}
          </div>
        </>
      )}

      {phase === 'done' && (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>{hits.perfect > hits.miss ? '🎉' : '🎯'}</div>
          <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 8px' }}>{tr('rhythm.done_title', 'Sesión terminada')}</h2>
          <div style={{ color: 'var(--ink-2)', marginBottom: 16 }}>
            <div style={{ fontSize: 32, color: 'var(--amber)', fontFamily: 'var(--f-serif)' }}>{score}</div>
            <div className="mono" style={{ fontSize: 12 }}>
              ✨ {hits.perfect} · ✓ {hits.good} · ✕ {hits.miss}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={onBack} style={{ flex: 1 }}>{tr('ui.back', 'Salir')}</button>
            <button className="btn primary" onClick={start} style={{ flex: 1 }}>{tr('rhythm.again', 'Otra ronda')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { RhythmScreen });
