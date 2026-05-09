import { firebaseConfig, FIREBASE_ENABLED, GOOGLE_OAUTH_CLIENT_ID } from './firebase-config.js';
import { t } from './lang.js';

const FIREBASE_CDN = 'https://www.gstatic.com/firebasejs/10.7.1';
const AUTH_INIT_TIMEOUT_MS = 8000;

let app = null;
let auth = null;
let db = null;
let currentUser = null;
// Cached firebase-auth module. signInWithPopup/Redirect must run inside the
// user-gesture tick that triggered the click; any `await import(...)` before
// it pushes the call past that tick and the browser blocks the popup or
// swallows the redirect silently. Stashing the module here during init lets
// signInWithGoogle(Redirect) fire with zero awaits in between.
let authMod = null;
// Redirect result consumed on the next boot after signInWithGoogleRedirect.
// app.jsx reads this synchronously after `await initFirebase()` resolves to
// decide whether to complete a pending onboarding.
let pendingRedirectUser = null;

// Local storage keys that hold user-scoped gameplay data. Cleared on sign-out
// and after an account switch so a fresh uid always hydrates from Firestore.
const USER_SCOPED_KEYS = [
  'cq_learn_data',
  'cq_user_stats',
  'cq_achievements',
  'cq_daily',
  'cq_leaderboard',
  'cq_academy_progress',
  'cq_academy_cocktail',
  'cq_academy_wine',
  'cq_academy_coffee',
  'stirio::state::v2',
  'stirio::activity::v1',
];

function clearUserScopedLocal() {
  USER_SCOPED_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });
}

// ─── Inicializar Firebase ────────────────────────────────────
let persistentAuthUnsub = null;

async function initFirebase() {
  if (!FIREBASE_ENABLED) return false;
  try {
    const { initializeApp } = await import(`${FIREBASE_CDN}/firebase-app.js`);
    authMod = await import(`${FIREBASE_CDN}/firebase-auth.js`);
    const { getAuth, onAuthStateChanged } = authMod;
    const { getFirestore } = await import(`${FIREBASE_CDN}/firebase-firestore.js`);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Always wait for onAuthStateChanged to give Firebase the authoritative
    // read on the persisted session — even when restoreSession() already
    // hydrated `currentUser` from localStorage. A stale guest (or email)
    // entry must not shadow a real Firebase user, otherwise the
    // post-signInWithGoogleRedirect bootstrap picks up the guest and skips
    // onboarding completion, trapping the user at the onboarding start.
    await new Promise(resolve => {
      let settled = false;
      const settle = () => { if (!settled) { settled = true; resolve(); } };
      const timeoutId = setTimeout(() => {
        console.warn(`initFirebase: onAuthStateChanged timed out after ${AUTH_INIT_TIMEOUT_MS}ms`);
        settle();
      }, AUTH_INIT_TIMEOUT_MS);
      const unsub = onAuthStateChanged(auth, (firebaseUser) => {
        clearTimeout(timeoutId);
        unsub();
        if (firebaseUser && !firebaseUser.isAnonymous) {
          // Firebase says this tab is signed in as a real user (Google / email).
          // Overwrite any stale guest/email snapshot from localStorage so the
          // rest of the app reads the authoritative uid + provider.
          currentUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || t('auth.google_player'),
            email: firebaseUser.email,
            photo: firebaseUser.photoURL,
            provider: firebaseUser.providerData?.[0]?.providerId === 'password' ? 'email' : 'google',
            isGuest: false
          };
          saveUserLocal(currentUser);
          // Backfill ranking fields on every boot so users whose docs were
          // created before seedUserDoc existed (or via saveOnboarding only)
          // get xpTotal/level/streakDays merged in and become visible to the
          // leaderboard's orderBy('xpTotal') query. Idempotent + non-blocking.
          seedUserDoc(currentUser);
        }
        settle();
      });
    });

    // Pick up any signed-in user returning from signInWithGoogleRedirect.
    // getRedirectResult resolves to null when this boot wasn't triggered by
    // a redirect, or to the signed-in user exactly once per redirect round-
    // trip. Failures here are non-fatal: the user just doesn't get auto-
    // completed; they can retry sign-in.
    try {
      const { getRedirectResult } = authMod;
      const result = await getRedirectResult(auth);
      if (result?.user) {
        const u = result.user;
        currentUser = {
          uid: u.uid,
          name: u.displayName || u.email?.split('@')[0] || t('auth.google_player'),
          email: u.email,
          photo: u.photoURL,
          provider: 'google',
          isGuest: false,
        };
        saveUserLocal(currentUser);
        seedUserDoc(currentUser);
        pendingRedirectUser = currentUser;
      }
    } catch (e) {
      console.warn('[auth] getRedirectResult failed:', e);
    }

    // Persistent listener: fires whenever the Firebase session changes after
    // init (sign-in as a different user, sign-out, token refresh with new uid).
    // Emits `stirio:authchange` with { uid, prev } so the app shell can drop
    // the previous user's cached data and rehydrate from Firestore.
    if (!persistentAuthUnsub) {
      let initialized = false;
      let lastUid = null;
      persistentAuthUnsub = onAuthStateChanged(auth, (firebaseUser) => {
        const nextUid = firebaseUser?.uid || null;
        if (!initialized) { initialized = true; lastUid = nextUid; return; }
        if (nextUid === lastUid) return;
        const prev = lastUid;
        lastUid = nextUid;
        // Account switch — wipe local caches so the new uid starts from
        // Firestore as authoritative source.
        if (prev && nextUid && prev !== nextUid) clearUserScopedLocal();
        try {
          window.dispatchEvent(new CustomEvent('stirio:authchange', {
            detail: { uid: nextUid, prev },
          }));
        } catch {}
      });
    }

    return true;
  } catch (e) {
    console.warn('Firebase no disponible, usando modo local:', e);
    return false;
  }
}

/**
 * Subscribe to account changes. The callback receives `{ uid, prev }` every
 * time the authenticated Firebase user changes (sign-in, sign-out, switch).
 * Returns an unsubscribe function.
 */
function subscribeAuthChange(cb) {
  const handler = (e) => { try { cb(e.detail || {}); } catch (err) { console.warn('authchange handler:', err); } };
  window.addEventListener('stirio:authchange', handler);
  return () => window.removeEventListener('stirio:authchange', handler);
}

/**
 * Ensure the user's `users/{uid}` doc has ranking fields so they appear in
 * the global leaderboard immediately after sign-up — even before they
 * complete any scored round. Fills in `level`/`xpTotal`/`streakDays` only
 * when they don't already exist (merge preserves any prior progress).
 */
async function seedUserDoc(user) {
  if (!db || !user || user.isGuest) return;
  try {
    const { doc, getDoc, setDoc } = await import(`${FIREBASE_CDN}/firebase-firestore.js`);
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? snap.data() : {};
    const seed = {
      name: user.name,
      lastSeen: Date.now(),
    };
    // Only seed ranking fields if they don't exist — don't overwrite progress.
    if (typeof existing.level !== 'number') seed.level = 1;
    if (typeof existing.xpTotal !== 'number') seed.xpTotal = 0;
    if (typeof existing.streakDays !== 'number') seed.streakDays = 0;
    await setDoc(ref, seed, { merge: true });
  } catch (e) {
    console.warn('seedUserDoc failed:', e);
  }
}

// ─── Login con Google ────────────────────────────────────────
// NOT declared `async` so the synchronous call to signInWithPopup stays within
// the user-gesture tick. Returns a Promise via signInWithPopup's own promise.
function signInWithGoogle() {
  if (!auth || !authMod) {
    const err = new Error('Firebase no configurado. Configura firebase-config.js primero.');
    err.code = 'auth/not-initialized';
    return Promise.reject(err);
  }
  const { GoogleAuthProvider, signInWithPopup } = authMod;
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  return signInWithPopup(auth, provider).then((result) => {
    const user = result.user;
    currentUser = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || t('auth.google_player'),
      email: user.email,
      photo: user.photoURL,
      provider: 'google',
      isGuest: false,
    };
    saveUserLocal(currentUser);
    seedUserDoc(currentUser);
    return currentUser;
  });
}

// ─── Login con Google (redirect) ─────────────────────────────
// Preferred over signInWithPopup: works on iOS Safari, installed PWAs, Brave,
// and Chrome configs with third-party cookies blocked (the popup flow fails
// with auth/internal-error in those envs because the postMessage iframe
// channel is broken). The page navigates to accounts.google.com; the returned
// promise never resolves in this tab. getRedirectResult in initFirebase picks
// up the signed-in user when the redirect brings us back.
function signInWithGoogleRedirect() {
  if (!auth || !authMod) {
    const err = new Error('Firebase no configurado. Configura firebase-config.js primero.');
    err.code = 'auth/not-initialized';
    return Promise.reject(err);
  }
  const { GoogleAuthProvider, signInWithRedirect } = authMod;
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  return signInWithRedirect(auth, provider);
}

// ─── Login con Google (GIS / One Tap) ────────────────────────
// Modern Google sign-in via Google Identity Services. Works in browsers
// with third-party cookies blocked (Chrome 115+, Safari, Firefox strict)
// because it doesn't rely on cross-origin cookies for the authDomain.
// Requires GOOGLE_OAUTH_CLIENT_ID to be set in firebase-config.js and the
// app origin to be listed in the OAuth client's Authorized JavaScript
// origins in Google Cloud Console.
let gisInitialized = false;
let gisTokenResolver = null;

function isGISReady() {
  return typeof window !== 'undefined'
    && !!window.google?.accounts?.id
    && !!GOOGLE_OAUTH_CLIENT_ID;
}

function initGISIfNeeded() {
  if (gisInitialized) return true;
  if (!isGISReady()) return false;
  window.google.accounts.id.initialize({
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    callback: (response) => {
      const resolve = gisTokenResolver?.resolve;
      gisTokenResolver = null;
      if (resolve) resolve(response?.credential || null);
    },
    // Keep the prompt lightweight; user can dismiss freely.
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  gisInitialized = true;
  return true;
}

async function signInWithGoogleGIS() {
  if (!auth || !authMod) {
    const err = new Error('Firebase no configurado.');
    err.code = 'auth/not-initialized';
    throw err;
  }
  if (!isGISReady()) {
    const err = new Error('GIS no disponible (cliente ID o script de Google no listo).');
    err.code = 'auth/gis-unavailable';
    throw err;
  }
  initGISIfNeeded();

  // Wait for the One Tap / account chooser to return an ID token. Times
  // out after 60s so a user that dismisses the prompt doesn't hang.
  const idToken = await new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        gisTokenResolver = null;
        const err = new Error('Timeout esperando credencial de Google.');
        err.code = 'auth/gis-timeout';
        reject(err);
      }
    }, 60000);
    gisTokenResolver = {
      resolve: (token) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        if (token) resolve(token);
        else {
          const err = new Error('Google no devolvió credencial.');
          err.code = 'auth/gis-no-credential';
          reject(err);
        }
      },
    };
    try {
      window.google.accounts.id.prompt((notification) => {
        // Handle One Tap not being displayed (e.g. user previously
        // dismissed it, or FedCM disabled). Surface as an error so the
        // caller can fall back to popup/redirect.
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          gisTokenResolver = null;
          const reason = notification.getNotDisplayedReason?.() || notification.getSkippedReason?.() || 'unknown';
          const err = new Error(`GIS prompt no mostrado (${reason}).`);
          err.code = 'auth/gis-not-displayed';
          reject(err);
        }
      });
    } catch (e) {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      gisTokenResolver = null;
      reject(e);
    }
  });

  const { GoogleAuthProvider, signInWithCredential } = authMod;
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  const u = result.user;
  currentUser = {
    uid: u.uid,
    name: u.displayName || u.email?.split('@')[0] || t('auth.google_player'),
    email: u.email,
    photo: u.photoURL,
    provider: 'google',
    isGuest: false,
  };
  saveUserLocal(currentUser);
  seedUserDoc(currentUser);
  return currentUser;
}

// Polls isGISReady() until true or timeout. The GIS script
// (accounts.google.com/gsi/client) is loaded `async defer` from index.html,
// so on slow networks (or right after a Clear site data) the synchronous
// isGISReady() may return false at the moment the user taps sign-in, sending
// the flow straight to popup/redirect. waitForGISReady gives the script a few
// seconds to land before we give up.
function waitForGISReady(timeoutMs = 3000) {
  return new Promise((resolve) => {
    if (isGISReady()) return resolve(true);
    const start = Date.now();
    const poll = () => {
      if (isGISReady()) return resolve(true);
      if (Date.now() - start >= timeoutMs) return resolve(false);
      setTimeout(poll, 100);
    };
    setTimeout(poll, 100);
  });
}

// Renders the official Google "Sign in with Google" button into the given
// container element via google.accounts.id.renderButton. The button click
// triggers the GIS credential flow without redirect or popup, which is the
// only reliable Google sign-in path on iOS Safari (ITP breaks
// signInWithRedirect, and signInWithPopup is blocked in standalone PWAs).
//
// Used as a fallback by Onboarding.handleGoogle when GIS prompt() returns
// `auth/gis-not-displayed` (the iOS Safari case).
async function renderGISButton(containerEl, opts = {}) {
  if (!auth || !authMod) {
    const err = new Error('Firebase no configurado.');
    err.code = 'auth/not-initialized';
    throw err;
  }
  if (!isGISReady()) {
    const err = new Error('GIS no disponible (cliente ID o script de Google no listo).');
    err.code = 'auth/gis-unavailable';
    throw err;
  }
  if (!containerEl) {
    const err = new Error('renderGISButton requiere un elemento DOM.');
    err.code = 'auth/gis-no-container';
    throw err;
  }
  initGISIfNeeded();

  const idToken = await new Promise((resolve, reject) => {
    let settled = false;
    gisTokenResolver = {
      resolve: (token) => {
        if (settled) return;
        settled = true;
        if (token) resolve(token);
        else {
          const err = new Error('Google no devolvió credencial.');
          err.code = 'auth/gis-no-credential';
          reject(err);
        }
      },
    };
    try {
      window.google.accounts.id.renderButton(containerEl, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        ...opts,
      });
    } catch (e) {
      if (settled) return;
      settled = true;
      gisTokenResolver = null;
      reject(e);
    }
  });

  const { GoogleAuthProvider, signInWithCredential } = authMod;
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  const u = result.user;
  currentUser = {
    uid: u.uid,
    name: u.displayName || u.email?.split('@')[0] || t('auth.google_player'),
    email: u.email,
    photo: u.photoURL,
    provider: 'google',
    isGuest: false,
  };
  saveUserLocal(currentUser);
  seedUserDoc(currentUser);
  return currentUser;
}

// Returns the user detected by getRedirectResult during the most recent
// initFirebase, then clears it so subsequent boots don't re-consume. Null
// when this boot wasn't a redirect return.
function consumePendingRedirectUser() {
  const u = pendingRedirectUser;
  pendingRedirectUser = null;
  return u;
}

/**
 * Wait for Firebase's onAuthStateChanged to confirm a non-anonymous user
 * (Google / email). Resolves with the snapshot normalized to our shape, or
 * null on timeout. Used as a post-redirect safety net: getRedirectResult
 * can return null on some browsers (iOS PWA, cross-origin auth handler),
 * but the persisted auth state still eventually fires the real user.
 */
function waitForRealAuthUser(maxMs = 10000) {
  return new Promise(resolve => {
    if (!auth || !authMod) return resolve(null);
    const { onAuthStateChanged } = authMod;
    let settled = false;
    const finish = (u) => { if (!settled) { settled = true; resolve(u); } };
    const timeoutId = setTimeout(() => finish(null), maxMs);
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser || firebaseUser.isAnonymous) return; // keep waiting
      clearTimeout(timeoutId);
      unsub();
      const snapshot = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || t('auth.google_player'),
        email: firebaseUser.email,
        photo: firebaseUser.photoURL,
        provider: firebaseUser.providerData?.[0]?.providerId === 'password' ? 'email' : 'google',
        isGuest: false,
      };
      // Reconcile module-level currentUser so later getCurrentUser() reads
      // the authoritative snapshot instead of a stale restored session.
      currentUser = snapshot;
      saveUserLocal(snapshot);
      finish(snapshot);
    });
  });
}

// ─── Registro con email + contraseña ─────────────────────────
async function signUpWithEmail(email, password, displayName) {
  if (!auth) throw new Error('Firebase no configurado.');
  const { createUserWithEmailAndPassword, updateProfile } = await import(`${FIREBASE_CDN}/firebase-auth.js`);
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = result.user;
  if (displayName && displayName.trim()) {
    try { await updateProfile(fbUser, { displayName: displayName.trim() }); } catch {}
  }
  currentUser = {
    uid: fbUser.uid,
    name: displayName?.trim() || fbUser.displayName || fbUser.email?.split('@')[0] || t('auth.email_player'),
    email: fbUser.email,
    photo: fbUser.photoURL || null,
    provider: 'email',
    isGuest: false
  };
  saveUserLocal(currentUser);
  seedUserDoc(currentUser);
  return currentUser;
}

// ─── Login con email + contraseña ─────────────────────────────
async function signInWithEmail(email, password) {
  if (!auth) throw new Error('Firebase no configurado.');
  const { signInWithEmailAndPassword } = await import(`${FIREBASE_CDN}/firebase-auth.js`);
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = result.user;
  currentUser = {
    uid: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || t('auth.email_player'),
    email: fbUser.email,
    photo: fbUser.photoURL || null,
    provider: 'email',
    isGuest: false
  };
  saveUserLocal(currentUser);
  seedUserDoc(currentUser);
  return currentUser;
}

// ─── Enviar email de reset de contraseña ─────────────────────
async function sendPasswordReset(email) {
  if (!auth) throw new Error('Firebase no configurado.');
  const { sendPasswordResetEmail } = await import(`${FIREBASE_CDN}/firebase-auth.js`);
  await sendPasswordResetEmail(auth, email.trim());
}

// ─── Login como invitado ─────────────────────────────────────
function signInAsGuest() {
  const guestId = localStorage.getItem('cq_guest_id') || 'guest_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  localStorage.setItem('cq_guest_id', guestId);
  currentUser = {
    uid: guestId,
    name: localStorage.getItem('cq_guest_name') || t('auth.guest_label'),
    email: null,
    photo: null,
    provider: 'guest',
    isGuest: true
  };
  saveUserLocal(currentUser);
  return currentUser;
}

// ─── Cerrar sesión ───────────────────────────────────────────
async function signOutUser() {
  if (auth) {
    const { signOut } = await import(`${FIREBASE_CDN}/firebase-auth.js`);
    await signOut(auth);
  }
  currentUser = null;
  localStorage.removeItem('cq_current_user');
  localStorage.removeItem('cq_guest_id');
  localStorage.removeItem('cq_guest_name');
  // Wipe user-scoped gameplay caches so the next sign-in starts from a clean
  // slate and hydrates from Firestore (the authoritative source).
  clearUserScopedLocal();
}

// ─── Persistencia local ──────────────────────────────────────
function saveUserLocal(user) {
  localStorage.setItem('cq_current_user', JSON.stringify(user));
}

function restoreSession() {
  const saved = localStorage.getItem('cq_current_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    return currentUser;
  }
  return null;
}

// ─── Actualizar nombre (invitado) ────────────────────────────
function updateGuestName(name) {
  if (currentUser && currentUser.isGuest) {
    currentUser.name = name.trim() || t('auth.guest_label');
    localStorage.setItem('cq_guest_name', currentUser.name);
    saveUserLocal(currentUser);
  }
}

// ─── Actualizar perfil (Google user) ─────────────────────────
async function updateUserProfile({ name, photoURL }) {
  if (!auth?.currentUser || currentUser?.isGuest) return;
  const { updateProfile } = await import(`${FIREBASE_CDN}/firebase-auth.js`);
  const updates = {};
  if (name !== undefined) updates.displayName = name.trim();
  if (photoURL !== undefined) updates.photoURL = photoURL;
  await updateProfile(auth.currentUser, updates);

  // Update local state
  if (name !== undefined) currentUser.name = updates.displayName || currentUser.name;
  if (photoURL !== undefined) currentUser.photo = photoURL;
  saveUserLocal(currentUser);

  try {
    window.dispatchEvent(new CustomEvent('stirio:namechange', {
      detail: { name: currentUser.name, photo: currentUser.photo },
    }));
  } catch {}

  // Sync to Firestore user doc
  if (db) {
    try {
      const { doc, setDoc } = await import(`${FIREBASE_CDN}/firebase-firestore.js`);
      const fsUpdates = {};
      if (name !== undefined) fsUpdates.name = currentUser.name;
      if (photoURL !== undefined) fsUpdates.photoURL = photoURL;
      await setDoc(doc(db, 'users', currentUser.uid), fsUpdates, { merge: true });
    } catch (e) { console.warn('Profile cloud sync failed:', e); }
  }
}

// ─── Guardar respuestas de onboarding ────────────────────────
// Writes onboarding answers to `users/{uid}` (merge). For guests, first
// upgrades the local pseudo-UID to a real Firebase anonymous UID via
// rivals.ensureAnonymousAuth so the doc is ownable under Firestore rules.
async function saveOnboarding(payload) {
  if (!db || !currentUser) return null;
  let uid = currentUser.uid;
  if (currentUser.isGuest) {
    try {
      const rivals = await import('./rivals.js');
      const anonUid = await rivals.ensureAnonymousAuth();
      if (anonUid) {
        uid = anonUid;
        // Persist the real anon UID so future boots hit the same Firestore doc
        currentUser.uid = anonUid;
        saveUserLocal(currentUser);
      }
    } catch (e) { console.warn('anon auth upgrade failed:', e); }
  }
  try {
    const { doc, setDoc } = await import(`${FIREBASE_CDN}/firebase-firestore.js`);
    await setDoc(doc(db, 'users', uid), { onboarding: payload }, { merge: true });
    // Make sure the doc also carries ranking fields — without this an upgraded
    // guest who finishes onboarding but hasn't earned XP yet stays invisible
    // in the leaderboard (orderBy filters out docs with no xpTotal).
    seedUserDoc({ ...currentUser, uid });
    return uid;
  } catch (e) {
    console.warn('saveOnboarding cloud write failed:', e);
    return null;
  }
}

// ─── Leer respuestas de onboarding ───────────────────────────
async function loadOnboarding() {
  if (!db || !currentUser) return null;
  try {
    const { doc, getDoc } = await import(`${FIREBASE_CDN}/firebase-firestore.js`);
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    return snap.exists() ? (snap.data().onboarding || null) : null;
  } catch (e) {
    console.warn('loadOnboarding failed:', e);
    return null;
  }
}

// ─── Subir foto de perfil ────────────────────────────────────
async function uploadProfilePhoto(file) {
  if (!app || !auth?.currentUser) throw new Error('Firebase not ready');
  const { getStorage, ref, uploadBytes, getDownloadURL } = await import(`${FIREBASE_CDN}/firebase-storage.js`);
  const storage = getStorage(app);
  const storageRef = ref(storage, `profile-photos/${currentUser.uid}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await updateUserProfile({ photoURL: url });
  return url;
}

// ─── Borrar datos del usuario ────────────────────────────────
async function deleteUserData() {
  if (!db || !currentUser) return;
  // Cross-check the authoritative Firebase uid against the local
  // `currentUser.uid`. If they disagree, an account swap is in flight and
  // we could delete the wrong user's data — bail out and let the caller
  // retry once the auth state has settled.
  const authUid = auth?.currentUser?.uid || null;
  const localUid = currentUser.uid;
  if (!authUid || !localUid || authUid !== localUid) {
    console.warn('deleteUserData: auth uid mismatch — aborting', { authUid, localUid });
    const err = new Error('auth-state-unstable');
    err.code = 'auth-state-unstable';
    throw err;
  }
  const uid = authUid;
  const { doc, deleteDoc, collection, query, where, getDocs } = await import(`${FIREBASE_CDN}/firebase-firestore.js`);

  // Delete user document
  try { await deleteDoc(doc(db, 'users', uid)); } catch (e) { console.warn('delete users doc:', e); }

  // Delete all scores for this user
  try {
    const scoresQ = query(collection(db, 'scores'), where('uid', '==', uid));
    const snap = await getDocs(scoresQ);
    const deletes = [];
    snap.forEach(d => deletes.push(deleteDoc(d.ref)));
    await Promise.all(deletes);
  } catch (e) { console.warn('delete scores:', e); }

  // Remove RTDB presence
  try {
    const { getDatabase, ref, remove } = await import(`${FIREBASE_CDN}/firebase-database.js`);
    const rtdb = getDatabase(app);
    await remove(ref(rtdb, `presence/${uid}`));
  } catch (e) { console.warn('delete rtdb presence:', e); }

  // Clear all local storage keys
  ['cq_learn_data', 'cq_user_stats', 'cq_achievements', 'cq_daily', 'cq_leaderboard', 'cq_academy_data', 'cq_academy_progress', 'cq_academy_cocktail', 'cq_academy_wine', 'cq_academy_coffee'].forEach(k => localStorage.removeItem(k));
}

// ─── Borrar cuenta completa ──────────────────────────────────
async function deleteUserAccount() {
  if (!auth?.currentUser || currentUser?.isGuest) throw new Error('No authenticated user');
  const { deleteUser, GoogleAuthProvider, reauthenticateWithPopup } = await import(`${FIREBASE_CDN}/firebase-auth.js`);

  // First delete all data
  await deleteUserData();

  // Then delete the auth account
  try {
    await deleteUser(auth.currentUser);
  } catch (e) {
    if (e.code === 'auth/requires-recent-login') {
      // Re-authenticate and retry
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(auth.currentUser, provider);
      await deleteUser(auth.currentUser);
    } else {
      throw e;
    }
  }

  // Clean up local session
  currentUser = null;
  localStorage.removeItem('cq_current_user');
  localStorage.removeItem('cq_guest_id');
  localStorage.removeItem('cq_guest_name');
}

// ─── Getters ─────────────────────────────────────────────────
function getDb() { return db; }
function getCurrentUser() { return currentUser; }
function isFirebaseReady() { return !!auth; }
function getFirebaseAuth() { return auth; }

export {
  initFirebase,
  signInWithGoogle,
  signInWithGoogleRedirect,
  signInWithGoogleGIS,
  isGISReady,
  waitForGISReady,
  renderGISButton,
  consumePendingRedirectUser,
  waitForRealAuthUser,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
  signInAsGuest,
  signOutUser,
  restoreSession,
  updateGuestName,
  updateUserProfile,
  saveOnboarding,
  loadOnboarding,
  uploadProfilePhoto,
  deleteUserData,
  deleteUserAccount,
  getDb,
  getCurrentUser,
  isFirebaseReady,
  getFirebaseAuth,
  subscribeAuthChange,
  clearUserScopedLocal,
};
