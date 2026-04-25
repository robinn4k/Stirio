// Stirio — LessonPlayer step: 'multi'
//
// Multi-select checkbox. User must pick exactly N options matching step.correct.
// "Lock it in" button enables once N picks are selected.

(() => {
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
            {(window.stUiT ? window.stUiT('lesson.lock_in', 'Lock it in') : 'Lock it in')} ({picks.length}/{need})
          </button>
        </div>
      </div>
    );
  };

  if (window.stLessonSteps) window.stLessonSteps.register('multi', MultiSelectStep);
})();
