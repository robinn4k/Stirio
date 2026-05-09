// Stirio — App Shell
// Depends on: ui.jsx, screens.jsx, lesson.jsx, reference.jsx, data.js, repo-data.js
// React hooks come from ui.jsx's top-level destructuring (shared script scope).
//
// Phase 1 (router migration): screen/subScreen/activeMode/activeLesson/fichaOpen
// have been replaced by a stack-based router (window.stRouter). The ROUTES table
// below is the single source of truth — adding a new screen means adding a route
// here and a render branch in renderRoute(). All `onBack` callbacks call
// router.back(), and overlays (lesson, mode-sheet, ficha) render on top of the
// underlying base screen instead of replacing it.

const ROUTES = {
  // Top-level screens (no parent — they're peers, not nested).
  // Profile being a peer is critical: with parent='home' the screen-derivation
  // walks up to 'home', which makes `screen === 'profile'` always false and
  // hides the Profile component entirely. Back-navigation from Profile is
  // handled by `onBack={() => setScreen('home')}` (router.reset under the
  // hood), which doesn't depend on the parent declaration.
  onboarding:  { hidesNav: true,  hidesLegal: true },
  home:        {},
  profile:     {},

  // Subscreens (parent: home unless noted)
  academy:            { parent: 'home',         hidesNav: true },
  iba:                { parent: 'home',         hidesNav: true },
  freequiz:        { parent: 'home',         hidesNav: true },
  wiki:            { parent: 'home',         hidesNav: true },
  blind:           { parent: 'home',         hidesNav: true },
  builder:         { parent: 'home',         hidesNav: true },
  duel:            { parent: 'home',         hidesNav: true },
  glossary:        { parent: 'home',         hidesNav: true },
  map:             { parent: 'home',         hidesNav: true },
  arcade:          { parent: 'home',         hidesNav: true },
  memory:          { parent: 'home',         hidesNav: true },
  rhythm:          { parent: 'home',         hidesNav: true },
  comanda:         { parent: 'home',         hidesNav: true },
  euvs:            { parent: 'home',         hidesNav: true },
  article:         { parent: 'wiki',         hidesNav: true },

  // Overlays — render on top of the base screen rather than replacing it.
  lesson:      { overlay: true, hidesNav: true, hidesLegal: true },
  'mode-sheet':{ overlay: true },
  ficha:       { overlay: true },
};

// Compute the base screen index (last non-overlay) and the overlay tail.
const splitStack = (stack) => {
  let baseIdx = stack.length - 1;
  while (baseIdx >= 0 && ROUTES[stack[baseIdx].name]?.overlay) baseIdx--;
  return {
    base: baseIdx >= 0 ? stack[baseIdx] : null,
    overlays: baseIdx >= 0 ? stack.slice(baseIdx + 1) : stack.slice(),
    top: stack[stack.length - 1] || null,
  };
};

// Subscribe to router updates and force a re-render. Returns the live router
// API alongside the current entry + decomposed stack.
const useRouter = () => {
  const router = (typeof window !== 'undefined' ? window.stRouter : null);
  const [, force] = useState(0);
  useEffect(() => {
    if (!router) return undefined;
    return router.subscribe(() => force(n => (n + 1) | 0));
  }, [router]);
  if (!router) {
    return { ready: false, current: null, stack: [], base: null, overlays: [], top: null,
             navigate: () => false, back: () => false, replace: () => false, reset: () => false };
  }
  const stack = router.getStack();
  const { base, overlays, top } = splitStack(stack);
  return {
    ready: true,
    current: router.getCurrent(),
    stack, base, overlays, top,
    navigate: router.navigate,
    back: router.back,
    replace: router.replace,
    reset: router.reset,
  };
};

// One-shot route registration (idempotent — defineRoutes merges).
const ensureRoutesDefined = () => {
  if (typeof window === 'undefined' || !window.stRouter) return;
  if (window.__stRoutesDefined) return;
  window.stRouter.defineRoutes(ROUTES);
  window.__stRoutesDefined = true;
};

// Labels come from `app.shortcut.<id>` keys in i18n/*.json at render time.
const PLAY_SHORTCUTS = [
  { id: 'daily',     icon: '📅' },
  { id: 'speed',     icon: '⚡' },
  { id: 'academy',   icon: '🎓' },
  { id: 'iba',       icon: '📇' },
  { id: 'freequiz',  icon: '🎲' },
  { id: 'mode-menu', icon: '⋯' },
];

// Auto-pick a sensible device default based on the actual viewport, but only
// when the user hasn't stored an explicit preference. Mouse-driven wide
// windows get the desktop layout; phones / tablets / coarse pointers get the
// mobile preview. Returns 'mobile' on SSR or any environment without
// matchMedia (defensive — the app is browser-only but keep it cheap).
const detectDeviceDefault = () => {
  try {
    if (typeof window === 'undefined' || !window.matchMedia) return 'mobile';
    return window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
      ? 'desktop'
      : 'mobile';
  } catch { return 'mobile'; }
};

const TWEAK_DEFAULTS = {
  theme: 'lounge',
  density: 'comfortable',
  featuredLayout: 'stacked',
  device: detectDeviceDefault(),
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
// Debounce cloud activity writes so a burst of recordActivity calls (e.g. a
// user blowing through several lessons) coalesces into one Firestore round-trip.
let _activitySyncTimer = 0;
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
    // Notify listeners (Profile heatmap, future widgets) so they re-read the
    // log without waiting for a remount or window-focus event.
    try { window.dispatchEvent(new CustomEvent('stirio:activitychange', { detail: { day: key, ...day } })); } catch {}
    if (_activitySyncTimer) clearTimeout(_activitySyncTimer);
    _activitySyncTimer = setTimeout(() => {
      _activitySyncTimer = 0;
      try { window.stLearn?.syncActivityToCloud?.(loadActivityLog()); } catch {}
    }, 1500);
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
  ensureRoutesDefined();
  const saved = loadState();
  const savedOnboarding = loadOnboardingLocal();
  const mustOnboard = needsOnboarding(savedOnboarding);
  const initialInvite = readInviteFromUrl();
  const initialDailyChallenge = readDailyChallengeFromUrl();

  // Seed the router stack ONCE, before the first React render. We can't do this
  // in useEffect because the first paint would flash an empty stack.
  if (typeof window !== 'undefined' && window.stRouter && !window.__stRouteSeeded) {
    window.__stRouteSeeded = true;
    if (mustOnboard) {
      window.stRouter.reset('onboarding');
    } else {
      const baseScreen = saved?.screen === 'profile' ? 'profile' : 'home';
      window.stRouter.reset(baseScreen);
      if (initialInvite) {
        window.stRouter.navigate('duel', { inviteCode: initialInvite });
      }
    }
  }

  const router = useRouter();
  // Walk parent chain to find the top-level tab (home / profile / onboarding).
  const baseName = router.base?.name || 'home';
  const getTopLevel = (name) => {
    let cur = name;
    let safety = 10;
    while (cur && ROUTES[cur]?.parent && safety-- > 0) cur = ROUTES[cur].parent;
    return cur || 'home';
  };
  const screen       = baseName === 'onboarding' ? 'onboarding' : getTopLevel(baseName);
  const subScreen    = (baseName === 'home' || baseName === 'profile' || baseName === 'onboarding') ? null : baseName;
  const activeLesson = router.overlays.find(o => o.name === 'lesson')?.params?.lesson || null;
  const fichaOverlay = router.overlays.find(o => o.name === 'ficha');
  const fichaOpen    = fichaOverlay?.params?.ficha || null;
  const modeOverlay  = router.overlays.find(o => o.name === 'mode-sheet');
  const activeMode   = modeOverlay?.params?.mode || null;
  // Topmost route metadata controls chrome (BottomNav / LegalFooter visibility).
  const topMeta      = router.top ? (ROUTES[router.top.name] || {}) : {};
  // Article entry for ArticleScreen: passed via route params instead of the
  // legacy window.__articleOverride side-channel (Phase 1 cleanup).
  const articleEntry = baseName === 'article' ? router.base?.params?.entry : null;

  const [profile, setProfile]         = useState(saved?.profile || {
    name: '', authMode: null, xp: 340, xpNext: 500,
    level: 4, title: 'Apprentice', streak: 3, avatar: null,
    onboarding: savedOnboarding || null,
  });
  const [tweaks, setTweaks]           = useState(loadTweaks());
  const [inviteCode, setInviteCode]   = useState(initialInvite);
  const [pendingDailyChallenge, setPendingDailyChallenge] = useState(initialDailyChallenge);

  // ── Router shortcuts (stable across renders) ────────────────────────────
  // setScreen used to switch the top-level screen AND clear any subscreen.
  // The router equivalent is reset(name) which clears the stack first.
  const setScreen = useCallback((name) => {
    if (!window.stRouter) return;
    window.stRouter.reset(name);
  }, []);
  // setSubScreen(null) used to mean "back to home" (clears subscreen overlay).
  // setSubScreen('something') used to push a subscreen.
  const setSubScreen = useCallback((name) => {
    if (!window.stRouter) return;
    if (name == null) {
      window.stRouter.reset(screen);
    } else {
      // If a subscreen is already on top, replace it; otherwise push.
      const top = window.stRouter.getCurrent();
      if (top && ROUTES[top.name] && !ROUTES[top.name].overlay && top.name !== 'home' && top.name !== 'profile' && top.name !== 'onboarding') {
        window.stRouter.replace(name);
      } else {
        window.stRouter.navigate(name);
      }
    }
  }, [screen]);
  const setActiveLesson = useCallback((lesson) => {
    if (!window.stRouter) return;
    if (lesson) {
      // If there's already a lesson on top, replace it so React swaps cleanly
      // (matches the original "set activeLesson directly" behavior).
      const top = window.stRouter.getCurrent();
      if (top?.name === 'lesson') window.stRouter.replace('lesson', { lesson });
      else window.stRouter.navigate('lesson', { lesson });
    } else {
      // Pop the lesson overlay if it's on top.
      const top = window.stRouter.getCurrent();
      if (top?.name === 'lesson') window.stRouter.back();
    }
  }, []);
  const setFichaOpen = useCallback((ficha) => {
    if (!window.stRouter) return;
    if (ficha) {
      // Track distinct fichas opened so the `fichas_reader` achievement
      // (read 5+ recipes) actually unlocks. Each unique cocktail name
      // counts once; reopening the same recipe doesn't double-count.
      try {
        if (window.stAchievements?.checkAchievements && window.stAchievements?.getStats) {
          const prev = window.stAchievements.getStats() || {};
          const seen = new Set(prev.fichasOpenedIds || []);
          if (ficha.name && !seen.has(ficha.name)) {
            seen.add(ficha.name);
            window.stAchievements.checkAchievements({
              fichasOpenedIds: Array.from(seen),
              fichasOpened: seen.size,
            });
          }
        }
      } catch {}
      const top = window.stRouter.getCurrent();
      if (top?.name === 'ficha') window.stRouter.replace('ficha', { ficha });
      else window.stRouter.navigate('ficha', { ficha });
    } else {
      const top = window.stRouter.getCurrent();
      if (top?.name === 'ficha') window.stRouter.back();
    }
  }, []);
  const setActiveMode = useCallback((mode) => {
    if (!window.stRouter) return;
    if (mode) {
      const top = window.stRouter.getCurrent();
      if (top?.name === 'mode-sheet') window.stRouter.replace('mode-sheet', { mode });
      else window.stRouter.navigate('mode-sheet', { mode });
    } else {
      const top = window.stRouter.getCurrent();
      if (top?.name === 'mode-sheet') window.stRouter.back();
    }
  }, []);
  // Covers the post-redirect window: onboarding is the initial screen because
  // `cq_onboarding` hasn't been written yet, but a pending stash OR a persisted
  // Firebase session tells us the bootstrap is about to complete onboarding.
  // Without this flag the user would see the blank step 0 form for ~2–10s
  // before `finishOnboarding` lands — they perceive it as "returned to start".
  const [authBootstrapping, setAuthBootstrapping] = useState(() => {
    try {
      const pending = !!localStorage.getItem('stirio::onboarding::pending');
      const savedUser = !!localStorage.getItem('cq_current_user');
      return mustOnboard && (pending || savedUser);
    } catch { return false; }
  });

  // Persist top-level screen + profile so a reload restores Profile vs Home.
  // Only 'home' / 'profile' are restored (subscreens / overlays don't persist).
  useEffect(() => {
    const persistedScreen = (screen === 'profile') ? 'profile' : 'home';
    saveState({ screen: persistedScreen, profile });
  }, [screen, profile]);

  // One-shot migration: pre-multitrack builds wrote cocktail academy progress
  // to `cq_academy_progress`. Copy it to the new per-track key on first mount
  // if the new key is empty, so returning users keep their unlocks.
  useEffect(() => {
    try {
      const legacy = localStorage.getItem('cq_academy_progress');
      const current = localStorage.getItem('cq_academy_cocktail');
      if (legacy && !current) {
        localStorage.setItem('cq_academy_cocktail', legacy);
      }
    } catch {}
  }, []);

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
      // Wait via the service registry instead of polling. Resolves immediately
      // if stLearn is already registered; otherwise resumes when index.html's
      // import('./js/learn.js') chain completes.
      try { if (window.stServices?.ready) await window.stServices.ready('stLearn'); } catch {}
      if (cancelled) return;
      syncFromLearn();
    })();
    const onFocus = () => syncFromLearn();
    const onXpChange = () => syncFromLearn();
    const onNameChange = () => {
      const u = window.stAuth?.getCurrentUser?.();
      if (u) setProfile(p => ({ ...p, name: u.name || p.name, avatar: u.photo || p.avatar }));
    };
    // Open MapScreen with deep-link params (focus / spirit). Dispatched by
    // MiniRegionMap when the user taps "Ver mapa →" inside an article so the
    // navigation stays inside the SPA instead of opening map.html in a new
    // browser tab.
    const onOpenMap = (e) => {
      const detail = e?.detail || {};
      if (!window.stRouter) return;
      const top = window.stRouter.getCurrent();
      if (top?.name === 'map') window.stRouter.replace('map', detail);
      else window.stRouter.navigate('map', detail);
    };
    // Open a FichaDetail overlay from anywhere via custom event. Used by
    // BrandsSection pairing chips so they can navigate to the recipe without
    // having to plumb onOpenFicha all the way down through ArticleScreen.
    const onOpenFichaEvt = (e) => {
      const ficha = e?.detail?.ficha;
      if (ficha) setFichaOpen(ficha);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('stirio:xpchange', onXpChange);
    window.addEventListener('stirio:namechange', onNameChange);
    window.addEventListener('stirio:open-map', onOpenMap);
    window.addEventListener('stirio:open-ficha', onOpenFichaEvt);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('stirio:xpchange', onXpChange);
      window.removeEventListener('stirio:namechange', onNameChange);
      window.removeEventListener('stirio:open-map', onOpenMap);
      window.removeEventListener('stirio:open-ficha', onOpenFichaEvt);
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
      try { if (window.stServices?.ready) await window.stServices.ready('stAuth'); } catch {}
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
          // Rehydrate the activity heatmap from Firestore when the local
          // rollup is empty (e.g. just after an account switch wiped it).
          try {
            if (Object.keys(loadActivityLog()).length === 0) {
              await window.stLearn?.loadActivityFromCloud?.();
            }
          } catch {}

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
      // Wait for lang module via the service registry, then preload translations.
      try { if (window.stServices?.ready) await window.stServices.ready('stLang'); } catch {}
      if (!cancelled && window.stLang?.preloadAllTranslations) {
        try {
          await window.stLang.preloadAllTranslations();
          setLangVersion(v => v + 1);
          // Notify subscribers (Profile achievements list, etc.) so they can
          // re-resolve strings that were fetched with empty translation dicts.
          window.dispatchEvent(new CustomEvent('stirio:langchange', { detail: { lang: window.stLang.getLang?.() } }));
        } catch {}
      }

      // Wait for auth module via the service registry.
      try { if (window.stServices?.ready) await window.stServices.ready('stAuth'); } catch {}
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
        // Stale stashes (older than 24 h) are ignored: the user likely
        // abandoned that flow. 24 h covers 2FA / password-reset detours that
        // the previous 30 min TTL clipped off, leaving signed-in users stuck.
        const STASH_TTL_MS = 24 * 60 * 60 * 1000;
        if (pendingStash && (Date.now() - (pendingStash.at || 0) > STASH_TTL_MS)) {
          try { localStorage.removeItem('stirio::onboarding::pending'); } catch {}
          pendingStash = null;
        }
        const currentAuthUser = window.stAuth.getCurrentUser?.();
        const fallbackUser = !redirectUser && currentAuthUser && !currentAuthUser.isGuest && currentAuthUser.provider !== 'guest'
          ? currentAuthUser : null;
        // Last-resort safety net: wait up to 10s for Firebase's auth state
        // to emit a real (non-anonymous) user. Covers browsers / PWAs where
        // getRedirectResult returns null but the redirect round-trip DID
        // persist a Google session that onAuthStateChanged surfaces async.
        // Runs whenever we don't yet have a user — independent of the stash,
        // so a user whose stash was purged still gets rescued from step 0.
        const resilientUser = (redirectUser || fallbackUser)
          ? null
          : await window.stAuth.waitForRealAuthUser?.(10000);
        const userForOnboarding = redirectUser || fallbackUser || resilientUser;
        if (userForOnboarding) {
          // Merge whatever we have: pending answers win, else derive minimal
          // defaults from the Google profile + stored/browser language.
          const storedLang = (() => { try { return localStorage.getItem('stirio_lang'); } catch { return null; } })();
          try {
            await finishOnboarding({
              name: userForOnboarding.name || pendingStash?.name || '',
              email: userForOnboarding.email || null,
              photoURL: userForOnboarding.photo || null,
              uid: userForOnboarding.uid,
              authMode: userForOnboarding.provider === 'email' ? 'email' : 'google',
              onboarding: {
                difficulty: pendingStash?.level || 'skip',
                language: pendingStash?.language || storedLang || window.stLang?.getLang?.() || 'es',
                alcohol: pendingStash?.alcohol || 'regular',
                favSpirit: pendingStash?.favSpirit || null,
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
        // Same activity rehydrate as in the auth-change effect — this path
        // covers the initial post-login bootstrap.
        try {
          if (Object.keys(loadActivityLog()).length === 0) {
            await window.stLearn?.loadActivityFromCloud?.();
          }
        } catch {}
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
          } else if (user.provider !== 'guest' && screen === 'onboarding' && needsOnboarding(localOnb)) {
            // Safety net: authenticated real user but neither cloud nor local
            // onboarding landed (e.g. finishOnboarding call above raced and
            // lost). Complete with derived defaults so the user reaches Home
            // instead of step 0. They can refine picks from Profile later.
            const storedLang = (() => { try { return localStorage.getItem('stirio_lang'); } catch { return null; } })();
            try {
              await finishOnboarding({
                name: user.name || '',
                email: user.email || null,
                photoURL: user.photo || null,
                uid: user.uid,
                authMode: user.provider === 'email' ? 'email' : 'google',
                onboarding: {
                  difficulty: 'skip',
                  language: storedLang || window.stLang?.getLang?.() || 'es',
                  alcohol: 'regular',
                  favSpirit: null,
                },
              });
            } catch (e) { console.warn('[auth] onboarding safety-net:', e); }
          }
        }
      } catch (e) { console.warn('[auth] bootstrap', e); }
      finally { if (!cancelled) setAuthBootstrapping(false); }
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

  // Maps "openMode" intents to router routes. Modes that resolve to a lesson
  // (daily, speed) build the lesson eagerly and push a 'lesson' overlay; the
  // rest map directly to a subscreen route.
  const MODE_ROUTES = {
    academy:  'academy',
    iba:      'iba',
    freequiz: 'freequiz',
    wiki:     'wiki',
    blind:    'blind',
    builder:  'builder',
    duel:     'duel',
    arcade:   'arcade',
    memory:   'memory',
    rhythm:   'rhythm',
    comanda:  'comanda',
    glossary: 'glossary',
    map:      'map',
    article:  'article',
    euvs:     'euvs',
  };
  const openMode = (m) => {
    if (m === 'mode-menu') { setActiveMode('any'); return; }
    if (m === 'daily') {
      const opts = pendingDailyChallenge
        ? { dateStr: pendingDailyChallenge.date, challengedBy: pendingDailyChallenge.by }
        : {};
      // Wait for translations before building the lesson — DAILY_LESSON() runs
      // _tp('daily.card_*', ...) and would otherwise emit literal i18n keys
      // when the user taps Daily during the first ~1 s of boot. Awaiting the
      // (memoised) preload also guarantees the stirio:langchange event has
      // already fired by the time we mount the lesson overlay, so the
      // langVersion bump can't pop the freshly-mounted overlay.
      (async () => {
        try { await window.stLang?.preloadAllTranslations?.(); } catch {}
        const l = typeof window.DAILY_LESSON === 'function' ? window.DAILY_LESSON(opts) : null;
        if (l) { pickLesson(l); if (pendingDailyChallenge) setPendingDailyChallenge(null); }
        else setActiveMode('any'); // data not ready yet — show the menu instead of doing nothing
      })();
      return;
    }
    if (m === 'speed') {
      // Same reasoning as 'daily': SPEED_LESSON also goes through _tp().
      (async () => {
        try { await window.stLang?.preloadAllTranslations?.(); } catch {}
        const l = typeof window.SPEED_LESSON === 'function' ? window.SPEED_LESSON() : null;
        if (l) pickLesson(l);
        else setActiveMode('any');
      })();
      return;
    }
    const route = MODE_ROUTES[m];
    if (route) { setSubScreen(route); return; }
    // Unknown mode → fall back to ModeSheet (preserves legacy behavior).
    setActiveMode(m);
  };

  const lessonStartAtRef = useRef(0);
  // useCallback with [] deps so the LESSON_FINISHED effect closures (registered
  // once on mount) capture stable references instead of re-render churn.
  const pickLesson   = useCallback((l) => {
    if (l) { lessonStartAtRef.current = Date.now(); setActiveLesson(l); }
  }, [setActiveLesson]);
  const exitLesson   = useCallback(()  => {
    lessonStartAtRef.current = 0; setActiveLesson(null);
  }, [setActiveLesson]);
  // Used by finishLesson when there's no "next" academy item — closes the
  // lesson overlay if it's still on top.
  const closeLessonOverlay = useCallback(() => {
    if (typeof window === 'undefined' || !window.stRouter) return;
    const top = window.stRouter.getCurrent();
    if (top?.name === 'lesson') window.stRouter.back();
  }, []);
  // finishLesson is invoked by LessonPlayer with { xp, correct, wrong, next }.
  // The body is now a single dispatch — the seven side-effects (XP write,
  // profile sync, activity log, academy progress, achievements, leaderboard,
  // resolve-next-or-close) are registered once on mount and executed in order
  // by window.stStore. See the LESSON_FINISHED effect registration block below.
  const finishLesson = useCallback((result = {}) => {
    if (!window.stStore || !window.stRouter) return null;
    const top = window.stRouter.getCurrent();
    const lesson = top?.name === 'lesson' ? top.params?.lesson : null;
    const startedAt = lessonStartAtRef.current;
    // Log activity inline — must run for every finished lesson regardless of
    // whether the LESSON_FINISHED effect chain registered in time. The effect
    // version was removed to avoid double-counting (see effects block below).
    try {
      const total = (result.correct || 0) + (result.wrong || 0);
      const durationMs = startedAt ? Math.max(0, Date.now() - startedAt) : 0;
      recordActivity({ xp: result.xp, correct: result.correct, total, durationMs });
    } catch {}
    lessonStartAtRef.current = 0;
    return window.stStore.dispatch({
      type: 'LESSON_FINISHED',
      payload: {
        xp: result.xp,
        correct: result.correct,
        wrong: result.wrong,
        next: result.next,
        lesson,
        startedAt,
      },
    });
  }, []);

  // Register the LESSON_FINISHED effect chain ONCE on mount. Each effect runs
  // in order; failures are isolated by the store. Closures here capture stable
  // references (setProfile setter, useCallback'd helpers, refs).
  useEffect(() => {
    if (!window.stStore) return undefined;

    const writeXp = (action) => {
      const { xp } = action.payload;
      try { if (window.stLearn?.addXp) window.stLearn.addXp(xp); } catch {}
    };

    const syncProfile = (action) => {
      const { xp } = action.payload;
      try {
        if (window.stLearn?.getLearnStats) {
          const stats = window.stLearn.getLearnStats();
          const lvl = window.stLearn.getLevelInfo(stats.xp);
          const nextTotal = lvl.maxLevel ? stats.xp : (stats.xp + (lvl.need - lvl.cur));
          setProfile(p => ({ ...p, xp: stats.xp, xpNext: nextTotal || p.xpNext, level: lvl.level, streak: stats.streak }));
        } else {
          setProfile(p => ({ ...p, xp: p.xp + xp }));
        }
      } catch { setProfile(p => ({ ...p, xp: p.xp + xp })); }
    };

    // Activity recording moved inline to finishLesson() above so it runs even
    // when the effect chain isn't wired in time. Don't add it back here — would
    // double-count.

    const persistAcademy = (action) => {
      const { lesson, xp } = action.payload;
      const id = lesson?.id || '';
      const aMatch = id.match(/^academy-(cocktail|wine|coffee)-l(\d+)-les(\d+)$/);
      const pMatch = id.match(/^academy-(cocktail|wine|coffee)-practice-l(\d+)-r(\d+)$/);
      if (!aMatch && !pMatch) return;
      try {
        const track = (aMatch || pMatch)[1];
        const key = `cq_academy_${track}`;
        const prog = JSON.parse(localStorage.getItem(key)) || {};
        if (aMatch) {
          const levelId = Number(aMatch[2]);
          const lessonIdx = Number(aMatch[3]);
          prog[levelId] = prog[levelId] || { lessons: [], practices: {} };
          prog[levelId].lessons[lessonIdx] = { passed: true, xp, at: Date.now() };
        } else {
          const levelId = Number(pMatch[2]);
          const roundId = Number(pMatch[3]);
          prog[levelId] = prog[levelId] || { lessons: [], practices: {} };
          prog[levelId].practices[roundId] = { passed: true, xp, at: Date.now() };
        }
        localStorage.setItem(key, JSON.stringify(prog));
      } catch {}
    };

    const checkAchievementsEffect = (action) => {
      const { lesson, correct, wrong } = action.payload;
      if (!window.stAchievements?.checkAchievements || typeof correct !== 'number') return;
      try {
        const prev = (window.stAchievements.getStats && window.stAchievements.getStats()) || {};
        const learn = window.stLearn?.getLearnStats ? window.stLearn.getLearnStats() : { xp: 0, streak: 0 };
        const total = (correct || 0) + (wrong || 0);
        const perfect = (wrong === 0) && (correct > 0);
        const patch = {
          totalGames: (prev.totalGames || 0) + 1,
          lessonsCompleted: (prev.lessonsCompleted || 0) + 1,
          xp: learn.xp || 0,
          streak: learn.streak || 0,
        };
        if (perfect) patch.perfectLesson = true;
        const activeId = lesson?.id || '';

        // Free-quiz round (`round-N`) — track distinct rounds played and
        // flag perfectQuiz when the user 10/10s a round.
        const roundMatch = activeId.match(/^round-(\d+)$/);
        if (roundMatch) {
          const roundsSet = new Set(prev.roundsPlayedIds || []);
          roundsSet.add(roundMatch[1]);
          patch.roundsPlayedIds = Array.from(roundsSet);
          patch.roundsPlayed = roundsSet.size;
          if (perfect && total >= 10) patch.perfectQuiz = true;
        }

        // Daily challenge (`daily-<seed>`) — first play unlocks daily_first;
        // a 10/10 unlocks daily_perfect.
        if (/^daily-/.test(activeId)) {
          patch.dailyPlayed = (prev.dailyPlayed || 0) + 1;
          if (perfect && total >= 10) patch.dailyPerfect = true;
        }

        // Speed mode (`speed-<ts>`) — track best run by # of correct answers.
        if (/^speed-/.test(activeId)) {
          patch.speedMax = Math.max(prev.speedMax || 0, correct);
        }

        // Academy — count distinct levels passed and flag academy_perfect.
        const acadMatch = activeId.match(/^academy-(cocktail|wine|coffee)-l(\d+)/);
        if (acadMatch && perfect) patch.academyPerfect = true;
        if (acadMatch) {
          // Recompute completed-level count across all 3 tracks so the
          // total matches what AcademyScreen tab counts show. A level is
          // "complete" when at least one of its lessons was passed.
          let completed = 0;
          for (const track of ['cocktail', 'wine', 'coffee']) {
            try {
              const prog = JSON.parse(localStorage.getItem(`cq_academy_${track}`) || '{}');
              completed += Object.values(prog)
                .filter(l => (l.lessons || []).some(x => x?.passed))
                .length;
            } catch {}
          }
          patch.academyLevels = completed;
        }

        window.stAchievements.checkAchievements(patch);
      } catch (e) { console.warn('achievements check failed:', e); }
    };

    const saveLeaderboardEffect = (action) => {
      const { lesson, xp, correct, wrong } = action.payload;
      if (!window.stLeaderboard?.saveScore || typeof xp !== 'number') return;
      try {
        const roundId = lesson?.id || `lesson-${Date.now()}`;
        const roundTitle = lesson?.title || lesson?.category || 'lesson';
        window.stLeaderboard.saveScore({
          roundId, roundTitle, score: xp,
          corrects: correct || 0, wrongs: wrong || 0,
        });
      } catch (e) { console.warn('saveScore failed:', e); }
    };

    // resolveNext: if the user tapped "Siguiente lección" on an academy item,
    // navigate to the next item in the level sequence. On success, mark
    // action.payload.advanced so the closeIfNotAdvanced effect skips closing.
    //
    // Regex capture groups (per the IDs minted by buildAcademyLesson /
    // buildAcademyPractice in js/data.js):
    //   academy-<track>-l<levelId>-les<lessonIdx>      → [1]=track [2]=levelId [3]=lessonIdx
    //   academy-<track>-practice-l<levelId>-r<roundId> → [1]=track [2]=levelId [3]=roundId
    const resolveNext = (action) => {
      const { lesson, next } = action.payload;
      if (!next || !lesson?.id) return;
      const aMatch = lesson.id.match(/^academy-(cocktail|wine|coffee)-l(\d+)-les(\d+)$/);
      const pMatch = lesson.id.match(/^academy-(cocktail|wine|coffee)-practice-l(\d+)-r(\d+)$/);
      if (!aMatch && !pMatch) return;
      const track   = (aMatch || pMatch)[1];
      const levelId = Number((aMatch || pMatch)[2]);
      const levels  = (window.getAcademyLevels && window.getAcademyLevels(track)) || [];
      const level   = levels.find(l => l.id === levelId);
      const seq     = (level && level.sequence) || [];
      let curIdx = -1;
      if (aMatch) {
        const lessonIdx = Number(aMatch[3]);
        curIdx = seq.findIndex(s => s.type === 'lesson' && s.index === lessonIdx);
      } else {
        const roundId = Number(pMatch[3]);
        curIdx = seq.findIndex(s => s.type === 'practice' && s.roundId === roundId);
      }
      const nextItem = curIdx >= 0 ? seq[curIdx + 1] : null;
      if (level && nextItem) {
        const nextLesson = nextItem.type === 'lesson'
          ? (window.buildAcademyLesson && window.buildAcademyLesson(level, nextItem.index, track))
          : (window.buildAcademyPractice && window.buildAcademyPractice(level, nextItem.roundId, track));
        if (nextLesson) {
          // Router replaces the lesson overlay in a single commit; LessonPlayer's
          // key={lesson.id} forces a clean remount.
          pickLesson(nextLesson);
          action.payload.advanced = true;
        }
      }
    };

    const closeIfNotAdvanced = (action) => {
      if (action.payload.advanced) return;
      closeLessonOverlay();
    };

    const offs = [
      window.stStore.registerEffect('LESSON_FINISHED', writeXp),
      window.stStore.registerEffect('LESSON_FINISHED', syncProfile),
      window.stStore.registerEffect('LESSON_FINISHED', persistAcademy),
      window.stStore.registerEffect('LESSON_FINISHED', checkAchievementsEffect),
      window.stStore.registerEffect('LESSON_FINISHED', saveLeaderboardEffect),
      window.stStore.registerEffect('LESSON_FINISHED', resolveNext),
      window.stStore.registerEffect('LESSON_FINISHED', closeIfNotAdvanced),
    ];
    return () => offs.forEach(off => off());
  }, [pickLesson, closeLessonOverlay]);

  // Window-event ↔ store bridge. Module-level emitters (stLearn, stAuth,
  // stAchievements, stLang, etc.) still fire `window.dispatchEvent(new
  // CustomEvent('stirio:...'))` — touching all of them to use the store
  // would be a much larger refactor. Instead, this listener fans those
  // events out to typed store actions so consumers can either:
  //   • addEventListener('stirio:xpchange', ...)               (legacy)
  //   • stStore.registerEffect('XP_CHANGED', ...)              (new)
  // and stay out of each other's way. The window events keep firing so
  // existing listeners aren't disturbed.
  useEffect(() => {
    if (!window.stStore) return undefined;
    const map = [
      ['stirio:xpchange',        'XP_CHANGED'],
      ['stirio:langchange',      'LANG_CHANGED'],
      ['stirio:achievement',     'ACHIEVEMENT_UNLOCKED'],
      ['stirio:namechange',      'NAME_CHANGED'],
      ['stirio:authchange',      'AUTH_CHANGED'],
      ['stirio:mapregionsready', 'MAP_REGIONS_READY'],
    ];
    const handlers = map.map(([eventName, actionType]) => {
      const fn = (e) => {
        try { window.stStore.dispatch({ type: actionType, payload: e?.detail || {} }); } catch {}
      };
      window.addEventListener(eventName, fn);
      return [eventName, fn];
    });
    return () => handlers.forEach(([name, fn]) => window.removeEventListener(name, fn));
  }, []);

  // Version-mismatch detector. Fetches /version.json (no-store) on mount and
  // every 5 minutes. If the server's version differs from the booted one, it
  // means the user's tab is running stale code — show a banner with a one-tap
  // "Recargar" that nukes SW + caches and reloads. Complements PR #171's
  // network-first + updateViaCache fixes: those handle the 80% case
  // automatically; this banner is the visible safety net for the rest.
  const [updateAvailable, setUpdateAvailable] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        // ?_= timestamp dodges any HTTP cache. cache:'no-store' belt + braces.
        const res = await fetch(`version.json?_=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const { version } = await res.json();
        if (cancelled) return;
        if (version && window.STIRIO_VERSION && version !== window.STIRIO_VERSION) {
          setUpdateAvailable(true);
        }
      } catch {}
    };
    check();
    const id = window.setInterval(check, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

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
    // Reset stack to home, then push duel if this came from an invite link.
    if (window.stRouter) {
      window.stRouter.reset('home');
      if (inviteCode) window.stRouter.navigate('duel', { inviteCode });
    }
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
    }}>

      {updateAvailable && (
        <div
          role="status"
          style={{
            position: 'sticky', top: 0, zIndex: 60,
            background: 'var(--amber)', color: 'var(--bg-0)',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12,
            fontSize: 13, fontWeight: 500,
            borderBottom: '1px solid color-mix(in oklch, var(--amber) 60%, black)',
          }}
        >
          <span>{(window.stUiT ? window.stUiT('app.update_banner.text', 'Nueva versión disponible') : 'Nueva versión disponible')}</span>
          <button
            onClick={async () => {
              try {
                if ('serviceWorker' in navigator) {
                  const regs = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(regs.map(r => r.unregister().catch(() => {})));
                }
                if (typeof caches !== 'undefined') {
                  const keys = await caches.keys();
                  await Promise.all(keys.map(k => caches.delete(k).catch(() => {})));
                }
              } catch (e) { console.warn('update reload cleanup failed:', e); }
              try { window.location.reload(); } catch { window.location.href = window.location.href; }
            }}
            style={{
              background: 'var(--bg-0)', color: 'var(--amber)',
              padding: '6px 14px', borderRadius: 'var(--r-sm, 6px)',
              fontFamily: 'var(--f-mono)', fontSize: 12,
              border: 'none', cursor: 'pointer',
            }}
          >
            {(window.stUiT ? window.stUiT('app.update_banner.cta', 'Recargar') : 'Recargar')}
          </button>
        </div>
      )}

      {screen === 'onboarding' && !activeLesson && (
        <Onboarding onDone={finishOnboarding} bootstrapping={authBootstrapping} />
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
          onStartAcademyLesson={(track, levelId, lessonIdx) => {
            const levels = (window.getAcademyLevels && window.getAcademyLevels(track)) || [];
            const level = levels.find(l => l.id === levelId);
            if (!level) return;
            const lesson = window.buildAcademyLesson && window.buildAcademyLesson(level, lessonIdx, track);
            if (lesson) pickLesson(lesson);
          }}
          onStartRound={(track, { roundId, levelId }) => {
            const levels = (window.getAcademyLevels && window.getAcademyLevels(track)) || [];
            const level = levels.find(l => l.id === levelId);
            const practice = level && window.buildAcademyPractice
              ? window.buildAcademyPractice(level, roundId, track)
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
          onOpenArticle={(entry) => window.stRouter && window.stRouter.navigate('article', { entry })}
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
          onBack={() => { setInviteCode(null); setSubScreen(null); }}
          initialInviteCode={router.base?.params?.inviteCode || inviteCode}
        />
      )}

      {subScreen === 'glossary' && !activeLesson && (
        <GlossaryScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'euvs' && !activeLesson && window.EuvsArchiveScreen && (
        <window.EuvsArchiveScreen onBack={() => setSubScreen(null)} />
      )}

      {subScreen === 'map' && !activeLesson && (
        <MapScreen
          onBack={() => setSubScreen(null)}
          focus={router.base?.params?.focus || null}
          spirit={router.base?.params?.spirit || null}
        />
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
          article={(window.stArticles && window.stArticles.resolveArticle(articleEntry)) || (window.stArticles && window.stArticles.getArticleOfTheDay())}
          onBack={() => setSubScreen(null)}
          onOpenWiki={() => setSubScreen('wiki')}
        />
      )}

      {fichaOpen && (
        <FichaDetail ficha={fichaOpen} units={tweaks.units || 'ml'} onClose={() => setFichaOpen(null)} />
      )}

      {activeMode && !activeLesson && (
        <ModeSheet
          mode={activeMode}
          onClose={() => setActiveMode(null)}
          onStart={(pickedId) => {
            // Picker fires with the picked mode; single-card fires with the
            // same mode it was rendering. Either way, dispatch via openMode.
            setActiveMode(null);
            openMode(pickedId || activeMode);
          }}
        />
      )}

      {screen === 'profile' && !activeLesson && !subScreen && (
        <Profile
          profile={profile}
          onBack={() => setScreen('home')}
          onUpdateProfile={(patch) => setProfile(p => ({ ...p, ...patch }))}
          tweaks={tweaks}
          onChangeTweak={updateTweak}
          playShortcuts={PLAY_SHORTCUTS}
          onOpenAdmin={() => setSubScreen('admin')}
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

      {subScreen === 'admin' && !activeLesson && (
        window.AdminScreen
          ? <AdminScreen onBack={() => setSubScreen(null)} />
          : (
            <div className="mobile-safe" style={{ padding: '24px 20px 120px', maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 2 }}>
              <button className="btn ghost" onClick={() => setSubScreen(null)} style={{ padding: 8, marginBottom: 18 }}>
                <Icon name="arrowL" size={18} /> Back
              </button>
              <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-2)' }}>
                Admin module not loaded yet — pull to refresh and try again.
              </div>
            </div>
          )
      )}

      {activeLesson && (
        <LessonPlayer
          key={activeLesson.id}
          lesson={activeLesson}
          onExit={exitLesson}
          onFinish={finishLesson}
        />
      )}

      {/* Legal footer — inside scroll area so it rides above the fixed BottomNav.
          Hidden on routes that declare hidesLegal (onboarding, lesson). */}
      {!topMeta.hidesLegal && (
        <div style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
          <LegalFooter />
        </div>
      )}

      {/* BottomNav hidden on routes that declare hidesNav (subscreens, lesson,
          onboarding). setScreen calls router.reset() which clears the stack.
          The FAB shortcut is "smart": if any Academy track has progress, the
          FAB becomes "Continuar" → academy hub. Otherwise it falls back to
          the user's configured playShortcut from Profile → Settings. */}
      {!topMeta.hidesNav && (() => {
        const userShortcut = PLAY_SHORTCUTS.find(s => s.id === (tweaks.playShortcut || 'daily')) || PLAY_SHORTCUTS[0];
        let hasAcademyProgress = false;
        try {
          for (const track of ['cocktail', 'wine', 'coffee']) {
            const raw = localStorage.getItem(`cq_academy_${track}`);
            if (!raw) continue;
            const prog = JSON.parse(raw);
            for (const level of Object.values(prog || {})) {
              if ((level?.lessons || []).some(l => l?.passed)) { hasAcademyProgress = true; break; }
              if (Object.values(level?.practices || {}).some(p => p?.passed)) { hasAcademyProgress = true; break; }
            }
            if (hasAcademyProgress) break;
          }
        } catch {}
        const shortcut = hasAcademyProgress
          ? { id: 'continue', target: 'academy', icon: '🎓', labelKey: 'app.shortcut.continue' }
          : { ...userShortcut, target: userShortcut.id, labelKey: `app.shortcut.${userShortcut.id}` };
        return (
          <BottomNav
            current={screen}
            onNav={setScreen}
            shortcut={shortcut}
            onPlay={() => openMode(shortcut.target)}
          />
        );
      })()}
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
      borderRadius: 'var(--r-pill)',
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
  <button
    className={`nav-btn ${active ? 'active' : ''}`}
    onClick={onClick}
    aria-label={label}
    aria-pressed={!!active}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      padding: '8px 18px', borderRadius: 'var(--r-pill)',
      minWidth: 56, minHeight: 48,
      background: active ? 'var(--amber-soft)' : 'transparent',
    }}
  >
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
