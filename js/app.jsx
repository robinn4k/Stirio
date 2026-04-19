// Stirio — App Shell
// Depends on: ui.jsx, screens.jsx, lesson.jsx, reference.jsx, data.js, repo-data.js
// React hooks come from ui.jsx's top-level destructuring (shared script scope).

const PLAY_SHORTCUTS = [
  { id: 'daily',     label: 'Reto diario',    icon: '📅', desc: '10 preguntas frescas' },
  { id: 'speed',     label: 'Velocidad 60s',  icon: '⚡',  desc: 'Ronda rápida de un minuto' },
  { id: 'academy',   label: 'Academia',       icon: '🎓', desc: 'Familias y rondas IBA' },
  { id: 'iba',       label: 'Recetas',        icon: '📇', desc: 'Recetario oficial' },
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
const LS_ACTIVITY = 'stirio::activity::v1';
const LS_ONBOARDING = 'cq_onboarding';

// Bump when questions change — forces existing users through the flow once.
const ONBOARDING_VERSION = 2;

const loadOnboardingLocal = () => {
  try { return JSON.parse(localStorage.getItem(LS_ONBOARDING)) || null; } catch { return null; }
};
const saveOnboardingLocal = (o) => {
  try { localStorage.setItem(LS_ONBOARDING, JSON.stringify(o)); } catch {}
};
const needsOnboarding = (o) => !o || typeof o.version !== 'number' || o.version < ONBOARDING_VERSION;

const loadState  = () => { try { return JSON.parse(localStorage.getItem(LS_STATE))  || null; } catch { return null; } };
const saveState  = (s) => { try { localStorage.setItem(LS_STATE, JSON.stringify(s)); } catch {} };

// ── Activity log (per-day rollup used by Profile heatmap + stats) ──
const activityDayKey = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const loadActivityLog = () => {
  try { return JSON.parse(localStorage.getItem(LS_ACTIVITY)) || {}; } catch { return {}; }
};
const recordActivity = ({ xp = 0, correct = 0, total = 0, durationMs = 0 } = {}) => {
  try {
    const log = loadActivityLog();
    const key = activityDayKey();
    const day = log[key] || { xp: 0, lessons: 0, perfect: 0, durationMs: 0 };
    day.xp += Math.max(0, xp | 0);
    day.lessons += 1;
    if (total > 0 && correct >= total) day.perfect += 1;
    day.durationMs += Math.max(0, durationMs | 0);
    log[key] = day;
    localStorage.setItem(LS_ACTIVITY, JSON.stringify(log));
  } catch {}
};
if (typeof window !== 'undefined') {
  window.stActivity = { loadActivityLog, recordActivity, activityDayKey };
}
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
  const savedOnboarding = loadOnboardingLocal();
  const mustOnboard = needsOnboarding(savedOnboarding);
  const [screen, setScreen]           = useState(mustOnboard ? 'onboarding' : (saved?.screen || 'home'));
  const [profile, setProfile]         = useState(saved?.profile || {
    name: '', authMode: null, xp: 340, xpNext: 500,
    level: 4, title: 'Apprentice', streak: 3, avatar: null,
    onboarding: savedOnboarding || null,
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

  // Hydrate profile XP/level/streak from the canonical stLearn store
  // (cq_learn_data). This is the same source the Firestore leaderboard reads
  // from, so Profile XP and Ranking XP stay in sync.
  useEffect(() => {
    let cancelled = false;
    const syncFromLearn = () => {
      try {
        if (!window.stLearn) return;
        const stats = window.stLearn.getLearnStats();
        const lvl = window.stLearn.getLevelInfo(stats.xp);
        const nextTotal = lvl.maxLevel ? stats.xp : (stats.xp + (lvl.need - lvl.cur));
        setProfile(p => ({
          ...p,
          xp: stats.xp,
          xpNext: nextTotal || p.xpNext,
          level: lvl.level,
          streak: stats.streak,
        }));
      } catch {}
    };
    (async () => {
      let tries = 0;
      while (!window.stLearn && tries < 40) { await new Promise(r => setTimeout(r, 100)); tries++; }
      if (cancelled) return;
      syncFromLearn();
    })();
    const onFocus = () => syncFromLearn();
    window.addEventListener('focus', onFocus);
    return () => { cancelled = true; window.removeEventListener('focus', onFocus); };
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

        // Firestore-backed onboarding sync: if the cloud copy is up-to-date
        // seed localStorage + skip the flow; if a guest has local answers
        // but the newly-signed-in Google account doesn't yet have them in
        // the cloud, migrate them up.
        let cloudOnboarding = null;
        try { cloudOnboarding = await window.stAuth.loadOnboarding(); } catch {}
        if (cloudOnboarding && !needsOnboarding(cloudOnboarding)) {
          saveOnboardingLocal(cloudOnboarding);
          setProfile(p => ({ ...p, onboarding: cloudOnboarding }));
          if (screen === 'onboarding') setScreen('home');
          if (cloudOnboarding.language) {
            try { window.stLang?.setLang(cloudOnboarding.language); } catch {}
          }
        } else {
          const localOnb = loadOnboardingLocal();
          if (!needsOnboarding(localOnb) && user.provider !== 'guest') {
            // Guest→Google upgrade: push the local payload to the new cloud doc
            try { await window.stAuth.saveOnboarding(localOnb); } catch {}
            setProfile(p => ({ ...p, onboarding: localOnb }));
            if (screen === 'onboarding') setScreen('home');
          } else if (!mustOnboard && screen === 'onboarding') {
            setScreen('home');
          }
        }
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

  // Edit-mode wire (Claude Design preview) — no-op ahora que TweaksPanel se eliminó
  useEffect(() => {
    const h = (e) => {
      if (e.data?.type === '__activate_edit_mode')   return;
      if (e.data?.type === '__deactivate_edit_mode') return;
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
    if (m === 'arcade')   { setSubScreen('arcade');    return; }
    if (m === 'memory')   { setSubScreen('memory');    return; }
    if (m === 'rhythm')   { setSubScreen('rhythm');    return; }
    if (m === 'glossary') { setSubScreen('glossary');  return; }
    if (m === 'map')      { setSubScreen('map');       return; }
    if (m === 'library')  { setSubScreen('library');   return; }
    if (m === 'daily')    { pickLesson(window.DAILY_LESSON && window.DAILY_LESSON()); return; }
    if (m === 'speed')    { pickLesson(window.SPEED_LESSON && window.SPEED_LESSON()); return; }
    setActiveMode(m);
  };

  const lessonStartAtRef = useRef(0);
  const pickLesson   = (l) => { if (l) { lessonStartAtRef.current = Date.now(); setActiveLesson(l); } };
  const exitLesson   = ()  => { lessonStartAtRef.current = 0; setActiveLesson(null); };
  const finishLesson = ({ xp, correct, total }) => {
    // Write XP to the canonical stLearn store (cq_learn_data) so Profile and
    // the Firestore leaderboard read the same number. Then re-sync the React
    // profile state from stLearn so the UI matches.
    try { if (window.stLearn && window.stLearn.addXp) window.stLearn.addXp(xp); } catch {}
    try {
      if (window.stLearn && window.stLearn.getLearnStats) {
        const stats = window.stLearn.getLearnStats();
        const lvl = window.stLearn.getLevelInfo(stats.xp);
        const nextTotal = lvl.maxLevel ? stats.xp : (stats.xp + (lvl.need - lvl.cur));
        setProfile(p => ({ ...p, xp: stats.xp, xpNext: nextTotal || p.xpNext, level: lvl.level, streak: stats.streak }));
      } else {
        setProfile(p => ({ ...p, xp: p.xp + xp }));
      }
    } catch { setProfile(p => ({ ...p, xp: p.xp + xp })); }

    // Record today's activity (used by Profile heatmap + stats)
    const startedAt = lessonStartAtRef.current;
    const durationMs = startedAt ? Math.max(0, Date.now() - startedAt) : 0;
    lessonStartAtRef.current = 0;
    recordActivity({ xp, correct, total, durationMs });

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

  const finishOnboarding = async (o) => {
    const payload = {
      version: ONBOARDING_VERSION,
      completedAt: Date.now(),
      ...(o.onboarding || {}),
    };
    setProfile(p => ({
      ...p,
      uid: o.uid || p.uid,
      name: o.name,
      email: o.email || null,
      photoURL: o.photoURL || null,
      authMode: o.authMode,
      onboarding: payload,
    }));
    saveOnboardingLocal(payload);
    if (payload.language) {
      try { window.stLang?.setLang(payload.language); } catch {}
      window.dispatchEvent(new CustomEvent('stirio:langchange', { detail: { lang: payload.language } }));
    }
    setScreen('home');
    // Fire-and-forget cloud write so Home paints immediately
    try { await window.stAuth?.saveOnboarding?.(payload); } catch {}
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

      {subScreen === 'glossary' && !activeLesson && (
        <GlossaryScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'map' && !activeLesson && (
        <MapScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'library' && !activeLesson && (
        <LibraryScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'arcade' && !activeLesson && (
        <ArcadeScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'memory' && !activeLesson && (
        <MemoryScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'rhythm' && !activeLesson && (
        <RhythmScreen onBack={() => setSubScreen(null)} />
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

      {/* Legal footer — inside scroll area so it rides above the fixed BottomNav */}
      {screen !== 'onboarding' && screen !== 'auth' && !activeLesson && (
        <div style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
          <LegalFooter />
        </div>
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

// ── Error boundary ─────────────────────────────────────────────
// Catches uncaught exceptions in any descendant (e.g. a blank-screen crash
// inside LessonPlayer when step is undefined). Without this, React unmounts
// the entire tree on child error → completely blank SPA.
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null, info: null }; }
  static getDerivedStateFromError(error) { return { error, info: null }; }
  componentDidCatch(err, info) { this.setState({ info }); console.error('[Stirio crash]', err, info); }
  reset = () => { try { window.location.reload(); } catch { this.setState({ error: null, info: null }); } };
  render() {
    if (!this.state.error) return this.props.children;
    const err = this.state.error;
    const msg = (err && (err.message || String(err))) || 'unknown error';
    const stack = (err && err.stack) ? String(err.stack).split('\n').slice(0, 6).join('\n') : '';
    const comp = (this.state.info && this.state.info.componentStack)
      ? String(this.state.info.componentStack).split('\n').slice(0, 6).join('\n')
      : '';
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg-0)', color: 'var(--ink-1)' }}>
        <div className="card" style={{ padding: 24, textAlign: 'left', maxWidth: 480, width: '100%' }}>
          <div style={{ fontSize: 36, marginBottom: 6, textAlign: 'center' }}>⚠️</div>
          <h2 style={{ fontFamily: 'var(--f-serif)', margin: '0 0 10px', textAlign: 'center' }}>Algo falló</h2>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 10, marginBottom: 10, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', wordBreak: 'break-word' }}>
            <strong style={{ color: 'var(--amber)' }}>{msg}</strong>
            {stack && <pre style={{ whiteSpace: 'pre-wrap', margin: '6px 0 0', fontSize: 10 }}>{stack}</pre>}
            {comp && <pre style={{ whiteSpace: 'pre-wrap', margin: '6px 0 0', fontSize: 10, color: 'var(--ink-3)' }}>{comp}</pre>}
          </div>
          <button className="btn primary" onClick={this.reset} style={{ width: '100%' }}>Recargar</button>
        </div>
      </div>
    );
  }
}

// ── Bootstrap ──────────────────────────────────────────────────
const kickApp = () => {
  const root = document.getElementById('root');
  if (root) ReactDOM.createRoot(root).render(<ErrorBoundary><App /></ErrorBoundary>);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', kickApp);
} else {
  kickApp();
}
