// Stirio — Full multiplayer Duel (2/3/4 players + RTDB + bot)
// Depends on: ui.jsx (Icon, confettiBurst), data.js (TRIVIA_ROUNDS)
// Consumes: window.stRivals, window.stBot, window.stAuth
// React hooks come from ui.jsx's top-level destructuring (shared script scope).

const ALL_SLOTS = ['p1', 'p2', 'p3', 'p4'];
const QUESTIONS_PER_DUEL = 10;
const TIME_PER_QUESTION = 15;
const DUEL_LANGS = [
  { id: 'es', flag: '🇪🇸', label: 'ES' },
  { id: 'en', flag: '🇬🇧', label: 'EN' },
  { id: 'fr', flag: '🇫🇷', label: 'FR' },
  { id: 'pt', flag: '🇵🇹', label: 'PT' },
  { id: 'de', flag: '🇩🇪', label: 'DE' },
];
const dTr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
// Parameterised translation with fallback: stLang.t() returns the raw key
// when a translation is missing, which leaks things like "duel.invite_text"
// into the UI. Fall back to the provided literal in that case.
const dTrParams = (k, params, f) => {
  const fb = (f !== undefined ? f : k);
  if (!window.stLang || !window.stLang.t) return fb;
  const v = window.stLang.t(k, params);
  return (!v || v === k) ? fb : v;
};

const DuelShell = ({ title, subtitle, onBack, children }) => (
  <div style={{ minHeight: '100dvh', padding: '24px 20px 120px', maxWidth: 560, margin: '0 auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <button className="btn" onClick={onBack} aria-label="Volver"
        style={{ padding: '6px 10px', minWidth: 40 }}>
        <Icon name="arrowL" size={18} />
      </button>
      <div>
        <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11 }}>{subtitle}</div>
        <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 28, margin: 0 }}>{title}</h1>
      </div>
    </div>
    {children}
  </div>
);

const Toast = ({ msg, type = 'info', onClose }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [msg]);
  if (!msg) return null;
  const bg = type === 'error' ? 'color-mix(in oklch, var(--red) 40%, var(--bg-2))'
    : type === 'success' ? 'color-mix(in oklch, var(--green) 40%, var(--bg-2))'
    : 'var(--bg-2)';
  return (
    <div style={{
      position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: 'var(--ink-1)', padding: '10px 18px', borderRadius: 24,
      border: '1px solid var(--border)', zIndex: 9999, fontSize: 14,
      animation: 'slideUp .25s ease',
    }}>{msg}</div>
  );
};

// ─────────────────────── MENU ───────────────────────
const DuelModeCard = ({ icon, title, subtitle, onClick, disabled, children }) => (
  <div className="card" style={{
    padding: 20, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'transform .15s, border-color .15s',
  }}
  onClick={disabled ? undefined : onClick}
  onMouseOver={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-2px)'; }}
  onMouseOut={e => { e.currentTarget.style.transform = 'none'; }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--f-serif)', fontSize: 18, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{subtitle}</div>
      </div>
      {!disabled && <div style={{ color: 'var(--amber)', fontSize: 20 }}>→</div>}
    </div>
    {children}
  </div>
);

const DuelMenu = ({ onPick, rtdbReady, quizLang, onChangeLang, useTimer, onChangeTimer }) => {
  const [maxPlayers, setMaxPlayers] = useState(2);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 14 }}>
        <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 8 }}>
          {dTr('duel.quiz_lang', 'Idioma del quiz')}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DUEL_LANGS.map(l => {
            const picked = quizLang === l.id;
            return (
              <button key={l.id} className="btn" onClick={() => onChangeLang(l.id)}
                style={{
                  flex: '1 1 auto', minWidth: 56, padding: '8px 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: picked ? 'color-mix(in oklch, var(--amber) 22%, var(--bg-2))' : undefined,
                  borderColor: picked ? 'var(--amber)' : undefined,
                  fontWeight: picked ? 600 : 400,
                }}>
                <span style={{ fontSize: 18 }}>{l.flag}</span>
                <span style={{ fontSize: 12 }}>{l.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', margin: '14px 0 8px' }}>
          {dTr('duel.timer_label', 'Temporizador por pregunta')}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => onChangeTimer(true)}
            style={{
              flex: 1, padding: '8px 10px',
              background: useTimer ? 'color-mix(in oklch, var(--amber) 22%, var(--bg-2))' : undefined,
              borderColor: useTimer ? 'var(--amber)' : undefined,
              fontWeight: useTimer ? 600 : 400,
            }}>
            {dTr('duel.timer_on', '⏱ Con tiempo')}
          </button>
          <button className="btn" onClick={() => onChangeTimer(false)}
            style={{
              flex: 1, padding: '8px 10px',
              background: !useTimer ? 'color-mix(in oklch, var(--amber) 22%, var(--bg-2))' : undefined,
              borderColor: !useTimer ? 'var(--amber)' : undefined,
              fontWeight: !useTimer ? 600 : 400,
            }}>
            {dTr('duel.timer_off', '∞ Sin tiempo')}
          </button>
        </div>
      </div>
      <DuelModeCard
        icon="🏠"
        title={dTr('duel.host_title', 'Crear sala')}
        subtitle={dTr('duel.host_subtitle', 'Invita amigos con un código')}
        disabled={!rtdbReady}
        onClick={() => onPick('host', { maxPlayers })}
      >
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 8 }}>{dTr('duel.host_players', 'Jugadores')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[2, 3, 4].map(n => (
              <button key={n} className="btn" onClick={e => { e.stopPropagation(); setMaxPlayers(n); }}
                style={{
                  flex: 1, padding: '10px 0',
                  background: maxPlayers === n ? 'color-mix(in oklch, var(--amber) 25%, var(--bg-2))' : undefined,
                  borderColor: maxPlayers === n ? 'var(--amber)' : undefined,
                }}>
                {n} 👥
              </button>
            ))}
          </div>
        </div>
      </DuelModeCard>
      <DuelModeCard
        icon="🔑"
        title={dTr('duel.join_title', 'Unirse con código')}
        subtitle={dTr('duel.join_subtitle', 'Introduce el código de 6 caracteres')}
        disabled={!rtdbReady}
        onClick={() => onPick('join-input')}
      />
      <DuelModeCard
        icon="🎲"
        title={dTr('duel.menu_random', 'Rival aleatorio')}
        subtitle={dTr('duel.random_subtitle', 'Emparejamiento rápido 1v1')}
        disabled={!rtdbReady}
        onClick={() => onPick('random')}
      />
      <DuelModeCard
        icon="🤖"
        title={dTr('duel.menu_bot', 'Contra bot')}
        subtitle={dTr('duel.bot_subtitle', 'Offline · 3 dificultades')}
        onClick={() => onPick('bot')}
      />
      {!rtdbReady && (
        <div className="card" style={{ padding: 14, fontSize: 13, color: 'var(--ink-2)', textAlign: 'center' }}>
          {dTr('duel.offline_bot_only', 'Sin conexión: solo modo bot disponible.')}
        </div>
      )}
    </div>
  );
};

// ─────────────────────── LOBBY HOST ───────────────────────
const PlayerSlot = ({ name, filled, isYou, isHost }) => (
  <div className="card" style={{
    padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
    background: filled ? 'color-mix(in oklch, var(--amber) 8%, var(--bg-2))' : 'var(--bg-2)',
    borderColor: filled ? 'color-mix(in oklch, var(--amber) 30%, var(--border))' : undefined,
    borderStyle: filled ? 'solid' : 'dashed',
  }}>
    <div style={{ fontSize: 24 }}>{filled ? '👤' : '⏳'}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, color: filled ? 'var(--ink-1)' : 'var(--ink-3)' }}>
        {filled ? name : dTr('duel.waiting_player', 'Esperando jugador…')}
      </div>
      {filled && (
        <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
          {isHost ? dTr('duel.role_host', 'Host') : dTr('duel.role_player', 'Jugador')} {isYou && `· ${dTr('duel.you', 'Tú')}`}
        </div>
      )}
    </div>
  </div>
);

const LobbyHost = ({ code, maxPlayers, players, myUid, isHost, canStart, onStart, onLeave, onShareInvite }) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const copy = () => {
    if (navigator.clipboard && code) {
      navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
    }
  };
  const share = async () => {
    const ok = await onShareInvite?.();
    if (ok === 'shared' || ok === 'copied') {
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    }
  };
  const slots = ALL_SLOTS.slice(0, maxPlayers);
  return (
    <div>
      <div className="card" style={{
        padding: 20, textAlign: 'center', marginBottom: 16,
        background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2))',
      }}>
        <div className="mono caps" style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 6 }}>{dTr('duel.room_code', 'Código de sala')}</div>
        <div style={{
          fontFamily: 'var(--f-mono)', fontSize: 36, fontWeight: 700,
          letterSpacing: 6, color: 'var(--ink-1)', marginBottom: 10,
        }}>{code || '------'}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={copy} style={{ padding: '6px 16px' }}>
            {copied ? `✓ ${dTr('duel.copied', 'Copiado')}` : `📋 ${dTr('duel.copy_code', 'Copiar')}`}
          </button>
          <button className="btn" onClick={share} disabled={!code} style={{ padding: '6px 16px', opacity: code ? 1 : 0.5 }}>
            {shared ? `✓ ${dTr('duel.shared', 'Enviado')}` : `🔗 ${dTr('duel.share_invite', 'Compartir invitación')}`}
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        {slots.map(slot => {
          const p = players && players[slot];
          return (
            <PlayerSlot
              key={slot}
              filled={!!p && !p.disconnected}
              name={p?.name || ''}
              isYou={p?.uid === myUid}
              isHost={slot === 'p1'}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" onClick={onLeave} style={{ flex: 1 }}>{(window.stUiT ? window.stUiT('ui.cancel', 'Cancelar') : 'Cancelar')}</button>
        {isHost && (
          <button className="btn primary" onClick={onStart} disabled={!canStart}
            style={{ flex: 2, opacity: canStart ? 1 : 0.5 }}>
            {canStart
              ? dTr('duel.start_btn', '▶ Iniciar duelo')
              : dTrParams('duel.waiting_players', { ready: Object.keys(players || {}).filter(s => !players[s].disconnected).length, total: maxPlayers }, `Esperando (${Object.keys(players || {}).filter(s => !players[s].disconnected).length}/${maxPlayers})`)}
          </button>
        )}
        {!isHost && (
          <div className="card" style={{ flex: 2, padding: 12, textAlign: 'center', color: 'var(--ink-2)', fontSize: 13 }}>
            {dTr('duel.waiting_host', 'Esperando al host…')}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────── LOBBY JOIN / SEARCHING ───────────────────────
const LobbyJoin = ({ onSubmit, onCancel, loading }) => {
  const [code, setCode] = useState('');
  const submit = () => {
    const c = code.trim().toUpperCase();
    if (c.length === 6) onSubmit(c);
  };
  return (
    <div>
      <div className="card" style={{ padding: 24, marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🔑</div>
        <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 6px' }}>{dTr('duel.enter_code', 'Introduce el código')}</h2>
        <p style={{ color: 'var(--ink-2)', fontSize: 13, marginBottom: 18 }}>
          Pídele al host su código de sala de 6 caracteres
        </p>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="XXXXXX"
          maxLength={6}
          style={{
            width: '100%', padding: '14px 16px',
            fontFamily: 'var(--f-mono)', fontSize: 28, fontWeight: 700,
            letterSpacing: 6, textAlign: 'center',
            background: 'var(--bg-3)', color: 'var(--ink-1)',
            border: '2px solid var(--border)', borderRadius: 10,
            textTransform: 'uppercase',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" onClick={onCancel} style={{ flex: 1 }}>{(window.stUiT ? window.stUiT('ui.back', 'Volver') : 'Volver')}</button>
        <button className="btn primary" onClick={submit} disabled={code.length !== 6 || loading}
          style={{ flex: 2, opacity: (code.length === 6 && !loading) ? 1 : 0.5 }}>
          {loading ? dTr('duel.joining', 'Uniendo…') : dTr('duel.join_btn', 'Unirse a sala →')}
        </button>
      </div>
    </div>
  );
};

const LobbySearching = ({ onCancel, seconds }) => (
  <div>
    <div className="card" style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 14, animation: 'pulseGlow 2s ease infinite' }}>🎲</div>
      <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 6px' }}>{dTr('duel.searching', 'Buscando rival…')}</h2>
      <p style={{ color: 'var(--ink-2)', fontSize: 13, marginBottom: 18 }}>
        Te emparejaremos con el siguiente jugador disponible
      </p>
      <div className="spinner" style={{ margin: '0 auto 14px' }} />
      {seconds !== undefined && (
        <div className="mono caps" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          {seconds > 0
            ? dTrParams('duel.seconds_left', { n: seconds }, `${seconds}s restantes`)
            : dTr('duel.time_up', 'Tiempo agotado')}
        </div>
      )}
    </div>
    <button className="btn" onClick={onCancel} style={{ width: '100%', marginTop: 12 }}>
      Cancelar búsqueda
    </button>
  </div>
);

// ─────────────────────── DUEL GAME (RTDB) ───────────────────────
const Scoreboard = ({ players, slots, mySlot }) => (
  <div style={{
    display: 'grid', gap: 6, marginBottom: 14,
    gridTemplateColumns: `repeat(${Math.min(slots.length, 4)}, 1fr)`,
  }}>
    {slots.map(slot => {
      const p = players[slot];
      const isMe = slot === mySlot;
      return (
        <div key={slot} className="card" style={{
          padding: '8px 10px', textAlign: 'center',
          background: isMe ? 'color-mix(in oklch, var(--amber) 15%, var(--bg-2))' : 'var(--bg-2)',
          borderColor: isMe ? 'var(--amber)' : undefined,
        }}>
          <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginBottom: 2 }}>
            {isMe ? 'Tú' : (p?.name || '?').slice(0, 10)}
          </div>
          <div style={{ fontFamily: 'var(--f-serif)', fontSize: 20, color: isMe ? 'var(--amber)' : 'var(--ink-1)' }}>
            {p?.score || 0}
          </div>
        </div>
      );
    })}
  </div>
);

const DuelGame = ({ roomId, slot, questions, players, maxPlayers, onFinish, isHost, useTimer }) => {
  const [qIdx, setQIdx] = useState(() => players[slot]?.currentQ || 0);
  const [timeLeft, setTimeLeft] = useState(useTimer ? TIME_PER_QUESTION : 0);
  const [picked, setPicked] = useState(null);
  const [revealAt, setRevealAt] = useState(null);

  const slots = ALL_SLOTS.slice(0, maxPlayers);
  const currentQ = questions[qIdx];

  useEffect(() => {
    if (!useTimer || revealAt) return;
    if (timeLeft <= 0) { submit(null); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, revealAt, useTimer]);

  const submit = async (pickIdx) => {
    if (picked !== null) return;
    setPicked(pickIdx);
    const correct = pickIdx !== null && pickIdx === currentQ.correctIndex;
    if (window.stRivals && window.stRivals.submitAnswer) {
      // When untimed, award the same score as if the player answered instantly
      // so the scoring still rewards correctness (timeLeft bonus is neutralised).
      const reportedTime = useTimer ? timeLeft : TIME_PER_QUESTION;
      try { await window.stRivals.submitAnswer(roomId, slot, qIdx, correct, reportedTime); } catch {}
    }
    setRevealAt(Date.now());
    setTimeout(() => {
      if (qIdx + 1 >= QUESTIONS_PER_DUEL) {
        if (isHost && window.stRivals && window.stRivals.finishGame) {
          window.stRivals.finishGame(roomId).catch(() => {});
        }
        onFinish();
        return;
      }
      setQIdx(qIdx + 1);
      setPicked(null);
      setRevealAt(null);
      setTimeLeft(useTimer ? TIME_PER_QUESTION : 0);
    }, 2000);
  };

  if (!currentQ) return <div className="card" style={{ padding: 20 }}>Cargando preguntas…</div>;

  const timerPct = useTimer ? Math.max(0, (timeLeft / TIME_PER_QUESTION) * 100) : 0;

  return (
    <div>
      <Scoreboard players={players} slots={slots} mySlot={slot} />
      {useTimer && (
        <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${timerPct}%`,
            background: timeLeft > 5 ? 'var(--amber)' : 'var(--red)',
            transition: 'width 1s linear',
          }} />
        </div>
      )}
      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <div className="mono caps" style={{ fontSize: 10, color: 'var(--amber)', marginBottom: 8 }}>
          {useTimer
            ? dTrParams('duel.question_progress', { n: qIdx + 1, total: QUESTIONS_PER_DUEL, time: timeLeft }, `Pregunta ${qIdx + 1} / ${QUESTIONS_PER_DUEL} · ${timeLeft}s`)
            : dTrParams('duel.question_progress_short', { n: qIdx + 1, total: QUESTIONS_PER_DUEL }, `Pregunta ${qIdx + 1} / ${QUESTIONS_PER_DUEL}`)}
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.4 }}>{currentQ.question}</div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {currentQ.answers.map((ans, i) => {
          const isPicked = picked === i;
          const isCorrect = revealAt && i === currentQ.correctIndex;
          const bg = !revealAt
            ? (isPicked ? 'color-mix(in oklch, var(--amber) 20%, var(--bg-2))' : undefined)
            : isCorrect ? 'color-mix(in oklch, var(--green) 35%, var(--bg-2))'
            : isPicked ? 'color-mix(in oklch, var(--red) 35%, var(--bg-2))'
            : undefined;
          return (
            <button key={i} className="choice-btn" disabled={picked !== null}
              onClick={() => submit(i)}
              style={{ background: bg, textAlign: 'left' }}>
              {ans}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────── RESULTS ───────────────────────
const MEDALS = ['🥇', '🥈', '🥉'];

const DuelResults = ({ players, mySlot, maxPlayers, onRematch, onExit }) => {
  const slots = ALL_SLOTS.slice(0, maxPlayers);
  const ranked = slots
    .map(s => ({ slot: s, ...(players[s] || { score: 0, name: '?' }) }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  const myRank = ranked.findIndex(r => r.slot === mySlot);
  const won = myRank === 0 && (ranked[0]?.score || 0) > 0;

  useEffect(() => {
    if (won) setTimeout(() => confettiBurst(window.innerWidth / 2, window.innerHeight / 3), 200);
  }, [won]);

  return (
    <div>
      <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 64, marginBottom: 6 }}>
          {won ? '🏆' : myRank === ranked.length - 1 ? '😅' : '🎉'}
        </div>
        <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 6px' }}>
          {won
            ? dTr('duel.won', '¡Ganaste!')
            : myRank === 0
              ? dTr('duel.tie', 'Empate')
              : dTrParams('duel.place_nth', { n: myRank + 1 }, `${myRank + 1}º puesto`)}
        </h2>
        <p style={{ color: 'var(--ink-2)', fontSize: 13 }}>{dTr('duel.game_over', 'Partida terminada')}</p>
      </div>
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {ranked.map((r, i) => (
          <div key={r.slot} className="card" style={{
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
            background: r.slot === mySlot ? 'color-mix(in oklch, var(--amber) 12%, var(--bg-2))' : 'var(--bg-2)',
            borderColor: r.slot === mySlot ? 'var(--amber)' : undefined,
          }}>
            <div style={{ fontSize: 24, width: 32, textAlign: 'center' }}>{MEDALS[i] || `#${i + 1}`}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{r.name} {r.slot === mySlot && '· Tú'}</div>
              {r.disconnected && <div className="mono caps" style={{ fontSize: 10, color: 'var(--red)' }}>Desconectado</div>}
            </div>
            <div style={{ fontFamily: 'var(--f-serif)', fontSize: 24, color: 'var(--amber)' }}>{r.score || 0}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" onClick={onExit} style={{ flex: 1 }}>{(window.stUiT ? window.stUiT('ui.back', 'Volver') : 'Volver')}</button>
        <button className="btn primary" onClick={onRematch} style={{ flex: 2 }}>{dTr('duel.rematch', 'Revancha')}</button>
      </div>
    </div>
  );
};

// ─────────────────────── BOT DUEL (offline) ───────────────────────
const BotDuel = ({ onBack }) => {
  const botApi = window.stBot;
  const DIFFS = (botApi && botApi.DIFFICULTIES) || {
    easy: { accuracy: 0.45, minMs: 2500, maxMs: 5500 },
    medium: { accuracy: 0.7, minMs: 1500, maxMs: 4000 },
    hard: { accuracy: 0.9, minMs: 900, maxMs: 2400 },
  };
  const [diff, setDiff] = useState('medium');
  const [started, setStarted] = useState(false);
  const rounds = (window.TRIVIA_ROUNDS || []);
  const round = useRef(rounds[Math.floor(Math.random() * Math.max(1, rounds.length))] || null);
  const [qIdx, setQIdx] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [userPick, setUserPick] = useState(null);
  const [botPick, setBotPick] = useState(null);
  const [phase, setPhase] = useState('playing');
  const botTimer = useRef(null);
  const total = QUESTIONS_PER_DUEL;
  const botName = useRef((botApi && botApi.getBotName && botApi.getBotName()) || 'Barbot 🤖');
  const questions = useRef(round.current ? (round.current.questions || []).slice(0, total) : []);
  const currentQ = questions.current[qIdx];

  if (currentQ && !currentQ._shuffled) currentQ._shuffled = [...currentQ.a].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (!started || phase !== 'playing' || !currentQ) return;
    const cfg = DIFFS[diff];
    const ms = cfg.minMs + Math.random() * (cfg.maxMs - cfg.minMs);
    const correct = Math.random() < cfg.accuracy;
    botTimer.current = setTimeout(() => {
      const ansArr = currentQ._shuffled;
      const correctIdx = ansArr.indexOf(currentQ.a[0]);
      const pick = correct ? correctIdx : ansArr.map((_, i) => i).filter(i => i !== correctIdx)[Math.floor(Math.random() * 3)];
      setBotPick(pick);
    }, ms);
    return () => clearTimeout(botTimer.current);
  }, [qIdx, phase, currentQ, started, diff]);

  useEffect(() => {
    if (started && phase === 'playing' && userPick !== null && botPick !== null) {
      const correctIdx = currentQ._shuffled.indexOf(currentQ.a[0]);
      if (userPick === correctIdx) setUserScore(s => s + 10);
      if (botPick === correctIdx) setBotScore(s => s + 10);
      setPhase('reveal');
      setTimeout(() => {
        if (qIdx + 1 >= total) { setPhase('done'); return; }
        setQIdx(i => i + 1); setUserPick(null); setBotPick(null); setPhase('playing');
      }, 1600);
    }
  }, [userPick, botPick, phase, started]);

  if (!started) {
    return (
      <DuelShell title="Contra bot" subtitle="Elige dificultad" onBack={onBack}>
        <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
          {Object.keys(DIFFS).map(d => (
            <button key={d} className="btn" onClick={() => setDiff(d)}
              style={{
                padding: '14px', textAlign: 'left',
                background: diff === d ? 'color-mix(in oklch, var(--amber) 20%, var(--bg-2))' : undefined,
                borderColor: diff === d ? 'var(--amber)' : undefined,
              }}>
              <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{d === 'easy' ? dTr('duel.diff_easy', '🌱 Fácil') : d === 'medium' ? dTr('duel.diff_medium', '⚡ Medio') : dTr('duel.diff_hard', '🔥 Difícil')}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>
                Precisión {Math.round(DIFFS[d].accuracy * 100)}% · Respuesta {(DIFFS[d].minMs / 1000).toFixed(1)}–{(DIFFS[d].maxMs / 1000).toFixed(1)}s
              </div>
            </button>
          ))}
        </div>
        <button className="btn primary" onClick={() => setStarted(true)} style={{ width: '100%' }}>▶ Empezar</button>
      </DuelShell>
    );
  }

  if (!round.current || !currentQ) return <DuelShell title="Duelo" subtitle="Error" onBack={onBack}><div className="card" style={{ padding: 20 }}>Sin preguntas.</div></DuelShell>;

  if (phase === 'done') {
    return (
      <DuelShell title="Contra bot" subtitle="Resultado" onBack={onBack}>
        <DuelResults
          players={{ p1: { name: dTr('duel.you', 'Tú'), score: userScore }, p2: { name: botName.current, score: botScore } }}
          mySlot="p1"
          maxPlayers={2}
          onRematch={() => { setStarted(false); setQIdx(0); setUserScore(0); setBotScore(0); setPhase('playing'); round.current = rounds[Math.floor(Math.random() * rounds.length)]; questions.current = round.current.questions.slice(0, total).map(q => ({ ...q })); }}
          onExit={onBack}
        />
      </DuelShell>
    );
  }

  const answers = currentQ._shuffled;
  const correctIdx = answers.indexOf(currentQ.a[0]);

  return (
    <DuelShell title={dTr('duel.bot_mode', 'Contra bot')} subtitle={dTrParams('duel.question_progress_short', { n: qIdx + 1, total }, `Pregunta ${qIdx + 1} · ${total}`)} onBack={onBack}>
      <Scoreboard
        players={{ p1: { name: dTr('duel.you', 'Tú'), score: userScore }, p2: { name: botName.current, score: botScore } }}
        slots={['p1', 'p2']}
        mySlot="p1"
      />
      <div className="card" style={{ padding: 20, marginBottom: 14 }}><div style={{ fontSize: 16, lineHeight: 1.4 }}>{currentQ.q}</div></div>
      <div style={{ display: 'grid', gap: 10 }}>
        {answers.map((ans, i) => {
          const isPicked = userPick === i;
          const isBotPick = phase === 'reveal' && botPick === i;
          const isCorrect = phase === 'reveal' && i === correctIdx;
          const bg = phase !== 'reveal'
            ? (isPicked ? 'color-mix(in oklch, var(--amber) 20%, var(--bg-2))' : undefined)
            : isCorrect ? 'color-mix(in oklch, var(--green) 35%, var(--bg-2))'
            : isPicked ? 'color-mix(in oklch, var(--red) 35%, var(--bg-2))'
            : undefined;
          return (
            <button key={i} className="choice-btn" disabled={phase !== 'playing' || userPick !== null}
              onClick={() => setUserPick(i)}
              style={{ background: bg, textAlign: 'left', position: 'relative' }}>
              <span>{ans}</span>
              {isBotPick && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-3)' }}>🤖</span>}
            </button>
          );
        })}
      </div>
    </DuelShell>
  );
};

// ─────────────────────── ORCHESTRATOR ───────────────────────
const DuelScreen = ({ onBack, initialInviteCode }) => {
  const [phase, setPhase] = useState('menu'); // menu|host|join-input|random|playing|results|bot
  const [uid, setUid] = useState(null);
  const [myName, setMyName] = useState(() => {
    try {
      const u = window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser();
      if (u && (u.name || u.displayName)) return u.name || u.displayName;
    } catch {}
    return dTr('duel.guest', 'Invitado');
  });
  const [rtdbReady, setRtdbReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [quizLang, setQuizLang] = useState(() => {
    try { return window.stLang?.getLang?.() || 'es'; } catch { return 'es'; }
  });
  const [useTimer, setUseTimer] = useState(true);

  const [roomId, setRoomId] = useState(null);
  const [code, setCode] = useState('');
  const [slot, setSlot] = useState('p1');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [searchSeconds, setSearchSeconds] = useState(30);
  const [joining, setJoining] = useState(false);
  const unsubRoomRef = useRef(null);
  const unsubMatchRef = useRef(null);
  const searchTimerRef = useRef(null);
  const autoJoinedRef = useRef(false);

  const showToast = (msg, type) => setToast({ msg, type });

  // Init Firebase + RTDB + anonymous auth
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (window.stAuth && window.stAuth.initFirebase) await window.stAuth.initFirebase();
        if (!window.stRivals) { showToast(dTr('duel.offline_info', 'Sin conexión — modo bot disponible'), 'info'); return; }
        const ok = await window.stRivals.initRivals();
        if (!ok) { showToast(dTr('duel.offline_info', 'Sin conexión — modo bot disponible'), 'info'); return; }
        const u = await window.stRivals.ensureAnonymousAuth();
        if (cancelled) return;
        if (u) {
          setUid(u);
          setRtdbReady(true);
          const curr = window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser();
          const resolved = curr?.name || curr?.displayName;
          if (resolved) setMyName(resolved);
        }
      } catch (e) {
        console.warn('[duel] init failed', e);
        showToast(dTr('duel.offline_info', 'Sin conexión — modo bot disponible'), 'info');
      }
    })();
    return () => { cancelled = true; cleanupListeners(); };
  }, []);

  const cleanupListeners = () => {
    if (typeof unsubRoomRef.current === 'function') { unsubRoomRef.current(); unsubRoomRef.current = null; }
    if (typeof unsubMatchRef.current === 'function') { unsubMatchRef.current(); unsubMatchRef.current = null; }
    if (searchTimerRef.current) { clearInterval(searchTimerRef.current); searchTimerRef.current = null; }
  };

  const returnToMenu = async () => {
    cleanupListeners();
    if (roomId && slot && window.stRivals) {
      try { await window.stRivals.leaveRoom(roomId, slot); } catch {}
    }
    if (uid && window.stRivals) { try { await window.stRivals.leaveQueue(uid); } catch {} }
    setRoomId(null); setCode(''); setSlot('p1'); setRoom(null); setQuestions(null);
    setPhase('menu');
  };

  // Subscribe to room updates
  const subscribeRoom = async (rid) => {
    const unsub = await window.stRivals.listenRoom(rid, (r) => {
      if (!r) return;
      setRoom(r);
      if (r.maxPlayers) setMaxPlayers(r.maxPlayers);
      if (r.status === 'playing' && !questions) {
        // Prefer the language-agnostic path (setup carries indices + shared
        // `lang`), so host and joiner see the same question text. Fall back
        // to the pre-rendered array for older rooms that don't include lang.
        let qs = null;
        if (r.setup?.roundId && window.stRivals?.loadDuelQuestionsFromSetup) {
          try {
            qs = window.stRivals.loadDuelQuestionsFromSetup(r.setup, r.setup.lang);
          } catch {}
        }
        if (!qs || !qs.length) {
          qs = Array.isArray(r.setup?.questions)
            ? r.setup.questions
            : Object.values(r.setup?.questions || {});
        }
        setQuestions(qs);
        setPhase('playing');
      }
      if (r.status === 'finished') setPhase('results');
    });
    unsubRoomRef.current = unsub;
  };

  // Host: create room
  const startHost = async (opts) => {
    if (!rtdbReady) return;
    setMaxPlayers(opts.maxPlayers);
    try {
      const rounds = window.TRIVIA_ROUNDS || [];
      const r = rounds[Math.floor(Math.random() * rounds.length)];
      if (!r) { showToast(dTr('duel.err_no_questions', 'No hay preguntas'), 'error'); return; }
      // Language-agnostic setup — host's chosen language is attached so all
      // players render the same text from their local question data. The
      // useTimer flag travels with the room so joiners also see the same
      // per-question countdown behaviour. Guard against an empty quizLang
      // slipping into Firebase (which would make joiners fall back to their
      // local lang and break the shared view).
      const lang = ['es','en','fr','pt','de'].includes(quizLang) ? quizLang : 'es';
      const setup = { ...window.stRivals.prepareDuelSetup(r), lang, useTimer };
      const res = await window.stRivals.createFriendRoom(uid, myName, setup, opts.maxPlayers);
      setRoomId(res.roomId); setCode(res.code); setSlot('p1');
      await window.stRivals.registerPlayerDisconnect(res.roomId, 'p1');
      await subscribeRoom(res.roomId);
      setPhase('host');
    } catch (e) {
      console.error('[duel] createFriendRoom', e);
      showToast(dTr('duel.err_create_room', 'Error al crear sala'), 'error');
    }
  };

  // Join by code
  const doJoin = async (c) => {
    if (!rtdbReady) return;
    setJoining(true);
    try {
      const result = await window.stRivals.joinByCode(uid, myName, c);
      setJoining(false);
      if (result === null) { showToast(dTr('duel.code_invalid', 'Código no válido'), 'error'); return; }
      if (result === 'full') { showToast(dTr('duel.err_room_full', 'Sala llena'), 'error'); return; }
      setRoomId(result.roomId); setSlot(result.slot); setCode(c);
      await window.stRivals.registerPlayerDisconnect(result.roomId, result.slot);
      await subscribeRoom(result.roomId);
      setPhase('host'); // Same UI as host lobby
    } catch (e) {
      setJoining(false);
      console.error('[duel] joinByCode', e);
      showToast(dTr('duel.err_join_generic', 'Error al unirse'), 'error');
    }
  };

  // Random matchmaking
  const startRandom = async () => {
    if (!rtdbReady) return;
    try {
      const rounds = window.TRIVIA_ROUNDS || [];
      const r = rounds[Math.floor(Math.random() * rounds.length)];
      const lang = ['es','en','fr','pt','de'].includes(quizLang) ? quizLang : 'es';
      const setup = { ...window.stRivals.prepareDuelSetup(r), lang, useTimer };
      const result = await window.stRivals.joinQueue(uid, myName, setup);
      setMaxPlayers(2);
      if (!result.waiting) {
        setRoomId(result.roomId); setSlot(result.slot);
        await window.stRivals.registerPlayerDisconnect(result.roomId, result.slot);
        await subscribeRoom(result.roomId);
        setPhase('host');
      } else {
        setSlot('p1');
        setSearchSeconds(30);
        setPhase('random');
        searchTimerRef.current = setInterval(() => {
          setSearchSeconds(s => {
            if (s <= 1) {
              clearInterval(searchTimerRef.current); searchTimerRef.current = null;
              window.stRivals.leaveQueue(uid).catch(() => {});
              if (unsubMatchRef.current) { unsubMatchRef.current(); unsubMatchRef.current = null; }
              showToast(dTr('duel.no_rivals', 'No se encontraron rivales'), 'info');
              setPhase('menu');
              return 0;
            }
            return s - 1;
          });
        }, 1000);
        unsubMatchRef.current = await window.stRivals.listenForMatch(uid, async ({ roomId: rid }) => {
          clearInterval(searchTimerRef.current); searchTimerRef.current = null;
          if (unsubMatchRef.current) { unsubMatchRef.current(); unsubMatchRef.current = null; }
          await window.stRivals.clearMatchNotif(uid);
          setRoomId(rid);
          await window.stRivals.registerPlayerDisconnect(rid, 'p1');
          await subscribeRoom(rid);
          setPhase('host');
        });
      }
    } catch (e) {
      console.error('[duel] joinQueue', e);
      showToast(dTr('duel.err_search', 'Error al buscar rival'), 'error');
    }
  };

  const handleStart = async () => {
    if (!roomId || !window.stRivals) return;
    try { await window.stRivals.startRoom(roomId); } catch (e) { showToast(dTr('duel.err_start', 'Error al iniciar'), 'error'); }
  };

  // Auto-join when arriving via an ?invite=CODE deep link. Runs once per
  // DuelScreen mount after RTDB is ready.
  useEffect(() => {
    if (!rtdbReady || !initialInviteCode || autoJoinedRef.current) return;
    const c = String(initialInviteCode).trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(c)) return;
    autoJoinedRef.current = true;
    doJoin(c);
  }, [rtdbReady, initialInviteCode]);

  // Render
  if (phase === 'bot') return <BotDuel onBack={returnToMenu} />;

  if (phase === 'menu') {
    return (
      <DuelShell title="Duelo" subtitle="Reta a otros jugadores" onBack={onBack}>
        <DuelMenu
          rtdbReady={rtdbReady}
          quizLang={quizLang}
          onChangeLang={setQuizLang}
          useTimer={useTimer}
          onChangeTimer={setUseTimer}
          onPick={(mode, opts) => {
            if (mode === 'bot') setPhase('bot');
            else if (mode === 'host') startHost(opts);
            else if (mode === 'join-input') setPhase('join-input');
            else if (mode === 'random') startRandom();
          }}
        />
        <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      </DuelShell>
    );
  }

  if (phase === 'join-input') {
    return (
      <DuelShell title={dTr('duel.title', 'Duelo')} subtitle={dTr('duel.join_by_code', 'Unirse por código')} onBack={() => setPhase('menu')}>
        <LobbyJoin onSubmit={doJoin} onCancel={() => setPhase('menu')} loading={joining} />
        <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      </DuelShell>
    );
  }

  if (phase === 'random') {
    return (
      <DuelShell title="Duelo" subtitle="Rival aleatorio" onBack={returnToMenu}>
        <LobbySearching seconds={searchSeconds} onCancel={returnToMenu} />
        <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      </DuelShell>
    );
  }

  if (phase === 'host') {
    const players = room?.players || {};
    const joinedCount = ALL_SLOTS.slice(0, maxPlayers).filter(s => players[s] && !players[s].disconnected).length;
    const canStart = joinedCount >= maxPlayers;
    const isHost = slot === 'p1';
    const shareInvite = async () => {
      if (!code) return null;
      const url = `${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(code)}`;
      const text = dTrParams('duel.invite_text', { code }, `¡Reto en Stirio! Únete con el código ${code}`);
      const title = dTr('duel.invite_title', 'Te invito a un duelo en Stirio');
      try {
        if (navigator.share) {
          await navigator.share({ title, text, url });
          return 'shared';
        }
      } catch (e) {
        // User cancelled the share sheet — treat as not-shared, not an error
        if (e && e.name === 'AbortError') return null;
      }
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          showToast(dTr('duel.invite_copied', 'Enlace copiado al portapapeles'), 'success');
          return 'copied';
        }
      } catch {}
      showToast(dTr('duel.invite_fail', 'No se pudo compartir el enlace'), 'error');
      return null;
    };
    return (
      <DuelShell title="Sala de duelo" subtitle={`${maxPlayers} jugadores`} onBack={returnToMenu}>
        <LobbyHost
          code={code}
          maxPlayers={maxPlayers}
          players={players}
          myUid={uid}
          isHost={isHost}
          canStart={canStart}
          onStart={handleStart}
          onLeave={returnToMenu}
          onShareInvite={shareInvite}
        />
        <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      </DuelShell>
    );
  }

  if (phase === 'playing') {
    const players = room?.players || {};
    // Fall back to `useTimer: true` for rooms created before this flag existed.
    const roomUseTimer = room?.setup?.useTimer !== false;
    return (
      <DuelShell title="Duelo" subtitle="En juego" onBack={returnToMenu}>
        <DuelGame
          roomId={roomId}
          slot={slot}
          questions={questions || []}
          players={players}
          maxPlayers={maxPlayers}
          isHost={slot === 'p1'}
          useTimer={roomUseTimer}
          onFinish={() => { /* results set via listenRoom when status=finished */ }}
        />
        <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      </DuelShell>
    );
  }

  if (phase === 'results') {
    return (
      <DuelShell title="Resultado" subtitle="Duelo terminado" onBack={returnToMenu}>
        <DuelResults
          players={room?.players || {}}
          mySlot={slot}
          maxPlayers={maxPlayers}
          onRematch={() => { cleanupListeners(); setRoomId(null); setRoom(null); setQuestions(null); setPhase('menu'); }}
          onExit={returnToMenu}
        />
        <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      </DuelShell>
    );
  }

  return null;
};

Object.assign(window, { DuelScreen });
