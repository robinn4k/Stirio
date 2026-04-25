// Stirio — LessonPlayer step: 'intro'
//
// Splash card shown at the start of a lesson. Receives the lesson object so it
// can render its emoji + category + an optional "did you know" fact box.
// Wrapped in an IIFE so the local IntroStep const stays out of the shared
// Babel script scope (avoids redeclaration collisions across step files).

(() => {
  const IntroStep = ({ step, lesson, onContinue }) => {
    const tr = (k, f, p) => (window.stUiT ? window.stUiT(k, f, p) : (f || k));
    const categoryLabel = tr(`lesson.category.${(lesson.category || '').toLowerCase()}`, lesson.category);
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16, filter: 'drop-shadow(0 8px 20px var(--amber-glow))' }}>{lesson.emoji}</div>
        {lesson.challengedBy && (
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            marginBottom: 12,
            borderRadius: 'var(--r-pill)',
            background: 'var(--amber-soft)',
            border: '1px solid var(--amber)',
            color: 'var(--amber)',
            fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.04em',
          }}>
            ⚔ {window.stLang && window.stLang.t
              ? window.stLang.t('daily.challenged_by', { name: lesson.challengedBy })
              : `Retado por ${lesson.challengedBy}`}
          </div>
        )}
        <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 8 }}>
          {categoryLabel}{Number.isFinite(lesson._timed) ? ` · ${lesson._timed}s` : ''}
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
            <span style={{ color: 'var(--amber)' }}>{tr('lesson.did_you_know', '// did you know')}</span><br />
            {step.fact}
          </div>
        )}
        <div style={{ marginTop: 32 }}>
          <button className="btn primary" onClick={onContinue} style={{ padding: '14px 28px', fontSize: 15 }}>
            {tr('lesson.lets_go', 'Let’s go')} <Icon name="arrowR" size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (window.stLessonSteps) window.stLessonSteps.register('intro', IntroStep);
})();
