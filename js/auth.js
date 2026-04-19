import { firebaseConfig, FIREBASE_ENABLED } from './firebase-config.js';
import { t } from './lang.js';

const FIREBASE_CDN = 'https://www.gstatic.com/firebasejs/10.7.1';
const AUTH_INIT_TIMEOUT_MS = 8000;

let app = null;
let auth = null;
let db = null;
let currentUser = null;

// ─── Inicializar Firebase ────────────────────────────────────
async function initFirebase() {
  if (!FIREBASE_ENABLED) return false;
  try {
    const { initializeApp } = await import(`${FIREBASE_CDN}/firebase-app.js`);
    const { getAuth, onAuthStateChanged } = await import(`${FIREBASE_CDN}/firebase-auth.js`);
    const { getFirestore } = await import(`${FIREBASE_CDN}/firebase-firestore.js`);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Wait for onAuthStateChanged to detect persisted sessions (with timeout so UI never hangs)
    if (!currentUser) {
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
          if (firebaseUser && !currentUser) {
            currentUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || t('auth.google_player'),
              email: firebaseUser.email,
              photo: firebaseUser.photoURL,
              provider: 'google',
              isGuest: false
            };
            saveUserLocal(currentUser);
          }
          settle();
        });
      });
    }

    return true;
  } catch (e) {
    console.warn('Firebase no disponible, usando modo local:', e);
    return false;
  }
}

// ─── Login con Google ────────────────────────────────────────
async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase no configurado. Configura firebase-config.js primero.');
  const { GoogleAuthProvider, signInWithPopup } = await import(`${FIREBASE_CDN}/firebase-auth.js`);
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  currentUser = {
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || t('auth.google_player'),
    email: user.email,
    photo: user.photoURL,
    provider: 'google',
    isGuest: false
  };
  saveUserLocal(currentUser);
  return currentUser;
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
  const uid = currentUser.uid;
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
  ['cq_learn_data', 'cq_user_stats', 'cq_achievements', 'cq_daily', 'cq_leaderboard', 'cq_academy_data'].forEach(k => localStorage.removeItem(k));
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
  getFirebaseAuth
};
