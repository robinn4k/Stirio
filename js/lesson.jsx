// Stirio — Lesson Player (the 60-second core)
// Depends on: ui.jsx (Icon, Prompt, playChord, confettiBurst)

const LessonPlayer = ({ lesson, onExit, onFinish }) => {
  // Timer only runs for lessons that explicitly opt in via `_timed`
  // (currently Speed rounds set `_timed: 60` in data.js). Academy, Daily and
  // Free Quiz lessons are self-paced so the player can actually read each
  // question + explanation without the clock rushing them.
  const timerDuration = Number.isFinite(lesson?._timed) ? lesson._timed : null;
  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerDuration || 0);
  const [xp, setXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [stepFeedback, setStepFeedback] = useState(null); // 'ok' | 'bad' | null
  const [pops, setPops] = useState([]);
  const [finished, setFinished] = useState(false);
  const containerRef = useRef(null);
  // Synchronous lock: setStepFeedback is async, so two clicks in the same
  // React frame both see `stepFeedback === null` and double-fire (XP doubled,
  // step skipped). A ref flips before any setState and is checked first.
  const answerLockRef = useRef(false);
  // Track the "advance to next step" timeout so we can cancel it if the user
  // exits the lesson during the feedback dwell — otherwise React fires
  // setStepIdx/finish on an unmounted component (warning + possible double
  // finish if the timer also expires).
  const advanceTimeoutRef = useRef(null);

  const step = lesson?.steps?.[stepIdx];
  const totalSteps = lesson?.steps?.length || 0;
  const progress = totalSteps ? stepIdx / totalSteps : 0;

  // Reset the per-step lock whenever we move to a new step so the user can
  // answer the next question.
  useEffect(() => { answerLockRef.current = false; }, [stepIdx]);

  // Cancel any pending advance timeout on unmount (covers Exit during
  // feedback dwell + StrictMode double-mount in dev).
  useEffect(() => () => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  // timer (only when the lesson opts in)
  useEffect(() => {
    if (finished || !timerDuration) return;
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); finish(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [finished, timerDuration]);

  const finish = useCallback(() => {
    setFinished(true);
  }, []);

  const handleAnswer = (ok, evt) => {
    if (answerLockRef.current || stepFeedback) return;
    answerLockRef.current = true;
    setStepFeedback(ok ? 'ok' : 'bad');
    window.hapticTap?.(ok ? 'ok' : 'bad');
    if (ok) {
      const gain = 10 + Math.floor((timerDuration ? timeLeft : 30) / 4);
      setXp(x => x + gain);
      setCorrect(c => c + 1);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) confettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2 - 60);
      setPops(p => [...p, { id: Date.now(), amount: gain }]);
    } else {
      setWrong(w => w + 1);
    }
    // Longer dwell on wrong answers so the player has time to read the
    // correct option + explanation. Also extended on correct so they can see
    // confirmation without feeling rushed.
    const currentStep = lesson?.steps?.[stepIdx];
    const hasExplain = currentStep?.kind === 'choice' && !!currentStep?.explain;
    const okDelay = hasExplain ? 1800 : 1100;
    const badDelay = hasExplain ? 3200 : 1400;
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    advanceTimeoutRef.current = setTimeout(() => {
      advanceTimeoutRef.current = null;
      setStepFeedback(null);
      if (stepIdx + 1 >= lesson.steps.length) finish();
      else setStepIdx(i => i + 1);
    }, ok ? okDelay : badDelay);
  };

  const skipIntro = () => setStepIdx(i => i + 1);

  if (finished) {
    const timeUsed = timerDuration ? Math.max(0, timerDuration - timeLeft) : 0;
    return <LessonResults
      lesson={lesson} xp={xp} correct={correct} wrong={wrong} timeUsed={timeUsed}
      onExit={onExit}
      onFinish={(opts) => onFinish({ xp, correct, wrong, ...(opts || {}) })}
    />;
  }

  // Guard: lesson missing steps or stepIdx past end. Render a friendly exit
  // fallback instead of crashing the whole app on step.kind undefined.
  if (!step) {
    const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--bg-0)', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="card" style={{ padding: 24, textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚠️</div>
          <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 6px' }}>{tr('lesson.unavailable_title', 'Lección no disponible')}</h2>
          <p style={{ color: 'var(--ink-2)', marginBottom: 16, fontSize: 14 }}>{tr('lesson.unavailable_body', 'No se pudo cargar el contenido. Vuelve y prueba de nuevo.')}</p>
          <button className="btn primary" onClick={onExit}>{tr('ui.back', 'Salir')}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'var(--bg-0)',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn .3s ease',
    }}>
      {/* ambient lesson background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 700px 500px at 50% -10%, var(--${lesson.accent}-soft, var(--amber-soft)), transparent 70%)`,
      }} />

      {/* header: progress + timer */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <button className="btn ghost" onClick={onExit} style={{ padding: 8 }} aria-label="Exit">
          <Icon name="close" />
        </button>

        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            height: 6, background: 'var(--bg-2)', borderRadius: 99, overflow: 'hidden',
          }}>
            <div style={{
              width: `${(progress * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--amber), oklch(0.86 0.17 60))',
              boxShadow: '0 0 12px var(--amber-glow)',
              transition: 'width .4s ease',
            }} />
          </div>
          <div style={{
            position: 'absolute', top: -2, left: 0, right: 0,
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)',
            marginTop: 10,
          }}>
            <span>{(window.stUiT ? window.stUiT(`lesson.category.${(lesson.category || '').toLowerCase()}`, lesson.category) : lesson.category)} · {lesson.title}</span>
            <span>{stepIdx + 1} / {lesson.steps.length}</span>
          </div>
        </div>

        {timerDuration && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            borderRadius: 99,
            background: timeLeft < 15 ? 'oklch(0.65 0.18 25 / 0.2)' : 'var(--bg-2)',
            border: '1px solid var(--line-soft)',
            fontFamily: 'var(--f-mono)', fontWeight: 600,
            color: timeLeft < 15 ? 'var(--bad)' : 'var(--ink-1)',
            animation: timeLeft < 10 ? 'flicker 1s infinite' : 'none',
          }}>
            <Icon name="clock" size={14} />
            {String(timeLeft).padStart(2, '0')}s
          </div>
        )}
      </div>

      {/* body */}
      <div ref={containerRef} style={{
        flex: 1, position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
        overflow: 'hidden',
      }}>
        {/* XP pops */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', pointerEvents: 'none' }}>
          {pops.slice(-3).map(p => <XPPop key={p.id} amount={p.amount} />)}
        </div>

        <div key={stepIdx} style={{
          width: '100%', maxWidth: 640,
          animation: 'rise .4s ease',
          transform: stepFeedback === 'bad' ? 'translateX(0)' : 'none',
        }} className={stepFeedback === 'bad' ? 'shake' : ''}>
          {(() => {
            // Phase 4: step components live in js/lesson-steps/*.jsx and
            // self-register in window.stLessonSteps. Adding a new step kind
            // means adding one file — no changes here. We pass every prop the
            // current step kinds use; each component picks what it needs.
            const StepComp = window.stLessonSteps?.get?.(step.kind);
            if (!StepComp) return null;
            return (
              <StepComp
                step={step}
                lesson={lesson}
                onAnswer={handleAnswer}
                onContinue={skipIntro}
              />
            );
          })()}
        </div>

        {/* feedback overlay */}
        {stepFeedback && (
          <div style={{
            position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
            padding: '12px 24px', borderRadius: 99,
            fontWeight: 600, fontSize: 16,
            background: stepFeedback === 'ok' ? 'oklch(0.8 0.16 145 / 0.2)' : 'oklch(0.68 0.19 25 / 0.2)',
            color: stepFeedback === 'ok' ? 'var(--ok)' : 'var(--bad)',
            border: `1px solid ${stepFeedback === 'ok' ? 'var(--ok)' : 'var(--bad)'}`,
            animation: 'pop .3s cubic-bezier(.2,1.4,.3,1) both',
          }}>
            {stepFeedback === 'ok'
              ? (window.stUiT ? window.stUiT('results.nice_pour', 'Nice pour.') : 'Nice pour.')
              : (window.stUiT ? window.stUiT('results.off_spec', 'Off-spec. Try again.') : 'Off-spec. Try again.')}
          </div>
        )}
      </div>

      {/* stats footer */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid var(--line-soft)',
        background: 'var(--bg-1)',
        fontFamily: 'var(--f-mono)', fontSize: 12,
      }}>
        <div style={{ display: 'flex', gap: 18 }}>
          <span style={{ color: 'var(--amber)' }}>⭐ {xp} XP</span>
          <span style={{ color: 'var(--ok)' }}>✓ {correct}</span>
          <span style={{ color: 'var(--ink-3)' }}>✕ {wrong}</span>
        </div>
        <div style={{ color: 'var(--ink-3)' }}>{(window.stUiT ? window.stUiT(`lesson.difficulty.${(lesson.difficulty || '').toLowerCase()}`, lesson.difficulty) : lesson.difficulty)}</div>
      </div>
    </div>
  );
};

// Step components moved to js/lesson-steps/*.jsx (Phase 4). Each kind self-
// registers in window.stLessonSteps; the renderer above looks up by step.kind.
// Adding a new kind = drop a new file in js/lesson-steps/ and cache it in
// sw.js — no changes to this file needed.

// ————— results screen —————
const shareDailyChallenge = async ({ correct, total, dateStr }) => {
  const trLocal = (k, f, p) => (window.stLang?.t ? window.stLang.t(k, p) : (f || k));
  const effectiveDate = dateStr || new Date().toISOString().slice(0, 10);
  const handle = (window.stAuth?.getCurrentUser?.()?.name || '').slice(0, 40);
  const by = handle ? `&by=${encodeURIComponent(handle)}` : '';
  const url = `https://robinn4k.github.io/Stirio/?daily=${effectiveDate}${by}`;
  const text = trLocal('daily.share_text', `Mi Daily de Stirio: ${correct}/${total}. ¿Puedes superarme?`, { score: correct, total });
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Stirio Daily', text, url });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      window.stToast?.show({ kind: 'info', title: trLocal('share.copied', 'Copiado al portapapeles'), ttl: 2000 });
    }
  } catch (e) {
    if (e?.name !== 'AbortError') console.warn('[daily share]', e);
  }
};

const LessonResults = ({ lesson, xp, correct, wrong, timeUsed, onExit, onFinish }) => {
  const total = correct + wrong;
  const acc = total ? Math.round((correct / total) * 100) : 0;
  const perfect = wrong === 0 && correct > 0;
  const isDaily = lesson.category === 'Daily';

  const celebratedRef = useRef(false);
  useEffect(() => {
    if (celebratedRef.current) return;
    if (correct <= 0) return;
    celebratedRef.current = true;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    if (perfect) {
      [0, 200, 400].forEach(d => setTimeout(() => confettiBurst(cx, cy), d));
    } else {
      confettiBurst(cx, cy);
    }
    try { playChord('major'); } catch {}
    window.hapticTap?.(perfect ? 'win' : 'ok');
    const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
    window.stToast?.show({
      kind: perfect ? 'achievement' : 'xp',
      title: perfect
        ? tr('results.toast_perfect', '¡Ronda perfecta!')
        : tr('results.toast_done', '¡Lección completada!'),
      body: `+${xp} XP`,
      ttl: 2800,
    });
  }, [perfect, correct, xp]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'var(--bg-0)',
      display: 'grid', placeItems: 'center',
      padding: '20px 20px calc(40px + env(safe-area-inset-bottom, 0))',
      animation: 'fadeIn .3s ease',
      overflow: 'auto',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 800px 600px at 50% 30%, var(--amber-soft), transparent 60%)',
      }} />
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 72, marginBottom: 8, animation: 'pop .6s cubic-bezier(.2,1.4,.3,1)' }}>
          {perfect ? '💎' : acc >= 70 ? '✨' : '🎯'}
        </div>
        <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 4 }}>
          {(window.stUiT ? window.stUiT('results.lesson_complete', 'Lesson complete') : 'Lesson complete')}
        </div>
        <h1 style={{
          fontFamily: 'var(--f-serif)', fontWeight: 400,
          fontSize: 48, margin: '0 0 6px', lineHeight: 1,
        }}>
          {perfect
            ? (window.stUiT ? window.stUiT('results.flawless', 'Flawless.') : 'Flawless.')
            : acc >= 70
              ? (window.stUiT ? window.stUiT('results.solid', 'Solid pour.') : 'Solid pour.')
              : (window.stUiT ? window.stUiT('results.not_bad', 'Not bad.') : 'Not bad.')}
        </h1>
        <p style={{ color: 'var(--ink-2)', margin: '0 0 28px' }}>
          {lesson.title}
        </p>

        <div className="card" style={{
          padding: 24, marginBottom: 16,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        }}>
          <Stat label="XP" value={`+${xp}`} color="var(--amber)" big />
          <Stat label={(window.stUiT ? window.stUiT('results.stat_correct', 'Correct') : 'Correct')} value={correct} color="var(--ok)" />
          <Stat label={(window.stUiT ? window.stUiT('results.stat_missed', 'Missed') : 'Missed')} value={wrong} color="var(--ink-3)" />
          <Stat label={(window.stUiT ? window.stUiT('results.stat_accuracy', 'Accuracy') : 'Accuracy')} value={`${acc}%`} color="var(--ink-1)" />
        </div>

        {perfect && (
          <div className="card rise-in" style={{
            padding: 16, marginBottom: 16,
            background: 'linear-gradient(90deg, var(--amber-soft), transparent)',
            borderColor: 'oklch(0.82 0.17 75 / 0.4)',
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
          }}>
            <div style={{ fontSize: 32 }}>💎</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{(window.stUiT ? window.stUiT('results.perfect_unlocked', 'Perfect Round unlocked') : 'Perfect Round unlocked')}</div>
              <div style={{ color: 'var(--ink-2)', fontSize: 12 }}>{(window.stUiT ? window.stUiT('results.perfect_bonus', '+50 bonus XP · rare achievement') : '+50 bonus XP · rare achievement')}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
          <button className="btn" onClick={() => onFinish()}>
            <Icon name="home" size={16} /> {(window.stUiT ? window.stUiT('results.home', 'Home') : 'Home')}
          </button>
          <button className="btn primary" onClick={() => onFinish({ next: true })}>
            {(window.stUiT ? window.stUiT('results.next_lesson', 'Next lesson') : 'Next lesson')} <Icon name="arrowR" size={16} />
          </button>
        </div>
        {isDaily && (
          <button
            onClick={() => shareDailyChallenge({ correct, total, dateStr: lesson.dailyDate })}
            style={{
              marginTop: 12, width: '100%', padding: '12px 16px',
              background: 'transparent',
              border: '1px solid var(--amber)',
              color: 'var(--amber)',
              borderRadius: 'var(--r-pill)',
              fontWeight: 600, fontSize: 13,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            ⚔ {(window.stUiT ? window.stUiT('daily.share_cta', 'Desafía a alguien') : 'Desafía a alguien')}
          </button>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, color, big }) => (
  <div>
    <div style={{
      fontSize: big ? 32 : 24, fontWeight: 600, color,
      fontFamily: 'var(--f-mono)',
      textShadow: big ? `0 0 20px ${color}` : 'none',
    }}>{value}</div>
    <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
  </div>
);

Object.assign(window, { LessonPlayer });
