// Stirio — LessonPlayer step: 'multi'
//
// Multi-select checkbox. User must pick exactly N options matching step.correct.
// "Lock it in" button enables once N picks are selected.

(() => {
  const MultiSelectStep = ({ step, onAnswer }) => {
    const [picks, setPicks] = useState([]);
    const toggle = (opt) => setPicks(p => p.includes(opt) ? p.filter(x => x !== opt) : [...p, opt]);
    // Defensive: malformed lesson data (missing/empty `correct`) used to crash
    // with "Cannot read properties of undefined (reading 'length')". Treat as
    // unanswerable and surface the problem instead of blanking the player.
    const correctList = Array.isArray(step?.correct) ? step.correct : [];
    const need = correctList.length;
    const ready = need > 0 && picks.length === need;
    if (need === 0) {
      const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
      return (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Prompt text={step?.prompt || tr('lesson.step_broken', 'Paso no disponible')} />
          <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>
            {tr('lesson.step_broken_body', 'Esta pregunta tiene un problema de datos. Salta a la siguiente.')}
          </p>
          <button className="btn" onClick={() => onAnswer(false)} style={{ marginTop: 12 }}>
            {tr('ui.skip', 'Saltar')}
          </button>
        </div>
      );
    }
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
              const ok = correctList.every(c => picks.includes(c)) && picks.length === correctList.length;
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
