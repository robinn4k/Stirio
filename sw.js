// Derive the base path from the SW's own scope so this works both locally
// (scope = '/') and on GitHub Pages in a subdirectory (scope = '/Stirio/').
const BASE = new URL(self.registration.scope).pathname;

const CACHE_PATHS = [
  '',           // root (e.g. /Stirio/ or /)
  'index.html',
  'map.html',
  'legal.html',
  'privacidad.html',
  'cookies.html',
  'favicon.svg',
  'logo.svg',
  'icon_pwa.svg',
  'icon_ios.png',
  'og-image.svg',
  'og-image.png',
  'manifest.json',
  'css/style.css',
  'fonts/fonts.css',
  'trivias/all.json',
  'trivias/general.json',
  'trivias/historia_cocteles.json',
  'trivias/quiensoy.json',
  'trivias/historia_iba_fabe.json',
  'flags/en.svg',
  'flags/es.svg',
  // JS modules
  'js/utils.js',
  'js/rivals.js',
  'js/questions.js',
  'js/learn.js',
  'js/lang.js',
  'js/auth.js',
  'js/quiz.js',
  'js/leaderboard.js',
  'js/share.js',
  'js/achievements.js',
  'js/daily.js',
  'js/speed.js',
  'js/blind.js',
  'js/bot.js',
  'js/fichas.js',
  'js/fichas/index.js',
  'js/fichas/iba_unforgettables.js',
  'js/fichas/iba_contemporary.js',
  'js/fichas/iba_new_era.js',
  'js/fichas/diffords.js',
  'js/academy.js',
  'js/academy_data.js',
  'js/academy_wine_data.js',
  'js/academy_coffee_data.js',
  'js/cookies.js',
  'js/constructor.js',
  'js/firebase-config.js',
  // Phase 0 foundations: router, service registry, action store, lesson step
  // plugin registry. Created without consumers; future phases migrate app.jsx.
  'js/router.js',
  'js/services.js',
  'js/store.js',
  'js/lesson-steps.js',
  // Phase 5a: mode registry (single source of truth for the 16 play modes).
  'js/modes.js',
  // Phase 4: LessonPlayer step plugins. Each file self-registers in
  // window.stLessonSteps. Adding a new step kind = add a file here.
  'js/lesson-steps/intro.jsx',
  'js/lesson-steps/choice.jsx',
  'js/lesson-steps/multi.jsx',
  'js/lesson-steps/ratio.jsx',
  'js/lesson-steps/earTrain.jsx',
  'js/lesson-steps/cutWords.jsx',
  'js/lesson-steps/colorMatch.jsx',
  'js/lesson-steps/timing.jsx',
  // Mini-games are a separate React + Three.js build under games-r3f-demo/.
  // The SPA navigates there directly (no iframe). We cache the entry file
  // and its hashed bundle so the games work offline.
  'games-r3f-demo/index.html',
  'games-r3f-demo/assets/index-BbVrAgTV.js',
  'games-r3f-demo/assets/open-sans-DRMBTUIL.ttf',
  // Wiki 3D modules
  'js/wiki.js',
  'js/wiki-data.js',
  'js/wiki-3d.js',
  'js/wiki-scenes.js',
  'js/wiki-map.js',
  // 3D model assets
  'models/alambique.glb',
  // i18n question bundles (contain the icon fields for Learn cards)
  'js/i18n/questions_es.js',
  'js/i18n/questions_en.js',
  'js/i18n/questions_de.js',
  'js/i18n/questions_fr.js',
  'js/i18n/questions_pt.js',
  'js/i18n/fichas_i18n.js',
  // Per-language translation files
  'i18n/es.json',
  'i18n/en.json',
  'i18n/fr.json',
  'i18n/pt.json',
  'i18n/de.json',
  // Design system v2 (React + Neon Lounge)
  'css/tokens.css',
  'js/repo-data.js',
  'js/data.js',
  'js/ficha-images.js',
  'js/articles.js',
  'js/spirit-brands-data.js',
  'js/ui.jsx',
  'js/lesson.jsx',
  'js/screens/shared.jsx',
  'js/screens/Onboarding.jsx',
  'js/screens/Home.jsx',
  'js/screens/Profile.jsx',
  'js/screens/ModeSheet.jsx',
  'js/i18n-exclusions.js',
  'js/reference.jsx',
  'js/mini-region-map.jsx',
  'js/article.jsx',
  'js/knowledge.jsx',
  'js/three-scene.jsx',
  'js/app.jsx',
  'js/legacy-modes.jsx',
  'js/duel.jsx',
  'js/glossary.jsx',
  // EUVS Archive: precache the JS only. The catalog (data/euvs-catalog.json)
  // intentionally stays out of CACHE_PATHS — it grows over time and we don't
  // want every release to force-redownload it. The runtime cache below
  // (network-first for non-precached same-origin GETs) handles offline use.
  'js/euvs-archive-utils.js',
  'js/euvs-archive.jsx',
  'js/map.jsx',
  'js/arcade.jsx',
  'js/memory.jsx',
  'js/rhythm.jsx',
  'js/comanda.jsx',
  'wiki.html'
];

// Build full pathnames like /Stirio/index.html or /index.html
const CACHE_LIST = CACHE_PATHS.map(p => BASE + p);

const STATIC_CACHE_VERSION = `Stirio-v12.20`;
const DEBUG = false;

self.addEventListener('install', function(event) {
  if (DEBUG) {
    console.log(caches)
    console.log("SW Install Event: Is in the process");
  }

  // Skip the "waiting" phase — a new SW activates on the next navigation
  // instead of waiting for every tab/PWA instance to be closed first.
  self.skipWaiting();

  const onSuccessCachesOpen = (cache) => {
    if (DEBUG) {
      console.log(cache)
      console.log("SW Install Event: Successfully opened the cache and add the cache list");
    }

    return cache.addAll(CACHE_LIST)
  }

  // Works like async/await
  event.waitUntil(
    // caches is a global variable inside the service workers file [readily available]
    caches.open(STATIC_CACHE_VERSION).then(onSuccessCachesOpen)
  )
})


self.addEventListener('activate', (event) => {
  if (DEBUG) console.log("SW Activate Event: Is in the process")

  // Google Chrome browseer -> console -> application -> cache -> cache storage
  const onSuccessCachesKeys = (cacheNames) => {
    // List of cachenames generated by STATIC_CACHE_VERSION
    if (DEBUG) console.log(cacheNames)

    // Loop through all the keys stored in cache storage
    return Promise.all(
      cacheNames.map((cache) => {
        if (cache !== STATIC_CACHE_VERSION) {
          if (DEBUG) console.log(`SW Activate Event: Remove the cache: ${cache}`);
          return caches.delete(cache)
        }
      })
    )
  }

  event.waitUntil(Promise.all([
    // Delete stale caches
    caches.keys().then(onSuccessCachesKeys),
    // Take control of all open clients (tabs/PWA) immediately, so a
    // single reload picks up the new assets without needing to close tabs.
    self.clients.claim(),
  ]))
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
})

// Hosts that MUST never be touched by the service worker. Firebase Auth POSTs
// JSON to identitytoolkit / securetoken and loads the auth iframe from
// {authDomain}/__/auth/iframe.js during signInWithRedirect. Any caching or
// fallback on those requests corrupts the auth handshake — the SDK ends up
// reading HTML (our index.html fallback) instead of JSON and rejects with
// auth/internal-error. Same rationale for Firestore/RTDB live traffic.
const AUTH_HOST_BYPASS = [
  'accounts.google.com',
  'apis.google.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firestore.googleapis.com',
  'firebaseinstallations.googleapis.com',
];
const AUTH_HOST_SUFFIXES = [
  '.firebaseapp.com',     // authDomain (covers /__/auth/handler + iframe)
  '.firebaseio.com',
  '.firebasedatabase.app',
  '.firebasestorage.app',
];

function shouldBypass(url) {
  if (AUTH_HOST_BYPASS.includes(url.hostname)) return true;
  return AUTH_HOST_SUFFIXES.some(suffix => url.hostname.endsWith(suffix));
}

self.addEventListener('fetch', (event) => {
  const FALLBACK_URL = CACHE_LIST[0];
  if (DEBUG) console.log("SW Fetch Event: Is in the process");

  // Non-GETs (POST/PUT/DELETE) aren't storable in the Cache API — trying to
  // cache them throws TypeError, which previously caused our catch() to swap
  // the real response for index.html. Let the browser handle them directly.
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never intercept auth / Firebase live traffic.
  if (shouldBypass(url)) return;

  // Never cache the version manifest. The boot-time mismatch detector hits
  // /version.json with ?_=<timestamp> on each call to dodge HTTP cache;
  // letting the SW process it would (a) pollute STATIC_CACHE_VERSION with
  // one entry per call and (b) potentially serve a stale value when the
  // network briefly stutters. Pass it through to the browser cleanly.
  if (url.pathname === BASE + 'version.json') return;

  const sameOrigin = url.origin === self.location.origin;
  const isNavigation = event.request.mode === 'navigate';

  // Cross-origin GETs (CDNs, etc.) go straight to network — we don't cache
  // opaque responses dynamically because put() can fail and our old catch
  // would swap them for index.html.
  if (!sameOrigin) return;

  const isPrecached = CACHE_LIST.includes(url.pathname);

  const networkFirst = () => fetch(event.request).then(response => {
    // Only cache successful, non-opaque, same-origin responses.
    if (response && response.ok && response.type === 'basic') {
      const clone = response.clone();
      caches.open(STATIC_CACHE_VERSION)
        .then(cache => cache.put(event.request, clone))
        .catch(() => {});
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    // Only navigation requests get the index.html SPA fallback — returning
    // HTML to a failed JS/CSS/JSON fetch would corrupt the caller.
    if (isNavigation) {
      const fallback = await caches.match(FALLBACK_URL);
      if (fallback) return fallback;
    }
    return Response.error();
  });

  // Navigation requests (the HTML shell) use network-first even when
  // precached. Without this, a user on iOS Safari can boot stale index.html
  // from cache forever — even after a SW update — because the old shell
  // pulls old <script src=...> URLs that the SW happily serves from the
  // (now updated, but still pinned to the old asset hashes implicitly via
  // path) cache. Network-first means: when online, you always get the
  // freshest HTML; when offline, the cached fallback still works.
  if (isNavigation) {
    event.respondWith(networkFirst());
    return;
  }

  if (isPrecached) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || networkFirst())
    );
    return;
  }

  event.respondWith(networkFirst());
})
