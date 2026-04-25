// Stirio — LessonPlayer step: 'earTrain'
//
// Audio stimulus: tap to play a chord, then identify Major vs minor.
// Uses playChord() from ui.jsx (shared scope).

(() => {
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

  if (window.stLessonSteps) window.stLessonSteps.register('earTrain', EarTrainStep);
})();
