// ─────────────────────────────────────────────────────────────
// academy.js – Cocktail Academy game logic
// Follows learn.js pattern: localStorage persistence,
// module-scoped session state, payload-driven UI.
// ─────────────────────────────────────────────────────────────

import { ACADEMY_LEVELS } from './academy_data.js';
import { getDb, getCurrentUser, isFirebaseReady } from './auth.js';
import { t } from './lang.js';

// ─── Storage ─────────────────────────────────────────────────
const KEY = 'cq_academy_data';
const KEY_LEARN = 'cq_learn_data';

function getData() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

function setData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  syncAcademyToCloud(data);
}

async function syncAcademyToCloud(data) {
  const user = getCurrentUser();
  if (!isFirebaseReady() || !user || user.isGuest) return;
  try {
    const db = getDb();
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    await setDoc(doc(db, 'users', user.uid), { academyData: data }, { merge: true });
  } catch (e) { console.warn('academy cloud sync failed:', e); }
}

export async function loadAcademyFromCloud() {
  const user = getCurrentUser();
  if (!isFirebaseReady() || !user || user.isGuest) return;
  try {
    const db = getDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists() && snap.data().academyData) {
      const cloud = snap.data().academyData;
      const local = getData();
      // Merge: keep best scores and max XP
      const merged = { ...local };
      merged.xp = Math.max(local.xp || 0, cloud.xp || 0);
      merged.totalCompleted = Math.max(local.totalCompleted || 0, cloud.totalCompleted || 0);
      if (cloud.levels) {
        merged.levels = { ...(local.levels || {}) };
        for (const [id, cl] of Object.entries(cloud.levels)) {
          const ll = merged.levels[id] || {};
          merged.levels[id] = {
            completed: ll.completed || cl.completed,
            bestScore: Math.max(ll.bestScore || 0, cl.bestScore || 0),
            attempts: Math.max(ll.attempts || 0, cl.attempts || 0),
          };
        }
      }
      localStorage.setItem(KEY, JSON.stringify(merged));
      syncAcademyToCloud(merged);
    }
  } catch (e) { console.warn('academy cloud load failed:', e); }
}

// ─── Public Getters ──────────────────────────────────────────

export function isLevelUnlocked(levelId) {
  if (levelId === 0) return true;
  const data = getData();
  return data.levels?.[levelId - 1]?.completed === true;
}

export function getAcademyStats() {
  const d = getData();
  const completedCount = Object.values(d.levels || {}).filter(l => l.completed).length;
  return {
    currentLevel: completedCount,
    xp: d.xp || 0,
    totalCompleted: d.totalCompleted || 0,
    levels: d.levels || {},
  };
}

export function getAcademyLevels() {
  const d = getData();
  return ACADEMY_LEVELS.map(level => {
    const progress = d.levels?.[level.id] || {};
    return {
      ...level,
      unlocked: isLevelUnlocked(level.id),
      completed: !!progress.completed,
      bestScore: progress.bestScore || 0,
      attempts: progress.attempts || 0,
    };
  });
}

// ─── Session State ───────────────────────────────────────────

let as = null;

export function startAcademy(levelId) {
  const level = ACADEMY_LEVELS.find(l => l.id === levelId);
  if (!level || !isLevelUnlocked(levelId)) return null;

  // Flatten all cards from all lessons
  const cards = [];
  level.lessons.forEach((lesson, li) => {
    lesson.cards.forEach(card => {
      cards.push({ ...card, lessonKey: lesson.key, lessonIndex: li });
    });
  });

  // Prepare assessment questions with shuffled answers
  const questions = level.questions.map(q => {
    const correct = q.a[0];
    const shuffled = [...q.a].sort(() => Math.random() - 0.5);
    return {
      question: q.q,
      answers: shuffled,
      correctIndex: shuffled.indexOf(correct),
      explanation: q.exp,
    };
  });

  as = {
    levelId,
    level,
    phase: 'cards',
    cards,
    cardIndex: 0,
    questions,
    questionIndex: 0,
    correctCount: 0,
    xp: 0,
    answered: false,
  };

  return _cardPayload();
}

export function advanceAcademyCard() {
  if (!as || as.phase !== 'cards') return null;

  as.cardIndex++;
  if (as.cardIndex >= as.cards.length) {
    // Transition to assessment phase
    as.phase = 'question';
    as.answered = false;
    return _questionPayload();
  }

  return _cardPayload();
}

export function answerAcademy(selectedIndex) {
  if (!as || as.phase !== 'question' || as.answered) return null;

  as.answered = true;
  const q = as.questions[as.questionIndex];
  const correct = selectedIndex === q.correctIndex;

  if (correct) {
    as.correctCount++;
    as.xp += 10;
  }

  return {
    phase: 'feedback',
    correct,
    correctIndex: q.correctIndex,
    selectedIndex,
    explanation: q.explanation,
  };
}

export function advanceAcademy() {
  if (!as || as.phase !== 'feedback') return null;

  as.questionIndex++;
  as.answered = false;

  if (as.questionIndex >= as.questions.length) {
    return _finishLevel();
  }

  as.phase = 'question';
  return _questionPayload();
}

export function abortAcademy() { as = null; }

// ─── Internal Helpers ────────────────────────────────────────

function _cardPayload() {
  const card = as.cards[as.cardIndex];
  return {
    phase: 'card',
    type: card.type,
    key: card.key || null,
    cocktail: card.cocktail || null,
    lessonKey: card.lessonKey,
    lessonIndex: card.lessonIndex,
    progress: { done: as.cardIndex, total: as.cards.length + as.questions.length },
  };
}

function _questionPayload() {
  const q = as.questions[as.questionIndex];
  return {
    phase: 'question',
    question: q.question,
    answers: q.answers,
    done: as.questionIndex,
    total: as.questions.length,
    progress: { done: as.cards.length + as.questionIndex, total: as.cards.length + as.questions.length },
  };
}

function _finishLevel() {
  const { levelId, level, correctCount, questions, xp } = as;
  const total = questions.length;
  const pct = Math.round((correctCount / total) * 100);
  const passed = pct >= level.passThreshold;

  // Persist level result
  const d = getData();
  const prev = d.levels?.[levelId] || {};
  const attempts = (prev.attempts || 0) + 1;
  const bestScore = Math.max(prev.bestScore || 0, pct);
  const completed = prev.completed || passed;

  d.levels = d.levels || {};
  d.levels[levelId] = { completed, bestScore, attempts };
  d.xp = (d.xp || 0) + xp;
  if (passed && !prev.completed) {
    d.totalCompleted = (d.totalCompleted || 0) + 1;
  }
  setData(d);

  // Cross-write XP to learn data (avoids circular import)
  _crossWriteXP(xp);
  // Touch streak
  _touchStreak();

  const nextLevel = ACADEMY_LEVELS.find(l => l.id === levelId + 1);
  const unlockNext = passed && !prev.completed && !!nextLevel;

  const result = {
    done: true,
    passed,
    pct,
    xp,
    correct: correctCount,
    total,
    levelId,
    levelKey: level.key,
    unlockNext,
    nextLevelKey: nextLevel ? nextLevel.key : null,
    levelsCompleted: Object.values(d.levels).filter(l => l.completed).length,
    academyPerfect: pct === 100,
  };

  as = null;
  return result;
}

function _crossWriteXP(xp) {
  try {
    const d = JSON.parse(localStorage.getItem(KEY_LEARN) || '{}');
    d.xp = (d.xp || 0) + xp;
    localStorage.setItem(KEY_LEARN, JSON.stringify(d));
  } catch { /* ignore */ }
}

function _touchStreak() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY_LEARN) || '{}');
    const today = new Date().toDateString();
    if (d.lastDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const streak = d.lastDate === yesterday ? (d.streak || 0) + 1 : 1;
    d.streak = streak;
    d.lastDate = today;
    localStorage.setItem(KEY_LEARN, JSON.stringify(d));
  } catch { /* ignore */ }
}
