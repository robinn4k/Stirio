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
  const [activeLesson, setActiveLesson] = useState(null);
  const [subScreen, setSubScreen]     = useState(null);
  const [fichaOpen, setFichaOpen]     = useState(null);
  const [activeMode, setActiveMode]   = useState(null);

  // Persist state
  useEffect(() => { saveState({ screen, profile }); }, [screen, profile]);

  // Bump counter used to force re-renders when the current language changes
  const [langVersion, setLangVersion] = useState(0);

  // Listen for language changes from the Profile settings selector
  useEffect(() => {
    const onLangChange = () => setLangVersion(v => v + 1);
    window.addEventListener('stirio:langchange', onLangChange);
    return () => window.removeEventListener('stirio:langchange', onLangChange);
  }, []);

  // Firebase auth bootstrap + i18n preload
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Poll for lang module (loaded async) and preload all translation JSONs
      let tries = 0;
      while (!window.stLang && tries < 40) { await new Promise(r => setTimeout(r, 100)); tries++; }
      if (!cancelled && window.stLang?.preloadAllTranslations) {
        try { await window.stLang.preloadAllTranslations(); setLangVersion(v => v + 1); } catch {}
      }

      // Poll for auth module
      tries = 0;
      while (!window.stAuth && tries < 40) { await new Promise(r => setTimeout(r, 100)); tries++; }
      if (cancelled || !window.stAuth) return;
      try {
        const local = window.stAuth.restoreSession();
        await window.stAuth.initFirebase(); // also detects persisted Google session
        const user = window.stAuth.getCurrentUser() || local;
        if (cancelled || !user) return;
        setProfile(p => ({
          ...p,
          uid: user.uid,
          name: user.name,
          email: user.email || null,
          photoURL: user.photo || null,
          authMode: user.provider === 'guest' ? 'guest' : 'google',
        }));
        if (screen === 'onboarding') setScreen('home');
      } catch (e) { console.warn('[auth] bootstrap', e); }
    })();
    return () => { cancelled = true; };
  }, []);

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
  const finishLesson = ({ xp, correct, total }) => {
    setProfile(p => ({ ...p, xp: p.xp + xp }));

    // Persist Academy progress if this was an academy lesson
    const id = activeLesson?.id || '';
    const aMatch = id.match(/^academy-l(\d+)-les(\d+)$/);
    const pMatch = id.match(/^academy-practice-l(\d+)-r(\d+)$/);
    if (aMatch || pMatch) {
      try {
        const key = 'cq_academy_progress';
        const prog = JSON.parse(localStorage.getItem(key)) || {};
        if (aMatch) {
          const [, levelId, lessonIdx] = aMatch.map(Number);
          prog[levelId] = prog[levelId] || { lessons: [], practices: {} };
          prog[levelId].lessons[lessonIdx] = { passed: true, xp, at: Date.now() };
        } else {
          const [, levelId, roundId] = pMatch.map(Number);
          prog[levelId] = prog[levelId] || { lessons: [], practices: {} };
          prog[levelId].practices[roundId] = { passed: true, xp, at: Date.now() };
        }
        localStorage.setItem(key, JSON.stringify(prog));
      } catch {}
    }

    // Trigger achievement checks with updated stats
    if (window.stAchievements && window.stAchievements.checkAchievements && typeof correct === 'number') {
      try { window.stAchievements.checkAchievements({ correct, total, xp }); } catch {}
    }
    // Update leaderboard score if logged in
    if (window.stLeaderboard && window.stLeaderboard.saveScore && typeof xp === 'number') {
      try { window.stLeaderboard.saveScore({ score: xp, mode: activeLesson?.category || 'lesson' }); } catch {}
    }

    setActiveLesson(null);
  };

  const finishOnboarding = (o) => {
    setProfile(p => ({
      ...p,
      uid: o.uid || p.uid,
      name: o.name,
      email: o.email || null,
      photoURL: o.photoURL || null,
      authMode: o.authMode,
    }));
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
          onStartAcademyLesson={(levelId, lessonIdx) => {
            const levels = (window.getAcademyLevels && window.getAcademyLevels()) || [];
            const level = levels.find(l => l.id === levelId);
            if (!level) return;
            const lesson = window.buildAcademyLesson && window.buildAcademyLesson(level, lessonIdx);
            if (lesson) pickLesson(lesson);
          }}
          onStartRound={({ roundId, levelId }) => {
            const levels = (window.getAcademyLevels && window.getAcademyLevels()) || [];
            const level = levels.find(l => l.id === levelId);
            const practice = level && window.buildAcademyPractice
              ? window.buildAcademyPractice(level, roundId)
              : null;
            if (practice) { pickLesson(practice); return; }
            // Fallback: sólo por roundId
            const round = (window.TRIVIA_ROUNDS || []).find(r => r.id === roundId);
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
          onLogout={async () => {
            try { if (window.stAuth) await window.stAuth.signOutUser(); } catch {}
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
            radial-gradient(1000px 500px at 20% 10%, var(--amber-glow), transparent 60%),
            radial-gradient(700px 300px at 85% 10%, var(--cyan-soft), transparent 65%),
            var(--bg-0)
          `,
          padding: '0',
          boxSizing: 'border-box',
        }),
        height: asDesktop ? 'auto' : '100dvh',
        overflow: asDesktop ? 'visible' : 'hidden',
      }}>
        {appContent}
        {/* Legal footer — rendered at the end of every screen's scroll area */}
        {screen !== 'onboarding' && screen !== 'auth' && !activeLesson && <LegalFooter />}
      </div>

      {/* Cookie consent banner (GDPR) — hides once accepted */}
      <CookieBanner />
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
      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 20 }}>{(window.stUiT ? window.stUiT('wiki.header', 'Enciclopedia 3D') : 'Enciclopedia 3D')}</div>
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
