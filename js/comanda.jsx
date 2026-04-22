// Stirio — ComandaScreen: Comanda Chase (landscape ticket rush, ES)
// Orders come in. Tap bottles to pour, choose shake/stir, garnish, serve.
// 90s round. Integrates XP via stLearn.addXp.

const CC_DURATION = 90;
const CC_POOL_SIZE = 12;
const CC_BOTTLE_LIMIT = 12;
const CC_TICKET_BASE_XP = 12;
const CC_STREAK_CAP = 5;

// Parse "30ml Ginebra" / "1/2 barspoon Marrasquino" / "1 terrón de azúcar"
// into { amount, name, key }.
const ccParseIng = (s) => {
  if (!s) return { amount: '', name: '', key: '' };
  const str = String(s).trim();
  // Leading number (integer, decimal, or fraction) + optional unit word,
  // then optional "de " separator before the ingredient name.
  const m = /^(\d+(?:[./,]\d+)?\s*[^\s\d]*?)\s+(?:de\s+)?(.+)$/i.exec(str);
  if (m && /\d/.test(m[1])) {
    const amount = m[1].trim();
    const name = m[2].trim();
    return { amount, name, key: name.toLowerCase() };
  }
  return { amount: '', name: str, key: str.toLowerCase() };
};

// Deterministic hue from ingredient name for bottle color
const ccHue = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return ((h % 360) + 360) % 360;
};

// Classify cocktail method into shake | stir | build (everything else excluded)
const ccMethodOf = (c) => {
  const m = (c && c.method ? c.method : '').toLowerCase();
  if (/agit|shake/.test(m) && !/dry/.test(m) && !/capa|layer|float/.test(m)) return 'shake';
  if (/remov|stir/.test(m)) return 'stir';
  if (/constru|build/.test(m)) return 'build';
  return null;
};

// Garnish catalog — fixed 6 icons, keyword-matched to cocktail.garnish strings
const CC_GARNISHES = [
  { key: 'lime',   emoji: '🍋', rx: /lima|lime/i },
  { key: 'orange', emoji: '🍊', rx: /naranja|orange/i },
  { key: 'mint',   emoji: '🌿', rx: /menta|mint|hierbabuena|albahaca|basil/i },
  { key: 'cherry', emoji: '🍒', rx: /cereza|cherry/i },
  { key: 'olive',  emoji: '🫒', rx: /aceituna|olive/i },
  { key: 'salt',   emoji: '🧂', rx: /sal\b|salt|rim|escarchado/i },
];
const ccExpectedGarnish = (ficha) => {
  const g = ficha && ficha.garnish ? String(ficha.garnish) : '';
  if (!g) return null;
  const hit = CC_GARNISHES.find(x => x.rx.test(g));
  return hit ? hit.key : null;
};

// Pick a pool of CC_POOL_SIZE cocktails with 2–5 ingredients and shake/stir/build method
const ccPickPool = () => {
  const repo = (typeof window !== 'undefined' && window.StirioRepo) || {};
  const all = [].concat(
    repo.IBA_UNFORGETTABLES || [],
    repo.IBA_CONTEMPORARY || [],
    repo.IBA_NEW_ERA || []
  );
  const ok = all.filter(c => {
    if (!c || !Array.isArray(c.ingredients)) return false;
    const n = c.ingredients.length;
    if (n < 2 || n > 5) return false;
    return !!ccMethodOf(c);
  });
  for (let i = ok.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ok[i], ok[j]] = [ok[j], ok[i]];
  }
  return ok.slice(0, CC_POOL_SIZE);
};

// Build bottle shelf from pool ingredients + distractors, max CC_BOTTLE_LIMIT
const ccBuildShelf = (pool) => {
  const map = new Map();
  pool.forEach(c => (c.ingredients || []).forEach(raw => {
    const p = ccParseIng(raw);
    if (p.key && !map.has(p.key)) map.set(p.key, p);
  }));
  const arr = [...map.values()];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, CC_BOTTLE_LIMIT);
};

// True if running in landscape
const ccIsLandscape = () => {
  try { return window.matchMedia('(orientation: landscape)').matches; }
  catch { return window.innerWidth > window.innerHeight; }
};

// Fullscreen helpers — no-op on iOS Safari (which doesn't support the API
// for arbitrary elements). Safe to call everywhere.
const ccCanFullscreen = () => {
  const el = typeof document !== 'undefined' ? document.documentElement : null;
  return !!(el && (el.requestFullscreen || el.webkitRequestFullscreen));
};
const ccEnterFullscreen = () => {
  try {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) return false;
    const p = req.call(el);
    if (p && typeof p.then === 'function') {
      p.then(() => {
        try {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        } catch {}
      }).catch(() => {});
    }
    return true;
  } catch { return false; }
};
const ccExitFullscreen = () => {
  try {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit && (document.fullscreenElement || document.webkitFullscreenElement)) {
      exit.call(document);
    }
  } catch {}
};

const ccIsIOS = () => {
  try {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  } catch { return false; }
};
const ccIsStandalone = () => {
  try {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
  } catch { return false; }
};

const ComandaScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const closeGame = () => { ccExitFullscreen(); onBack && onBack(); };
  const [phase, setPhase] = useState('menu'); // menu | playing | done
  const [timed, setTimed] = useState(true);   // 90s countdown vs free-play
  const [round, setRound] = useState(null);
  const [fb, setFb] = useState(null); // { kind: 'ok'|'bad', text, at }
  const [shakeFx, setShakeFx] = useState(0); // timestamp to trigger shake animation
  const rafRef = useRef(0);
  const startAtRef = useRef(0);
  const lastFinishRef = useRef(null); // cached final stats for done screen

  // Ensure we exit fullscreen if the component unmounts (route change, etc.)
  useEffect(() => () => ccExitFullscreen(), []);

  // Build initial round state
  const start = () => {
    const pool = ccPickPool();
    if (!pool.length) {
      setFb({ kind: 'bad', text: tr('comanda.fb.no_data', 'Datos no listos — reintenta.'), at: Date.now() });
      return;
    }
    setRound({
      pool,
      idx: 0,
      timed,
      timeLeft: CC_DURATION,
      elapsed: 0,
      served: 0,
      perfect: 0,
      wrong: 0,
      streak: 0,
      bestStreak: 0,
      score: 0,
      vessel: [],      // array of bottle keys
      method: null,    // 'shake' | 'stir' | null (build)
      garnish: null,   // garnish key or null
    });
    setFb(null);
    startAtRef.current = performance.now();
    ccEnterFullscreen();
    setPhase('playing');
  };

  // Game loop — countdown or elapsed tracker depending on mode
  useEffect(() => {
    if (phase !== 'playing') return;
    const loop = (now) => {
      const elapsed = (now - startAtRef.current) / 1000;
      const remaining = Math.max(0, CC_DURATION - elapsed);
      setRound(r => (r ? { ...r, timeLeft: remaining, elapsed } : r));
      if (!timed) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (remaining <= 0) {
        try { window.hapticTap && window.hapticTap('win'); } catch {}
        setPhase('done');
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  // Auto-clear transient feedback after 1.1s
  useEffect(() => {
    if (!fb) return;
    const t = setTimeout(() => setFb(null), 1100);
    return () => clearTimeout(t);
  }, [fb]);

  const currentTicket = round ? round.pool[round.idx % round.pool.length] : null;
  const expectedMethod = currentTicket ? ccMethodOf(currentTicket) : null;
  const expectedKeys = currentTicket
    ? (currentTicket.ingredients || []).map(raw => ccParseIng(raw).key)
    : [];
  const expectedGarnish = currentTicket ? ccExpectedGarnish(currentTicket) : null;

  // Per-ticket shelf: always include all ingredients of the current ticket +
  // distractors from other pool cocktails. Rebuilds when the ticket changes.
  const visibleBottles = useMemo(() => {
    if (!round || !currentTicket) return [];
    const need = (currentTicket.ingredients || []).map(raw => ccParseIng(raw))
      .filter(p => p.key);
    const needKeys = new Set(need.map(p => p.key));
    const distractors = [];
    const seen = new Set(needKeys);
    for (const c of round.pool) {
      if (c === currentTicket) continue;
      for (const raw of (c.ingredients || [])) {
        const p = ccParseIng(raw);
        if (p.key && !seen.has(p.key)) { seen.add(p.key); distractors.push(p); }
      }
    }
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    const needShuffled = shuffle(need.slice());
    const distShuffled = shuffle(distractors);
    const distractorSlots = Math.max(CC_BOTTLE_LIMIT - needShuffled.length, 4);
    const final = shuffle([...needShuffled, ...distShuffled.slice(0, distractorSlots)]);
    return final.slice(0, CC_BOTTLE_LIMIT);
  }, [round && round.idx, round && round.pool]);

  const pourBottle = (bottle) => {
    if (phase !== 'playing' || !round) return;
    try { window.hapticTap && window.hapticTap('tap'); } catch {}
    setRound(r => ({ ...r, vessel: [...r.vessel, bottle.key] }));
  };

  const pickMethod = (m) => {
    if (phase !== 'playing' || !round) return;
    try { window.hapticTap && window.hapticTap('tap'); } catch {}
    if (m === 'shake') setShakeFx(Date.now());
    setRound(r => ({ ...r, method: m }));
  };

  const pickGarnish = (g) => {
    if (phase !== 'playing' || !round) return;
    try { window.hapticTap && window.hapticTap('tap'); } catch {}
    setRound(r => ({ ...r, garnish: r.garnish === g.key ? null : g.key }));
  };

  const clearVessel = () => {
    if (phase !== 'playing' || !round) return;
    try { window.hapticTap && window.hapticTap('tap'); } catch {}
    setRound(r => ({ ...r, vessel: [], method: null, garnish: null }));
  };

  // Validation + scoring on SERVE
  const serve = () => {
    if (phase !== 'playing' || !round || !currentTicket) return;
    // Ingredient set-equality (multiset: order irrelevant, duplicates count)
    const got = [...round.vessel].sort();
    const need = [...expectedKeys].sort();
    const ingredientsOk = got.length === need.length && got.every((k, i) => k === need[i]);
    const methodOk = (round.method || 'build') === (expectedMethod || 'build');
    const correct = ingredientsOk && methodOk;

    if (!correct) {
      try { window.hapticTap && window.hapticTap('bad'); } catch {}
      try { window.playChord && window.playChord('minor'); } catch {}
      const why = !ingredientsOk
        ? (got.length < need.length
            ? tr('comanda.fb.missing', 'Faltan ingredientes')
            : got.length > need.length
              ? tr('comanda.fb.extra', 'Ingredientes de más')
              : tr('comanda.fb.wrong_ing', 'Ingredientes incorrectos'))
        : tr('comanda.fb.wrong_method', 'Método incorrecto');
      setFb({ kind: 'bad', text: why, at: Date.now() });
      setRound(r => ({
        ...r,
        vessel: [],
        method: null,
        garnish: null,
        wrong: r.wrong + 1,
        streak: 0,
      }));
      return;
    }

    // Correct — score base + streak + garnish bonus + time bonus
    try { window.hapticTap && window.hapticTap('ok'); } catch {}
    try { window.playChord && window.playChord('major'); } catch {}
    const garnishOk = expectedGarnish ? round.garnish === expectedGarnish : true;
    const timeBonus = Math.min(10, Math.floor(round.timeLeft / 10));
    const streakMult = Math.min(CC_STREAK_CAP, round.streak + 1);
    const gained = CC_TICKET_BASE_XP + timeBonus + (garnishOk ? 4 : 0);
    const scored = gained * streakMult;

    // Perfect = ingredients + method + garnish all correct
    const perfect = garnishOk;
    if (perfect) {
      try {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        window.confettiBurst && window.confettiBurst(cx, cy);
      } catch {}
    }
    setFb({
      kind: 'ok',
      text: (perfect ? tr('comanda.fb.perfect', '¡Perfecto!') : tr('comanda.fb.served', 'Servido'))
        + ` +${scored} XP`,
      at: Date.now(),
    });
    setRound(r => ({
      ...r,
      idx: r.idx + 1,
      served: r.served + 1,
      perfect: r.perfect + (perfect ? 1 : 0),
      score: r.score + scored,
      streak: streakMult,
      bestStreak: Math.max(r.bestStreak, streakMult),
      vessel: [],
      method: null,
      garnish: null,
    }));
  };

  // Write XP + activity once we land on 'done'
  useEffect(() => {
    if (phase !== 'done' || !round) return;
    if (lastFinishRef.current === round) return;
    lastFinishRef.current = round;
    const xp = Math.max(0, Math.round(round.score));
    const durationMs = Math.round((performance.now() - startAtRef.current));
    try { window.stLearn && window.stLearn.addXp && window.stLearn.addXp(xp); } catch {}
    try {
      window.stActivity && window.stActivity.recordActivity && window.stActivity.recordActivity({
        xp,
        correct: round.perfect,
        total: round.served,
        durationMs,
      });
    } catch {}
    try {
      if (window.stAchievements && window.stAchievements.checkAchievements) {
        const prev = (window.stAchievements.getStats && window.stAchievements.getStats()) || {};
        const learn = (window.stLearn && window.stLearn.getLearnStats && window.stLearn.getLearnStats()) || { xp: 0, streak: 0 };
        window.stAchievements.checkAchievements({
          totalGames: (prev.totalGames || 0) + 1,
          xp: learn.xp || 0,
          streak: learn.streak || 0,
        });
      }
    } catch {}
  }, [phase, round]);

  // ---------- Render ----------
  const timeStr = round
    ? (round.timed === false ? `${Math.floor(round.elapsed || 0)}s` : `${Math.max(0, Math.ceil(round.timeLeft))}s`)
    : `${CC_DURATION}s`;

  return (
    <div className="cc-root">
      <style>{CC_CSS}</style>

      {phase === 'menu' && (
        <div className="cc-menu">
          <button className="btn cc-back" onClick={closeGame} aria-label="Volver">
            <Icon name="arrowL" size={18} />
          </button>
          <div className="cc-menu-card">
            <div style={{ fontSize: 56, marginBottom: 6 }}>🎟️</div>
            <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>
              {tr('comanda.eyebrow', 'comanda chase')}
            </div>
            <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 34, margin: '4px 0 10px' }}>
              {tr('comanda.header', 'Comanda Chase')}
            </h1>
            <p style={{ color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 18 }}>
              {tr('comanda.menu_body', 'Entran tickets. Toca las botellas, elige shake o stir, añade guarnición y sirve.')}
            </p>
            <div className="cc-mode-toggle" role="group" aria-label="Modo">
              <button
                type="button"
                className={`cc-mode-opt ${timed ? 'on' : ''}`}
                onClick={() => setTimed(true)}
              >
                ⏱ {tr('comanda.mode_timed', 'Con tiempo · 90s')}
              </button>
              <button
                type="button"
                className={`cc-mode-opt ${!timed ? 'on' : ''}`}
                onClick={() => setTimed(false)}
              >
                ∞ {tr('comanda.mode_free', 'Sin tiempo')}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn" onClick={closeGame}>{tr('ui.back', 'Salir')}</button>
              <button className="btn primary" onClick={start}>
                <Icon name="play" size={14} /> {tr('comanda.start', 'Empezar')}
              </button>
            </div>
            {ccIsIOS() && !ccIsStandalone() && !ccCanFullscreen() && (
              <p className="cc-fs-hint">
                {tr('comanda.fs_hint', '💡 Instala Stirio en tu pantalla de inicio para jugar a pantalla completa.')}
              </p>
            )}
          </div>
        </div>
      )}

      {phase === 'playing' && round && currentTicket && (
        <div className="cc-play">
          {/* HUD */}
          <div className="cc-hud">
            <button className="btn cc-back-hud" onClick={closeGame} aria-label="Volver">
              <Icon name="arrowL" size={16} />
            </button>
            <div className="cc-hud-title">
              <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 10 }}>
                {tr('comanda.eyebrow', 'comanda chase')}
              </div>
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: 16, lineHeight: 1 }}>
                {tr('comanda.header', 'Comanda Chase')}
              </div>
            </div>
            <div className="cc-hud-stats">
              <div className="cc-stat">
                <div className="cc-stat-label">{round.timed === false ? tr('comanda.mode_free', 'Sin tiempo') : tr('comanda.timer', 'Tiempo')}</div>
                <div className={`cc-stat-val ${round.timed !== false && round.timeLeft < 15 ? 'cc-urgent' : ''}`}>{timeStr}</div>
              </div>
              <div className="cc-stat">
                <div className="cc-stat-label">{tr('comanda.served', 'Servidos')}</div>
                <div className="cc-stat-val">{round.served}</div>
              </div>
              <div className="cc-stat">
                <div className="cc-stat-label">{tr('comanda.score', 'XP')}</div>
                <div className="cc-stat-val" style={{ color: 'var(--amber)' }}>{round.score}</div>
              </div>
              {round.streak > 1 && (
                <div className="cc-stat cc-streak">
                  <div className="cc-stat-label">{tr('comanda.streak', 'Racha')}</div>
                  <div className="cc-stat-val">×{round.streak} 🔥</div>
                </div>
              )}
            </div>
          </div>

          {/* 3-column playfield */}
          <div className="cc-grid">
            {/* Ticket panel */}
            <div className="cc-panel cc-ticket">
              <div className="mono caps cc-panel-eyebrow">{tr('comanda.order', 'Comanda')}</div>
              <div className="cc-ticket-head">
                <span className="cc-ticket-icon">{currentTicket.icon || '🍸'}</span>
                <div>
                  <div className="cc-ticket-name">{currentTicket.name}</div>
                  <div className="cc-ticket-method mono caps">
                    {expectedMethod === 'shake' && tr('comanda.shake', 'Shake')}
                    {expectedMethod === 'stir' && tr('comanda.stir', 'Stir')}
                    {expectedMethod === 'build' && tr('comanda.build', 'Build')}
                    {currentTicket.glass ? ` · ${currentTicket.glass}` : ''}
                  </div>
                </div>
              </div>
              <ul className="cc-ticket-list">
                {(currentTicket.ingredients || []).map((raw, i) => {
                  const p = ccParseIng(raw);
                  const poured = round.vessel.includes(p.key);
                  return (
                    <li key={i} className={poured ? 'cc-line done' : 'cc-line'}>
                      <span className="cc-bullet" style={{ background: `oklch(0.62 0.15 ${ccHue(p.key)})` }} />
                      <span className="cc-ing-amount">{p.amount}</span>
                      <span className="cc-ing-name">{p.name}</span>
                    </li>
                  );
                })}
              </ul>
              {expectedGarnish && (
                <div className="cc-ticket-garnish">
                  <span className="mono caps cc-panel-eyebrow">{tr('comanda.garnish', 'Guarnición')}</span>
                  <span style={{ marginLeft: 8 }}>{currentTicket.garnish}</span>
                </div>
              )}
            </div>

            {/* Center: vessel + actions */}
            <div className="cc-center">
              <div className="cc-vessel-wrap">
                <div
                  className={`cc-vessel ${round.method === 'shake' ? 'shake' : ''} ${shakeFx && Date.now() - shakeFx < 500 ? 'bump' : ''}`}
                  style={{ animationName: round.method === 'shake' ? 'ccShake' : undefined }}
                  key={shakeFx}
                >
                  <div className="cc-vessel-inner">
                    {round.vessel.length === 0 && (
                      <div className="cc-vessel-empty">{tr('comanda.vessel_empty', 'Vacío')}</div>
                    )}
                    {round.vessel.map((k, i) => (
                      <div key={i} className="cc-layer"
                        style={{ background: `linear-gradient(180deg, oklch(0.7 0.16 ${ccHue(k)}), oklch(0.45 0.18 ${ccHue(k)}))` }} />
                    ))}
                  </div>
                  {round.garnish && (
                    <div className="cc-garnish-float">
                      {(CC_GARNISHES.find(g => g.key === round.garnish) || {}).emoji}
                    </div>
                  )}
                </div>
                {fb && (
                  <div className={`cc-fb ${fb.kind}`}>{fb.text}</div>
                )}
              </div>

              <div className="cc-actions">
                <button
                  className={`cc-act ${round.method === 'shake' ? 'on' : ''}`}
                  onClick={() => pickMethod('shake')}
                >🥤 {tr('comanda.shake', 'Shake')}</button>
                <button
                  className={`cc-act ${round.method === 'stir' ? 'on' : ''}`}
                  onClick={() => pickMethod('stir')}
                >🥄 {tr('comanda.stir', 'Stir')}</button>
                <button className="cc-act ghost" onClick={clearVessel}>
                  ↺ {tr('comanda.clear', 'Limpiar')}
                </button>
                <button
                  className={`cc-act primary${round.vessel.length > 0 && round.vessel.length === expectedKeys.length ? ' ready' : ''}`}
                  onClick={serve}
                >
                  ✓ {tr('comanda.serve', 'Servir')}
                </button>
              </div>
              {round.timed === false && (
                <button
                  className="cc-end-shift"
                  onClick={() => {
                    try { window.hapticTap && window.hapticTap('win'); } catch {}
                    setPhase('done');
                  }}
                >
                  {tr('comanda.end_shift', 'Terminar turno')}
                </button>
              )}
            </div>

            {/* Right: bottles + garnish */}
            <div className="cc-panel cc-shelf">
              <div className="mono caps cc-panel-eyebrow">{tr('comanda.bottles', 'Botellas')}</div>
              <div className="cc-bottles">
                {visibleBottles.map((b) => {
                  const poured = round.vessel.includes(b.key);
                  return (
                    <button
                      key={b.key}
                      className={`cc-bottle${poured ? ' poured' : ''}`}
                      onClick={() => pourBottle(b)}
                    >
                      <span className="cc-bottle-cap" style={{ background: `oklch(0.6 0.18 ${ccHue(b.key)})` }} />
                      <span className="cc-bottle-label">{b.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mono caps cc-panel-eyebrow" style={{ marginTop: 10 }}>
                {tr('comanda.garnish', 'Guarnición')}
              </div>
              <div className="cc-garnish-row">
                {CC_GARNISHES.map(g => (
                  <button
                    key={g.key}
                    className={`cc-gchip ${round.garnish === g.key ? 'on' : ''}`}
                    onClick={() => pickGarnish(g)}
                    aria-label={g.key}
                  >{g.emoji}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && round && (
        <div className="cc-menu">
          <div className="cc-menu-card">
            <div style={{ fontSize: 56, marginBottom: 6 }}>
              {round.perfect >= 3 ? '🏆' : round.served > 0 ? '🥂' : '🫠'}
            </div>
            <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>
              {tr('comanda.done_eyebrow', 'servicio terminado')}
            </div>
            <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 30, margin: '4px 0 10px' }}>
              {tr('comanda.done_title', 'Fin del turno')}
            </h2>
            <div className="cc-result-grid">
              <div><div className="cc-stat-label">{tr('comanda.served', 'Servidos')}</div><div className="cc-stat-val">{round.served}</div></div>
              <div><div className="cc-stat-label">{tr('comanda.perfect_count', 'Perfectos')}</div><div className="cc-stat-val">{round.perfect}</div></div>
              <div><div className="cc-stat-label">{tr('comanda.wrong_count', 'Fallos')}</div><div className="cc-stat-val">{round.wrong}</div></div>
              <div><div className="cc-stat-label">{tr('comanda.best_streak', 'Mejor racha')}</div><div className="cc-stat-val">×{round.bestStreak || 0}</div></div>
            </div>
            <div style={{ fontSize: 40, color: 'var(--amber)', fontFamily: 'var(--f-serif)', margin: '14px 0 18px' }}>
              +{Math.max(0, Math.round(round.score))} XP
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn" onClick={closeGame}>{tr('ui.back', 'Salir')}</button>
              <button className="btn primary" onClick={start}>{tr('comanda.again', 'Otra ronda')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CC_CSS = `
.cc-root {
  position: fixed; inset: 0; z-index: 40;
  width: 100vw; height: 100dvh;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 10%, oklch(0.28 0.08 290 / 0.55), transparent 50%),
    radial-gradient(circle at 80% 90%, oklch(0.28 0.12 35 / 0.4), transparent 55%),
    var(--bg-1);
  color: var(--ink-1);
  font-family: var(--f-sans, system-ui);
}
.cc-menu {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  padding: 24px;
  background: var(--bg-1);
  background-image:
    radial-gradient(circle at 20% 10%, oklch(0.28 0.08 290 / 0.55), transparent 50%),
    radial-gradient(circle at 80% 90%, oklch(0.28 0.12 35 / 0.4), transparent 55%);
  overflow: hidden;
}
.cc-menu-card {
  max-width: 560px; width: 100%;
  padding: 28px 32px;
  text-align: center;
  border-radius: 20px;
  background: linear-gradient(145deg, oklch(0.22 0.04 280 / 0.9), oklch(0.14 0.03 270 / 0.85));
  border: 1px solid oklch(0.82 0.17 75 / 0.22);
  box-shadow: 0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05);
  backdrop-filter: blur(14px);
}
.cc-back { position: absolute; top: 16px; left: 16px; padding: 6px 10px; min-width: 40px; }
.cc-back-hud { padding: 4px 8px; min-width: 36px; }

.cc-play { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 14px; gap: 14px; }
.cc-hud {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, oklch(0.2 0.03 280 / 0.85), oklch(0.14 0.02 270 / 0.75));
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(10px);
  height: 60px; flex-shrink: 0;
}
.cc-hud-title { flex: 1; min-width: 0; }
.cc-hud-stats { display: flex; gap: 18px; align-items: center; }
.cc-stat { text-align: center; min-width: 56px; }
.cc-stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-3); font-family: var(--f-mono, monospace); }
.cc-stat-val { font-size: 20px; font-weight: 700; font-family: var(--f-serif, serif); line-height: 1; margin-top: 3px; }
.cc-urgent { color: var(--danger, #ff6b6b); animation: ccPulse 0.6s infinite; }
.cc-streak .cc-stat-val { color: var(--amber); }

.cc-grid {
  flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: minmax(240px, 0.9fr) minmax(280px, 1.6fr) minmax(280px, 1.1fr);
  gap: 14px;
}
.cc-panel {
  border-radius: 18px;
  padding: 18px;
  background: linear-gradient(180deg, oklch(0.22 0.03 280 / 0.8), oklch(0.15 0.025 275 / 0.75));
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 28px rgba(0,0,0,0.35);
  overflow: auto;
  display: flex; flex-direction: column;
}
.cc-panel-eyebrow { color: var(--amber); font-size: 10px; margin-bottom: 12px; letter-spacing: 0.15em; }

.cc-ticket-head { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
.cc-ticket-icon { font-size: 34px; filter: drop-shadow(0 4px 10px var(--amber-glow, rgba(255,170,60,0.35))); }
.cc-ticket-name { font-family: var(--f-serif, serif); font-size: 22px; line-height: 1.05; }
.cc-ticket-method { font-size: 10px; color: var(--ink-2); letter-spacing: 0.14em; margin-top: 4px; }
.cc-ticket-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.cc-line { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; background: rgba(255,255,255,0.03); font-size: 13px; transition: all 0.25s; }
.cc-line.done { background: oklch(0.45 0.18 145 / 0.18); text-decoration: line-through; opacity: 0.75; }
.cc-bullet { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 8px currentColor; }
.cc-ing-amount { font-family: var(--f-mono, monospace); font-size: 11px; color: var(--ink-2); min-width: 58px; }
.cc-ing-name { flex: 1; }
.cc-ticket-garnish { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: var(--ink-2); }

.cc-center { display: flex; flex-direction: column; gap: 14px; min-height: 0; }
.cc-vessel-wrap { position: relative; flex: 1; display: grid; place-items: center; min-height: 0; }
.cc-vessel { position: relative; width: 140px; height: 200px; border-radius: 8px 8px 52px 52px; background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03)); border: 2px solid rgba(255,255,255,0.18); box-shadow: inset 0 -24px 40px rgba(0,0,0,0.38), inset 4px 0 10px rgba(255,255,255,0.05), inset -4px 0 10px rgba(255,255,255,0.02), 0 24px 50px rgba(0,0,0,0.5); overflow: hidden; transition: transform 0.2s; }
.cc-vessel::before { content: ''; position: absolute; left: 10px; top: 14px; bottom: 34px; width: 5px; background: linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0)); border-radius: 3px; pointer-events: none; z-index: 2; }
.cc-vessel::after { content: ''; position: absolute; right: 14px; top: 20px; width: 3px; height: 40px; background: linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0)); border-radius: 2px; pointer-events: none; z-index: 2; }
.cc-vessel-inner { position: absolute; inset: 8px; display: flex; flex-direction: column-reverse; border-radius: 4px 4px 44px 44px; overflow: hidden; }
.cc-layer { flex: 1; min-height: 14px; box-shadow: inset 0 -2px 3px rgba(0,0,0,0.3), inset 0 2px 2px rgba(255,255,255,0.12); animation: ccPour 0.35s ease; position: relative; }
.cc-layer:last-child::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 6px; background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0)); border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
.cc-vessel-empty { position: absolute; inset: 8px; display: grid; place-items: center; color: var(--ink-3); font-size: 12px; font-family: var(--f-mono, monospace); letter-spacing: 0.1em; text-transform: uppercase; border: 2px dashed rgba(255,255,255,0.08); border-radius: 4px 4px 44px 44px; }
.cc-vessel.shake { animation: ccShake 0.6s infinite; }
.cc-garnish-float { position: absolute; top: -16px; right: -8px; font-size: 28px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); animation: ccPop 0.3s ease; }
.cc-fb { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); padding: 8px 16px; border-radius: 999px; font-weight: 600; font-size: 13px; pointer-events: none; animation: ccFb 1.1s ease; white-space: nowrap; }
.cc-fb.ok { background: oklch(0.45 0.18 145 / 0.4); color: oklch(0.9 0.18 145); border: 1px solid oklch(0.55 0.18 145 / 0.5); }
.cc-fb.bad { background: oklch(0.45 0.2 25 / 0.4); color: oklch(0.9 0.15 25); border: 1px solid oklch(0.55 0.2 25 / 0.5); }

.cc-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; flex-shrink: 0; }
.cc-act { padding: 14px 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: var(--ink-1); font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.15s; min-height: 50px; }
.cc-act:hover { background: rgba(255,255,255,0.08); transform: translateY(-1px); }
.cc-act:active { transform: translateY(0); }
.cc-act.on { background: oklch(0.45 0.13 250 / 0.4); border-color: oklch(0.7 0.16 250); color: oklch(0.9 0.14 250); }
.cc-act.ghost { color: var(--ink-3); }
.cc-act.primary { background: linear-gradient(180deg, oklch(0.78 0.17 85), oklch(0.62 0.18 70)); color: oklch(0.18 0.05 55); border-color: transparent; box-shadow: 0 6px 18px oklch(0.7 0.15 80 / 0.35); }
.cc-act.primary.ready { background: linear-gradient(180deg, oklch(0.78 0.18 150), oklch(0.55 0.18 145)); color: oklch(0.14 0.05 145); box-shadow: 0 6px 22px oklch(0.65 0.2 150 / 0.5); animation: ccReadyPulse 1.6s infinite; }
@keyframes ccReadyPulse { 0%,100% { box-shadow: 0 6px 22px oklch(0.65 0.2 150 / 0.5); } 50% { box-shadow: 0 6px 30px oklch(0.7 0.22 150 / 0.75); } }

.cc-bottles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.cc-bottle { padding: 14px 8px 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.1)); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.15s; min-height: 80px; }
.cc-bottle:hover { transform: translateY(-2px); background: linear-gradient(180deg, rgba(255,255,255,0.09), rgba(0,0,0,0.05)); border-color: rgba(255,255,255,0.15); }
.cc-bottle:active { transform: translateY(0); }
.cc-bottle.poured { opacity: 0.48; background: linear-gradient(180deg, oklch(0.45 0.15 145 / 0.18), rgba(0,0,0,0.1)); border-color: oklch(0.55 0.18 145 / 0.35); }
.cc-bottle.poured .cc-bottle-label { text-decoration: line-through; color: var(--ink-3); }
.cc-bottle.poured .cc-bottle-cap { filter: grayscale(0.3); }
.cc-bottle-cap { width: 18px; height: 22px; border-radius: 4px 4px 2px 2px; box-shadow: 0 0 8px currentColor, inset 0 -2px 3px rgba(0,0,0,0.35); }
.cc-bottle-label { font-size: 11px; text-align: center; color: var(--ink-2); line-height: 1.15; }

.cc-garnish-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 6px; }
.cc-gchip { padding: 10px 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); cursor: pointer; font-size: 24px; transition: all 0.15s; min-height: 48px; }
.cc-gchip:hover { transform: translateY(-1px); background: rgba(255,255,255,0.06); }
.cc-gchip.on { background: oklch(0.45 0.13 145 / 0.35); border-color: oklch(0.7 0.16 145); }

.cc-result-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 14px 0; padding: 14px; border-radius: 12px; background: rgba(255,255,255,0.03); }
.cc-result-grid .cc-stat-val { font-size: 24px; }

@keyframes ccPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
@keyframes ccShake { 0%,100%{transform:translate(0,0) rotate(0)} 20%{transform:translate(-4px,2px) rotate(-3deg)} 40%{transform:translate(5px,-2px) rotate(3deg)} 60%{transform:translate(-3px,-3px) rotate(-2deg)} 80%{transform:translate(3px,3px) rotate(2deg)} }
@keyframes ccPour { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes ccPop { from { transform: scale(0.3) rotate(-20deg); opacity: 0; } to { transform: scale(1) rotate(0); opacity: 1; } }
@keyframes ccFb { 0%{opacity:0;transform:translate(-50%,6px) scale(.9)} 15%,80%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(-50%,-6px) scale(.95)} }

@media (max-width: 900px) {
  .cc-grid { grid-template-columns: minmax(180px, 0.8fr) minmax(220px, 1.6fr) minmax(220px, 1.1fr); }
  .cc-vessel { width: 120px; height: 170px; }
  .cc-bottles { grid-template-columns: repeat(2, 1fr); }
  .cc-ticket-name { font-size: 18px; }
}

/* PWA hint under the Empezar button — shown only on iOS Safari browser */
.cc-fs-hint {
  margin: 14px 0 0;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.35;
  color: var(--ink-2);
  background: oklch(0.82 0.17 75 / 0.08);
  border: 1px solid oklch(0.82 0.17 75 / 0.18);
  border-radius: 10px;
}

/* Mode toggle on the menu card (Con tiempo / Sin tiempo) */
.cc-mode-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 4px;
  margin: 0 0 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
}
.cc-mode-opt {
  padding: 10px 8px;
  border: none;
  background: transparent;
  color: var(--ink-2);
  font-size: 13px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s;
}
.cc-mode-opt:hover { color: var(--ink-1); }
.cc-mode-opt.on {
  background: linear-gradient(180deg, oklch(0.78 0.17 85 / 0.35), oklch(0.55 0.18 70 / 0.25));
  color: oklch(0.92 0.1 85);
  box-shadow: 0 2px 8px oklch(0.7 0.15 80 / 0.25), inset 0 1px 0 rgba(255,255,255,0.08);
}

/* Terminar turno button — shown only in free mode */
.cc-end-shift {
  margin-top: 10px;
  padding: 10px 14px;
  width: 100%;
  background: transparent;
  border: 1px dashed rgba(255,255,255,0.18);
  color: var(--ink-2);
  font-size: 13px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.cc-end-shift:hover {
  background: rgba(255,255,255,0.04);
  color: var(--ink-1);
  border-style: solid;
  border-color: rgba(255,255,255,0.3);
}

/* Short-viewport tuning: iOS Safari in landscape leaves ~300-360px of
   usable height because of the URL + tab bar. Keep the menu + playing
   layout legible without fullscreen. */
@media (max-height: 520px) and (orientation: landscape) {
  .cc-menu-card { padding: 14px 20px; max-width: 520px; }
  .cc-menu-card > div:first-child { font-size: 32px !important; margin-bottom: 2px !important; }
  .cc-menu-card h1 { font-size: 22px; margin: 2px 0 6px; }
  .cc-menu-card p { font-size: 12px; margin-bottom: 10px; }
  .cc-fs-hint { margin-top: 8px; padding: 6px 10px; font-size: 11px; }
  .cc-hud { height: 48px; padding: 6px 12px; }
  .cc-stat-val { font-size: 16px; }
  .cc-grid { gap: 8px; }
  .cc-panel { padding: 10px; }
  .cc-vessel { width: 110px; height: 150px; }
  .cc-ticket-name { font-size: 17px; }
  .cc-ticket-icon { font-size: 26px; }
  .cc-line { padding: 4px 7px; font-size: 12px; }
  .cc-actions { gap: 6px; }
  .cc-act { padding: 9px 8px; font-size: 12px; }
}
@media (max-height: 400px) and (orientation: landscape) {
  .cc-hud { height: 40px; padding: 4px 10px; }
  .cc-hud-title { display: none; }
  .cc-vessel { width: 92px; height: 126px; }
  .cc-bottles { gap: 5px; }
  .cc-bottle { padding: 6px 4px 5px; min-height: 52px; }
  .cc-bottle-label { font-size: 10px; }
  .cc-garnish-row { gap: 4px; }
  .cc-gchip { padding: 5px 2px; font-size: 18px; }
}

/* Native fullscreen polish */
:fullscreen .cc-root,
:-webkit-full-screen .cc-root {
  background: var(--bg-1);
}

/* Portrait / narrow viewports — stack panels vertically.
   Triggers on phone portrait, narrow browser windows, and iPad portrait. */
@media (orientation: portrait), (max-width: 720px) {
  .cc-hud { height: 60px; gap: 12px; padding: 8px 14px; border-radius: 16px; }
  .cc-hud-title { display: none; }
  .cc-hud-stats { gap: 14px; flex: 1; justify-content: flex-end; }
  .cc-stat { min-width: 50px; }
  .cc-stat-label { font-size: 9px; }
  .cc-stat-val { font-size: 17px; }

  .cc-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 14px;
    overflow-y: auto;
    padding-bottom: 8px;
  }
  .cc-panel { padding: 16px 18px; border-radius: 18px; }
  .cc-ticket { order: 1; }
  .cc-center { order: 2; gap: 14px; }
  .cc-shelf { order: 3; }
  .cc-panel-eyebrow { margin-bottom: 12px; }

  .cc-ticket-head { margin-bottom: 14px; gap: 12px; }
  .cc-ticket-icon { font-size: 30px; }
  .cc-ticket-name { font-size: 20px; }
  .cc-ticket-list { flex: initial; gap: 8px; }
  .cc-line { padding: 8px 12px; font-size: 13px; border-radius: 10px; }
  .cc-ticket-garnish { margin-top: 14px; padding-top: 12px; font-size: 13px; }

  /* In the mobile single-column layout the parent .cc-grid drives scroll.
     Reset the desktop `flex: 1` on .cc-vessel-wrap so it sizes to its content
     and the action buttons (Shake/Stir/Clear/Serve) stay immediately below
     the vessel instead of being pushed out of view. */
  .cc-vessel-wrap { flex: 0 0 auto; min-height: 200px; padding: 10px 0; }
  .cc-vessel { width: 120px; height: 168px; }

  .cc-actions { grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .cc-act { padding: 16px 8px; font-size: 14px; border-radius: 14px; min-height: 52px; }

  .cc-bottles { grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .cc-bottle { min-height: 80px; padding: 14px 8px 12px; border-radius: 14px; gap: 8px; }
  .cc-bottle-label { font-size: 12px; line-height: 1.2; }
  .cc-bottle-cap { width: 22px; height: 26px; }
  .cc-garnish-row { grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 4px; }
  .cc-gchip { padding: 10px 4px; font-size: 24px; border-radius: 12px; }
}

/* Very narrow (small phones portrait) — keep legibility but tighten slightly. */
@media (orientation: portrait) and (max-width: 380px) {
  .cc-panel { padding: 12px 14px; }
  .cc-ticket-name { font-size: 18px; }
  .cc-vessel { width: 104px; height: 146px; }
  .cc-bottles { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .cc-bottle { min-height: 72px; padding: 12px 6px 10px; }
  .cc-bottle-label { font-size: 11px; }
  .cc-act { padding: 14px 6px; font-size: 13px; min-height: 48px; }
  .cc-garnish-row { gap: 6px; }
  .cc-gchip { font-size: 22px; padding: 9px 3px; }
}

/* Result screen should still fit in portrait */
@media (orientation: portrait) {
  .cc-menu-card { max-width: 420px; }
  .cc-result-grid { grid-template-columns: repeat(2, 1fr); }
}
`;

Object.assign(window, { ComandaScreen });



