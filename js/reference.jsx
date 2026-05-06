// ═══════════════════════════════════════════════════════════
// reference.jsx — Academia & Fichas IBA/Difford's
// Pantallas grandes con datos reales del repo Stirio.
// ═══════════════════════════════════════════════════════════

const { useState: useStateRef, useMemo: useMemoRef } = React;

// ═══════════════ ACADEMIA ═══════════════

// ── Track registry ──
// Cada academia (cocktail / wine / coffee) persiste su progreso en un key
// independiente y se muestra con su propia identidad (icono, color, copy).
const PROGRESS_KEY_BY_TRACK = {
  cocktail: 'cq_academy_cocktail',
  wine:     'cq_academy_wine',
  coffee:   'cq_academy_coffee',
};
const TRACK_META = {
  cocktail: { icon: '🍸', color: 'var(--amber)', titleKey: 'academy.cocktail.title',  eyebrowKey: 'academy.cocktail.eyebrow', descKey: 'academy.cocktail.desc',
              titleFallback: 'Cocktail Academy', eyebrowFallback: 'Mixology',     descFallback: 'Domina las familias de cócteles — Sours, Highballs, Martinis, Tiki…' },
  wine:     { icon: '🍷', color: '#8e1b3d',      titleKey: 'academy.wine.title',      eyebrowKey: 'academy.wine.eyebrow',     descKey: 'academy.wine.desc',
              titleFallback: 'Sommelier Academy', eyebrowFallback: 'Vinos',         descFallback: 'Uvas, regiones, cata y servicio — el mundo del vino paso a paso.' },
  coffee:   { icon: '☕', color: '#6b3a17',      titleKey: 'academy.coffee.title',    eyebrowKey: 'academy.coffee.eyebrow',   descKey: 'academy.coffee.desc',
              titleFallback: 'Barista Academy',  eyebrowFallback: 'Café',          descFallback: 'Granos, espresso y leche — el oficio del café de especialidad.' },
};

// ── Progreso de Academia (localStorage, por track) ──
// Retrocompatible: si aún existe el key legacy `cq_academy_progress`, se usa
// como fallback cuando el track cocktail no tiene datos nuevos.
const loadAcademyProgress = (track = 'cocktail') => {
  const key = PROGRESS_KEY_BY_TRACK[track] || PROGRESS_KEY_BY_TRACK.cocktail;
  try {
    const raw = localStorage.getItem(key)
      || (track === 'cocktail' ? localStorage.getItem('cq_academy_progress') : null);
    return JSON.parse(raw) || {};
  } catch { return {}; }
};
const levelCompleted = (progress, level) => {
  const lp = progress[level.id];
  if (!lp) return false;
  return (level.lessons || []).every((_, i) => lp.lessons && lp.lessons[i]?.passed);
};

// Cuenta niveles completados del track dado (lectura barata para el hub).
const countCompletedLevels = (track) => {
  const levels = (window.getAcademyLevels && window.getAcademyLevels(track)) || [];
  const progress = loadAcademyProgress(track);
  return {
    done: levels.filter(l => levelCompleted(progress, l)).length,
    total: levels.length,
  };
};

// Persisted active track — restored when the user re-opens Academy. Defaults
// to 'cocktail' on first run or if the stored value isn't in TRACK_META.
const ACTIVE_TRACK_KEY = 'cq_academy_active_track';
const TRACKS = ['cocktail', 'wine', 'coffee'];
const loadActiveTrack = () => {
  try {
    const t = localStorage.getItem(ACTIVE_TRACK_KEY);
    return TRACKS.includes(t) ? t : 'cocktail';
  } catch { return 'cocktail'; }
};
const saveActiveTrack = (t) => {
  try { localStorage.setItem(ACTIVE_TRACK_KEY, t); } catch {}
};

// ── LevelPath: SVG sendero estilo Duolingo ──
// Renders the academy levels as an illustrated path with nodes in a gentle
// sine-wave layout. Locked nodes show a padlock; the next playable level
// gets a pulsing halo. Each node carries a side label with the level title
// and lesson progress so users can scan the track without tapping.
const LevelPath = ({ levels, progress, onSelect }) => {
  const NODE_R = 36;
  const ROW_H = 128;
  const W = 320;
  const CENTER_X = W / 2;
  const AMP = 70;
  const LABEL_W = 120;
  const H = levels.length * ROW_H + 60;
  const positionFor = (i) => ({
    x: CENTER_X + Math.sin(i * 0.95) * AMP,
    y: i * ROW_H + 70,
  });

  // Find the first unlocked-but-not-completed level → "current".
  let currentIdx = -1;
  for (let i = 0; i < levels.length; i++) {
    const prevDone = i === 0 || levelCompleted(progress, levels[i - 1]);
    if (prevDone && !levelCompleted(progress, levels[i])) { currentIdx = i; break; }
  }

  const segments = [];
  for (let i = 0; i < levels.length - 1; i++) {
    const a = positionFor(i);
    const b = positionFor(i + 1);
    const midY = (a.y + b.y) / 2;
    segments.push(`M ${a.x} ${a.y} C ${a.x} ${midY} ${b.x} ${midY} ${b.x} ${b.y}`);
  }

  const _t = (k, f) => (window.stLang && window.stLang.t) ? window.stLang.t(k) : (f || k);
  const _tp = (k, p, f) => (window.stLang && window.stLang.t) ? window.stLang.t(k, p) : (f || k);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', maxWidth: W + 'px', margin: '0 auto', height: 'auto' }}
      role="list"
    >
      <defs>
        {levels.map((level) => (
          <linearGradient key={`grad-${level.id}`} id={`level-node-grad-${level.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={level.color} stopOpacity="0.95" />
            <stop offset="100%" stopColor="oklch(0.28 0.04 60)" stopOpacity="1" />
          </linearGradient>
        ))}
      </defs>
      <path
        d={segments.join(' ')}
        stroke="var(--bg-3)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="3 12"
      />
      {levels.map((level, i) => {
        const { x, y } = positionFor(i);
        const prevDone = i === 0 || levelCompleted(progress, levels[i - 1]);
        const locked = !prevDone;
        const isCurrent = i === currentIdx;
        const lessonCount = (level.lessons || []).length;
        const doneCount = (progress[level.id]?.lessons || []).filter(l => l?.passed).length;
        const title = _t(level.key, level.key);
        const desc = _t(level.descKey, '');
        const progressLine = _tp('academy.level_progress_short', { done: doneCount, total: lessonCount }, `${doneCount}/${lessonCount}`);
        // Label sits on the side opposite the node's wave displacement so it
        // doesn't overlap the path. When the node is left-of-center we draw
        // the label to the right, and vice versa.
        const labelOnRight = x < CENTER_X;
        const labelX = labelOnRight ? x + NODE_R + 12 : x - NODE_R - 12 - LABEL_W;
        const labelAlign = labelOnRight ? 'left' : 'right';
        return (
          <g
            key={level.id}
            onClick={() => !locked && onSelect(level)}
            role="listitem"
            aria-label={`${title} — ${doneCount}/${lessonCount}`}
            style={{ cursor: locked ? 'not-allowed' : 'pointer' }}
          >
            {isCurrent && (
              <circle
                cx={x} cy={y} r={NODE_R + 8}
                fill="none"
                stroke={level.color}
                strokeWidth="3"
                className="level-node-pulse"
              />
            )}
            <circle
              cx={x} cy={y} r={NODE_R + 4}
              fill="oklch(0.18 0.02 60)"
              opacity={locked ? 0.55 : 0.85}
            />
            <circle
              cx={x} cy={y} r={NODE_R}
              fill={`url(#level-node-grad-${level.id})`}
              stroke={level.color}
              strokeWidth="2"
              opacity={locked ? 0.55 : 1}
            />
            <text
              x={x} y={y + 12}
              textAnchor="middle"
              fontSize="32"
              opacity={locked ? 0.55 : 1}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {locked ? '🔒' : level.icon}
            </text>
            <circle cx={x + NODE_R - 6} cy={y - NODE_R + 6} r="13" fill="var(--bg-1)" stroke={level.color} strokeWidth="1.5" opacity={locked ? 0.6 : 1} />
            <text
              x={x + NODE_R - 6} y={y - NODE_R + 10}
              textAnchor="middle"
              fontSize="11"
              fontFamily="var(--f-mono)"
              fill="var(--ink-1)"
              opacity={locked ? 0.6 : 1}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {String(i).padStart(2, '0')}
            </text>
            {/* Side label: title + progress. Uses foreignObject for HTML wrap */}
            <foreignObject x={labelX} y={y - 32} width={LABEL_W} height={70} style={{ pointerEvents: 'none' }}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={{
                fontFamily: 'var(--f-sans)',
                color: 'var(--ink-1)',
                opacity: locked ? 0.55 : 1,
                textAlign: labelAlign,
                lineHeight: 1.15,
              }}>
                <div style={{ fontFamily: 'var(--f-serif)', fontSize: 14, color: locked ? 'var(--ink-2)' : 'var(--ink-1)' }}>{title}</div>
                {desc && (
                  <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</div>
                )}
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: level.color, marginTop: 4, letterSpacing: '0.1em' }}>{progressLine}</div>
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
};

const AcademyScreen = ({ onBack, onStartAcademyLesson, onStartRound, onOpenFicha }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  // Active track is local state, persisted across opens.
  const [track, setTrack] = useStateRef(loadActiveTrack);
  const meta = TRACK_META[track] || TRACK_META.cocktail;
  const levels = (window.getAcademyLevels && window.getAcademyLevels(track)) || [];
  const [openLevel, setOpenLevel] = useStateRef(null);
  const progress = loadAcademyProgress(track);
  const pickTrack = (t) => {
    if (t === track) return;
    saveActiveTrack(t);
    setTrack(t);
    setOpenLevel(null);
  };

  // Si el módulo de datos aún no está cargado, mostramos loader + polling
  const [retries, setRetries] = useStateRef(0);
  React.useEffect(() => {
    if (levels.length === 0 && retries < 20) {
      const t = setTimeout(() => setRetries(r => r + 1), 200);
      return () => clearTimeout(t);
    }
  }, [levels.length, retries]);
  const loadFailed = levels.length === 0 && retries >= 20;

  const completed = levels.filter(l => levelCompleted(progress, l)).length;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)' }}>
      <div className="screen-frame" style={{ maxWidth: 760, margin: '0 auto', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="btn" style={{ padding: 8, width: 40, height: 40, borderRadius: '50%' }}>
          <Icon name="arrowL" size={16} />
        </button>
        <div>
          <div className="mono caps" style={{ color: meta.color, fontSize: 10 }}>{tr(meta.eyebrowKey, meta.eyebrowFallback)}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 34, margin: 0, lineHeight: 1 }}>{tr(meta.titleKey, meta.titleFallback)}</h1>
        </div>
      </div>

      {/* Track tabs (Cocktails / Wine / Coffee) */}
      <div style={{
        padding: '4px 24px 8px',
        display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      }}>
        {TRACKS.map(t => {
          const m = TRACK_META[t];
          const active = t === track;
          const { done, total } = countCompletedLevels(t);
          return (
            <button
              key={t}
              onClick={() => pickTrack(t)}
              className="chip"
              style={{
                padding: '8px 14px', borderRadius: 'var(--r-pill)',
                display: 'flex', alignItems: 'center', gap: 8,
                background: active ? `linear-gradient(135deg, ${m.color}, oklch(0.3 0.05 60))` : 'var(--bg-2)',
                color: active ? 'var(--bg-0)' : 'var(--ink-1)',
                border: `1px solid ${active ? m.color : 'var(--line)'}`,
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: 'pointer', flex: '0 0 auto', whiteSpace: 'nowrap',
              }}
              aria-pressed={active}
            >
              <span style={{ fontSize: 16 }}>{m.icon}</span>
              <span>{tr(m.titleKey, m.titleFallback)}</span>
              {total > 0 && (
                <span className="mono" style={{
                  fontSize: 10, opacity: 0.85,
                  padding: '1px 6px', borderRadius: 99,
                  background: active ? 'rgba(0,0,0,0.18)' : 'var(--bg-3)',
                }}>{done}/{total}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hero con progreso real */}
      <div style={{ padding: '16px 24px 24px' }}>
        <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2))', borderColor: 'oklch(0.82 0.17 75 / 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 10 }}>
            <div>
              <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)' }}>{tr('academy.progress', 'Progreso')}</div>
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: 28, lineHeight: 1 }}>
                {completed} <span style={{ color: 'var(--ink-3)', fontSize: 18 }}>/ {levels.length || '–'} {tr('academy.levels_word', 'niveles')}</span>
              </div>
            </div>
            <div style={{ fontSize: 42 }}>{meta.icon}</div>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden' }}>
            <div style={{ width: `${levels.length ? (completed / levels.length) * 100 : 0}%`, height: '100%', background: meta.color, transition: 'width .3s' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.4 }}>
            {tr(meta.descKey, meta.descFallback)}
          </div>
        </div>
      </div>

      {/* Niveles */}
      <div style={{ padding: '0 24px', display: 'grid', gap: 12 }}>
        {levels.length === 0 && !loadFailed && (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`sk-${i}`} className="card"
              role="status"
              aria-label={tr('academy.loading', 'Cargando Academia…')}
              style={{ padding: 16, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
              <window.Skeleton h={48} w={48} radius={12} />
              <div style={{ display: 'grid', gap: 8 }}>
                <window.Skeleton h={10} w="40%" />
                <window.Skeleton h={16} w="75%" />
                <window.Skeleton h={10} w="55%" />
              </div>
              <window.Skeleton h={24} w={24} radius={999} />
            </div>
          ))
        )}
        {loadFailed && (
          <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-2)', display: 'grid', gap: 10, justifyItems: 'center' }}>
            <div style={{ fontSize: 32 }}>📡</div>
            <div style={{ fontSize: 13 }}>{tr('academy.load_failed', 'No pudimos cargar la Academia.')}</div>
            <button className="btn primary" onClick={() => setRetries(0)} style={{ padding: '8px 16px', fontSize: 13 }}>
              {tr('academy.retry', 'Reintentar')}
            </button>
          </div>
        )}
        {levels.length > 0 && (
          <LevelPath
            levels={levels}
            progress={progress}
            onSelect={(level) => setOpenLevel(level)}
          />
        )}
      </div>
      </div>

      {openLevel && (
        <LevelDetail
          level={openLevel}
          progress={progress[openLevel.id] || { lessons: [], practices: {} }}
          onClose={() => setOpenLevel(null)}
          onStartLesson={(idx) => { setOpenLevel(null); onStartAcademyLesson(track, openLevel.id, idx); }}
          onStartPractice={(roundId) => { setOpenLevel(null); onStartRound(track, { roundId, levelId: openLevel.id }); }}
        />
      )}
    </div>
  );
};

const LevelCard = ({ level, index, locked, progress, onOpen }) => {
  const _t = (k, f) => (window.stLang && window.stLang.t) ? window.stLang.t(k) : (f || k);
  const _tp = (k, params, f) => (window.stLang && window.stLang.t) ? window.stLang.t(k, params) : (f || k);
  const title = _t(level.key);
  const desc = _t(level.descKey);
  const levelN = String(index).padStart(2, '0');
  const progressLine = _tp(
    'academy.level_progress',
    { n: levelN, done: progress.done, total: progress.total },
    `Nivel ${levelN} · ${progress.done}/${progress.total} lecciones`,
  );
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
          {progressLine}
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
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
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
            <div className="mono caps" style={{ fontSize: 10, color: level.color, marginBottom: 2 }}>{(window.stLang && window.stLang.t) ? window.stLang.t('academy.level_n', { n: level.id }) : `Nivel ${level.id}`}</div>
            <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 26, margin: 0, lineHeight: 1 }}>{_t(level.key)}</h2>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.3 }}>{_t(level.descKey)}</div>
          </div>
        </div>

        <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 10 }}>
          {tr('academy.level_route', 'Ruta del nivel')}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {(() => {
            // Progressive unlock: a sequence item is locked until every prior
            // lesson AND practice in the same sequence has been passed. The
            // very first step is always open; completing it reveals the next.
            const isItemLocked = (seqIdx) => {
              for (let k = 0; k < seqIdx; k++) {
                const prev = sequence[k];
                if (!prev) continue;
                if (prev.type === 'lesson' && !progress.lessons?.[prev.index]?.passed) return true;
                if (prev.type === 'practice' && !progress.practices?.[prev.roundId]) return true;
              }
              return false;
            };
            const lockedLabel = tr('academy.locked', 'Completa el paso anterior');
            return sequence.map((item, i) => {
              const locked = isItemLocked(i);
              if (item.type === 'lesson') {
                const lesson = level.lessons[item.index];
                if (!lesson) return null;
                const passed = progress.lessons?.[item.index]?.passed;
                return (
                  <button key={`${i}-lesson-${item.index}`}
                    onClick={() => !locked && onStartLesson(item.index)}
                    disabled={locked}
                    className="card" style={{
                    padding: 14, textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer',
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
                    background: 'var(--bg-2)', opacity: locked ? 0.55 : 1,
                  }}>
                    <div style={{ fontSize: 22 }}>{locked ? '🔒' : passed ? '✅' : '📚'}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 15, lineHeight: 1.1 }}>{_t(lesson.key)}</div>
                      <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 3 }}>
                        {locked
                          ? lockedLabel
                          : (window.stLang && window.stLang.t
                              ? window.stLang.t('academy.lesson_label', { cards: lesson.cards?.length || 0, questions: lesson.questions?.length || 0 })
                              : `Lección · ${lesson.cards?.length || 0} tarjetas · ${lesson.questions?.length || 0} preguntas`)}
                      </div>
                    </div>
                    <Icon name={locked ? 'lock' : 'arrowR'} size={14} />
                  </button>
                );
              }
              if (item.type === 'practice') {
                const passed = progress.practices?.[item.roundId];
                // Prefer the actual round title (e.g. "Técnicas de Bar") over the
                // generic "Práctica · Ronda N". stQuestions holds the localized
                // round list; TRIVIA_ROUNDS is the ES fallback from data.js.
                let roundTitle = null;
                try {
                  const lang = (window.stLang && window.stLang.getLang && window.stLang.getLang()) || 'es';
                  const rounds = (window.stQuestions && window.stQuestions.getLocalizedRounds && window.stQuestions.getLocalizedRounds(lang))
                    || window.TRIVIA_ROUNDS || [];
                  const r = rounds.find(x => x && x.id === item.roundId);
                  if (r && r.title) roundTitle = r.title;
                } catch {}
                const fallbackTitle = window.stLang && window.stLang.t
                  ? window.stLang.t('academy.practice_label', { id: item.roundId })
                  : `Práctica · Ronda ${item.roundId}`;
                return (
                  <button key={`${i}-practice-${item.roundId}`}
                    onClick={() => !locked && onStartPractice(item.roundId)}
                    disabled={locked}
                    className="card" style={{
                    padding: 14, textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer',
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
                    background: 'var(--bg-2)', borderLeft: `3px solid ${level.color}`,
                    opacity: locked ? 0.55 : 1,
                  }}>
                    <div style={{ fontSize: 22 }}>{locked ? '🔒' : passed ? '🏆' : '⚡'}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 15, lineHeight: 1.1 }}>
                        {roundTitle || fallbackTitle}
                      </div>
                      <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 3 }}>
                        {locked
                          ? lockedLabel
                          : (window.stLang && window.stLang.t ? window.stLang.t('academy.practice_sublabel') : 'Quiz de refuerzo')}
                      </div>
                    </div>
                    <Icon name={locked ? 'lock' : 'arrowR'} size={14} />
                  </button>
                );
              }
              return null;
            });
          })()}
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
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)' }}>
      <div className="screen-frame" style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 120 }}>
      <div style={{ padding: '20px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="btn" style={{ padding: 8, width: 40, height: 40, borderRadius: '50%' }}>
          <Icon name="arrowL" size={16} />
        </button>
        <div>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 10 }}>{tr('ficha.reference', 'Reference')}</div>
          <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 30, margin: 0, lineHeight: 1 }}>{tr('ficha.fichas_iba', 'Recetas')}</h1>
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
        {fichas.length === 0 && Array.from({ length: 8 }).map((_, i) => (
          <div key={`sk-${i}`} className="card"
            role="status"
            aria-label={tr('fichas.loading', 'Cargando recetas…')}
            style={{ padding: 12, display: 'grid', gap: 8, aspectRatio: '1' }}>
            <window.Skeleton h="auto" radius={10} style={{ aspectRatio: '1.2' }} />
            <window.Skeleton h={12} w="80%" />
            <window.Skeleton h={9} w="50%" />
          </div>
        ))}
        {filtered.map(f => {
          const img = window.getFichaImage ? window.getFichaImage(f.name) : null;
          return (
          <button key={f.name} onClick={() => onOpenFicha(f)} className="card" style={{
            padding: 12, textAlign: 'left', cursor: 'pointer',
            display: 'grid', gap: 8, aspectRatio: '1',
            background: 'var(--bg-2)',
          }}>
            {img ? (
              <img src={img} alt={f.name} loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'grid';
                }}
                style={{
                  width: '100%', aspectRatio: '1.2',
                  borderRadius: 10,
                  objectFit: 'cover',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                }} />
            ) : null}
            <div style={{
              width: '100%', aspectRatio: '1.2',
              borderRadius: 10,
              background: `linear-gradient(135deg, ${f.color || 'var(--bg-3)'}, oklch(0.2 0.02 60))`,
              display: img ? 'none' : 'grid', placeItems: 'center',
              fontSize: 32,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}>{f.icon || '🍸'}</div>
            <div>
              <div style={{ fontFamily: 'var(--f-serif)', fontSize: 13, lineHeight: 1.1, marginBottom: 2 }}>{f.name}</div>
              <div style={{ fontSize: 9, color: 'var(--ink-3)' }} className="mono caps">{f._family}</div>
            </div>
          </button>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🥃</div>
            <div style={{ fontSize: 13 }}>{tr('fichas.no_results', 'Sin resultados')}</div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

// ═══════════════ FICHA DETAIL ═══════════════

// 1 ml → 0.033814 US fl oz. Rounds to 0.25-oz precision for drinkable values,
// 0.1-oz otherwise. Only touches numeric ml quantities — leaves dashes, "top",
// barspoons, and any existing oz values alone.
const ML_PER_OZ = 29.5735;
const mlStringToOz = (str) => str.replace(/(\d+(?:[.,]\d+)?)\s*ml\b/gi, (_, num) => {
  const ml = parseFloat(num.replace(',', '.'));
  if (!isFinite(ml)) return `${num} ml`;
  const oz = ml / ML_PER_OZ;
  // Round to nearest quarter for common bartending values (0.25 / 0.5 / 0.75 / 1)
  const rounded = Math.abs(oz - Math.round(oz * 4) / 4) < 0.05
    ? (Math.round(oz * 4) / 4)
    : Math.round(oz * 10) / 10;
  const out = Number.isInteger(rounded) ? `${rounded}` : rounded.toString();
  return `${out} oz`;
});

const FichaDetail = ({ ficha, units = 'ml', onClose }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const heroImg = window.getFichaImage ? window.getFichaImage(ficha.name) : null;
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
        minHeight: heroImg ? 220 : 'auto',
        background: heroImg
          ? `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, oklch(0.18 0.03 60 / 0.82) 75%), url(${heroImg}) center/cover`
          : `linear-gradient(160deg, ${ficha.color || 'var(--bg-2)'} 0%, oklch(0.2 0.03 60) 100%)`,
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
              {units === 'oz' ? mlStringToOz(ing) : ing}
            </div>
          ))}
        </div>
      </div>

      {/* Garnish */}
      {ficha.garnish && (
        <div style={{ padding: '0 24px 20px' }}>
          <div className="mono caps" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 8 }}>{tr('ficha.garnish_label', 'Garnish')}</div>
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
  const lang = window.stLang?.getLang?.() || 'es';
  const rounds = React.useMemo(
    () => window.stQuestions?.getLocalizedRounds?.(lang) || window.TRIVIA_ROUNDS || [],
    [lang]
  );
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)' }}>
      <div className="screen-frame" style={{ maxWidth: 760, margin: '0 auto', paddingBottom: 120 }}>
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
        {rounds.length === 0 && Array.from({ length: 6 }).map((_, i) => (
          <div key={`sk-${i}`} className="card"
            role="status"
            aria-label={tr('freequiz.loading', 'Cargando rondas…')}
            style={{ padding: 16, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
            <window.Skeleton h={48} w={48} radius={12} />
            <div style={{ display: 'grid', gap: 8 }}>
              <window.Skeleton h={9} w="50%" />
              <window.Skeleton h={16} w="80%" />
              <window.Skeleton h={10} w="60%" />
            </div>
            <window.Skeleton h={30} w={30} radius={999} />
          </div>
        ))}
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
    </div>
  );
};

Object.assign(window, { AcademyScreen, FichasScreen, FichaDetail, FreeQuizScreen });
