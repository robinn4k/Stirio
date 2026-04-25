// Stirio — LessonPlayer step: 'timing'
//
// Stopwatch-driven timing game: tap "Start", let the seconds roll, tap "Pour
// now" when you think you've hit step.target ± step.tolerance.

(() => {
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
            {(window.stUiT ? window.stUiT('lesson.start_shaking', 'Start shaking') : 'Start shaking')}
          </button>
        ) : (
          <button className="btn primary" onClick={() => {
            const ok = Math.abs(elapsed - step.target) <= step.tolerance;
            onAnswer(ok);
          }} style={{ padding: '14px 30px' }}>
            {(window.stUiT ? window.stUiT('lesson.pour_now', 'Pour now') : 'Pour now')}
          </button>
        )}
        <div style={{ marginTop: 16, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
          {(window.stUiT ? window.stUiT('lesson.shake_hint', 'shake hard · aim for peak foam') : 'shake hard · aim for peak foam')}
        </div>
      </div>
    );
  };

  if (window.stLessonSteps) window.stLessonSteps.register('timing', TimingStep);
})();
