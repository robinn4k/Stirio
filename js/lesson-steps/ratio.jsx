// Stirio — LessonPlayer step: 'ratio'
//
// Pour-the-ratio interaction with a glass viz + sliders per ingredient.
// Validates each picked value within step.tolerance of step.targets[k].

(() => {
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
                height: `${total > 0 ? (vals[k] / total) * 100 : 0}%`,
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

  if (window.stLessonSteps) window.stLessonSteps.register('ratio', RatioStep);
})();
