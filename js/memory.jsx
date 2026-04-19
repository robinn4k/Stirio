// Stirio — MemoryScreen: pair-matching game with cocktail emojis
// Depends on: ui.jsx (Icon, confettiBurst)

const MEMORY_EMOJIS = ['🍋','🍊','🍒','🌿','🥃','🍸','🍹','🥂','🍷','🫗','🧊','🍍'];

const _shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const _buildDeck = (pairCount = 8) => {
  const pool = _shuffle(MEMORY_EMOJIS).slice(0, pairCount);
  return _shuffle([...pool, ...pool]).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
};

const MemoryScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [cards, setCards] = useState(() => _buildDeck(8));
  const [picked, setPicked] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(id);
  }, [won, startedAt]);

  useEffect(() => {
    if (picked.length !== 2) return;
    const [a, b] = picked;
    setMoves(m => m + 1);
    if (cards[a].emoji === cards[b].emoji) {
      const next = cards.slice();
      next[a] = { ...next[a], matched: true };
      next[b] = { ...next[b], matched: true };
      setCards(next);
      setPicked([]);
      if (next.every(c => c.matched)) {
        setWon(true);
        setTimeout(() => confettiBurst(window.innerWidth / 2, window.innerHeight / 3), 200);
      }
    } else {
      setTimeout(() => {
        setCards(prev => {
          const next = prev.slice();
          next[a] = { ...next[a], flipped: false };
          next[b] = { ...next[b], flipped: false };
          return next;
        });
        setPicked([]);
      }, 800);
    }
  }, [picked]);

  const flip = (i) => {
    if (cards[i].flipped || cards[i].matched || picked.length === 2) return;
    const next = cards.slice();
    next[i] = { ...next[i], flipped: true };
    setCards(next);
    setPicked([...picked, i]);
  };

  const reset = () => {
    setCards(_buildDeck(8));
    setPicked([]);
    setMoves(0);
    setWon(false);
    setElapsed(0);
  };

  return (
    <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button className="btn" onClick={onBack} aria-label="Volver" style={{ padding: '6px 10px', minWidth: 40 }}>
          <Icon name="arrowL" size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>{tr('memory.eyebrow', 'arcade')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 28, margin: 0 }}>{tr('memory.header', 'Memoria de Garnish')}</h1>
        </div>
        <div className="mono" style={{ fontSize: 12, textAlign: 'right', color: 'var(--ink-2)' }}>
          <div>{tr('memory.moves', 'Movs')}: <strong style={{ color: 'var(--ink-1)' }}>{moves}</strong></div>
          <div>{tr('memory.time', 'Tiempo')}: <strong style={{ color: 'var(--ink-1)' }}>{elapsed}s</strong></div>
        </div>
      </div>

      {won && (
        <div className="card" style={{ padding: 20, textAlign: 'center', marginBottom: 14, background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2))' }}>
          <div style={{ fontSize: 48 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--f-serif)', margin: '6px 0' }}>{tr('memory.won_title', '¡Completado!')}</h2>
          <p style={{ color: 'var(--ink-2)', marginBottom: 14 }}>{moves} {tr('memory.moves', 'movs')} · {elapsed}s</p>
          <button className="btn primary" onClick={reset}>{tr('memory.again', 'Otra ronda')}</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {cards.map((c, i) => (
          <button key={c.id} onClick={() => flip(i)} disabled={c.matched || won} style={{
            aspectRatio: '3 / 4',
            borderRadius: 12,
            border: '1px solid var(--line)',
            background: c.flipped || c.matched ? 'var(--bg-2)' : 'linear-gradient(135deg, var(--amber-soft), var(--bg-3))',
            fontSize: 36,
            display: 'grid', placeItems: 'center',
            cursor: c.matched ? 'default' : 'pointer',
            opacity: c.matched ? 0.45 : 1,
            transition: 'transform .18s, opacity .2s',
            transform: c.flipped || c.matched ? 'rotateY(0)' : 'rotateY(180deg)',
          }}>
            {c.flipped || c.matched ? c.emoji : ''}
          </button>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { MemoryScreen });
