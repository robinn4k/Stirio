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

  const step = lesson?.steps?.[stepIdx];
  const totalSteps = lesson?.steps?.length || 0;
  const progress = totalSteps ? stepIdx / totalSteps : 0;

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
    if (stepFeedback) return;
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
    setTimeout(() => {
      setStepFeedback(null);
      if (stepIdx + 1 >= lesson.steps.length) finish();
      else setStepIdx(i => i + 1);
    }, ok ? okDelay : badDelay);
  };

  const skipIntro = () => setStepIdx(i => i + 1);

  if (finished) {
    const timeUsed = timerDuration ? Math.max(0, timerDuration - timeLeft) : 0;
    return <LessonResults lesson={lesson} xp={xp} correct={correct} wrong={wrong} timeUsed={timeUsed} onExit={onExit} onFinish={() => onFinish({ xp, correct, wrong })} />;
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
      position: 'fixed', inset: 0, zIndex: 50,
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
            <span>{lesson.category} · {lesson.title}</span>
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
          {step.kind === 'intro' && <IntroStep step={step} lesson={lesson} onContinue={skipIntro} />}
          {step.kind === 'multi' && <MultiSelectStep step={step} onAnswer={handleAnswer} />}
          {step.kind === 'ratio' && <RatioStep step={step} onAnswer={handleAnswer} />}
          {step.kind === 'choice' && <ChoiceStep step={step} onAnswer={handleAnswer} />}
          {step.kind === 'earTrain' && <EarTrainStep step={step} onAnswer={handleAnswer} />}
          {step.kind === 'cutWords' && <CutWordsStep step={step} onAnswer={handleAnswer} />}
          {step.kind === 'colorMatch' && <ColorMatchStep step={step} onAnswer={handleAnswer} />}
          {step.kind === 'timing' && <TimingStep step={step} onAnswer={handleAnswer} />}
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
        <div style={{ color: 'var(--ink-3)' }}>{lesson.difficulty}</div>
      </div>
    </div>
  );
};

// ————— step components —————

const IntroStep = ({ step, lesson, onContinue }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 64, marginBottom: 16, filter: 'drop-shadow(0 8px 20px var(--amber-glow))' }}>{lesson.emoji}</div>
    <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 8 }}>
      {lesson.category}{Number.isFinite(lesson._timed) ? ` · ${lesson._timed}s` : ''}
    </div>
    <h1 style={{
      fontFamily: 'var(--f-serif)', fontWeight: 400,
      fontSize: 'clamp(36px, 6vw, 56px)',
      margin: '0 0 16px', lineHeight: 1.05,
    }}>
      {step.title}
    </h1>
    <p style={{ color: 'var(--ink-2)', fontSize: 17, lineHeight: 1.5, maxWidth: 520, margin: '0 auto 20px' }}>
      {step.body}
    </p>
    {step.fact && (
      <div style={{
        display: 'inline-block',
        padding: '12px 18px',
        borderRadius: 'var(--r-md)',
        background: 'var(--bg-2)',
        border: '1px dashed var(--line)',
        fontFamily: 'var(--f-mono)', fontSize: 12,
        color: 'var(--ink-2)',
        maxWidth: 480, textAlign: 'left',
      }}>
        <span style={{ color: 'var(--amber)' }}>// did you know</span><br />
        {step.fact}
      </div>
    )}
    <div style={{ marginTop: 32 }}>
      <button className="btn primary" onClick={onContinue} style={{ padding: '14px 28px', fontSize: 15 }}>
        Let's go <Icon name="arrowR" size={16} />
      </button>
    </div>
  </div>
);

const ChoiceStep = ({ step, onAnswer }) => {
  const [selected, setSelected] = useState(null);
  const pick = (i, ev) => {
    if (selected !== null) return;
    if (ev && ev.currentTarget && ev.currentTarget.blur) ev.currentTarget.blur();
    setSelected(i);
    onAnswer(i === step.correct);
  };
  return (
    <div>
      <Prompt text={step.prompt} />
      <div style={{ display: 'grid', gap: 10 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrectAns = selected !== null && i === step.correct;
          // Reveal after a pick: green on the correct answer, red on a wrong
          // pick. Untouched options stay neutral so focus goes to the ones
          // that matter.
          let bg = 'var(--bg-2)';
          let borderColor = 'var(--line-soft)';
          let badgeBg = 'var(--bg-3)';
          let badgeColor = 'var(--ink-2)';
          if (selected !== null) {
            if (isCorrectAns) {
              bg = 'color-mix(in oklch, var(--ok) 22%, var(--bg-2))';
              borderColor = 'var(--ok)';
              badgeBg = 'var(--ok)';
              badgeColor = 'var(--bg-0)';
            } else if (isSelected) {
              bg = 'color-mix(in oklch, var(--bad) 25%, var(--bg-2))';
              borderColor = 'var(--bad)';
              badgeBg = 'var(--bad)';
              badgeColor = 'var(--bg-0)';
            }
          }
          return (
            <button
              key={i}
              onClick={(ev) => pick(i, ev)}
              disabled={selected !== null}
              className="choice-btn"
              style={{
                padding: '16px 18px',
                textAlign: 'left',
                background: bg,
                border: `1px solid ${borderColor}`,
                borderRadius: 'var(--r-md)',
                fontSize: 15,
                transition: 'all .15s',
                cursor: selected !== null ? 'default' : 'pointer',
              }}
            >
              <span style={{
                display: 'inline-flex', width: 24, height: 24, marginRight: 12,
                borderRadius: 6, background: badgeBg,
                placeItems: 'center', justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'var(--f-mono)', fontSize: 11, color: badgeColor,
              }}>
                {selected === null
                  ? String.fromCharCode(65 + i)
                  : isCorrectAns ? '✓' : isSelected ? '✕' : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && step.explain && (
        <div style={{
          marginTop: 14,
          padding: '12px 14px',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-2)',
          border: '1px dashed var(--line)',
          fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)',
          animation: 'rise .3s ease',
        }}>
          <span style={{ color: 'var(--amber)', fontFamily: 'var(--f-mono)', fontSize: 11, marginRight: 6 }}>
            {(window.stUiT ? window.stUiT('lesson.explain', '// por qué') : '// por qué')}
          </span>
          {step.explain}
        </div>
      )}
    </div>
  );
};

const MultiSelectStep = ({ step, onAnswer }) => {
  const [picks, setPicks] = useState([]);
  const toggle = (opt) => setPicks(p => p.includes(opt) ? p.filter(x => x !== opt) : [...p, opt]);
  const need = step.correct.length;
  const ready = picks.length === need;
  return (
    <div>
      <Prompt text={step.prompt} subtitle={step.hint && `hint · ${step.hint}`} />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10, marginBottom: 18,
      }}>
        {step.options.map((opt, i) => {
          const picked = picks.includes(opt);
          return (
            <button
              key={i}
              onClick={(ev) => { if (ev.currentTarget.blur) ev.currentTarget.blur(); toggle(opt); }}
              style={{
                padding: '14px 12px',
                borderRadius: 'var(--r-md)',
                background: picked ? 'var(--amber-soft)' : 'var(--bg-2)',
                border: `1px solid ${picked ? 'var(--amber)' : 'var(--line-soft)'}`,
                color: picked ? 'var(--amber)' : 'var(--ink-1)',
                fontSize: 14, fontWeight: picked ? 600 : 400,
                transition: 'all .15s',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: 'center' }}>
        <button
          className="btn primary"
          disabled={!ready}
          onClick={() => {
            const ok = step.correct.every(c => picks.includes(c)) && picks.length === step.correct.length;
            onAnswer(ok);
          }}
          style={{
            opacity: ready ? 1 : 0.4,
            pointerEvents: ready ? 'auto' : 'none',
            padding: '12px 24px',
          }}
        >
          Lock it in ({picks.length}/{need})
        </button>
      </div>
    </div>
  );
};

const RatioStep = ({ step, onAnswer }) => {
  const keys = Object.keys(step.targets);
  const [vals, setVals] = useState(() => Object.fromEntries(keys.map(k => [k, 20])));
  const colors = ['var(--amber)', 'var(--berry)', 'var(--violet)', 'var(--cyan)'];
  const total = keys.reduce((s, k) => s + vals[k], 0);
  return (
    <div>
      <Prompt text={step.prompt} />
      {/* visual glass */}
      <div style={{
        width: 160, height: 200,
        margin: '0 auto 24px',
        position: 'relative',
        borderRadius: '8px 8px 80px 80px / 8px 8px 40px 40px',
        border: '2px solid oklch(0.9 0.01 60 / 0.5)',
        background: 'oklch(0.25 0.02 60 / 0.3)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${Math.min(total, 100)}%`,
          display: 'flex', flexDirection: 'column-reverse',
          transition: 'height .3s',
        }}>
          {keys.map((k, i) => (
            <div key={k} style={{
              height: `${(vals[k] / total) * 100}%`,
              background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]})`,
              opacity: 0.85,
              boxShadow: 'inset 0 6px 10px rgba(255,255,255,0.1)',
              transition: 'height .3s',
            }} />
          ))}
        </div>
        {/* rim highlight */}
        <div style={{ position: 'absolute', top: 4, left: 8, right: 8, height: 3, background: 'linear-gradient(90deg, transparent, white, transparent)', opacity: 0.25, borderRadius: 2 }} />
      </div>
      <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
        {keys.map((k, i) => (
          <div key={k}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'var(--f-mono)', fontSize: 12 }}>
              <span style={{ color: colors[i] }}>● {k}</span>
              <span style={{ color: 'var(--ink-2)' }}>{vals[k]}ml</span>
            </div>
            <input
              type="range" min="0" max="60" value={vals[k]}
              onChange={e => setVals(v => ({ ...v, [k]: +e.target.value }))}
              style={{ width: '100%', accentColor: colors[i] }}
            />
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <button className="btn primary" onClick={() => {
          const ok = keys.every(k => Math.abs(vals[k] - step.targets[k]) <= step.tolerance);
          onAnswer(ok);
        }}>
          Pour it
        </button>
      </div>
    </div>
  );
};

const EarTrainStep = ({ step, onAnswer }) => {
  const [played, setPlayed] = useState(false);
  return (
    <div style={{ textAlign: 'center' }}>
      <Prompt text={step.prompt} />
      <button
        onClick={() => { playChord(step.chord); setPlayed(true); }}
        style={{
          width: 120, height: 120, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--cyan-soft), transparent 70%), var(--bg-2)',
          border: '2px solid var(--cyan)',
          color: 'var(--cyan)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 40px oklch(0.78 0.13 200 / 0.4)',
          animation: !played ? 'pulseGlow 2s infinite' : 'none',
        }}
      >
        <Icon name="play" size={36} />
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 340, margin: '0 auto' }}>
        <button className="btn" style={{ padding: 18 }} onClick={() => onAnswer(step.chord === 'major')}>
          <span style={{ fontFamily: 'var(--f-serif)', fontSize: 24 }}>{(window.stUiT ? window.stUiT('lesson.chord_major', 'Major') : 'Major')}</span>
        </button>
        <button className="btn" style={{ padding: 18 }} onClick={() => onAnswer(step.chord === 'minor')}>
          <span style={{ fontFamily: 'var(--f-serif)', fontSize: 24 }}>{(window.stUiT ? window.stUiT('lesson.chord_minor', 'minor') : 'minor')}</span>
        </button>
      </div>
      <div style={{ marginTop: 18, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
        {played ? 'replay ↻ or guess' : 'tap to listen'}
      </div>
    </div>
  );
};

const CutWordsStep = ({ step, onAnswer }) => {
  const words = useMemo(() => step.sentence.split(' ').map((w, i) => ({ w, i, clean: w.replace(/[.,]/g, '').toLowerCase() })), [step.sentence]);
  const [killed, setKilled] = useState(new Set());
  const toggle = (i) => setKilled(s => {
    const n = new Set(s);
    if (n.has(i)) n.delete(i); else n.add(i);
    return n;
  });
  return (
    <div>
      <Prompt text={step.prompt} />
      <div style={{
        padding: 22,
        background: 'var(--bg-2)',
        borderRadius: 'var(--r-md)',
        fontFamily: 'var(--f-serif)', fontSize: 22, lineHeight: 1.5,
        marginBottom: 20,
        border: '1px solid var(--line-soft)',
      }}>
        {words.map((word, i) => {
          const isKilled = killed.has(i);
          return (
            <span key={i}>
              <span
                onClick={() => toggle(i)}
                style={{
                  cursor: 'pointer',
                  textDecoration: isKilled ? 'line-through' : 'none',
                  textDecorationColor: 'var(--bad)',
                  textDecorationThickness: '2px',
                  opacity: isKilled ? 0.35 : 1,
                  color: isKilled ? 'var(--ink-3)' : 'var(--ink-0)',
                  padding: '2px 1px',
                  borderRadius: 3,
                  transition: 'all .15s',
                }}
              >{word.w}</span>
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
      <div style={{ textAlign: 'center' }}>
        <button className="btn primary" onClick={() => {
          const killedWords = [...killed].map(i => words[i].clean);
          const expected = step.kill.map(w => w.toLowerCase());
          const hits = expected.filter(w => killedWords.includes(w)).length;
          const ok = hits >= expected.length - 1 && killedWords.length <= expected.length + 1;
          onAnswer(ok);
        }}>
          Ship it
        </button>
      </div>
    </div>
  );
};

const ColorMatchStep = ({ step, onAnswer }) => (
  <div style={{ textAlign: 'center' }}>
    <Prompt text={step.prompt} />
    <div style={{
      width: 140, height: 140, borderRadius: '50%',
      background: step.base,
      margin: '0 auto 28px',
      boxShadow: `0 0 50px ${step.base}`,
    }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, maxWidth: 420, margin: '0 auto' }}>
      {step.options.map((c, i) => (
        <button key={i} onClick={() => onAnswer(i === step.correct)} style={{
          aspectRatio: 1,
          borderRadius: 'var(--r-md)',
          background: c,
          border: '2px solid var(--line)',
          cursor: 'pointer',
          transition: 'transform .15s',
        }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
      ))}
    </div>
  </div>
);

const TimingStep = ({ step, onAnswer }) => {
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!started) return;
    const t0 = Date.now();
    const r = setInterval(() => setElapsed(((Date.now() - t0) / 1000)), 50);
    return () => clearInterval(r);
  }, [started]);
  return (
    <div style={{ textAlign: 'center' }}>
      <Prompt text={step.prompt} />
      <div style={{
        fontFamily: 'var(--f-mono)', fontSize: 72, fontWeight: 600,
        color: 'var(--amber)',
        textShadow: '0 0 30px var(--amber-glow)',
        margin: '8px 0 24px',
        animation: started ? 'pulseGlow 0.4s infinite' : 'none',
      }}>
        {elapsed.toFixed(1)}
      </div>
      {!started ? (
        <button className="btn primary" onClick={() => setStarted(true)} style={{ padding: '14px 30px' }}>
          Start shaking
        </button>
      ) : (
        <button className="btn primary" onClick={() => {
          const ok = Math.abs(elapsed - step.target) <= step.tolerance;
          onAnswer(ok);
        }} style={{ padding: '14px 30px' }}>
          Pour now
        </button>
      )}
      <div style={{ marginTop: 16, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
        shake hard · aim for peak foam
      </div>
    </div>
  );
};

// ————— results screen —————
const LessonResults = ({ lesson, xp, correct, wrong, timeUsed, onExit, onFinish }) => {
  const total = correct + wrong;
  const acc = total ? Math.round((correct / total) * 100) : 0;
  const perfect = wrong === 0 && correct > 0;

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
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'var(--bg-0)',
      display: 'grid', placeItems: 'center', padding: 20,
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
          <button className="btn" onClick={onFinish}>
            <Icon name="home" size={16} /> {(window.stUiT ? window.stUiT('results.home', 'Home') : 'Home')}
          </button>
          <button className="btn primary" onClick={onFinish}>
            {(window.stUiT ? window.stUiT('results.next_lesson', 'Next lesson') : 'Next lesson')} <Icon name="arrowR" size={16} />
          </button>
        </div>
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
