// Stirio — ArcadeScreen: Garnish Catcher mini-game (ES)
// Drag the glass horizontally to catch the target garnish. 60 seconds.
// +2 points for correct, -1 for wrong. Target rotates every 8s.

const GARNISHES = ['🍋', '🍊', '🍒', '🌿', '🫐', '🍓', '🍍', '🥭'];
const GAME_DURATION = 60; // seconds
const TARGET_ROTATE_SEC = 8;
const SPAWN_MS_MIN = 550;
const SPAWN_MS_MAX = 950;
const FALL_PX_PER_SEC = 180;
const CATCH_ZONE = 56; // px radius of glass

const ArcadeScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [phase, setPhase] = useState('menu'); // menu | playing | done
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(GAME_DURATION);
  const [target, setTarget] = useState(GARNISHES[0]);
  const [items, setItems] = useState([]);
  const [glassX, setGlassX] = useState(50); // % of width
  const [flash, setFlash] = useState(null);
  const fieldRef = useRef(null);
  const rafRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const nextSpawnRef = useRef(600);
  const startTimeRef = useRef(0);
  const lastTickRef = useRef(0);
  const targetRef = useRef(GARNISHES[0]);

  const start = () => {
    setScore(0);
    setTime(GAME_DURATION);
    setItems([]);
    setGlassX(50);
    setFlash(null);
    const first = GARNISHES[Math.floor(Math.random() * GARNISHES.length)];
    targetRef.current = first;
    setTarget(first);
    startTimeRef.current = performance.now();
    lastTickRef.current = performance.now();
    lastSpawnRef.current = performance.now();
    nextSpawnRef.current = SPAWN_MS_MIN + Math.random() * (SPAWN_MS_MAX - SPAWN_MS_MIN);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const loop = (now) => {
      const field = fieldRef.current;
      if (!field) { rafRef.current = requestAnimationFrame(loop); return; }
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTime(Math.ceil(remaining));
      if (remaining <= 0) { setPhase('done'); return; }

      // Rotate target
      const targetSlot = Math.floor(elapsed / TARGET_ROTATE_SEC);
      const nextTarget = GARNISHES[targetSlot % GARNISHES.length];
      if (nextTarget !== targetRef.current) {
        targetRef.current = nextTarget;
        setTarget(nextTarget);
      }

      // Spawn
      if (now - lastSpawnRef.current > nextSpawnRef.current) {
        lastSpawnRef.current = now;
        nextSpawnRef.current = SPAWN_MS_MIN + Math.random() * (SPAWN_MS_MAX - SPAWN_MS_MIN);
        const emoji = GARNISHES[Math.floor(Math.random() * GARNISHES.length)];
        setItems(prev => [...prev, {
          id: now + Math.random(),
          emoji,
          x: 6 + Math.random() * 88, // % of width
          y: -40,
          speed: FALL_PX_PER_SEC * (0.85 + Math.random() * 0.4),
        }]);
      }

      // Update items
      const rect = field.getBoundingClientRect();
      const glassPx = (glassX / 100) * rect.width;
      const floorY = rect.height - 60;
      setItems(prev => {
        const kept = [];
        let gained = 0, lost = 0, hitEmoji = null;
        for (const it of prev) {
          const ny = it.y + it.speed * dt;
          if (ny >= floorY) {
            const itemPx = (it.x / 100) * rect.width;
            if (Math.abs(itemPx - glassPx) < CATCH_ZONE) {
              if (it.emoji === targetRef.current) { gained += 2; hitEmoji = 'good'; }
              else { lost += 1; hitEmoji = 'bad'; }
            }
            continue;
          }
          kept.push({ ...it, y: ny });
        }
        if (gained || lost) setScore(s => s + gained - lost);
        if (hitEmoji) { setFlash(hitEmoji); setTimeout(() => setFlash(null), 180); }
        return kept;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, glassX]);

  const move = (clientX) => {
    const field = fieldRef.current;
    if (!field) return;
    const r = field.getBoundingClientRect();
    const pct = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
    setGlassX(pct);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e) => {
      if (e.code === 'ArrowLeft')  { setGlassX(x => Math.max(4, x - 5)); e.preventDefault(); }
      if (e.code === 'ArrowRight') { setGlassX(x => Math.min(96, x + 5)); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button className="btn" onClick={onBack} aria-label="Volver" style={{ padding: '6px 10px', minWidth: 40 }}>
          <Icon name="arrowL" size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>{tr('arcade.eyebrow', 'arcade')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 24, margin: 0 }}>{tr('arcade.header', 'Garnish Catcher')}</h1>
        </div>
        <div className="mono" style={{ fontSize: 13, textAlign: 'right', color: 'var(--ink-2)' }}>
          <div>{tr('arcade.score', 'Puntos')}: <strong style={{ color: 'var(--ink-1)' }}>{score}</strong></div>
          <div>{tr('arcade.time', 'Tiempo')}: <strong style={{ color: 'var(--ink-1)' }}>{time}s</strong></div>
        </div>
      </div>

      {phase === 'menu' && (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🕹️</div>
          <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 8px' }}>{tr('arcade.menu_title', 'Atrapa la guarnición')}</h2>
          <p style={{ color: 'var(--ink-2)', marginBottom: 16, fontSize: 14 }}>
            {tr('arcade.menu_body', 'Mueve el vaso (arrastra o usa ← →). Atrapa la guarnición indicada. +2 aciertos · −1 fallos. 60 segundos.')}
          </p>
          <button className="btn primary" onClick={start}>{tr('arcade.start', 'Empezar')}</button>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <div className="card" style={{ padding: 12, textAlign: 'center', marginBottom: 12, background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2))' }}>
            <div className="mono caps" style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 2 }}>{tr('arcade.target', 'Atrapa')}</div>
            <div style={{ fontSize: 44 }}>{target}</div>
          </div>
          <div
            ref={fieldRef}
            onMouseMove={e => move(e.clientX)}
            onTouchMove={e => e.touches[0] && move(e.touches[0].clientX)}
            style={{
              position: 'relative',
              width: '100%', height: 420,
              borderRadius: 16, overflow: 'hidden',
              background: flash === 'good' ? 'oklch(0.3 0.17 145 / 0.4)' : flash === 'bad' ? 'oklch(0.3 0.17 25 / 0.4)' : 'var(--bg-2)',
              border: '1px solid var(--line)',
              touchAction: 'none',
              transition: 'background .18s',
              userSelect: 'none',
            }}
          >
            {items.map(it => (
              <div key={it.id} style={{
                position: 'absolute',
                left: `${it.x}%`, top: it.y,
                transform: 'translateX(-50%)',
                fontSize: 32, pointerEvents: 'none',
              }}>{it.emoji}</div>
            ))}
            <div style={{
              position: 'absolute',
              left: `${glassX}%`, bottom: 10,
              transform: 'translateX(-50%)',
              fontSize: 48, pointerEvents: 'none',
              filter: 'drop-shadow(0 4px 8px var(--amber-glow))',
            }}>🥃</div>
          </div>
        </>
      )}

      {phase === 'done' && (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎯</div>
          <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 6px' }}>{tr('arcade.done_title', '¡Se acabó!')}</h2>
          <div style={{ fontSize: 32, color: 'var(--amber)', fontFamily: 'var(--f-serif)', marginBottom: 16 }}>{score}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={onBack} style={{ flex: 1 }}>{tr('ui.back', 'Salir')}</button>
            <button className="btn primary" onClick={start} style={{ flex: 1 }}>{tr('arcade.again', 'Otra ronda')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { ArcadeScreen });
