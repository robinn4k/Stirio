// Stirio — App Shell
// Depends on: ui.jsx, screens.jsx, lesson.jsx, reference.jsx, data.js, repo-data.js
// React hooks come from ui.jsx's top-level destructuring (shared script scope).

// Labels come from `app.shortcut.<id>` keys in i18n/*.json at render time.
const PLAY_SHORTCUTS = [
  { id: 'daily',     icon: '📅' },
  { id: 'speed',     icon: '⚡' },
  { id: 'academy',   icon: '🎓' },
  { id: 'iba',       icon: '📇' },
  { id: 'freequiz',  icon: '🎲' },
  { id: 'mode-menu', icon: '⋯' },
];

const TWEAK_DEFAULTS = {
  theme: 'lounge',
  density: 'comfortable',
  featuredLayout: 'stacked',
  device: 'mobile',
  playShortcut: 'daily',
  units: 'ml',
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

const readInviteFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get('invite') || '').toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) return null;
    // Strip the param so a page refresh doesn't retrigger the auto-join flow.
    try {
      params.delete('invite');
      const qs = params.toString();
      const newUrl = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    } catch {}
    return code;
  } catch { return null; }
};

// Viral loop del Daily Challenge: cuando alguien comparte su reto, la URL
// lleva `?daily=YYYY-MM-DD&by=<handle>`. Parseamos, validamos, y limpiamos
// los params de la URL para no re-disparar el auto-open al refrescar.
// La fecha se valida de nuevo en DAILY_LESSON(seedForDate) — fechas fuera
// del rango [hoy-60d, hoy+1d] se ignoran y el usuario ve el Daily normal.
const readDailyChallengeFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const date = params.get('daily');
    const by = (params.get('by') || '').slice(0, 40);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    try {
      params.delete('daily');
      params.delete('by');
      const qs = params.toString();
      const newUrl = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    } catch {}
    return { date, by };
  } catch { return null; }
};

const App = () => {
  const saved = loadState();
  const savedOnboarding = loadOnboardingLocal();
  const mustOnboard = needsOnboarding(savedOnboarding);
  const initialInvite = readInviteFromUrl();
  const initialDailyChallenge = readDailyChallengeFromUrl();
  const [screen, setScreen]           = useState(mustOnboard ? 'onboarding' : (saved?.screen || 'home'));
  const [profile, setProfile]         = useState(saved?.profile || {
    name: '', authMode: null, xp: 340, xpNext: 500,
    level: 4, title: 'Apprentice', streak: 3, avatar: null,
    onboarding: savedOnboarding || null,
  });
  const [tweaks, setTweaks]           = useState(loadTweaks());
  const [activeLesson, setActiveLesson] = useState(null);
  const [subScreen, setSubScreen]     = useState(initialInvite && !mustOnboard ? 'duel' : null);
  const [fichaOpen, setFichaOpen]     = useState(null);
  const [activeMode, setActiveMode]   = useState(null);
  const [inviteCode, setInviteCode]   = useState(initialInvite);
  const [pendingDailyChallenge, setPendingDailyChallenge] = useState(initialDailyChallenge);

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
  const syncFromLearn = useCallback(() => {
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let tries = 0;
      while (!window.stLearn && tries < 40) { await new Promise(r => setTimeout(r, 100)); tries++; }
      if (cancelled) return;
      syncFromLearn();
    })();
    const onFocus = () => syncFromLearn();
    const onXpChange = () => syncFromLearn();
    const onNameChange = () => {
      const u = window.stAuth?.getCurrentUser?.();
      if (u) setProfile(p => ({ ...p, name: u.name || p.name, avatar: u.photo || p.avatar }));
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('stirio:xpchange', onXpChange);
    window.addEventListener('stirio:namechange', onNameChange);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('stirio:xpchange', onXpChange);
      window.removeEventListener('stirio:namechange', onNameChange);
    };
  }, [syncFromLearn]);

  // Listen for account switches and rehydrate user data from Firestore.
  // stAuth.subscribeAuthChange fires whenever the Firebase uid changes
  // (sign-in, sign-out, or switching Google accounts). The auth module also
  // wipes user-scoped localStorage when it detects a uid swap, so the cloud
  // loaders below repopulate cq_learn_data / cq_achievements with the new
  // account's data instead of inheriting the previous user's state.
  useEffect(() => {
    let cancelled = false;
    let unsub = null;
    (async () => {
      let tries = 0;
      while (!window.stAuth?.subscribeAuthChange && tries < 40) { await new Promise(r => setTimeout(r, 100)); tries++; }
      if (cancelled || !window.stAuth?.subscribeAuthChange) return;
      unsub = window.stAuth.subscribeAuthChange(async ({ uid, prev }) => {
        try {
          if (!uid) {
            // Signed out — reset React profile to a blank slate.
            setProfile({
              name: '', authMode: null, xp: 0, xpNext: 300, level: 1,
              streak: 0, title: 'Curious Novice', avatar: null, onboarding: null,
            });
            return;
          }
          // Account switch — belt-and-braces clear before cloud reload so
          // a partial Firestore write can't leave stale local data.
          if (prev && prev !== uid && window.stAuth?.clearUserScopedLocal) {
            try { window.stAuth.clearUserScopedLocal(); } catch {}
          }
          try { await window.stLearn?.loadLearnFromCloud?.(); } catch {}
          try { await window.stAchievements?.loadAchievementsFromCloud?.(); } catch {}

          const user = window.stAuth?.getCurrentUser?.();
          if (user) {
            setProfile(p => ({
              ...p,
              uid: user.uid,
              name: user.name || p.name,
              email: user.email || null,
              photoURL: user.photo || null,
              authMode: user.provider === 'guest' ? 'guest' : (user.provider === 'email' ? 'email' : 'google'),
            }));
          }
          syncFromLearn();

          // Re-sync onboarding from Firestore so the new account's
          // preferences (including language) are applied. If the cloud doc
          // has a complete onboarding, skip the flow — the previous
          // `onLogout` forces screen='onboarding' and without this jump
          // back the user gets prompted to redo onboarding even though
          // their answers are saved in Firestore.
          try {
            const cloudOnboarding = await window.stAuth?.loadOnboarding?.();
            if (cloudOnboarding) {
              saveOnboardingLocal(cloudOnboarding);
              setProfile(p => ({ ...p, onboarding: cloudOnboarding }));
              if (!needsOnboarding(cloudOnboarding)) {
                setScreen('home');
              }
              if (cloudOnboarding.language) {
                try { window.stLang?.setLang?.(cloudOnboarding.language); } catch {}
                window.dispatchEvent(new CustomEvent('stirio:langchange', { detail: { lang: cloudOnboarding.language } }));
              }
            }
          } catch {}
        } catch (e) { console.warn('[auth] rehydrate on authchange:', e); }
      });
    })();
    return () => { cancelled = true; if (typeof unsub === 'function') unsub(); };
  }, [syncFromLearn]);

  // Firebase auth bootstrap + i18n preload
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Poll for lang module (loaded async) and preload all translation JSONs
      let tries = 0;
      while (!window.stLang && tries < 40) { await new Promise(r => setTimeout(r, 100)); tries++; }
      if (!cancelled && window.stLang?.preloadAllTranslations) {
        try {
          await window.stLang.preloadAllTranslations();
          setLangVersion(v => v + 1);
          // Notify subscribers (Profile achievements list, etc.) so they can
          // re-resolve strings that were fetched with empty translation dicts.
          window.dispatchEvent(new CustomEvent('stirio:langchange', { detail: { lang: window.stLang.getLang?.() } }));
        } catch {}
      }

      // Poll for auth module
      tries = 0;
      while (!window.stAuth && tries < 40) { await new Promise(r => setTimeout(r, 100)); tries++; }
      if (cancelled || !window.stAuth) return;
      try {
        const local = window.stAuth.restoreSession();
        await window.stAuth.initFirebase(); // also detects persisted Google session
        // If this boot came from a signInWithGoogleRedirect round-trip,
        // consume the result + the pending onboarding answers stashed by
        // Onboarding.handleGoogle and complete onboarding here — the
        // Onboarding component unmounted during the redirect, so we skip
        // back to it by driving finishOnboarding directly.
        //
        // Fallback path: a SW `controllerchange` reload (triggered when a new
        // STATIC_CACHE_VERSION claims the page) can preempt the bootstrap
        // before finishOnboarding resolves. On the reload, getRedirectResult
        // already consumed the round-trip so `redirectUser` is null — but the
        // Firebase session is persisted and currentUser is signed-in Google.
        // When the pending stash still exists we can complete onboarding from
        // that state. The stash is kept until finishOnboarding actually
        // resolves so an interrupted attempt can retry on the next boot.
        const redirectUser = window.stAuth.consumePendingRedirectUser?.();
        let pendingStash = null;
        try { pendingStash = JSON.parse(localStorage.getItem('stirio::onboarding::pending') || 'null'); } catch {}
        // Stale stashes (older than 30 min) are ignored: the user likely
        // abandoned that flow and a fresh click would have overwritten it.
        const STASH_TTL_MS = 30 * 60 * 1000;
        if (pendingStash && (Date.now() - (pendingStash.at || 0) > STASH_TTL_MS)) {
          try { localStorage.removeItem('stirio::onboarding::pending'); } catch {}
          pendingStash = null;
        }
        const currentAuthUser = window.stAuth.getCurrentUser?.();
        const fallbackUser = !redirectUser && pendingStash && currentAuthUser && !currentAuthUser.isGuest && currentAuthUser.provider !== 'guest'
          ? currentAuthUser : null;
        // Last-resort safety net: wait up to 10s for Firebase's auth state
        // to emit a real (non-anonymous) user. Covers browsers / PWAs where
        // getRedirectResult returns null but the redirect round-trip DID
        // persist a Google session that onAuthStateChanged surfaces async.
        const resilientUser = (redirectUser || fallbackUser) ? null : (
          pendingStash ? await window.stAuth.waitForRealAuthUser?.(10000) : null
        );
        const userForOnboarding = redirectUser || fallbackUser || resilientUser;
        if (userForOnboarding && pendingStash) {
          try {
            await finishOnboarding({
              name: userForOnboarding.name || pendingStash.name || '',
              email: userForOnboarding.email || null,
              photoURL: userForOnboarding.photo || null,
              uid: userForOnboarding.uid,
              authMode: 'google',
              onboarding: {
                difficulty: pendingStash.level || 'skip',
                language: pendingStash.language,
                alcohol: pendingStash.alcohol || 'regular',
                favSpirit: pendingStash.favSpirit || null,
              },
            });
            // Only clear the stash after a successful completion so an
            // interrupted attempt (SW reload, crash) can retry.
            try { localStorage.removeItem('stirio::onboarding::pending'); } catch {}
          } catch (e) { console.warn('[auth] finishOnboarding post-redirect:', e); }
        }
        const user = window.stAuth.getCurrentUser() || local;
        if (cancelled || !user) return;
        setProfile(p => ({
          ...p,
          uid: user.uid,
          name: user.name,
          email: user.email || null,
          photoURL: user.photo || null,
          authMode: user.provider === 'guest' ? 'guest' : (user.provider === 'email' ? 'email' : 'google'),
        }));

        // Pull the user's XP + achievements from Firestore so the Profile /
        // Ranking / Achievements screens paint with the authoritative data
        // for this uid, even on a freshly-installed device.
        try { await window.stLearn?.loadLearnFromCloud?.(); } catch {}
        try { await window.stAchievements?.loadAchievementsFromCloud?.(); } catch {}
        syncFromLearn();

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

  // Viral loop: si el usuario aterrizó con `?daily=YYYY-MM-DD&by=X`, auto-lanza
  // el Daily de esa fecha una vez se alcanza Home (tras el onboarding si era
  // necesario). La lógica real vive en openMode('daily') que respeta el
  // pendingDailyChallenge y lo consume.
  useEffect(() => {
    if (!pendingDailyChallenge) return;
    if (screen !== 'home') return;
    if (activeLesson || subScreen) return;
    openMode('daily');
  }, [pendingDailyChallenge, screen, activeLesson, subScreen]);

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
    if (m === 'mode-menu') { setActiveMode('any'); return; }
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
    if (m === 'comanda')  { setSubScreen('comanda');   return; }
    if (m === 'glossary') { setSubScreen('glossary');  return; }
    if (m === 'map')      { setSubScreen('map');       return; }
    if (m === 'library')  { setSubScreen('library');   return; }
    if (m === 'article')  { setSubScreen('article');   return; }
    if (m === 'daily') {
      const opts = pendingDailyChallenge
        ? { dateStr: pendingDailyChallenge.date, challengedBy: pendingDailyChallenge.by }
        : {};
      const l = typeof window.DAILY_LESSON === 'function' ? window.DAILY_LESSON(opts) : null;
      if (l) { pickLesson(l); if (pendingDailyChallenge) setPendingDailyChallenge(null); }
      else setActiveMode('any'); // data not ready yet — show the menu instead of doing nothing
      return;
    }
    if (m === 'speed') {
      const l = typeof window.SPEED_LESSON === 'function' ? window.SPEED_LESSON() : null;
      if (l) pickLesson(l);
      else setActiveMode('any');
      return;
    }
    setActiveMode(m);
  };

  const lessonStartAtRef = useRef(0);
  const pickLesson   = (l) => { if (l) { lessonStartAtRef.current = Date.now(); setActiveLesson(l); } };
  const exitLesson   = ()  => { lessonStartAtRef.current = 0; setActiveLesson(null); };
  const finishLesson = ({ xp, correct, wrong, next } = {}) => {
    const total = (correct || 0) + (wrong || 0);
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

    // Trigger achievement checks with CUMULATIVE stats. Previously we passed
    // per-session values, so thresholds like xp_500, lessons_5, streak_3 and
    // perfect_lesson could never cross. Now we read prev counters from
    // stAchievements + xp/streak from stLearn and increment from there.
    if (window.stAchievements && window.stAchievements.checkAchievements && typeof correct === 'number') {
      try {
        const prev = (window.stAchievements.getStats && window.stAchievements.getStats()) || {};
        const learn = (window.stLearn && window.stLearn.getLearnStats) ? window.stLearn.getLearnStats() : { xp: 0, streak: 0 };
        const perfect = (wrong === 0) && (correct > 0);
        const patch = {
          totalGames: (prev.totalGames || 0) + 1,
          lessonsCompleted: (prev.lessonsCompleted || 0) + 1,
          xp: learn.xp || 0,
          streak: learn.streak || 0,
        };
        if (perfect) patch.perfectLesson = true;
        // Track distinct round IDs so `all_rounds` unlocks after 10 different
        // rounds played, not 10 replays of the same one.
        const activeId = activeLesson?.id || '';
        const roundMatch = activeId.match(/^round-(\d+)$/);
        if (roundMatch) {
          const roundsSet = new Set(prev.roundsPlayedIds || []);
          roundsSet.add(roundMatch[1]);
          patch.roundsPlayedIds = Array.from(roundsSet);
          patch.roundsPlayed = roundsSet.size;
        }
        window.stAchievements.checkAchievements(patch);
      } catch (e) { console.warn('achievements check failed:', e); }
    }
    // Update leaderboard score if logged in. `saveScore` signature is
    // { roundId, roundTitle, score, corrects, wrongs } — we derive roundId
    // from the active lesson so Firestore keeps one doc per round per user
    // (the path is scores/{uid}_{roundId}). Without it every finish
    // overwrites the same scores/{uid}_undefined doc.
    if (window.stLeaderboard && window.stLeaderboard.saveScore && typeof xp === 'number') {
      try {
        const lesson = activeLesson;
        const roundId = lesson?.id || `lesson-${Date.now()}`;
        const roundTitle = lesson?.title || lesson?.category || 'lesson';
        window.stLeaderboard.saveScore({
          roundId,
          roundTitle,
          score: xp,
          corrects: correct || 0,
          wrongs: wrong || 0,
        });
      } catch (e) { console.warn('saveScore failed:', e); }
    }

    // If the user tapped "Siguiente lección" from the results screen AND the
    // current lesson belongs to an Academy level, resolve the next unfinished
    // item in the level's sequence and launch it. Fall back to clearing the
    // lesson (returning to Academy hub) if nothing comes next.
    if (next && (aMatch || pMatch)) {
      const levelId = Number((aMatch || pMatch)[1]);
      const levels = (window.getAcademyLevels && window.getAcademyLevels()) || [];
      const level  = levels.find(l => l.id === levelId);
      const seq    = (level && level.sequence) || [];
      // Index of the item we just finished.
      let curIdx = -1;
      if (aMatch) {
        const lessonIdx = Number(aMatch[2]);
        curIdx = seq.findIndex(s => s.type === 'lesson' && s.index === lessonIdx);
      } else {
        const roundId = Number(pMatch[2]);
        curIdx = seq.findIndex(s => s.type === 'practice' && s.roundId === roundId);
      }
      const nextItem = curIdx >= 0 ? seq[curIdx + 1] : null;
      if (level && nextItem) {
        const nextLesson = nextItem.type === 'lesson'
          ? (window.buildAcademyLesson && window.buildAcademyLesson(level, nextItem.index))
          : (window.buildAcademyPractice && window.buildAcademyPractice(level, nextItem.roundId));
        if (nextLesson) {
          // Replace activeLesson directly (not via null + setTimeout) so React
          // swaps LessonPlayer in a single commit. The LessonPlayer's
          // `key={lesson.id}` forces a clean remount, and the old
          // LessonResults can't linger above the new intro as a ghost overlay.
          pickLesson(nextLesson);
          return;
        }
      }
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
    // Propagate the guest's chosen alias into stAuth so Duel, leaderboard and
    // anything else that reads `getCurrentUser().name` sees the real name
    // instead of the "Invitado" placeholder.
    if (o.authMode === 'guest' && o.name) {
      try { window.stAuth?.updateGuestName?.(o.name); } catch {}
    }
    if (payload.language) {
      try { window.stLang?.setLang(payload.language); } catch {}
      window.dispatchEvent(new CustomEvent('stirio:langchange', { detail: { lang: payload.language } }));
    }
    setScreen('home');
    // If the user arrived via an invite link, drop them straight into the
    // Duel lobby once onboarding is done.
    if (inviteCode) setSubScreen('duel');
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
        <KnowledgeScreen
          onBack={() => setSubScreen(null)}
          onOpenArticle={(entry) => { window.__articleOverride = entry; setSubScreen('article'); }}
          onOpenFicha={(f) => setFichaOpen(f)}
        />
      )}

      {subScreen === 'blind' && !activeLesson && (
        <BlindScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'builder' && !activeLesson && (
        <ConstructorScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'duel' && !activeLesson && (
        <DuelScreen
          onBack={() => { setSubScreen(null); setInviteCode(null); }}
          initialInviteCode={inviteCode}
        />
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

      {subScreen === 'comanda' && !activeLesson && (
        <ComandaScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'article' && !activeLesson && (
        <ArticleScreen
          article={(window.stArticles && window.stArticles.resolveArticle(window.__articleOverride)) || (window.stArticles && window.stArticles.getArticleOfTheDay())}
          onBack={() => { window.__articleOverride = null; setSubScreen(null); }}
          onOpenWiki={() => { window.__articleOverride = null; setSubScreen('wiki'); }}
        />
      )}

      {fichaOpen && (
        <FichaDetail ficha={fichaOpen} units={tweaks.units || 'ml'} onClose={() => setFichaOpen(null)} />
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
          shortcut={PLAY_SHORTCUTS.find(s => s.id === (tweaks.playShortcut || 'daily')) || PLAY_SHORTCUTS[0]}
          onPlay={() => openMode(tweaks.playShortcut || 'daily')}
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

      {/* Global toast host for XP / level-up / achievements / name changes */}
      <ToastHost />
    </>
  );
};

// ── Bottom nav ──────────────────────────────────────────────────
const BottomNav = ({ current, onNav, onPlay, shortcut }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const shortcutLabel = shortcut?.id
    ? tr(`app.shortcut.${shortcut.id}`, tr('app.shortcut.default', 'Jugar'))
    : tr('app.shortcut.default', 'Jugar');
  return (
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
      <NavBtn icon="home" label={tr('app.nav.home', 'Home')} active={current === 'home'} onClick={() => onNav('home')} />
      <button onClick={onPlay} style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--amber)',
        color: 'var(--bg-0)',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 0 24px var(--amber-glow), inset 0 1px 0 rgba(255,255,255,0.4)',
        border: 0,
        transition: 'transform .12s',
        fontSize: 24, lineHeight: 1,
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        aria-label={shortcutLabel}
        title={shortcutLabel}
      >
        {shortcut?.icon || <Icon name="play" size={22} />}
      </button>
      <NavBtn icon="user" label={tr('app.nav.you', 'You')} active={current === 'profile'} onClick={() => onNav('profile')} />
    </div>
  </nav>
  );
};

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

// WikiScreen was removed — the unified KnowledgeScreen (js/knowledge.jsx)
// now owns the encyclopedia UI and embeds wiki.html only for 3D categories.

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
