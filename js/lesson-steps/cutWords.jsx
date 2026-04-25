// Stirio — LessonPlayer step: 'cutWords'
//
// Strike-through word picker. Tap to mark words for removal; passes if killed
// set matches step.kill within 1 word slack.

(() => {
  const CutWordsStep = ({ step, onAnswer }) => {
    const words = useMemo(
      () => step.sentence.split(' ').map((w, i) => ({ w, i, clean: w.replace(/[.,]/g, '').toLowerCase() })),
      [step.sentence]
    );
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

  if (window.stLessonSteps) window.stLessonSteps.register('cutWords', CutWordsStep);
})();
