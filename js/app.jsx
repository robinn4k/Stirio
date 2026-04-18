// Stirio — App Shell
// Depends on: ui.jsx, screens.jsx, lesson.jsx, reference.jsx, data.js, repo-data.js
// React hooks come from ui.jsx's top-level destructuring (shared script scope).

const PLAY_SHORTCUTS = [
  { id: 'daily',     label: 'Reto diario',    icon: '📅', desc: '10 preguntas frescas' },
  { id: 'speed',     label: 'Velocidad 60s',  icon: '⚡',  desc: 'Ronda rápida de un minuto' },
  { id: 'academy',   label: 'Academia',       icon: '🎓', desc: 'Familias y rondas IBA' },
  { id: 'iba',       label: 'Fichas IBA',     icon: '📇', desc: 'Recetario oficial' },
  { id: 'freequiz',  label: 'Quiz libre',     icon: '🎲', desc: 'Elige la ronda' },
  { id: 'mode-menu', label: 'Menú de modos',  icon: '⋯',  desc: 'Mostrar todo' },
];

const TWEAK_DEFAULTS = {
  theme: 'lounge',
  density: 'comfortable',
  featuredLayout: 'stacked',
  device: 'mobile',
  playShortcut: 'daily',
};

const LS_STATE  = 'stirio::state::v2';
const LS_TWEAKS = 'stirio::tweaks::v1';

const loadState  = () => { try { return JSON.parse(localStorage.getItem(LS_STATE))  || null; } catch { return null; } };
const saveState  = (s) => { try { localStorage.setItem(LS_STATE, JSON.stringify(s)); } catch {} };
const loadTweaks = () => {
  // Migrate legacy cq_theme key from the old vanilla JS app
  const legacyTheme = localStorage.getItem('cq_theme');
  const legacyMap = { classic: 'lounge', forest: 'tiki', navy: 'midnight', midnight: 'midnight' };
  const legacyMigrated = legacyTheme ? { theme: legacyMap[legacyTheme] || 'lounge' } : {};
  try {
    return { ...TWEAK_DEFAULTS, ...legacyMigrated, ...(JSON.parse(localStorage.getItem(LS_TWEAKS)) || {}) };
  } catch {
    return { ...TWEAK_DEFAULTS, ...legacyMigrated };
  }
};

const App = () => {
  const saved = loadState();
  const [screen, setScreen]           = useState(saved?.screen || 'onboarding');
  const [profile, setProfile]         = useState(saved?.profile || {
    name: '', authMode: null, xp: 340, xpNext: 500,
    level: 4, title: 'Apprentice', streak: 3, avatar: null,
  });
  const [tweaks, setTweaks]           = useState(loadTweaks());
  const [tweakMode, setTweakMode]     = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [subScreen, setSubScreen]     = useState(null);
  const [fichaOpen, setFichaOpen]     = useState(null);
  const [activeMode, setActiveMode]   = useState(null);

  // Persist state
  useEffect(() => { saveState({ screen, profile }); }, [screen, profile]);

  // Apply tweaks as data-* attrs on <html>
  useEffect(() => {
    const d = tweaks.device || 'mobile';
    const density   = tweaks.density   || (d === 'desktop' ? 'compact' : 'comfortable');
    const featured  = tweaks.featuredLayout || (d === 'desktop' ? 'split' : 'stacked');
    const html = document.documentElement;
    html.setAttribute('data-theme',   tweaks.theme   || 'lounge');
    html.setAttribute('data-device',  d);
    html.setAttribute('data-density', density);
    html.setAttribute('data-featured', featured);
  }, [tweaks]);

  // Edit-mode wire (Claude Design preview)
  useEffect(() => {
    const h = (e) => {
      if (e.data?.type === '__activate_edit_mode')   setTweakMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweakMode(false);
    };
    window.addEventListener('message', h);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', h);
  }, []);

  const updateTweak = (key, val) => {
    let next = { ...tweaks, [key]: val };
    if (key === 'device') {
      next.density         = val === 'desktop' ? 'compact' : 'comfortable';
      next.featuredLayout  = val === 'desktop' ? 'split'   : 'stacked';
    }
    setTweaks(next);
    try { localStorage.setItem(LS_TWEAKS, JSON.stringify(next)); } catch {}
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: key === 'device'
      ? { device: val, density: next.density, featuredLayout: next.featuredLayout }
      : { [key]: val }
    }, '*');
  };

  const openMode = (m) => {
    if (m === 'academy')  { setSubScreen('academy');  return; }
    if (m === 'iba')      { setSubScreen('iba');       return; }
    if (m === 'freequiz') { setSubScreen('freequiz');  return; }
    if (m === 'wiki')     { setSubScreen('wiki');      return; }
    if (m === 'blind')    { setSubScreen('blind');     return; }
    if (m === 'builder')  { setSubScreen('builder');   return; }
    if (m === 'duel')     { setSubScreen('duel');      return; }
    if (m === 'daily')    { pickLesson(window.DAILY_LESSON && window.DAILY_LESSON()); return; }
    if (m === 'speed')    { pickLesson(window.SPEED_LESSON && window.SPEED_LESSON()); return; }
    setActiveMode(m);
  };

  const pickLesson   = (l) => { if (l) setActiveLesson(l); };
  const exitLesson   = ()  => setActiveLesson(null);
  const finishLesson = ({ xp }) => {
    setProfile(p => ({ ...p, xp: p.xp + xp }));
    setActiveLesson(null);
  };

  const finishOnboarding = (o) => {
    setProfile(p => ({ ...p, name: o.name, authMode: o.authMode }));
    setScreen('home');
  };

  const asDesktop = (tweaks.device || 'mobile') === 'desktop';

  const appContent = (
    <div style={{
      position: 'relative', width: '100%',
      height: asDesktop ? 'auto' : '100%',
      minHeight: asDesktop ? '100dvh' : 0,
      overflow: asDesktop ? 'visible' : 'auto',
      WebkitOverflowScrolling: 'touch',
      background: 'var(--bg-0)',
    }}>

      {screen === 'onboarding' && !activeLesson && (
        <Onboarding onDone={finishOnboarding} />
      )}

      {screen === 'home' && !activeLesson && !subScreen && (
        <Home
          profile={profile}
          onPickLesson={pickLesson}
          onOpenProfile={() => setScreen('profile')}
          onOpenMode={openMode}
        />
      )}

      {subScreen === 'academy' && !activeLesson && (
        <AcademyScreen
          onBack={() => setSubScreen(null)}
          onStartRound={(fam) => {
            const round = (window.TRIVIA_ROUNDS || []).find(r =>
              r.title.toLowerCase().includes(fam.match.toLowerCase()) ||
              r.title.toLowerCase().includes(fam.title.toLowerCase())
            ) || (window.TRIVIA_ROUNDS || [])[0];
            if (round) pickLesson(window.buildLessonFromRound && window.buildLessonFromRound(round));
          }}
          onOpenFicha={(f) => setFichaOpen(f)}
        />
      )}

      {subScreen === 'iba' && !activeLesson && (
        <FichasScreen
          onBack={() => setSubScreen(null)}
          onOpenFicha={(f) => setFichaOpen(f)}
        />
      )}

      {subScreen === 'freequiz' && !activeLesson && (
        <FreeQuizScreen
          onBack={() => setSubScreen(null)}
          onStartRound={(r) => pickLesson(window.buildLessonFromRound && window.buildLessonFromRound(r))}
        />
      )}

      {subScreen === 'wiki' && !activeLesson && (
        <WikiScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'blind' && !activeLesson && (
        <BlindScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'builder' && !activeLesson && (
        <ConstructorScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'duel' && !activeLesson && (
        <DuelScreen onBack={() => setSubScreen(null)} />
      )}

      {fichaOpen && (
        <FichaDetail ficha={fichaOpen} onClose={() => setFichaOpen(null)} />
      )}

      {activeMode && !activeLesson && (
        <ModeSheet
          mode={activeMode}
          onClose={() => setActiveMode(null)}
          onStart={() => {
            setActiveMode(null);
            openMode(activeMode);
          }}
        />
      )}

      {screen === 'profile' && !activeLesson && (
        <Profile
          profile={profile}
          onBack={() => setScreen('home')}
          onUpdateProfile={(patch) => setProfile(p => ({ ...p, ...patch }))}
          tweaks={tweaks}
          onChangeTweak={updateTweak}
          playShortcuts={PLAY_SHORTCUTS}
          onResetData={() => {
            setProfile(p => ({ ...p, xp: 0, level: 1, streak: 0 }));
          }}
          onLogout={() => {
            localStorage.removeItem(LS_STATE);
            setProfile({ name: '', authMode: null, xp: 0, xpNext: 300, level: 1, streak: 0, title: 'Curious Novice', avatar: null });
            setScreen('onboarding');
          }}
        />
      )}

      {activeLesson && (
        <LessonPlayer
          key={activeLesson.id}
          lesson={activeLesson}
          onExit={exitLesson}
          onFinish={finishLesson}
        />
      )}

      {!activeLesson && screen !== 'onboarding' && !subScreen && (
        <BottomNav
          current={screen}
          onNav={(s) => { setScreen(s); setSubScreen(null); }}
          onPlay={() => {
            const s = tweaks.playShortcut || 'daily';
            if (s === 'mode-menu') { setActiveMode('any'); return; }
            openMode(s);
          }}
        />
      )}
    </div>
  );

  return (
    <>
      <div style={{
        minHeight: '100dvh', width: '100%',
        ...(asDesktop ? {} : {
          display: 'grid', placeItems: 'center',
          background: `
            radial-gradient(1200px 600px at 20% 10%, var(--amber-glow), transparent 60%),
            radial-gradient(900px 500px at 80% 90%, var(--cyan-soft), transparent 60%),
            var(--bg-0)
          `,
          padding: '0',
          boxSizing: 'border-box',
        }),
        height: asDesktop ? 'auto' : '100dvh',
        overflow: asDesktop ? 'visible' : 'hidden',
      }}>
        {appContent}
      </div>

      {/* Tweaks panel — floating overlay */}
      {tweakMode && (
        <TweaksPanel tweaks={tweaks} onChange={updateTweak} onClose={() => setTweakMode(false)} />
      )}

      {/* Tweaks trigger button — always visible for dev/preview */}
      <button
        onClick={() => setTweakMode(t => !t)}
        title="Tweaks"
        style={{
          position: 'fixed', bottom: 90, right: 18, zIndex: 50,
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          color: 'var(--ink-2)',
          display: 'grid', placeItems: 'center',
          boxShadow: 'var(--shadow-md)',
          transition: 'color .15s',
        }}
      >
        <Icon name="settings" size={18} />
      </button>
    </>
  );
};

// ── Bottom nav ──────────────────────────────────────────────────
const BottomNav = ({ current, onNav, onPlay }) => (
  <nav style={{
    position: 'fixed', bottom: 18, left: 0, right: 0, zIndex: 30,
    display: 'flex', justifyContent: 'center', pointerEvents: 'none',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: 6,
      background: 'oklch(0.18 0.014 60 / 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--line)',
      borderRadius: 99,
      boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--line-soft)',
      pointerEvents: 'auto',
    }}>
      <NavBtn icon="home" label="Home" active={current === 'home'} onClick={() => onNav('home')} />
      <button onClick={onPlay} style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--amber)',
        color: 'var(--bg-0)',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 0 24px var(--amber-glow), inset 0 1px 0 rgba(255,255,255,0.4)',
        border: 0,
        transition: 'transform .12s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Jugar"
      >
        <Icon name="play" size={22} />
      </button>
      <NavBtn icon="user" label="You" active={current === 'profile'} onClick={() => onNav('profile')} />
    </div>
  </nav>
);

const NavBtn = ({ icon, label, active, onClick }) => (
  <button className={`nav-btn ${active ? 'active' : ''}`} onClick={onClick} style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    padding: '8px 18px', borderRadius: 99,
    background: active ? 'var(--amber-soft)' : 'transparent',
  }}>
    <Icon name={icon} size={20} />
    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
  </button>
);

// ── Tweaks panel ───────────────────────────────────────────────
const TweaksPanel = ({ tweaks, onChange, onClose }) => (
  <div style={{
    position: 'fixed', right: 20, bottom: 140, zIndex: 60,
    width: 272,
    background: 'oklch(0.16 0.014 60 / 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-lg)',
    padding: 18,
    boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
    animation: 'slideUp .3s cubic-bezier(.2,1.1,.3,1)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div className="mono caps" style={{ fontSize: 10, color: 'var(--amber)' }}>Tweaks</div>
      <button onClick={onClose} style={{ padding: 4, color: 'var(--ink-3)' }}><Icon name="close" size={16} /></button>
    </div>

    <TweakRow label="Device">
      <div style={{ display: 'flex', gap: 6 }}>
        {[{ id: 'mobile', label: '📱 Móvil' }, { id: 'desktop', label: '💻 Desktop' }].map(d => (
          <button key={d.id} onClick={() => onChange('device', d.id)} style={{
            flex: 1, padding: 8, borderRadius: 8,
            background: (tweaks.device || 'mobile') === d.id ? 'var(--amber-soft)' : 'var(--bg-2)',
            border: `1px solid ${(tweaks.device || 'mobile') === d.id ? 'var(--amber)' : 'var(--line-soft)'}`,
            color: (tweaks.device || 'mobile') === d.id ? 'var(--amber)' : 'var(--ink-1)',
            fontFamily: 'var(--f-mono)', fontSize: 10,
          }}>{d.label}</button>
        ))}
      </div>
    </TweakRow>

    <TweakRow label="Theme">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[
          { id: 'lounge',   label: 'Original',  dot: 'oklch(0.82 0.17 75)',  bg: 'oklch(0.14 0.012 60)' },
          { id: 'daybar',   label: 'Daybar',     dot: 'oklch(0.56 0.18 45)',  bg: 'oklch(0.96 0.015 80)' },
          { id: 'midnight', label: 'Midnight',   dot: 'oklch(0.78 0.2 330)',  bg: 'oklch(0.11 0.035 275)' },
          { id: 'tiki',     label: 'Tiki',       dot: 'oklch(0.82 0.16 90)',  bg: 'oklch(0.15 0.03 150)' },
          { id: 'punk',     label: 'Punk',       dot: 'oklch(0.62 0.24 25)',  bg: 'oklch(0.08 0 0)' },
          { id: 'mezcal',   label: 'Mezcal',     dot: 'oklch(0.76 0.15 40)',  bg: 'oklch(0.17 0.015 50)' },
        ].map(t => (
          <button key={t.id} onClick={() => onChange('theme', t.id)} style={{
            padding: 8, borderRadius: 8,
            background: tweaks.theme === t.id ? 'var(--bg-3)' : 'var(--bg-2)',
            border: `1px solid ${tweaks.theme === t.id ? 'var(--amber)' : 'var(--line-soft)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-1)',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${t.dot}, ${t.bg})`,
              boxShadow: `0 0 8px ${t.dot}`,
              border: '1px solid var(--line-soft)',
            }} />
            {t.label}
          </button>
        ))}
      </div>
    </TweakRow>

    <TweakRow label="Density">
      <div style={{ display: 'flex', gap: 6 }}>
        {['compact', 'comfortable'].map(d => (
          <button key={d} onClick={() => onChange('density', d)} style={{
            flex: 1, padding: 8, borderRadius: 8,
            background: tweaks.density === d ? 'var(--amber-soft)' : 'var(--bg-2)',
            border: `1px solid ${tweaks.density === d ? 'var(--amber)' : 'var(--line-soft)'}`,
            color: tweaks.density === d ? 'var(--amber)' : 'var(--ink-1)',
            fontFamily: 'var(--f-mono)', fontSize: 10, textTransform: 'capitalize',
          }}>{d}</button>
        ))}
      </div>
    </TweakRow>

    <TweakRow label="Featured card">
      <div style={{ display: 'flex', gap: 6 }}>
        {[{ id: 'split', label: 'Split' }, { id: 'stacked', label: 'Stacked' }].map(t => (
          <button key={t.id} onClick={() => onChange('featuredLayout', t.id)} style={{
            flex: 1, padding: 8, borderRadius: 8,
            background: tweaks.featuredLayout === t.id ? 'var(--amber-soft)' : 'var(--bg-2)',
            border: `1px solid ${tweaks.featuredLayout === t.id ? 'var(--amber)' : 'var(--line-soft)'}`,
            color: tweaks.featuredLayout === t.id ? 'var(--amber)' : 'var(--ink-1)',
            fontFamily: 'var(--f-mono)', fontSize: 10,
          }}>{t.label}</button>
        ))}
      </div>
    </TweakRow>

    <TweakRow label="Reset">
      <button onClick={() => { localStorage.removeItem(LS_STATE); location.reload(); }} style={{
        width: '100%', padding: 8, borderRadius: 8,
        background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
        color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', fontSize: 10,
      }}>
        Restart onboarding
      </button>
    </TweakRow>
  </div>
);

const TweakRow = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

// ── Wiki screen (iframe wrapper for the standalone wiki.html) ──
const WikiScreen = ({ onBack }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 50,
    background: 'var(--bg-0)',
    display: 'flex', flexDirection: 'column',
    animation: 'fadeIn .3s ease',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 18px',
      borderBottom: '1px solid var(--line-soft)',
      background: 'var(--bg-1)',
    }}>
      <button className="btn ghost" onClick={onBack} style={{ padding: 8 }}>
        <Icon name="arrowL" size={18} />
      </button>
      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 20 }}>Enciclopedia 3D</div>
    </div>
    <iframe
      src="wiki.html"
      style={{ flex: 1, border: 'none', width: '100%' }}
      title="Wiki 3D"
    />
  </div>
);

// ── Bootstrap ──────────────────────────────────────────────────
const kickApp = () => {
  const root = document.getElementById('root');
  if (root) ReactDOM.createRoot(root).render(<App />);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', kickApp);
} else {
  kickApp();
}
