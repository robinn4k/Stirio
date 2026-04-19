// Stirio — Shared UI Primitives
// Requires: React (UMD), css/tokens.css, css/style.css
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Language helper ──────────────────────────────────────────
// Wraps window.stLang.t() if available; falls back to key (ES-only for now).
// TODO: full i18n in follow-up PR for en/fr/pt/de
const t = (key, fallback) => {
  if (window.stLang && window.stLang.t) {
    const v = window.stLang.t(key);
    if (v && v !== key) return v;
  }
  return fallback || key;
};

// ── Icons ────────────────────────────────────────────────────
const Icon = ({ name, size = 20, style: extraStyle }) => {
  const s = { width: size, height: size, flexShrink: 0, display: 'inline-block', ...extraStyle };
  const paths = {
    home: <><path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" /></>,
    sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></>,
    trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0z" /><path d="M6 4H4v2a2 2 0 0 0 2 2" /><path d="M18 4h2v2a2 2 0 0 1-2 2" /><path d="M10 12v3h4v-3" /><path d="M7 20h10" /><path d="M10 15v5" /><path d="M14 15v5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c2-4 5-6 8-6s6 2 8 6" /></>,
    flame: <path d="M12 3s4 3 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3 0 2 1 3 2 3 0-3-1-4-1-6 0-1 1-2 2-2z" />,
    play: <path d="M6 4l14 8-14 8z" />,
    check: <path d="M4 12l5 5L20 6" />,
    close: <><path d="M5 5l14 14" /><path d="M19 5L5 19" /></>,
    arrowR: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
    arrowL: <><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>,
    bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
    heart: <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z" />,
    bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    swords: <><path d="M14 14l7-7V3h-4l-7 7" /><path d="M5 19l5-5" /><path d="M10 14l-7 7v-4l3-3" /><path d="M18 16l3 3-2 2-3-3" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></>,
    star: <path d="M12 3l2.6 6.3L21 10l-5 4.4L17.5 21 12 17.6 6.5 21 8 14.4 3 10l6.4-.7z" />,
    shuffle: <><path d="M3 6h4l10 12h4" /><path d="M17 6h4l-3-3M17 6l3 3" /><path d="M3 18h4l2-2.4" /><path d="M13 8.4 15 6" /></>,
    book: <path d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" />,
    headphones: <><path d="M4 13a8 8 0 0 1 16 0" /><rect x="3" y="13" width="4" height="7" rx="1" /><rect x="17" y="13" width="4" height="7" rx="1" /></>,
    zap: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
    dumbbell: <><path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" /><rect x="2" y="4" width="4" height="5" rx="1" /><rect x="18" y="4" width="4" height="5" rx="1" /><rect x="2" y="15" width="4" height="5" rx="1" /><rect x="18" y="15" width="4" height="5" rx="1" /><path d="M12 6.5v11" /></>,
    map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>,
    cube: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
    edit: <><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M14 6l4 4" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" style={s}>
      {paths[name] || <circle cx="12" cy="12" r="6" />}
    </svg>
  );
};

// ── Placeholder image ────────────────────────────────────────
const Placeholder = ({ label = 'glass', ratio = 1, tint = 'amber', rounded = 'var(--r-md)' }) => {
  const hue = { amber: 75, cyan: 200, violet: 300, berry: 10, lime: 130 }[tint] || 75;
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: ratio,
      borderRadius: rounded, overflow: 'hidden', border: '1px solid var(--line-soft)',
      background: `repeating-linear-gradient(135deg, oklch(0.7 0.15 ${hue} / 0.12) 0 8px, transparent 8px 18px),
        linear-gradient(180deg, oklch(0.3 0.05 ${hue} / 0.5), oklch(0.2 0.03 ${hue} / 0.3))`,
    }}>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: `oklch(0.85 0.12 ${hue} / 0.85)`,
      }}>
        {label}
      </div>
    </div>
  );
};

// ── XP pop animation ─────────────────────────────────────────
const XPPop = ({ amount, color = 'var(--amber)' }) => (
  <div style={{
    position: 'absolute', pointerEvents: 'none',
    fontFamily: 'var(--f-mono)', fontWeight: 700,
    fontSize: 20, color,
    animation: 'floatXP 1.2s ease-out forwards',
    textShadow: '0 0 20px currentColor',
  }}>
    +{amount} XP
  </div>
);

// ── Glow ring ────────────────────────────────────────────────
const GlowRing = ({ children, color = 'var(--amber)', size = 48, pulse = false }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    display: 'grid', placeItems: 'center',
    background: `radial-gradient(circle, oklch(0.82 0.17 75 / 0.18), transparent 70%)`,
    boxShadow: `0 0 0 1px ${color}`,
    animation: pulse ? 'pulseGlow 2s ease-in-out infinite' : 'none',
  }}>
    {children}
  </div>
);

// ── Streak badge ─────────────────────────────────────────────
const StreakBadge = ({ count }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 12px 6px 8px', borderRadius: 'var(--r-pill)',
    background: 'linear-gradient(90deg, oklch(0.65 0.18 25 / 0.2), oklch(0.82 0.17 75 / 0.2))',
    border: '1px solid oklch(0.82 0.17 75 / 0.3)',
    color: 'var(--amber)', fontFamily: 'var(--f-mono)', fontWeight: 600, fontSize: 12,
  }}>
    <span style={{ fontSize: 14, filter: 'drop-shadow(0 0 6px var(--amber))' }}>🔥</span>
    {count}
  </div>
);

// ── Lesson prompt header ──────────────────────────────────────
const Prompt = ({ text, subtitle }) => (
  <div style={{ marginBottom: 22 }}>
    <h2 style={{
      fontFamily: 'var(--f-serif)', fontWeight: 400,
      fontSize: 'clamp(22px, 4vw, 32px)',
      lineHeight: 1.2, color: 'var(--ink-0)',
    }}>
      {text}
    </h2>
    {subtitle && (
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--amber)', marginTop: 6 }}>
        {subtitle}
      </div>
    )}
  </div>
);

// ── Step title (onboarding) ───────────────────────────────────
const StepTitle = ({ eyebrow, title, subtitle }) => (
  <div style={{ marginBottom: 28 }}>
    {eyebrow && (
      <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 10, marginBottom: 6, letterSpacing: '0.14em' }}>
        {eyebrow}
      </div>
    )}
    <h2 style={{
      fontFamily: 'var(--f-serif)', fontWeight: 400,
      fontSize: 'clamp(28px, 5vw, 40px)',
      lineHeight: 1.1, marginBottom: 8,
    }}>
      {title}
    </h2>
    {subtitle && (
      <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5 }}>{subtitle}</p>
    )}
  </div>
);

// ── Web Audio chord ───────────────────────────────────────────
const playChord = (type = 'major') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const root = 261.63;
    const intervals = type === 'major' ? [1, 1.26, 1.5] : [1, 1.189, 1.5];
    intervals.forEach((r, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = root * r;
      g.gain.value = 0;
      o.connect(g).connect(ctx.destination);
      o.start(now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.02 + i * 0.04);
      g.gain.linearRampToValueAtTime(0, now + 1.1);
      o.stop(now + 1.2);
    });
    setTimeout(() => ctx.close(), 1400);
  } catch (e) {}
};

// ── Confetti burst ────────────────────────────────────────────
const confettiBurst = (x, y, colors = ['var(--amber)', 'var(--cyan)', 'var(--lime)', 'var(--berry)', 'var(--violet)']) => {
  const root = document.body;
  for (let i = 0; i < 26; i++) {
    const el = document.createElement('div');
    const c = colors[i % colors.length];
    const angle = (Math.PI * 2 * i) / 26 + Math.random() * 0.3;
    const dist = 70 + Math.random() * 90;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 50;
    Object.assign(el.style, {
      position: 'fixed',
      left: x + 'px', top: y + 'px',
      width: (4 + Math.random() * 5) + 'px',
      height: (7 + Math.random() * 8) + 'px',
      background: c,
      borderRadius: Math.random() > 0.5 ? '50%' : '1px',
      pointerEvents: 'none',
      zIndex: 9999,
      transform: 'translate(-50%,-50%)',
      transition: 'transform 900ms cubic-bezier(.2,.8,.3,1), opacity 900ms ease',
    });
    root.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${Math.random() * 360}deg)`;
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 1000);
  }
};

// ── Cookie consent banner (GDPR) ──────────────────────────────
const CookieBanner = () => {
  const KEY = 'cq_cookie_consent';
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(KEY) === 'accepted'; } catch { return false; }
  });
  if (hidden) return null;
  const accept = () => {
    try { localStorage.setItem(KEY, 'accepted'); } catch {}
    setHidden(true);
  };
  return (
    <div style={{
      position: 'fixed', left: 12, right: 12, bottom: 12,
      zIndex: 200, padding: 16,
      background: 'var(--bg-1)', border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)', boxShadow: '0 12px 40px rgba(0,0,0,.35)',
      display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640, margin: '0 auto',
    }}>
      <div
        style={{ fontSize: 13, color: 'var(--ink-1)', lineHeight: 1.4 }}
        dangerouslySetInnerHTML={{
          __html: t('cookie.text', 'Usamos cookies esenciales para el funcionamiento de la app y cookies opcionales para análisis. Al continuar aceptas nuestra <a href="cookies.html">política de cookies</a>.'),
        }}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <a href="privacidad.html" target="_blank" rel="noopener" className="btn ghost" style={{ padding: '8px 12px', fontSize: 12 }}>{t('privacy', 'Privacidad')}</a>
        <button className="btn primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={accept}>{t('cookie.accept', 'Aceptar')}</button>
      </div>
    </div>
  );
};

// ── Legal footer ──────────────────────────────────────────────
const LegalFooter = () => {
  const linkStyle = { color: 'inherit', textDecoration: 'none' };
  return (
    <footer style={{
      padding: '6px 16px 8px',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 9,
      fontFamily: 'var(--f-mono)',
      letterSpacing: '0.04em',
      opacity: 0.4,
      lineHeight: 1.4,
    }}>
      <a href="legal.html" target="_blank" rel="noopener" style={linkStyle}>Legal</a>
      <span style={{ margin: '0 5px' }}>·</span>
      <a href="privacidad.html" target="_blank" rel="noopener" style={linkStyle}>Privacy</a>
      <span style={{ margin: '0 5px' }}>·</span>
      <a href="cookies.html" target="_blank" rel="noopener" style={linkStyle}>Cookies</a>
      <span style={{ margin: '0 5px' }}>·</span>
      <span>© {new Date().getFullYear()} Stirio</span>
    </footer>
  );
};

// ── Export to window (referenced by other JSX files) ─────────
Object.assign(window, {
  stUiT: t,
  Icon, Placeholder, XPPop, GlowRing, StreakBadge,
  Prompt, StepTitle,
  playChord, confettiBurst,
  CookieBanner, LegalFooter,
});
