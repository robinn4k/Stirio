// Stirio — Legacy modes wrapped as React screens
// Depends on: ui.jsx (Icon, confettiBurst), data.js (TRIVIA_ROUNDS)
// Consumes the dynamically-loaded ES modules exposed on window:
//   window.stBlind        (blind.js exports)
//   window.stConstructor  (constructor.js exports)
//   window.stBot          (bot.js exports)
// The live 1v1 via rivals.js (Firebase RTDB) is NOT wired here — this PR
// ships a bot-only duel. Full matchmaking lands in a follow-up.

const { useState, useEffect, useRef } = React;

// Pick the right string from a multilingual object { es, en, fr, pt, de }
const ml = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  const lang = (window.stLang && window.stLang.getLang && window.stLang.getLang()) || 'es';
  return v[lang] || v.en || v.es || Object.values(v)[0] || '';
};

const ScreenShell = ({ title, subtitle, onBack, children }) => (
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

const FinishCard = ({ icon, correct, total, onRetry, onBack }) => {
  useEffect(() => {
    if (correct / total >= 0.6) setTimeout(() => confettiBurst(window.innerWidth/2, window.innerHeight/3), 150);
  }, [correct, total]);
  return (
    <div className="card" style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>{icon}</div>
      <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 6px' }}>¡Ronda terminada!</h2>
      <p style={{ color: 'var(--ink-2)', marginBottom: 18 }}>
        Acertaste <strong>{correct}/{total}</strong>
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" onClick={onBack} style={{ flex: 1 }}>Salir</button>
        <button className="btn primary" onClick={onRetry} style={{ flex: 1 }}>Jugar otra vez</button>
      </div>
    </div>
  );
};

// ─────────────────────────── BLIND ───────────────────────────
const BlindScreen = ({ onBack }) => {
  const api = window.stBlind;
  const [state, setState] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!api) return;
    setState(api.startBlind());
    return () => api.abortBlind && api.abortBlind();
  }, [api]);

  if (!api) return (
    <ScreenShell title="Cata a ciegas" subtitle="Blind tasting" onBack={onBack}>
      <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-2)' }}>
        Cargando módulo…
      </div>
    </ScreenShell>
  );

  if (done) return (
    <ScreenShell title="Cata a ciegas" subtitle="Blind tasting" onBack={onBack}>
      <FinishCard
        icon="👃"
        correct={done.correct}
        total={done.total}
        onRetry={() => { setDone(null); setFeedback(null); setState(api.startBlind()); }}
        onBack={onBack}
      />
    </ScreenShell>
  );

  if (!state) return null;

  const revealNext = () => setState(api.revealNextClue());
  const pick = (i) => {
    const r = api.answerBlind(i);
    setFeedback(r);
    setTimeout(() => {
      setFeedback(null);
      if (r.done) setDone(r.result);
      else setState(r.next);
    }, 1400);
  };

  const canReveal = state.revealedClues < state.clues.length;

  return (
    <ScreenShell title="Cata a ciegas" subtitle={`Pregunta ${state.index + 1} · ${state.total}`} onBack={onBack}>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 12 }}>
          Pistas {state.revealedClues}/{state.clues.length}
        </div>
        {state.clues.slice(0, state.revealedClues).map((c, i) => (
          <div key={i} style={{
            padding: '10px 12px', marginBottom: 8,
            background: 'var(--bg-3)', borderRadius: 10,
            fontSize: 15, lineHeight: 1.4, color: 'var(--ink-1)',
          }}>
            <span style={{ color: 'var(--amber)', marginRight: 6 }}>▸</span>{ml(c)}
          </div>
        ))}
        {canReveal && (
          <button className="btn" onClick={revealNext} style={{ marginTop: 6, width: '100%' }}>
            + Revelar pista siguiente
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {state.answers.map((ans, i) => {
          const isPicked = feedback && feedback.selectedIndex === i;
          const isCorrect = feedback && feedback.correctIndex === i;
          const bg = !feedback ? undefined
            : isCorrect ? 'color-mix(in oklch, var(--green) 35%, var(--bg-2))'
            : isPicked ? 'color-mix(in oklch, var(--red) 35%, var(--bg-2))'
            : undefined;
          return (
            <button key={i} className="choice-btn" disabled={!!feedback}
              onClick={() => pick(i)} style={{ background: bg, textAlign: 'left' }}>
              {ml(ans)}
            </button>
          );
        })}
      </div>
    </ScreenShell>
  );
};

// ─────────────────────────── CONSTRUCTOR ───────────────────────────
const ConstructorScreen = ({ onBack }) => {
  const api = window.stConstructor;
  const [state, setState] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!api) return;
    setState(api.startConstructor());
    return () => api.abortConstructor && api.abortConstructor();
  }, [api]);

  if (!api) return (
    <ScreenShell title="Constructor" subtitle="Ingredientes → cóctel" onBack={onBack}>
      <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-2)' }}>
        Cargando módulo…
      </div>
    </ScreenShell>
  );

  if (done) return (
    <ScreenShell title="Constructor" subtitle="Ingredientes → cóctel" onBack={onBack}>
      <FinishCard
        icon="🍹"
        correct={done.correct}
        total={done.total}
        onRetry={() => { setDone(null); setFeedback(null); setState(api.startConstructor()); }}
        onBack={onBack}
      />
    </ScreenShell>
  );

  if (!state) return null;

  const pick = (i) => {
    const r = api.answerConstructor(i);
    setFeedback(r);
    setTimeout(() => {
      setFeedback(null);
      if (r.done) setDone(r.result);
      else setState(r.next);
    }, 1200);
  };

  return (
    <ScreenShell title="Constructor" subtitle={`Pregunta ${state.index + 1} · ${state.total}`} onBack={onBack}>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 12 }}>
          Ingredientes · {ml(state.method)} · {ml(state.glass)}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {(state.ingredients || []).map((ing, i) => (
            <div key={i} style={{
              padding: '10px 12px',
              background: 'var(--bg-3)', borderRadius: 10,
              fontSize: 15, color: 'var(--ink-1)',
            }}>
              <span style={{ color: 'var(--amber)', marginRight: 8 }}>●</span>{ml(ing)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {state.answers.map((ans, i) => {
          const isPicked = feedback && feedback.selectedIndex === i;
          const isCorrect = feedback && feedback.correctIndex === i;
          const bg = !feedback ? undefined
            : isCorrect ? 'color-mix(in oklch, var(--green) 35%, var(--bg-2))'
            : isPicked ? 'color-mix(in oklch, var(--red) 35%, var(--bg-2))'
            : undefined;
          return (
            <button key={i} className="choice-btn" disabled={!!feedback}
              onClick={() => pick(i)} style={{ background: bg, textAlign: 'left' }}>
              {ml(ans)}
            </button>
          );
        })}
      </div>
    </ScreenShell>
  );
};

// ─────────────────────────── DUEL (bot) ───────────────────────────
const DuelScreen = ({ onBack }) => {
  const botApi = window.stBot;
  const rounds = (window.TRIVIA_ROUNDS || []);
  const round = useRef(rounds[Math.floor(Math.random() * Math.max(1, rounds.length))] || null);
  const [qIdx, setQIdx] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [userPick, setUserPick] = useState(null);
  const [botPick, setBotPick] = useState(null);
  const [phase, setPhase] = useState('playing'); // playing | reveal | done
  const botTimer = useRef(null);

  const total = 10;
  const botDifficulty = botApi && botApi.DIFFICULTIES ? botApi.DIFFICULTIES.medium : { accuracy: 0.7, minMs: 1500, maxMs: 4000 };
  const botName = useRef((botApi && botApi.getBotName && botApi.getBotName()) || 'Barbot 🤖');

  const questions = useRef(
    round.current ? (round.current.questions || []).slice(0, total) : []
  );

  const currentQ = questions.current[qIdx];

  // Schedule bot answer when question arrives
  useEffect(() => {
    if (phase !== 'playing' || !currentQ) return;
    const ms = botDifficulty.minMs + Math.random() * (botDifficulty.maxMs - botDifficulty.minMs);
    const willBeCorrect = Math.random() < botDifficulty.accuracy;
    botTimer.current = setTimeout(() => {
      const correctAnsText = currentQ.a[0];
      const shuffledAnswers = currentQ._shuffled || currentQ.a;
      const correctIdx = shuffledAnswers.indexOf(correctAnsText);
      let pick;
      if (willBeCorrect) pick = correctIdx;
      else {
        const wrong = shuffledAnswers.map((_, i) => i).filter(i => i !== correctIdx);
        pick = wrong[Math.floor(Math.random() * wrong.length)];
      }
      setBotPick(pick);
    }, ms);
    return () => clearTimeout(botTimer.current);
  }, [qIdx, phase, currentQ]);

  // When both picked → reveal
  useEffect(() => {
    if (phase === 'playing' && userPick !== null && botPick !== null) {
      const correctIdx = (currentQ._shuffled || currentQ.a).indexOf(currentQ.a[0]);
      if (userPick === correctIdx) setUserScore(s => s + 10);
      if (botPick === correctIdx) setBotScore(s => s + 10);
      setPhase('reveal');
      setTimeout(() => {
        if (qIdx + 1 >= total) { setPhase('done'); return; }
        setQIdx(i => i + 1);
        setUserPick(null);
        setBotPick(null);
        setPhase('playing');
      }, 1600);
    }
  }, [userPick, botPick, phase]);

  // Shuffle answers once per question
  if (currentQ && !currentQ._shuffled) {
    currentQ._shuffled = [...currentQ.a].sort(() => Math.random() - 0.5);
  }

  if (!round.current || !currentQ) {
    return (
      <ScreenShell title="Duelo" subtitle="Bot vs. tú" onBack={onBack}>
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-2)' }}>
          No hay preguntas disponibles.
        </div>
      </ScreenShell>
    );
  }

  if (phase === 'done') {
    const winner = userScore > botScore ? 'user' : userScore < botScore ? 'bot' : 'tie';
    return (
      <ScreenShell title="Duelo" subtitle="Resultado" onBack={onBack}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>
            {winner === 'user' ? '🏆' : winner === 'bot' ? '🤖' : '🤝'}
          </div>
          <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 10px' }}>
            {winner === 'user' ? '¡Ganaste!' : winner === 'bot' ? `Ganó ${botName.current}` : 'Empate'}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 18 }}>
            <div>
              <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 11 }}>Tú</div>
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: 28, color: 'var(--amber)' }}>{userScore}</div>
            </div>
            <div>
              <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{botName.current}</div>
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: 28, color: 'var(--ink-2)' }}>{botScore}</div>
            </div>
          </div>
          <button className="btn primary" onClick={onBack} style={{ width: '100%' }}>Volver</button>
        </div>
      </ScreenShell>
    );
  }

  const answers = currentQ._shuffled;
  const correctIdx = answers.indexOf(currentQ.a[0]);

  return (
    <ScreenShell title="Duelo" subtitle={`Pregunta ${qIdx + 1} · ${total}`} onBack={onBack}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <div className="card" style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
          <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 10 }}>Tú</div>
          <div style={{ fontFamily: 'var(--f-serif)', fontSize: 22, color: 'var(--amber)' }}>{userScore}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
          <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 10 }}>{botName.current}</div>
          <div style={{ fontFamily: 'var(--f-serif)', fontSize: 22, color: 'var(--ink-2)' }}>
            {botScore} {phase === 'playing' && botPick === null && '⏳'}
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 16, lineHeight: 1.4 }}>{currentQ.q}</div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {answers.map((ans, i) => {
          const isPicked = userPick === i;
          const isBot = phase === 'reveal' && botPick === i;
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
              {isBot && (
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-3)' }}>
                  🤖 {botName.current.split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </ScreenShell>
  );
};

Object.assign(window, { BlindScreen, ConstructorScreen, DuelScreen });
