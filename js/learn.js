import { getLocalizedRounds } from './questions.js';
import { getLang } from './lang.js';
import { getDb, getCurrentUser, isFirebaseReady } from './auth.js';
import { shuffle } from './utils.js';

// ─── Storage ──────────────────────────────────────────────────
const KEY = 'cq_learn_data';

function getData() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

function setData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  syncLearnToCloud(data);
}

async function syncLearnToCloud(data) {
  const user = getCurrentUser();
  if (!isFirebaseReady() || !user || user.isGuest) return;
  try {
    const db = getDb();
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    // Also refresh ranking fields on every XP / streak change so the global
    // leaderboard updates immediately without waiting for `saveScore`.
    const xp = data.xp || 0;
    const streak = data.streak || 0;
    const lvl = getLevelInfo(xp);
    await setDoc(doc(db, 'users', user.uid), {
      learnData: data,
      level: lvl.level,
      xpTotal: xp,
      streakDays: streak,
      name: user.name,
      lastSeen: Date.now(),
    }, { merge: true });
  } catch (e) { console.warn('learn cloud sync failed:', e); }
}

export async function loadLearnFromCloud() {
  const user = getCurrentUser();
  if (!isFirebaseReady() || !user || user.isGuest) return;
  try {
    const db = getDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists() && snap.data().learnData) {
      localStorage.setItem(KEY, JSON.stringify(snap.data().learnData));
    }
  } catch (e) { console.warn('learn cloud load failed:', e); }
}

// ─── Mastery System ───────────────────────────────────────────

export const MASTERY_LEVELS = [
  { level: 0, key: 'novato',        icon: '🌱', color: '#888888' },
  { level: 1, key: 'familiarizado', icon: '📖', color: '#3498db' },
  { level: 2, key: 'maestro',       icon: '🏆', color: '#f1c40f' },
];

/**
 * Compute the mastery score (0.0–1.0) for a round based on per-concept hit counts.
 * Each concept can accumulate up to 3 hits (cap). Score = avg hits / 3.
 */
export function getRoundMasteryScore(roundData, roundProgress) {
  const total = roundData.questions.length;
  const concepts = roundProgress?.concepts || {};
  const sum = roundData.questions.reduce(
    (acc, _, i) => acc + Math.min(3, concepts[i]?.hits ?? 0), 0
  );
  return total > 0 ? sum / (total * 3) : 0;
}

/** Return the MASTERY_LEVELS entry for a given 0.0–1.0 score */
export function getMasteryLevel(score) {
  if (score >= 0.67) return MASTERY_LEVELS[2];
  if (score >= 0.33) return MASTERY_LEVELS[1];
  return MASTERY_LEVELS[0];
}

// ─── Stats ────────────────────────────────────────────────────
export function getLearnStats() {
  const d = getData();
  let streak = d.streak || 0;
  // If lastDate is not today or yesterday, the streak has expired
  if (streak > 0 && d.lastDate) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (d.lastDate !== today && d.lastDate !== yesterday) {
      streak = 0;
    }
  }
  return { xp: d.xp || 0, streak, rounds: d.rounds || {} };
}

export function getLevelInfo(xp) {
  const steps = [0, 100, 250, 500, 900, 1500, 2500, 4000];
  const maxLevel = steps.length;
  let level = 1;
  for (let i = 1; i < steps.length; i++) {
    if (xp >= steps[i]) level = i + 1; else break;
  }
  if (level >= maxLevel) {
    return { level: maxLevel, cur: steps[maxLevel - 1], need: steps[maxLevel - 1], pct: 100, maxLevel: true };
  }
  const start = steps[level - 1];
  const end   = steps[level];
  const cur   = xp - start;
  const need  = end - start;
  return { level, cur, need, pct: Math.min(100, Math.round((cur / need) * 100)), maxLevel: false };
}

export function getLearnRounds() {
  const { rounds: prog } = getLearnStats();
  const rounds = getLocalizedRounds(getLang());
  return rounds.map(r => {
    const rp = prog[r.id] || {};
    const masteryScore = getRoundMasteryScore(r, rp);
    const masteryInfo  = getMasteryLevel(masteryScore);
    return {
      ...r,
      progress: {
        sessionCount: rp.sessionCount || rp.completed || 0,
        mastered: masteryInfo.level >= 2,
        masteryScore,
        masteryLevel: masteryInfo.level,
        masteryKey:   masteryInfo.key,
        masteryIcon:  masteryInfo.icon,
        // legacy compat
        completed: rp.sessionCount || rp.completed || 0,
      }
    };
  });
}

// ─── Streak ───────────────────────────────────────────────────
function touchStreak() {
  const d = getData();
  const today = new Date().toDateString();
  if (d.lastDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const streak = d.lastDate === yesterday ? (d.streak || 0) + 1 : 1;
  setData({ ...d, streak, lastDate: today });
}

// ─── Session State ────────────────────────────────────────────
const SESSION_SIZE = 7;

let ls = null;

export function startLesson(roundId) {
  const round = getLocalizedRounds(getLang()).find(r => r.id === roundId);
  if (!round) return null;

  // Read existing concept mastery to prioritise weakest concepts
  const d = getData();
  const roundProgress = d.rounds?.[roundId] || {};
  const concepts = roundProgress.concepts || {};

  // Sort questions by hit count ascending (weakest first), shuffle ties
  const indexed = round.questions.map((q, i) => ({
    i, q, hits: concepts[i]?.hits ?? 0
  }));
  indexed.sort((a, b) => a.hits - b.hits || Math.random() - 0.5);
  const selected = indexed.slice(0, SESSION_SIZE);

  // Build question objects
  const questions = selected.map(({ i, q }) => {
    const correct  = q.a[0];
    const shuffled = shuffle(q.a);
    return {
      srcIndex:    i,
      theory:      q.theory || q.exp || '',
      question:    q.q,
      answers:     shuffled,
      correctIndex: shuffled.indexOf(correct),
      explanation: q.exp,
    };
  });

  ls = {
    round,
    questions,           // original session questions
    queue: [...questions], // working queue — retried questions appended
    queuePos: 0,
    phase: 'theory',     // 'theory' | 'question' | 'feedback'
    xp: 0,
    correctCount: 0,
    answered: false,
    retried: new Set(),  // srcIndex values already re-queued
    masteryGains: [],    // { srcIndex, before, after }
    prevMasteryScore: getRoundMasteryScore(round, roundProgress),
  };

  return _theoryPayload();
}

function _currentQ() { return ls.queue[ls.queuePos]; }

function _theoryPayload() {
  return {
    phase: 'theory',
    theory:          _currentQ().theory,
    roundIcon:       ls.round.icon,
    sessionProgress: { done: ls.queuePos, total: ls.queue.length },
  };
}

function _questionPayload() {
  const q = _currentQ();
  return {
    phase:    'question',
    question: q.question,
    answers:  q.answers,
    sessionProgress: { done: ls.queuePos, total: ls.queue.length },
  };
}

/** Called when user taps "Listo, a practicar →" on theory card */
export function advanceFromTheory() {
  if (!ls || ls.phase !== 'theory') return null;
  ls.phase    = 'question';
  ls.answered = false;
  return _questionPayload();
}

export function answerLesson(selectedIndex) {
  if (!ls || ls.phase !== 'question' || ls.answered) return null;
  ls.answered = true;
  ls.phase    = 'feedback';

  const q       = _currentQ();
  const correct = selectedIndex === q.correctIndex;

  if (correct) {
    ls.correctCount++;
    ls.xp += 10;
  } else {
    // Re-queue once for a retry
    if (!ls.retried.has(q.srcIndex)) {
      ls.retried.add(q.srcIndex);
      ls.queue.push(q);
    }
  }

  _persistConceptHit(q.srcIndex, correct);

  return {
    phase:         'feedback',
    correct,
    correctIndex:  q.correctIndex,
    selectedIndex,
    explanation:   q.explanation,
  };
}

/** Persist a hit/miss for a single concept immediately (no session-end required) */
function _persistConceptHit(srcIndex, hit) {
  const d          = getData();
  const roundId    = ls.round.id;
  const roundData  = d.rounds?.[roundId] || {};
  const concepts   = { ...(roundData.concepts || {}) };
  const prev       = concepts[srcIndex] || { hits: 0, misses: 0 };

  const hitsBefore = Math.min(3, prev.hits);
  const newHits    = hit ? prev.hits + 1 : prev.hits;
  const hitsAfter  = Math.min(3, newHits);

  if (hitsAfter > hitsBefore) {
    ls.masteryGains.push({ srcIndex, before: hitsBefore, after: hitsAfter });
  }

  concepts[srcIndex] = {
    hits:   newHits,
    misses: hit ? prev.misses : prev.misses + 1,
  };

  localStorage.setItem(KEY, JSON.stringify({
    ...d,
    rounds: { ...(d.rounds || {}), [roundId]: { ...roundData, concepts } }
  }));
}

/** Called when user taps "Siguiente →" on feedback panel */
export function advanceLesson() {
  if (!ls || ls.phase !== 'feedback') return null;

  ls.queuePos++;
  if (ls.queuePos >= ls.queue.length) return _finishSession();

  ls.phase = 'theory';
  return _theoryPayload();
}

function _finishSession() {
  const { round, xp, correctCount, questions, masteryGains, prevMasteryScore } = ls;

  // Re-read fresh data (we wrote per-concept hits incrementally)
  const d            = getData();
  const roundId      = round.id;
  const freshProgress = d.rounds?.[roundId] || {};
  const sessionCount = (freshProgress.sessionCount || freshProgress.completed || 0) + 1;
  const newMasteryScore = getRoundMasteryScore(round, freshProgress);
  const prevLevel    = getMasteryLevel(prevMasteryScore).level;
  const newLevel     = getMasteryLevel(newMasteryScore).level;

  setData({
    ...d,
    xp: (d.xp || 0) + xp,
    rounds: {
      ...(d.rounds || {}),
      [roundId]: {
        ...freshProgress,
        sessionCount,
        mastered: newLevel >= 2,
        completed: sessionCount,  // legacy compat
      }
    }
  });
  touchStreak();

  const result = {
    done: true,
    xp,
    correct: correctCount,
    total:   questions.length,
    round,
    masteryGains,
    masteryScore:      newMasteryScore,
    masteryLevel:      newLevel,
    prevMasteryLevel:  prevLevel,
    levelUp:           newLevel > prevLevel,
  };
  ls = null;
  return result;
}

export function abortLesson() { ls = null; }

// Add XP and refresh streak. Used by the React LessonPlayer so that non-learn
// modes (speed, daily, blind, academy…) also accrue XP into the canonical
// cq_learn_data store that the leaderboard reads from.
export function addXp(amount) {
  const xp = Math.max(0, amount | 0);
  if (!xp) return;
  const d = getData();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const streak = d.lastDate === today ? (d.streak || 1)
    : d.lastDate === yesterday ? (d.streak || 0) + 1
    : 1;
  setData({ ...d, xp: (d.xp || 0) + xp, streak, lastDate: today });
}
