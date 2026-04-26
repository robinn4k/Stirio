/**
 * rivals.js — Firebase Realtime Database service for 1v1 Rivals mode
 * Centralizes all real-time multiplayer logic.
 */

import { getLocalizedRounds } from './questions.js';
import { getLang } from './lang.js';

const POINTS_PER_CORRECT = 100;
const TIME_BONUS_PER_SECOND = 5;
export const QUESTIONS_PER_DUEL = 10;

// Hard cap on what one answer can contribute to a player's total. Worst-case
// legitimate value is `POINTS_PER_CORRECT + 60 * TIME_BONUS_PER_SECOND = 400`,
// so 400 is the natural ceiling. We add a safety margin just in case the
// constants change. Used in `submitAnswer` to clamp the server-side write so
// a manipulated client cannot ratchet up an absurd score even if the answer
// truthiness check is bypassed somewhere up the call chain.
export const MAX_POINTS_PER_ANSWER = POINTS_PER_CORRECT + 60 * TIME_BONUS_PER_SECOND;

let db = null;

// ─── Init ─────────────────────────────────────────────────────

export async function initRivals() {
  try {
    const { getApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getDatabase } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    db = getDatabase(getApp());
    return true;
  } catch (e) {
    console.warn('Firebase RTDB no disponible:', e);
    return false;
  }
}

export function isRivalsReady() {
  return !!db;
}

// ─── Auth helpers ─────────────────────────────────────────────

/**
 * Wait for Firebase Auth to resolve its initial state from storage.
 * onAuthStateChanged fires once immediately with the current user (or null).
 * Returns the UID of the authenticated user, or null if not authenticated.
 */
export async function waitForFirebaseAuthUid() {
  try {
    const { getApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const auth = getAuth(getApp());
    return await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(u => { unsub(); resolve(u?.uid ?? null); });
    });
  } catch (e) {
    return null;
  }
}

/**
 * Ensure the guest user has an active Firebase anonymous auth session.
 * Waits for Firebase Auth to restore any persisted anonymous session before
 * deciding whether to call signInAnonymously (avoids creating a new UID on
 * every reload when a session already exists in IndexedDB).
 */
export async function ensureAnonymousAuth() {
  try {
    const { getApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const auth = getAuth(getApp());
    // Wait for Firebase Auth to restore any persisted session from IndexedDB.
    // auth.currentUser is null until this resolves even if a session exists.
    const uid = await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(u => { unsub(); resolve(u?.uid ?? null); });
    });
    if (uid) return uid;
    // No persisted session — create a new anonymous one
    const result = await signInAnonymously(auth);
    return result.user.uid;
  } catch (e) {
    console.warn('Anonymous auth failed:', e);
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generateRoomId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Prepare questions from a round for a duel (bot mode only).
 * Returns question objects with localized text already applied.
 */
export function prepareDuelQuestions(roundData) {
  return shuffle(roundData.questions).slice(0, QUESTIONS_PER_DUEL).map(q => {
    const correctAnswer = q.a[0];
    const shuffledAnswers = shuffle(q.a);
    return {
      question: q.q,
      answers: shuffledAnswers,
      correctIndex: shuffledAnswers.indexOf(correctAnswer),
      explanation: q.exp
    };
  });
}

/**
 * Prepare a language-agnostic duel setup for multiplayer.
 * Stores round ID + question/answer indices so each player can render
 * questions in their own language from their local data.
 */
export function prepareDuelSetup(roundData) {
  const allIdx = roundData.questions.map((_, i) => i);
  const questionIndices = shuffle(allIdx).slice(0, QUESTIONS_PER_DUEL);
  const questions = questionIndices.map(qi => {
    // q.a[0] is always the correct answer; build a shuffled permutation of indices
    const answerPerm = shuffle([0, 1, 2, 3].slice(0, roundData.questions[qi].a.length));
    return { idx: qi, answerPerm, correctIndex: answerPerm.indexOf(0) };
  });
  return { roundId: roundData.id, questions };
}

/**
 * Mixed-mode duel setup: pulls questions from multiple rounds so players
 * face a diverse blend. Each question carries its own `roundId` so the
 * loader can look up the correct source round regardless of the caller's
 * language. Pool is shuffled once, then sliced to QUESTIONS_PER_DUEL.
 */
export function prepareDuelSetupMixed(roundsArr) {
  const rounds = (roundsArr || []).filter(r => r && Array.isArray(r.questions) && r.questions.length > 0);
  if (rounds.length === 0) throw new Error('prepareDuelSetupMixed: no valid rounds');
  const pool = [];
  rounds.forEach(r => r.questions.forEach((_, qi) => pool.push({ roundId: r.id, idx: qi })));
  const picked = shuffle(pool).slice(0, QUESTIONS_PER_DUEL);
  const questions = picked.map(({ roundId, idx }) => {
    const round = rounds.find(r => r.id === roundId);
    const qLen = round.questions[idx].a.length;
    const answerPerm = shuffle([0, 1, 2, 3].slice(0, qLen));
    return { roundId, idx, answerPerm, correctIndex: answerPerm.indexOf(0) };
  });
  return { mixed: true, roundIds: rounds.map(r => r.id), questions };
}

/**
 * Reconstruct localized question objects from a language-agnostic room setup.
 * Each player calls this independently using their own language setting.
 * Handles Firebase serialization: arrays stored as {0:…,1:…} objects.
 *
 * Multiplayer rooms should always carry `setup.lang` (host's choice) so all
 * players render identical text. The local `getLang()` fallback is a last
 * resort for legacy rooms and bot mode.
 */
const SUPPORTED_DUEL_LANGS = ['es', 'en', 'fr', 'pt', 'de'];
export function loadDuelQuestionsFromSetup(setup, lang) {
  const effective = (typeof lang === 'string' && SUPPORTED_DUEL_LANGS.includes(lang)) ? lang : null;
  if (!effective) {
    console.warn('[duel] setup.lang missing or invalid — falling back to local lang', { got: lang });
  }
  const l = effective || getLang();
  const rounds = getLocalizedRounds(l);
  const setupQs = Array.isArray(setup.questions)
    ? setup.questions
    : Object.values(setup.questions);
  // Mixed setup: each question carries its own roundId. Legacy setup: single
  // top-level roundId covers every question.
  if (setup.mixed) {
    return setupQs.map(({ roundId, idx, answerPerm, correctIndex }) => {
      const round = rounds.find(r => r.id === roundId);
      if (!round) return null;
      const q = round.questions[idx];
      const perm = Array.isArray(answerPerm) ? answerPerm : Object.values(answerPerm);
      return {
        question: q.q,
        answers: perm.map(ai => q.a[ai]),
        correctIndex,
        explanation: q.exp
      };
    }).filter(Boolean);
  }
  const round = rounds.find(r => r.id === setup.roundId);
  if (!round) return [];
  return setupQs.map(({ idx, answerPerm, correctIndex }) => {
    const q = round.questions[idx];
    const perm = Array.isArray(answerPerm) ? answerPerm : Object.values(answerPerm);
    return {
      question: q.q,
      answers: perm.map(ai => q.a[ai]),
      correctIndex,
      explanation: q.exp
    };
  });
}

export function calcScore(correct, timeLeft) {
  return correct ? POINTS_PER_CORRECT + timeLeft * TIME_BONUS_PER_SECOND : 0;
}

// ─── Presence ─────────────────────────────────────────────────

export async function setPresence(uid, name) {
  if (!db) return;
  const { ref, set, onDisconnect } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  const presRef = ref(db, `presence/${uid}`);
  await set(presRef, { name, online: true });
  onDisconnect(presRef).remove();
}

export async function removePresence(uid) {
  if (!db) return;
  const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  await remove(ref(db, `presence/${uid}`));
}

export async function listenOnlineCount(cb) {
  if (!db) { cb(0); return () => {}; }
  const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  const unsub = onValue(ref(db, 'presence'), snap => {
    cb(snap.exists() ? Object.keys(snap.val()).length : 0);
  });
  return unsub;
}

// ─── Room: Friend Code ────────────────────────────────────────

export async function createFriendRoom(uid, name, setup, maxPlayers = 2) {
  if (!db) throw new Error('RTDB no inicializado');
  const { ref, set, onDisconnect } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  const roomId = generateRoomId();
  const code = generateCode();

  await set(ref(db, `rooms/${roomId}`), {
    code,
    status: 'waiting',
    setup,
    maxPlayers,
    currentRound: 1,
    createdAt: Date.now(),
    players: {
      p1: { uid, name, score: 0, currentQ: 0, answers: {}, ready: false, rematch: null }
    }
  });
  // Store code → roomId mapping for lookup
  await set(ref(db, `codes/${code}`), roomId);

  // Register cleanup on disconnect
  onDisconnect(ref(db, `rooms/${roomId}/players/p1`)).update({ disconnected: true });
  onDisconnect(ref(db, `codes/${code}`)).remove();

  return { roomId, code };
}

export async function joinByCode(uid, name, code) {
  if (!db) throw new Error('RTDB no inicializado');
  const { ref, get, update, onDisconnect } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

  const codeSnap = await get(ref(db, `codes/${code.toUpperCase()}`));
  if (!codeSnap.exists()) return null;

  const roomId = codeSnap.val();
  const roomSnap = await get(ref(db, `rooms/${roomId}`));
  if (!roomSnap.exists()) return null;

  const room = roomSnap.val();
  const max = room.maxPlayers || 2;
  const ALL_SLOTS = ['p1', 'p2', 'p3', 'p4'];

  // Find first empty slot (p2, p3, p4 — p1 is the host)
  let assignedSlot = null;
  for (let i = 1; i < max; i++) {
    if (!room.players?.[ALL_SLOTS[i]]) {
      assignedSlot = ALL_SLOTS[i];
      break;
    }
  }
  if (!assignedSlot) return 'full';

  // Atomic multi-path write (same pattern as submitAnswer)
  const joinedCount = ALL_SLOTS.slice(0, max).filter(s => s === assignedSlot || room.players?.[s]).length;
  const updates = {
    [`rooms/${roomId}/players/${assignedSlot}`]: { uid, name, score: 0, currentQ: 0, answers: {}, ready: true, rematch: null },
  };
  if (joinedCount >= max) {
    updates[`rooms/${roomId}/status`] = 'ready';
  }

  await update(ref(db), updates);
  onDisconnect(ref(db, `rooms/${roomId}/players/${assignedSlot}`)).update({ disconnected: true });

  return { roomId, slot: assignedSlot };
}

// ─── Room: Matchmaking Queue ──────────────────────────────────

export async function joinQueue(uid, name, setup) {
  if (!db) throw new Error('RTDB no inicializado');
  const { ref, get, set, remove, onDisconnect } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

  const qSnap = await get(ref(db, 'queue'));
  if (qSnap.exists()) {
    const entries = Object.entries(qSnap.val()).filter(([id]) => id !== uid);
    if (entries.length > 0) {
      const [oppUid, opp] = entries[0];
      // Remove opponent from queue and create room
      await remove(ref(db, `queue/${oppUid}`));
      const roomId = generateRoomId();
      const p2Ref = ref(db, `rooms/${roomId}/players/p2`);

      await set(ref(db, `rooms/${roomId}`), {
        code: null,
        status: 'playing',
        setup,
        currentRound: 1,
        createdAt: Date.now(),
        players: {
          p1: { uid: oppUid, name: opp.name, score: 0, currentQ: 0, answers: {}, ready: true, rematch: null },
          p2: { uid, name, score: 0, currentQ: 0, answers: {}, ready: true, rematch: null }
        }
      });
      onDisconnect(p2Ref).update({ disconnected: true });

      // Notify the waiting p1
      await set(ref(db, `matched/${oppUid}`), { roomId });

      return { roomId, slot: 'p2', waiting: false };
    }
  }

  // No match found — add self to queue
  const myRef = ref(db, `queue/${uid}`);
  await set(myRef, { uid, name, joinedAt: Date.now() });
  onDisconnect(myRef).remove();

  return { roomId: null, slot: 'p1', waiting: true };
}

export async function leaveQueue(uid) {
  if (!db) return;
  const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  await remove(ref(db, `queue/${uid}`));
}

/** Listen for a match notification (used by the waiting p1 player) */
export async function listenForMatch(uid, cb) {
  if (!db) return () => {};
  const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  const unsub = onValue(ref(db, `matched/${uid}`), snap => {
    if (snap.exists()) cb(snap.val()); // { roomId }
  });
  return unsub;
}

export async function clearMatchNotif(uid) {
  if (!db) return;
  const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  await remove(ref(db, `matched/${uid}`));
}

// ─── In-Room Actions ──────────────────────────────────────────

export async function listenRoom(roomId, cb) {
  if (!db) return () => {};
  const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  const unsub = onValue(ref(db, `rooms/${roomId}`), snap => {
    cb(snap.exists() ? snap.val() : null);
  });
  return unsub;
}

export async function startRoom(roomId) {
  if (!db) return;
  const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  await update(ref(db, `rooms/${roomId}`), { status: 'playing' });
}

export async function registerPlayerDisconnect(roomId, slot) {
  if (!db) return;
  const { ref, onDisconnect } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  onDisconnect(ref(db, `rooms/${roomId}/players/${slot}`)).update({ disconnected: true });
}

/**
 * Compute the clamped points awarded for a single answer. Pulled out of
 * `submitAnswer` so it can be unit-tested without mocking Firebase. The
 * `Math.min(MAX_POINTS_PER_ANSWER, …)` is defense-in-depth: even if the
 * constants in `calcScore` are bumped accidentally, no single answer can
 * ratchet up a player's score beyond the documented ceiling.
 *
 * NOTE: `correct` is currently the client-supplied truthiness — the real
 * fix requires server-side validation (Cloud Function) checking the chosen
 * answer index against the question's known correct answer. Tracked in
 * `docs/SECURITY_QA_AUDIT.md` (F4) as deferred work.
 */
export function clampedAnswerPoints(correct, timeLeft) {
  const clampedTime = Math.max(0, Math.min(Number(timeLeft) || 0, 60));
  const earnedPoints = calcScore(!!correct, clampedTime);
  return {
    clampedTime,
    earnedPoints: Math.max(0, Math.min(MAX_POINTS_PER_ANSWER, earnedPoints | 0)),
  };
}

/**
 * Submit an answer for a player.
 * Score is computed from the answer data rather than trusting the client value.
 * @param {string} roomId
 * @param {string} slot - 'p1' or 'p2'
 * @param {number} qIndex - question index (0-based)
 * @param {boolean} correct
 * @param {number} timeLeft - seconds remaining
 */
export async function submitAnswer(roomId, slot, qIndex, correct, timeLeft) {
  if (!db) return;
  const { ref, update, get } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

  // Clamp timeLeft and cap earnedPoints to defend against client manipulation
  const { clampedTime, earnedPoints } = clampedAnswerPoints(correct, timeLeft);

  // Defense-in-depth: only allow the authenticated user to write to a slot
  // they actually occupy. Without this, a tampered client could call
  // `submitAnswer(roomId, 'p2', …)` from p1's session and inflate the rival.
  // The RTDB rule is the authoritative gate; this just fails fast client-side.
  try {
    const { getApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const myUid = getAuth(getApp())?.currentUser?.uid;
    const slotUidSnap = await get(ref(db, `rooms/${roomId}/players/${slot}/uid`));
    if (myUid && slotUidSnap.exists() && slotUidSnap.val() !== myUid) {
      console.warn('[rivals] submitAnswer blocked — slot does not belong to current user');
      return;
    }
  } catch {}

  // Read current score and add earned points (prevents client-side score manipulation)
  const scoreSnap = await get(ref(db, `rooms/${roomId}/players/${slot}/score`));
  const currentScore = Number(scoreSnap.val()) || 0;

  const updates = {
    [`rooms/${roomId}/players/${slot}/answers/${qIndex}`]: { correct: !!correct, timeLeft: clampedTime },
    [`rooms/${roomId}/players/${slot}/currentQ`]: qIndex + 1,
    [`rooms/${roomId}/players/${slot}/score`]: currentScore + earnedPoints
  };
  await update(ref(db), updates);
}

export async function finishGame(roomId) {
  if (!db) return;
  const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  await update(ref(db, `rooms/${roomId}`), { status: 'finished' });
}

export async function leaveRoom(roomId, slot) {
  if (!db) return;
  const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  await update(ref(db, `rooms/${roomId}/players/${slot}`), { disconnected: true });
}

// ─── Rematch: per-player vote, host resets when everyone non-disconnected accepts ──

export async function acceptRematch(roomId, slot) {
  if (!db) return;
  const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  await update(ref(db, `rooms/${roomId}/players/${slot}`), { rematch: 'accept' });
}

export async function declineRematch(roomId, slot) {
  if (!db) return;
  const { ref, update, onDisconnect } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  // Cancel the onDisconnect handler so the slot isn't re-marked after this
  try { onDisconnect(ref(db, `rooms/${roomId}/players/${slot}`)).cancel(); } catch {}
  await update(ref(db, `rooms/${roomId}/players/${slot}`), { rematch: 'leave', disconnected: true });
}

// Host-only: when all active (non-disconnected) players have accepted, reset
// room state and kick off a new round with a fresh setup (same selection,
// newly drawn questions). Returns true if the reset happened.
export async function resetForRematch(roomId, freshSetup) {
  if (!db) return false;
  const { ref, get, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
  const snap = await get(ref(db, `rooms/${roomId}`));
  if (!snap.exists()) return false;
  const room = snap.val();
  const players = room.players || {};
  const slots = Object.keys(players);
  const active = slots.filter(s => !players[s].disconnected);
  if (active.length < 2) return false;
  if (!active.every(s => players[s].rematch === 'accept')) return false;

  const updates = {
    [`rooms/${roomId}/status`]: 'playing',
    [`rooms/${roomId}/currentRound`]: (room.currentRound || 1) + 1,
  };
  if (freshSetup) updates[`rooms/${roomId}/setup`] = freshSetup;
  for (const s of active) {
    updates[`rooms/${roomId}/players/${s}/score`] = 0;
    updates[`rooms/${roomId}/players/${s}/currentQ`] = 0;
    updates[`rooms/${roomId}/players/${s}/answers`] = {};
    updates[`rooms/${roomId}/players/${s}/rematch`] = null;
  }
  await update(ref(db), updates);
  return true;
}
