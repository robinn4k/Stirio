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
const DATA_VERSION = 2;

function getData() {
  try {
    let d = JSON.parse(localStorage.getItem(KEY)) || {};
    if ((d._version || 0) < DATA_VERSION) {
      d = _migrateData(d);
      localStorage.setItem(KEY, JSON.stringify(d));
    }
    return d;
  } catch { return { _version: DATA_VERSION }; }
}

function setData(data) {
  data._version = DATA_VERSION;
  localStorage.setItem(KEY, JSON.stringify(data));
  syncAcademyToCloud(data);
}

// ─── Migration ───────────────────────────────────────────────

function _migrateData(data) {
  if (data.levels) {
    for (const [id, levelData] of Object.entries(data.levels)) {
      if (levelData.completed && !levelData.lessons) {
        const level = ACADEMY_LEVELS.find(l => l.id === parseInt(id));
        if (level) {
          levelData.lessons = {};
          level.lessons.forEach((_, li) => {
            levelData.lessons[li] = {
              completed: true,
              bestScore: levelData.bestScore || 0,
              attempts: 1,
            };
          });
        }
      } else if (!levelData.lessons) {
        levelData.lessons = {};
      }
    }
  }
  data._version = DATA_VERSION;
  return data;
}

// ─── Cloud Sync ──────────────────────────────────────────────

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
      let cloud = snap.data().academyData;
      if ((cloud._version || 0) < DATA_VERSION) cloud = _migrateData(cloud);
      const local = getData();
      const merged = { ...local, _version: DATA_VERSION };
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
            lessons: _mergeLessons(ll.lessons, cl.lessons),
          };
        }
      }
      localStorage.setItem(KEY, JSON.stringify(merged));
      syncAcademyToCloud(merged);
    }
  } catch (e) { console.warn('academy cloud load failed:', e); }
}

function _mergeLessons(localLessons, cloudLessons) {
  const l = localLessons || {};
  const c = cloudLessons || {};
  const merged = { ...l };
  for (const [li, cl] of Object.entries(c)) {
    const ll = merged[li] || {};
    merged[li] = {
      completed: ll.completed || cl.completed,
      bestScore: Math.max(ll.bestScore || 0, cl.bestScore || 0),
      attempts: Math.max(ll.attempts || 0, cl.attempts || 0),
    };
  }
  return merged;
}

// ─── Public Getters ──────────────────────────────────────────

export function isLevelUnlocked(levelId) {
  if (levelId === 0) return true;
  const data = getData();
  return data.levels?.[levelId - 1]?.completed === true;
}

export function isLessonUnlocked(levelId, lessonIndex) {
  if (!isLevelUnlocked(levelId)) return false;
  if (lessonIndex === 0) return true;
  const data = getData();
  return data.levels?.[levelId]?.lessons?.[lessonIndex - 1]?.completed === true;
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
    const lessonProgress = level.lessons.map((lesson, li) => {
      const lp = progress.lessons?.[li] || {};
      return {
        ...lesson,
        index: li,
        unlocked: isLessonUnlocked(level.id, li),
        completed: !!lp.completed,
        bestScore: lp.bestScore || 0,
        attempts: lp.attempts || 0,
      };
    });
    const lessonsCompleted = lessonProgress.filter(l => l.completed).length;
    return {
      id: level.id,
      key: level.key,
      descKey: level.descKey,
      icon: level.icon,
      color: level.color,
      passThreshold: level.passThreshold,
      unlocked: isLevelUnlocked(level.id),
      completed: !!progress.completed,
      bestScore: progress.bestScore || 0,
      attempts: progress.attempts || 0,
      lessons: lessonProgress,
      lessonsCompleted,
      lessonsTotal: level.lessons.length,
      questions: level.questions,
    };
  });
}

// ─── Session State ───────────────────────────────────────────

let as = null;

export function startAcademyLesson(levelId, lessonIndex) {
  const level = ACADEMY_LEVELS.find(l => l.id === levelId);
  if (!level || !isLessonUnlocked(levelId, lessonIndex)) return null;
  const lesson = level.lessons[lessonIndex];
  if (!lesson) return null;

  const cards = lesson.cards.map(card => ({
    ...card, lessonKey: lesson.key, lessonIndex,
  }));

  const questions = lesson.questions.map(q => {
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
    lessonIndex,
    level,
    lesson,
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

// Backward compat: start first lesson of level
export function startAcademy(levelId) {
  return startAcademyLesson(levelId, 0);
}

export function advanceAcademyCard() {
  if (!as || as.phase !== 'cards') return null;

  as.cardIndex++;
  if (as.cardIndex >= as.cards.length) {
    as.phase = 'question';
    as.answered = false;
    return _questionPayload();
  }

  return _cardPayload();
}

export function answerAcademy(selectedIndex) {
  if (!as || as.phase !== 'question' || as.answered) return null;

  as.answered = true;
  as.phase = 'feedback';
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
    return _finishLesson();
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
    current: as.questionIndex,
    total: as.questions.length,
    progress: { done: as.cards.length + as.questionIndex, total: as.cards.length + as.questions.length },
  };
}

function _finishLesson() {
  const { levelId, lessonIndex, level, lesson, correctCount, questions, xp } = as;
  const total = questions.length;
  const pct = Math.round((correctCount / total) * 100);
  const threshold = lesson.passThreshold || level.passThreshold;
  const passed = pct >= threshold;

  // Persist lesson result
  const d = getData();
  d.levels = d.levels || {};
  d.levels[levelId] = d.levels[levelId] || {};
  d.levels[levelId].lessons = d.levels[levelId].lessons || {};

  const prevLesson = d.levels[levelId].lessons[lessonIndex] || {};
  const lessonAttempts = (prevLesson.attempts || 0) + 1;
  const lessonBestScore = Math.max(prevLesson.bestScore || 0, pct);
  const lessonCompleted = prevLesson.completed || passed;

  d.levels[levelId].lessons[lessonIndex] = {
    completed: lessonCompleted,
    bestScore: lessonBestScore,
    attempts: lessonAttempts,
  };

  // Check if all lessons in level are now completed
  const allLessonsCompleted = level.lessons.every((_, li) =>
    d.levels[levelId].lessons[li]?.completed === true
  );
  const prevLevelCompleted = d.levels[levelId].completed;
  if (allLessonsCompleted && !prevLevelCompleted) {
    d.levels[levelId].completed = true;
    d.totalCompleted = (d.totalCompleted || 0) + 1;
  }

  // Update level-level bestScore (average of lesson scores)
  const lessonScores = level.lessons.map((_, li) =>
    d.levels[levelId].lessons[li]?.bestScore || 0
  );
  d.levels[levelId].bestScore = Math.round(
    lessonScores.reduce((s, v) => s + v, 0) / lessonScores.length
  );
  d.levels[levelId].attempts = (d.levels[levelId].attempts || 0) + 1;

  d.xp = (d.xp || 0) + xp;
  setData(d);

  _crossWriteXP(xp);
  _touchStreak();

  // Determine what was unlocked
  const nextLessonIndex = lessonIndex + 1;
  const hasNextLesson = nextLessonIndex < level.lessons.length;
  const unlockNextLesson = passed && !prevLesson.completed && hasNextLesson;

  const nextLevel = ACADEMY_LEVELS.find(l => l.id === levelId + 1);
  const levelCompleted = allLessonsCompleted && !prevLevelCompleted;
  const unlockNextLevel = levelCompleted && !!nextLevel;

  const result = {
    done: true,
    passed,
    pct,
    xp,
    correct: correctCount,
    total,
    levelId,
    lessonIndex,
    levelKey: level.key,
    lessonKey: lesson.key,
    unlockNextLesson,
    nextLessonIndex: hasNextLesson ? nextLessonIndex : null,
    nextLessonKey: hasNextLesson ? level.lessons[nextLessonIndex].key : null,
    levelCompleted,
    unlockNextLevel,
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
