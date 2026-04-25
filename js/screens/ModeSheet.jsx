// Stirio — ModeSheet (Phase 5a).
//
// Two presentations:
//
//   • mode === 'any' → grouped picker. Renders the 16 modes split into the
//     three intent groups (aprender / jugar / consultar) defined in
//     js/modes.js. Tapping a tile fires onStart(modeId).
//
//   • mode === '<id>' → single-mode card with the long-form description and
//     a primary CTA. onStart() is fired with no args (compat with the legacy
//     fallback path in app.jsx → openMode(activeMode)).
//
// Splits from the former monolithic js/screens.jsx (PR #145).

const ModeSheet = ({ mode, onClose, onStart }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const stModes = window.stModes;

  // Picker mode: render the three grouped sections.
  if (mode === 'any') {
    if (!stModes) return null;
    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 55,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'grid', placeItems: 'center', padding: 20,
        animation: 'fadeIn .25s ease', overflow: 'auto',
      }}>
        <div onClick={e => e.stopPropagation()} className="card" style={{
          maxWidth: 540, width: '100%',
          maxHeight: 'calc(100dvh - 40px)',
          padding: 24,
          background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2) 60%)',
          borderColor: 'oklch(0.82 0.17 75 / 0.3)',
          animation: 'slideUp .35s cubic-bezier(.2,1.1,.3,1)',
          position: 'relative',
          overflow: 'auto',
        }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, padding: 6, color: 'var(--ink-3)' }}>
            <Icon name="close" size={18} />
          </button>
          <div style={{ marginBottom: 20 }}>
            <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 11, marginBottom: 4 }}>
              {tr('mode.picker.eyebrow', 'Modos')}
            </div>
            <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 28, margin: '0 0 4px', lineHeight: 1.05 }}>
              {tr('mode.picker.title', '¿Qué quieres jugar?')}
            </h2>
          </div>
          {stModes.MODE_GROUPS.map(group => {
            const modes = stModes.getModesByGroup(group);
            if (!modes.length) return null;
            return (
              <section key={group} style={{ marginBottom: 18 }}>
                <div className="mono caps" style={{ color: 'var(--ink-2)', fontSize: 10, marginBottom: 8, letterSpacing: '0.08em' }}>
                  {tr(`mode.group.${group}`, group)}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 8,
                }}>
                  {modes.map(m => (
                    <ModeTile key={m.id} mode={m} tr={tr} onPick={() => onStart(m.id)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  // Single-mode card. Read metadata from the registry; titles / body / cta
  // still come from i18n under the mode.<id>.* keys.
  const m = stModes ? stModes.getMode(mode) : null;
  if (!m) return null;
  const title    = tr(`mode.${m.id}.title`, m.id);
  const subtitle = tr(`mode.${m.id}.sub`, '');
  const body     = tr(`mode.${m.id}.body`, '');
  const cta      = tr(`mode.${m.id}.cta`, tr('mode.start', 'Empezar'));
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 55,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', padding: 20,
      animation: 'fadeIn .25s ease',
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{
        maxWidth: 460, width: '100%',
        padding: 28,
        background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2) 60%)',
        borderColor: 'oklch(0.82 0.17 75 / 0.3)',
        animation: 'slideUp .35s cubic-bezier(.2,1.1,.3,1)',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, padding: 6, color: 'var(--ink-3)' }}>
          <Icon name="close" size={18} />
        </button>
        <div style={{ fontSize: 64, marginBottom: 10, filter: 'drop-shadow(0 6px 20px var(--amber-glow))' }}>{m.icon}</div>
        <div className="mono caps" style={{ color: m.color, fontSize: 11, marginBottom: 4 }}>{subtitle}</div>
        <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 34, margin: '0 0 10px', lineHeight: 1.05 }}>{title}</h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 20 }}>{body}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={onClose}>{tr('mode.close', 'Cerrar')}</button>
          <button className="btn primary" onClick={() => onStart(m.id)} style={{ flex: 1 }}>
            <Icon name="play" size={14} /> {cta}
          </button>
        </div>
      </div>
    </div>
  );
};

const ModeTile = ({ mode, tr, onPick }) => {
  const title    = tr(`mode.${mode.id}.title`, mode.id);
  const subtitle = tr(`mode.${mode.id}.sub`, '');
  return (
    <button
      onClick={onPick}
      className="card"
      style={{
        padding: '12px 12px',
        textAlign: 'left',
        background: 'var(--bg-2)',
        border: `1px solid color-mix(in oklch, ${mode.color} 25%, var(--line-soft))`,
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        transition: 'transform .12s, border-color .12s',
        display: 'flex', flexDirection: 'column', gap: 4,
        minHeight: 72,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = mode.color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = `color-mix(in oklch, ${mode.color} 25%, var(--line-soft))`;
      }}
      aria-label={title}
    >
      <span style={{ fontSize: 22, lineHeight: 1, marginBottom: 2 }}>{mode.icon}</span>
      <span style={{ fontFamily: 'var(--f-serif)', fontSize: 16, color: 'var(--ink-0)', lineHeight: 1.2 }}>{title}</span>
      {subtitle && (
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)', lineHeight: 1.3 }}>{subtitle}</span>
      )}
    </button>
  );
};

Object.assign(window, { ModeSheet });
