// Stirio — Lesson Player (the 60-second core)
// Depends on: ui.jsx (Icon, Prompt, playChord, confettiBurst)

const LessonPlayer = ({ lesson, onExit, onFinish }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [xp, setXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [stepFeedback, setStepFeedback] = useState(null); // 'ok' | 'bad' | null
  const [pops, setPops] = useState([]);
  const [finished, setFinished] = useState(false);
  const containerRef = useRef(null);

  const step = lesson.steps[stepIdx];
  const progress = stepIdx / lesson.steps.length;

  // timer
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); finish(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [finished]);

  const finish = useCallback(() => {
    setFinished(true);
  }, []);

  const handleAnswer = (ok, evt) => {
    if (stepFeedback) return;
    setStepFeedback(ok ? 'ok' : 'bad');
    if (ok) {
      const gain = 10 + Math.floor(timeLeft / 4);
      setXp(x => x + gain);
      setCorrect(c => c + 1);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) confettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2 - 60);
      setPops(p => [...p, { id: Date.now(), amount: gain }]);
    } else {
      setWrong(w => w + 1);
    }
    setTimeout(() => {
      setStepFeedback(null);
      if (stepIdx + 1 >= lesson.steps.length) finish();
      else setStepIdx(i => i + 1);
    }, ok ? 900 : 1100);
  };

  const skipIntro = () => setStepIdx(i => i + 1);

  if (finished) {
    return <LessonResults lesson={lesson} xp={xp} correct={correct} wrong={wrong} timeUsed={60 - timeLeft} onExit={onExit} onFinish={() => onFinish({ xp, correct, wrong })} />;
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
            {stepFeedback === 'ok' ? 'Nice pour.' : 'Off-spec. Try again.'}
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
      {lesson.category} · 60s lesson
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

const ChoiceStep = ({ step, onAnswer }) => (
  <div>
    <Prompt text={step.prompt} />
    <div style={{ display: 'grid', gap: 10 }}>
      {step.options.map((opt, i) => (
        <button
          key={i}
          onClick={(e) => onAnswer(i === step.correct, e)}
          className="choice-btn"
          style={{
            padding: '16px 18px',
            textAlign: 'left',
            background: 'var(--bg-2)',
            border: '1px solid var(--line-soft)',
            borderRadius: 'var(--r-md)',
            fontSize: 15,
            transition: 'all .15s',
          }}
        >
          <span style={{
            display: 'inline-flex', width: 24, height: 24, marginRight: 12,
            borderRadius: 6, background: 'var(--bg-3)',
            placeItems: 'center', justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)',
          }}>{String.fromCharCode(65 + i)}</span>
          {opt}
        </button>
      ))}
    </div>
  </div>
);

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
              onClick={() => toggle(opt)}
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
          <span style={{ fontFamily: 'var(--f-serif)', fontSize: 24 }}>Major</span>
        </button>
        <button className="btn" style={{ padding: 18 }} onClick={() => onAnswer(step.chord === 'minor')}>
          <span style={{ fontFamily: 'var(--f-serif)', fontSize: 24 }}>minor</span>
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

  useEffect(() => {
    if (perfect) {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      [0, 200, 400].forEach(d => setTimeout(() => confettiBurst(cx, cy), d));
    }
  }, [perfect]);

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
          Lesson complete
        </div>
        <h1 style={{
          fontFamily: 'var(--f-serif)', fontWeight: 400,
          fontSize: 48, margin: '0 0 6px', lineHeight: 1,
        }}>
          {perfect ? 'Flawless.' : acc >= 70 ? 'Solid pour.' : 'Not bad.'}
        </h1>
        <p style={{ color: 'var(--ink-2)', margin: '0 0 28px' }}>
          {lesson.title}
        </p>

        <div className="card" style={{
          padding: 24, marginBottom: 16,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        }}>
          <Stat label="XP" value={`+${xp}`} color="var(--amber)" big />
          <Stat label="Correct" value={correct} color="var(--ok)" />
          <Stat label="Missed" value={wrong} color="var(--ink-3)" />
          <Stat label="Accuracy" value={`${acc}%`} color="var(--ink-1)" />
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
              <div style={{ fontWeight: 600, fontSize: 14 }}>Perfect Round unlocked</div>
              <div style={{ color: 'var(--ink-2)', fontSize: 12 }}>+50 bonus XP · rare achievement</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
          <button className="btn" onClick={onExit}>
            <Icon name="home" size={16} /> Home
          </button>
          <button className="btn primary" onClick={onFinish}>
            Next lesson <Icon name="arrowR" size={16} />
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
