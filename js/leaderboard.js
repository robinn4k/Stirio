import { getDb, getCurrentUser, isFirebaseReady } from './auth.js';

const LOCAL_KEY = 'cq_leaderboard';
const LOCAL_USER_KEY = 'cq_user_stats';

// --- LOCAL STORAGE HELPERS ---

function getLocalScores() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; }
  catch { return []; }
}

function saveLocalScores(scores) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(scores));
}

function getLocalUserStats() {
  try { return JSON.parse(localStorage.getItem(LOCAL_USER_KEY)) || { games: 0, best: 0, total: 0, rounds: {} }; }
  catch { return { games: 0, best: 0, total: 0, rounds: {} }; }
}

function saveLocalUserStats(stats) {
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(stats));
}

// --- SAVE SCORE ---

async function saveScore({ roundId, roundTitle, score, corrects, wrongs }) {
  const user = getCurrentUser();
  if (!user) return;

  const entry = {
    uid: user.uid,
    name: user.name,
    roundId,
    roundTitle,
    score,
    corrects,
    wrongs,
    date: Date.now(),
    isGuest: user.isGuest
  };

  // Update local user stats
  const stats = getLocalUserStats();
  stats.games++;
  stats.total += score;
  if (score > stats.best) stats.best = score;
  if (!stats.rounds[roundId] || score > stats.rounds[roundId]) {
    stats.rounds[roundId] = score;
  }
  saveLocalUserStats(stats);

  // Save to local leaderboard
  const local = getLocalScores();
  local.push(entry);
  local.sort((a, b) => b.score - a.score);
  saveLocalScores(local.slice(0, 100)); // Keep top 100

  // Save to Firestore if available
  if (isFirebaseReady() && !user.isGuest) {
    try {
      const db = getDb();
      const { collection, doc, setDoc, getDoc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      // Use deterministic doc ID so each player has at most one entry per round (best score)
      const scoreRef = doc(db, 'scores', `${user.uid}_${roundId}`);
      const existing = await getDoc(scoreRef);
      if (!existing.exists() || score > existing.data().score) {
        await setDoc(scoreRef, entry);
      }
      // Update user document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        await updateDoc(userRef, {
          games: (data.games || 0) + 1,
          best: Math.max(data.best || 0, score),
          total: (data.total || 0) + score,
          [`rounds.${roundId}`]: Math.max((data.rounds?.[roundId] || 0), score),
          name: user.name,
          lastSeen: Date.now()
        });
      } else {
        await setDoc(userRef, { ...stats, name: user.name, uid: user.uid, lastSeen: Date.now() });
      }
    } catch (e) {
      console.warn('Error al guardar en Firestore:', e);
    }
  }

  return entry;
}

// --- FETCH LEADERBOARD ---

function deduplicateByPlayer(scores) {
  const byPlayer = {};
  scores.forEach(s => {
    if (!byPlayer[s.uid] || s.score > byPlayer[s.uid].score) byPlayer[s.uid] = s;
  });
  return Object.values(byPlayer).sort((a, b) => b.score - a.score).slice(0, 20);
}

async function fetchLeaderboard(roundId = null) {
  // Try Firestore first
  if (isFirebaseReady()) {
    try {
      const db = getDb();
      const { collection, query, where, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      let q;
      if (roundId) {
        q = query(collection(db, 'scores'), where('roundId', '==', roundId), orderBy('score', 'desc'), limit(100));
      } else {
        q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(100));
      }
      const snap = await getDocs(q);
      return deduplicateByPlayer(snap.docs.map(d => d.data()));
    } catch (e) {
      console.warn('Error al leer Firestore, usando local:', e);
    }
  }

  // Fallback: local
  let scores = getLocalScores();
  if (roundId) scores = scores.filter(s => s.roundId === roundId);
  return deduplicateByPlayer(scores);
}

// --- USER STATS ---

async function getUserStats() {
  const user = getCurrentUser();
  if (!user) return null;

  // Try Firestore
  if (isFirebaseReady() && !user.isGuest) {
    try {
      const db = getDb();
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        // If Firestore doc has no rounds yet (old user doc), fall back to local rounds
        if (!data.rounds || Object.keys(data.rounds).length === 0) {
          const local = getLocalUserStats();
          data.rounds = local.rounds;
        }
        return data;
      }
    } catch (e) {
      console.warn('Error al leer stats de Firestore:', e);
    }
  }

  return getLocalUserStats();
}

// --- USER RANK ---

async function getUserRank(roundId = null) {
  const user = getCurrentUser();
  if (!user) return null;
  const board = await fetchLeaderboard(roundId);
  const idx = board.findIndex(e => e.uid === user.uid);
  return idx >= 0 ? idx + 1 : null;
}

// --- RESET LEADERBOARD (migration tool) ---

async function resetLeaderboard() {
  // Clear local leaderboard data
  localStorage.removeItem(LOCAL_KEY);
  localStorage.removeItem(LOCAL_USER_KEY);

  // Clear Firestore scores for current user
  const user = getCurrentUser();
  if (isFirebaseReady() && user && !user.isGuest) {
    try {
      const db = getDb();
      const { collection, query, where, getDocs, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const q = query(collection(db, 'scores'), where('uid', '==', user.uid));
      const snap = await getDocs(q);
      for (const d of snap.docs) await deleteDoc(d.ref);
    } catch (e) {
      console.warn('Error resetting Firestore leaderboard:', e);
    }
  }
}

export { saveScore, fetchLeaderboard, getUserStats, getUserRank, getLocalUserStats, resetLeaderboard };
