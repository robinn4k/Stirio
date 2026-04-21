// Stirio — Legacy modes wrapped as React screens
// Depends on: ui.jsx (Icon, confettiBurst), data.js (TRIVIA_ROUNDS)
// Consumes the dynamically-loaded ES modules exposed on window:
//   window.stBlind        (blind.js exports)
//   window.stConstructor  (constructor.js exports)
//   window.stBot          (bot.js exports)
// The live 1v1 via rivals.js (Firebase RTDB) is NOT wired here — this PR
// ships a bot-only duel. Full matchmaking lands in a follow-up.

// React hooks (useState/useEffect/useRef) come from ui.jsx's top-level destructuring
// — classic scripts share script-scope bindings, so no need to redeclare here.

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

const FinishCard = ({ icon, correct, total, history, onRetry, onBack }) => {
  const lTr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  // stLang.t() returns the raw key on a miss, which previously surfaced
  // "{total}" in the UI because only `correct` was passed. Pass both and fall
  // back to a literal if the translation key isn't loaded.
  const lTrP = (k, params, f) => {
    const fb = (f !== undefined ? f : k);
    if (!window.stLang || !window.stLang.t) return fb;
    const v = window.stLang.t(k, params);
    return (!v || v === k) ? fb : v;
  };
  useEffect(() => {
    if (correct / total >= 0.6) setTimeout(() => confettiBurst(window.innerWidth/2, window.innerHeight/3), 150);
  }, [correct, total]);
  return (
    <div className="card" style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>{icon}</div>
      <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 6px' }}>{lTr('finish.title', '¡Ronda terminada!')}</h2>
      <p style={{ color: 'var(--ink-2)', marginBottom: 18 }}
        dangerouslySetInnerHTML={{
          __html: lTrP(
            'finish.hits',
            { correct: `<strong>${correct}</strong>`, total: `<strong>${total}</strong>` },
            `Acertaste <strong>${correct}/${total}</strong>`
          )
        }}
      />
      {Array.isArray(history) && history.length > 0 && (
        <div style={{
          textAlign: 'left', marginBottom: 18,
          maxHeight: 320, overflowY: 'auto',
          border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)',
          background: 'var(--bg-2)',
        }}>
          {history.map((h, i) => {
            const correctAns = h.answers?.[h.correctIndex];
            const pickedAns = h.answers?.[h.selectedIndex];
            const borderColor = i === history.length - 1 ? 'transparent' : 'var(--line-soft)';
            return (
              <div key={i} style={{
                padding: '10px 14px',
                borderBottom: `1px solid ${borderColor}`,
                display: 'flex', alignItems: 'flex-start', gap: 10,
                fontSize: 13, lineHeight: 1.45,
              }}>
                <div style={{
                  fontSize: 18, lineHeight: 1,
                  color: h.correct ? 'var(--ok)' : 'var(--bad)',
                }}>{h.correct ? '✓' : '✕'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink-1)', marginBottom: 2 }}>
                    {ml(h.name)}
                  </div>
                  {!h.correct && (
                    <div style={{ color: 'var(--ink-2)', fontSize: 12 }}>
                      <div><span style={{ color: 'var(--bad)' }}>{lTr('finish.your_answer', 'Tu respuesta')}:</span> {ml(pickedAns) || '—'}</div>
                      <div><span style={{ color: 'var(--ok)' }}>{lTr('finish.correct_answer', 'Correcta')}:</span> {ml(correctAns)}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" onClick={onBack} style={{ flex: 1 }}>{(window.stUiT ? window.stUiT('ui.back', 'Salir') : 'Salir')}</button>
        <button className="btn primary" onClick={onRetry} style={{ flex: 1 }}>{(window.stUiT ? window.stUiT('ui.play_again', 'Jugar otra vez') : 'Jugar otra vez')}</button>
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
    <ScreenShell title={(window.stUiT ? window.stUiT('blind.title', 'Cata a ciegas') : 'Cata a ciegas')} subtitle={(window.stUiT ? window.stUiT('blind.subtitle', 'Blind tasting') : 'Blind tasting')} onBack={onBack}>
      <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-2)' }}>
        {(window.stUiT ? window.stUiT('finish.loading', 'Cargando módulo…') : 'Cargando módulo…')}
      </div>
    </ScreenShell>
  );

  if (done) return (
    <ScreenShell title={(window.stUiT ? window.stUiT('blind.title', 'Cata a ciegas') : 'Cata a ciegas')} subtitle={(window.stUiT ? window.stUiT('blind.subtitle', 'Blind tasting') : 'Blind tasting')} onBack={onBack}>
      <FinishCard
        icon="👃"
        correct={done.correct}
        total={done.total}
        history={done.history}
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
    <ScreenShell title={(window.stUiT ? window.stUiT('blind.title', 'Cata a ciegas') : 'Cata a ciegas')} subtitle={(window.stLang && window.stLang.t) ? window.stLang.t('blind.question', { n: state.index + 1, total: state.total }) : `Pregunta ${state.index + 1} · ${state.total}`} onBack={onBack}>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 12 }}>
          {(window.stLang && window.stLang.t) ? window.stLang.t('blind.clues', { n: state.revealedClues, total: state.clues.length }) : `Pistas ${state.revealedClues}/${state.clues.length}`}
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
            {(window.stUiT ? window.stUiT('blind.reveal_next', '+ Revelar pista siguiente') : '+ Revelar pista siguiente')}
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
              onClick={(ev) => { if (ev.currentTarget.blur) ev.currentTarget.blur(); pick(i); }} style={{ background: bg, textAlign: 'left' }}>
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
    <ScreenShell title={(window.stUiT ? window.stUiT('builder.title', 'Constructor') : 'Constructor')} subtitle={(window.stUiT ? window.stUiT('builder.subtitle', 'Ingredientes → cóctel') : 'Ingredientes → cóctel')} onBack={onBack}>
      <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-2)' }}>
        {(window.stUiT ? window.stUiT('finish.loading', 'Cargando módulo…') : 'Cargando módulo…')}
      </div>
    </ScreenShell>
  );

  if (done) return (
    <ScreenShell title={(window.stUiT ? window.stUiT('builder.title', 'Constructor') : 'Constructor')} subtitle={(window.stUiT ? window.stUiT('builder.subtitle', 'Ingredientes → cóctel') : 'Ingredientes → cóctel')} onBack={onBack}>
      <FinishCard
        icon="🍹"
        correct={done.correct}
        total={done.total}
        history={done.history}
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
    <ScreenShell title={(window.stUiT ? window.stUiT('builder.title', 'Constructor') : 'Constructor')} subtitle={(window.stLang && window.stLang.t) ? window.stLang.t('blind.question', { n: state.index + 1, total: state.total }) : `Pregunta ${state.index + 1} · ${state.total}`} onBack={onBack}>
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
              onClick={(ev) => { if (ev.currentTarget.blur) ev.currentTarget.blur(); pick(i); }} style={{ background: bg, textAlign: 'left' }}>
              {ml(ans)}
            </button>
          );
        })}
      </div>
    </ScreenShell>
  );
};

Object.assign(window, { BlindScreen, ConstructorScreen });
