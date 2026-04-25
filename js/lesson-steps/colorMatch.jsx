// Stirio — LessonPlayer step: 'colorMatch'
//
// Pick the swatch that matches the base color. step.options is an array of
// CSS color strings; step.correct is the index of the right one.

(() => {
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

  if (window.stLessonSteps) window.stLessonSteps.register('colorMatch', ColorMatchStep);
})();
