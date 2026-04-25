// Stirio — LessonPlayer step: 'choice'
//
// Single-choice multiple choice (4 options). Reveal logic on pick: green on
// the correct answer, red on a wrong pick, neutral on untouched options.

(() => {
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

  if (window.stLessonSteps) window.stLessonSteps.register('choice', ChoiceStep);
})();
