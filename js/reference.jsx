// ═══════════════════════════════════════════════════════════
// reference.jsx — Academia & Fichas IBA/Difford's
// Pantallas grandes con datos reales del repo Stirio.
// ═══════════════════════════════════════════════════════════

const { useState: useStateRef, useMemo: useMemoRef } = React;

// ═══════════════ ACADEMIA ═══════════════

// ── Progreso de Academia (localStorage) ──
const ACADEMY_PROGRESS_KEY = 'cq_academy_progress';
const loadAcademyProgress = () => {
  try { return JSON.parse(localStorage.getItem(ACADEMY_PROGRESS_KEY)) || {}; }
  catch { return {}; }
};
const levelCompleted = (progress, level) => {
  const lp = progress[level.id];
  if (!lp) return false;
  return (level.lessons || []).every((_, i) => lp.lessons && lp.lessons[i]?.passed);
};

const AcademyScreen = ({ onBack, onStartAcademyLesson, onStartRound }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const levels = (window.getAcademyLevels && window.getAcademyLevels()) || [];
  const [openLevel, setOpenLevel] = useStateRef(null);
  const progress = loadAcademyProgress();

  // Si academy_data.js aún no está cargado, mostramos loader + polling
  const [retries, setRetries] = useStateRef(0);
  React.useEffect(() => {
    if (levels.length === 0 && retries < 20) {
      const t = setTimeout(() => setRetries(r => r + 1), 200);
      return () => clearTimeout(t);
    }
  }, [levels.length, retries]);

  const completed = levels.filter(l => levelCompleted(progress, l)).length;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="btn" style={{ padding: 8, width: 40, height: 40, borderRadius: '50%' }}>
          <Icon name="arrowL" size={16} />
        </button>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 10 }}>{tr('academy.eyebrow', 'Aprende')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 34, margin: 0, lineHeight: 1 }}>{tr('academy.title_ui', 'Cocktail Academy')}</h1>
        </div>
      </div>

      {/* Hero con progreso real */}
      <div style={{ padding: '16px 24px 24px' }}>
        <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2))', borderColor: 'oklch(0.82 0.17 75 / 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 10 }}>
            <div>
              <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)' }}>{tr('academy.progress', 'Progreso')}</div>
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: 28, lineHeight: 1 }}>
                {completed} <span style={{ color: 'var(--ink-3)', fontSize: 18 }}>/ {levels.length || 6} niveles</span>
              </div>
            </div>
            <div style={{ fontSize: 42 }}>🎓</div>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden' }}>
            <div style={{ width: `${levels.length ? (completed / levels.length) * 100 : 0}%`, height: '100%', background: 'var(--amber)', transition: 'width .3s' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.4 }}>
            {tr('academy.intro', '6 niveles con teoría, consejos y prácticas reales. Completa las lecciones de un nivel para desbloquear el siguiente.')}
          </div>
        </div>
      </div>

      {/* Niveles */}
      <div style={{ padding: '0 24px', display: 'grid', gap: 12 }}>
        {levels.length === 0 && (
          <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-2)' }}>
            {tr('academy.loading', 'Cargando Academia…')}
          </div>
        )}
        {levels.map((level, i) => {
          const prevDone = i === 0 || levelCompleted(progress, levels[i - 1]);
          const locked = !prevDone;
          const lessonCount = (level.lessons || []).length;
          const doneCount = (progress[level.id]?.lessons || []).filter(l => l?.passed).length;
          return (
            <LevelCard key={level.id}
              level={level}
              index={i}
              locked={locked}
              progress={{ done: doneCount, total: lessonCount }}
              onOpen={() => !locked && setOpenLevel(level)}
            />
          );
        })}
      </div>

      {openLevel && (
        <LevelDetail
          level={openLevel}
          progress={progress[openLevel.id] || { lessons: [], practices: {} }}
          onClose={() => setOpenLevel(null)}
          onStartLesson={(idx) => { setOpenLevel(null); onStartAcademyLesson(openLevel.id, idx); }}
          onStartPractice={(roundId) => { setOpenLevel(null); onStartRound({ roundId, levelId: openLevel.id }); }}
        />
      )}
    </div>
  );
};

const LevelCard = ({ level, index, locked, progress, onOpen }) => {
  const _t = (k, f) => (window.stLang && window.stLang.t) ? window.stLang.t(k) : (f || k);
  const title = _t(level.key);
  const desc = _t(level.descKey);
  return (
    <button onClick={onOpen} className="card" style={{
      padding: 18, textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer',
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
      borderLeft: `4px solid ${level.color}`,
      opacity: locked ? 0.55 : 1,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `linear-gradient(135deg, ${level.color}, oklch(0.3 0.05 60))`,
        display: 'grid', placeItems: 'center',
        fontSize: 26,
        boxShadow: `0 8px 20px ${level.color}33`,
      }}>{level.icon}</div>
      <div>
        <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginBottom: 2 }}>
          Nivel {String(index).padStart(2, '0')} · {progress.done}/{progress.total} lecciones
        </div>
        <div style={{ fontFamily: 'var(--f-serif)', fontSize: 22, lineHeight: 1.1, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.3 }}>{desc}</div>
      </div>
      <div>
        {locked
          ? <Icon name="lock" size={18} />
          : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--amber)', display: 'grid', placeItems: 'center', color: 'var(--bg-0)' }}>
              <Icon name="play" size={14} />
            </div>
        }
      </div>
    </button>
  );
};

const LevelDetail = ({ level, progress, onClose, onStartLesson, onStartPractice }) => {
  const _t = (k, f) => (window.stLang && window.stLang.t) ? window.stLang.t(k) : (f || k);
  const sequence = level.sequence || [];
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 55,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
      display: 'grid', placeItems: 'end center',
      animation: 'fadeIn .25s',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 560, maxHeight: '86dvh',
        background: 'var(--bg-1)',
        borderRadius: '24px 24px 0 0',
        padding: 24, overflowY: 'auto',
        borderTop: `4px solid ${level.color}`,
        animation: 'slideUp .35s cubic-bezier(.2,1.1,.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--line)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: `linear-gradient(135deg, ${level.color}, oklch(0.3 0.05 60))`,
            display: 'grid', placeItems: 'center', fontSize: 32,
          }}>{level.icon}</div>
          <div>
            <div className="mono caps" style={{ fontSize: 10, color: level.color, marginBottom: 2 }}>Nivel {level.id}</div>
            <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 26, margin: 0, lineHeight: 1 }}>{_t(level.key)}</h2>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.3 }}>{_t(level.descKey)}</div>
          </div>
        </div>

        <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 10 }}>
          {tr('academy.level_route', 'Ruta del nivel')}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {sequence.map((item, i) => {
            if (item.type === 'lesson') {
              const lesson = level.lessons[item.index];
              if (!lesson) return null;
              const passed = progress.lessons?.[item.index]?.passed;
              return (
                <button key={`${i}-lesson-${item.index}`} onClick={() => onStartLesson(item.index)} className="card" style={{
                  padding: 14, textAlign: 'left', cursor: 'pointer',
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
                  background: 'var(--bg-2)',
                }}>
                  <div style={{ fontSize: 22 }}>{passed ? '✅' : '📚'}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--f-serif)', fontSize: 15, lineHeight: 1.1 }}>{_t(lesson.key)}</div>
                    <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 3 }}>
                      {window.stLang && window.stLang.t
                        ? window.stLang.t('academy.lesson_label', { cards: lesson.cards?.length || 0, questions: lesson.questions?.length || 0 })
                        : `Lección · ${lesson.cards?.length || 0} tarjetas · ${lesson.questions?.length || 0} preguntas`}
                    </div>
                  </div>
                  <Icon name="arrowR" size={14} />
                </button>
              );
            }
            if (item.type === 'practice') {
              const passed = progress.practices?.[item.roundId];
              return (
                <button key={`${i}-practice-${item.roundId}`} onClick={() => onStartPractice(item.roundId)} className="card" style={{
                  padding: 14, textAlign: 'left', cursor: 'pointer',
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
                  background: 'var(--bg-2)', borderLeft: `3px solid ${level.color}`,
                }}>
                  <div style={{ fontSize: 22 }}>{passed ? '🏆' : '⚡'}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--f-serif)', fontSize: 15, lineHeight: 1.1 }}>
                      {window.stLang && window.stLang.t
                        ? window.stLang.t('academy.practice_label', { id: item.roundId })
                        : `Práctica · Ronda ${item.roundId}`}
                    </div>
                    <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 3 }}>
                      {window.stLang && window.stLang.t ? window.stLang.t('academy.practice_sublabel') : 'Quiz de refuerzo'}
                    </div>
                  </div>
                  <Icon name="arrowR" size={14} />
                </button>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

// ═══════════════ FICHAS ═══════════════

const FichasScreen = ({ onBack, onOpenFicha }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const fichas = window.ALL_FICHAS || [];
  const [q, setQ] = useStateRef('');
  const [cat, setCat] = useStateRef('all');

  const categories = useMemoRef(() => {
    const cats = new Set(fichas.map(f => f.category));
    return ['all', ...Array.from(cats)];
  }, [fichas]);

  const filtered = useMemoRef(() => {
    const query = q.toLowerCase().trim();
    return fichas.filter(f => {
      if (cat !== 'all' && f.category !== cat) return false;
      if (!query) return true;
      return (
        f.name.toLowerCase().includes(query) ||
        (f.ingredients || []).some(i => i.toLowerCase().includes(query))
      );
    });
  }, [fichas, q, cat]);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', paddingBottom: 120 }}>
      <div style={{ padding: '20px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="btn" style={{ padding: 8, width: 40, height: 40, borderRadius: '50%' }}>
          <Icon name="arrowL" size={16} />
        </button>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 10 }}>{tr('ficha.reference', 'Reference')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 30, margin: 0, lineHeight: 1 }}>{tr('ficha.fichas_iba', 'Fichas IBA')}</h1>
        </div>
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
          {filtered.length}/{fichas.length}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 24px 10px' }}>
        <div style={{ position: 'relative' }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={tr('fichas.search_placeholder', 'Buscar cóctel o ingrediente…')}
            style={{
              width: '100%', padding: '12px 14px 12px 38px',
              background: 'var(--bg-2)',
              border: '1px solid var(--line-soft)',
              borderRadius: 12,
              color: 'var(--ink-0)',
              fontFamily: 'var(--f-sans)', fontSize: 14,
              outline: 'none',
            }}
          />
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
            <Icon name="search" size={16} />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ padding: '0 24px 14px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)} className="mono caps" style={{
            flexShrink: 0,
            padding: '7px 12px',
            borderRadius: 99,
            fontSize: 10,
            background: cat === c ? 'var(--amber)' : 'var(--bg-2)',
            color: cat === c ? 'var(--bg-0)' : 'var(--ink-2)',
            border: `1px solid ${cat === c ? 'var(--amber)' : 'var(--line-soft)'}`,
          }}>
            {c === 'all' ? tr('fichas.filter_all', 'Todos') : c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {filtered.map(f => (
          <button key={f.name} onClick={() => onOpenFicha(f)} className="card" style={{
            padding: 12, textAlign: 'left', cursor: 'pointer',
            display: 'grid', gap: 8, aspectRatio: '1',
            background: 'var(--bg-2)',
          }}>
            <div style={{
              width: '100%', aspectRatio: '1.2',
              borderRadius: 10,
              background: `linear-gradient(135deg, ${f.color || 'var(--bg-3)'}, oklch(0.2 0.02 60))`,
              display: 'grid', placeItems: 'center',
              fontSize: 32,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}>{f.icon || '🍸'}</div>
            <div>
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: 13, lineHeight: 1.1, marginBottom: 2 }}>{f.name}</div>
              <div style={{ fontSize: 9, color: 'var(--ink-3)' }} className="mono caps">{f._family}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🥃</div>
            <div style={{ fontSize: 13 }}>Sin resultados</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════ FICHA DETAIL ═══════════════

const FichaDetail = ({ ficha, onClose }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  return (
  <div onClick={onClose} style={{
    position: 'fixed', inset: 0, zIndex: 60,
    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
    display: 'grid', placeItems: 'end center',
    animation: 'fadeIn .25s',
  }}>
    <div onClick={e => e.stopPropagation()} style={{
      width: '100%', maxWidth: 520, maxHeight: '90dvh',
      background: 'var(--bg-1)',
      borderRadius: '24px 24px 0 0',
      overflowY: 'auto',
      animation: 'slideUp .4s cubic-bezier(.2,1.1,.3,1)',
      position: 'relative',
    }}>
      {/* Hero */}
      <div style={{
        padding: '28px 24px 32px',
        background: `linear-gradient(160deg, ${ficha.color || 'var(--bg-2)'} 0%, oklch(0.2 0.03 60) 100%)`,
        borderRadius: '24px 24px 0 0',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center',
        }}>
          <Icon name="close" size={16} />
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.3)' }} />
        </div>
        <div style={{ fontSize: 72, textAlign: 'center', marginBottom: 6, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' }}>
          {ficha.icon || '🍸'}
        </div>
        <div className="mono caps" style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 4 }}>
          {ficha.category}
        </div>
        <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 36, margin: 0, lineHeight: 1, textAlign: 'center' }}>
          {ficha.name}
        </h2>
      </div>

      {/* Meta */}
      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <MetaPill label={tr('ficha.glass', 'Vaso')} value={ficha.glass} />
        <MetaPill label={tr('ficha.method', 'Método')} value={ficha.method} />
      </div>

      {/* Ingredients */}
      <div style={{ padding: '0 24px 20px' }}>
        <div className="mono caps" style={{ fontSize: 10, color: 'var(--amber)', marginBottom: 10 }}>{tr('ficha.ingredients', 'Ingredientes')}</div>
        <div style={{ display: 'grid', gap: 6 }}>
          {(ficha.ingredients || []).map((ing, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              background: 'var(--bg-2)',
              border: '1px solid var(--line-soft)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 13,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
              {ing}
            </div>
          ))}
        </div>
      </div>

      {/* Garnish */}
      {ficha.garnish && (
        <div style={{ padding: '0 24px 20px' }}>
          <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 8 }}>Garnish</div>
          <div style={{ fontSize: 13, color: 'var(--ink-1)', fontStyle: 'italic' }}>
            {ficha.garnish}
          </div>
        </div>
      )}

      {/* Story */}
      {ficha.story && (
        <div style={{ padding: '0 24px 32px' }}>
          <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 8 }}>{tr('ficha.history', 'Historia')}</div>
          <div style={{
            fontSize: 14, color: 'var(--ink-1)', lineHeight: 1.55,
            fontFamily: 'var(--f-serif)', fontStyle: 'italic',
            padding: 16,
            background: 'var(--bg-2)',
            borderRadius: 12,
            borderLeft: '3px solid var(--amber)',
          }}>
            {ficha.story}
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

const MetaPill = ({ label, value }) => (
  <div style={{
    padding: '10px 12px',
    background: 'var(--bg-2)',
    borderRadius: 10,
    border: '1px solid var(--line-soft)',
  }}>
    <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 12, color: 'var(--ink-1)', fontWeight: 500 }}>{value || '—'}</div>
  </div>
);

// ═══════════════ FREEQUIZ — lista de las 24 rondas ═══════════════

const FreeQuizScreen = ({ onBack, onStartRound }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const rounds = window.TRIVIA_ROUNDS || [];
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', paddingBottom: 120 }}>
      <div style={{ padding: '20px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="btn" style={{ padding: 8, width: 40, height: 40, borderRadius: '50%' }}>
          <Icon name="arrowL" size={16} />
        </button>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 10 }}>{tr('home.quick_eyebrow', 'jugar')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 30, margin: 0, lineHeight: 1 }}>{tr('mode.freequiz.title', 'Quiz Libre')}</h1>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>{rounds.length} rondas temáticas · {rounds.reduce((n, r) => n + r.questions.length, 0)} preguntas</div>
        </div>
      </div>

      <div style={{ padding: '14px 24px', display: 'grid', gap: 10 }}>
        {rounds.map(r => (
          <button key={r.id} onClick={() => onStartRound(r)} className="card" style={{
            padding: 16, textAlign: 'left', cursor: 'pointer',
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
            borderLeft: `3px solid ${r.color}`,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `linear-gradient(135deg, ${r.color}, oklch(0.25 0.03 60))`,
              display: 'grid', placeItems: 'center', fontSize: 22,
            }}>{r.icon}</div>
            <div>
              <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginBottom: 2 }}>
                Ronda {String(r.id).padStart(2, '0')} · {r.questions.length} preguntas
              </div>
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: 18, lineHeight: 1.1, marginBottom: 2 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-2)' }}>{r.subtitle}</div>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--amber)', display: 'grid', placeItems: 'center', color: 'var(--bg-0)' }}>
              <Icon name="play" size={12} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { AcademyScreen, FichasScreen, FichaDetail, FreeQuizScreen });
