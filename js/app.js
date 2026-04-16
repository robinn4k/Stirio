import { initFirebase, signInWithGoogle, signInAsGuest, signOutUser, restoreSession, getCurrentUser, updateGuestName, updateUserProfile, uploadProfilePhoto, deleteUserData, deleteUserAccount } from './auth.js';
import { startRound, startCustomRound, answerQuestion, abortRound, getRounds } from './quiz.js';
import { saveScore, fetchLeaderboard, getUserStats } from './leaderboard.js';
import { getLearnStats, getLevelInfo, getLearnRounds, startLesson, answerLesson, advanceLesson, advanceFromTheory, abortLesson, MASTERY_LEVELS, getMasteryLevel } from './learn.js';
import { getDailyStatus, getDailyQuestions, saveDailyResult } from './daily.js';
import { startSpeed, startSpeedTimer, answerSpeed, abortSpeed } from './speed.js';
import { getAchievements, checkAchievements, updateStats, getStats } from './achievements.js';
import { fichas } from './fichas.js';
import { startConstructor, answerConstructor, abortConstructor } from './constructor.js';
import { startBlind, answerBlind, revealNextClue, abortBlind } from './blind.js';
import { getLang, setLang, t, translateHTML, preloadAllTranslations } from './lang.js';
import { loadAchievementsFromCloud } from './achievements.js';
import { loadLearnFromCloud } from './learn.js';
import { startAcademy, startAcademyLesson, advanceAcademyCard, answerAcademy, advanceAcademy, abortAcademy, getAcademyStats, getAcademyLevels, isLevelUnlocked, isLessonUnlocked, isSequenceItemUnlocked, markPracticeCompleted, loadAcademyFromCloud } from './academy.js';
import { ACADEMY_LEVELS } from './academy_data.js';
import { showShareModal, closeShareModal } from './share.js';
import {
  initRivals, isRivalsReady, ensureAnonymousAuth, waitForFirebaseAuthUid,
  setPresence, removePresence, listenOnlineCount,
  prepareDuelQuestions, prepareDuelSetup, loadDuelQuestionsFromSetup, calcScore, QUESTIONS_PER_DUEL,
  createFriendRoom, joinByCode,
  joinQueue, leaveQueue, listenForMatch, clearMatchNotif,
  listenRoom, startRoom, registerPlayerDisconnect,
  submitAnswer as rtdbSubmitAnswer, finishGame, leaveRoom
} from './rivals.js';
import { getLocalizedRounds } from './questions.js';
import { getBotName, scheduleBotAnswer, DIFFICULTIES } from './bot.js';
import { initWiki, bindWikiEvents, openArticle } from './wiki.js';
// Mini-games were migrated from Phaser to the R3F PoC under games-r3f-demo/.
// The SPA now navigates to that build directly; see goToGames() below.
import { showConfirm } from './utils.js';

// ─── DOM helpers ─────────────────────────────────────────────
const $ = id => document.getElementById(id);

// Per-view cleanup registry: when a view becomes inactive, its registered
// callback is invoked. This prevents timer/listener leaks when the user
// navigates away from a game or duel via any path (UI button, system back,
// language toggle, etc.).
const viewCleanups = new Map();
function registerViewCleanup(viewId, fn) { viewCleanups.set(viewId, fn); }
function runViewCleanup(viewId) {
  const fn = viewCleanups.get(viewId);
  if (!fn) return;
  try { fn(); } catch (e) { console.warn(`cleanup error for ${viewId}:`, e); }
}
const showView = id => {
  setLoading(false); // always clear any pending loading spinner on navigation
  const current = document.querySelector('.view.active');
  if (current && current.id !== id) runViewCleanup(current.id);
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(id).classList.add('active');
};
const setLoading = show => $('loading').classList.toggle('hidden', !show);
const toast = (msg, type = 'info') => {
  const el = $('toast');
  if (el.classList.contains('toast-update')) return;
  el.textContent = msg;
  el.className = `toast toast-${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
};

// ─── THEMES ──────────────────────────────────────────────────
const THEMES = {
  classic: {
    key: 'theme.classic',
    bg: '#0d0508', surface: '#1a0d12', surface2: '#261520',
    bgWarm: '#3a1a05', bgAccent: '#1a0a20', bgDeep: '#1a1025',
    bgCanvas1: '#0a0a1a', bgCanvas2: '#1a0a2a',
    bgCanvasD1: '#050510', bgCanvasD2: '#100520',
    text: '#f0e6d3', textMuted: '#b0956e', textDim: '#8c7b58',
    btnText: '#0d0508',
    overlay: 'rgba(13,5,8,.85)', overlayHeavy: 'rgba(13,5,8,.95)', overlayMid: 'rgba(13,5,8,.9)',
  },
  midnight: {
    key: 'theme.midnight',
    bg: '#080e12', surface: '#0f1a22', surface2: '#182a35',
    bgWarm: '#0a1a2a', bgAccent: '#0a1525', bgDeep: '#0f1a28',
    bgCanvas1: '#080e14', bgCanvas2: '#0f1a28',
    bgCanvasD1: '#050a10', bgCanvasD2: '#0f1520',
    text: '#e8edf2', textMuted: '#93adc0', textDim: '#7a94a6',
    btnText: '#080e12',
    overlay: 'rgba(8,14,18,.85)', overlayHeavy: 'rgba(8,14,18,.95)', overlayMid: 'rgba(8,14,18,.9)',
  },
  forest: {
    key: 'theme.forest',
    bg: '#080f0a', surface: '#0f1a12', surface2: '#1a2e1f',
    bgWarm: '#0a1f0d', bgAccent: '#0a1a10', bgDeep: '#0f1a14',
    bgCanvas1: '#080f0a', bgCanvas2: '#0f1a12',
    bgCanvasD1: '#050a06', bgCanvasD2: '#0f1a0f',
    text: '#e8f0e6', textMuted: '#95b998', textDim: '#7a9c7f',
    btnText: '#080f0a',
    overlay: 'rgba(8,15,10,.85)', overlayHeavy: 'rgba(8,15,10,.95)', overlayMid: 'rgba(8,15,10,.9)',
  },
  navy: {
    key: 'theme.navy',
    bg: '#07090f', surface: '#0e1320', surface2: '#1a2040',
    bgWarm: '#0a1030', bgAccent: '#0f0a25', bgDeep: '#0e1530',
    bgCanvas1: '#07090f', bgCanvas2: '#0e1320',
    bgCanvasD1: '#050710', bgCanvasD2: '#0e1320',
    text: '#e6eaf2', textMuted: '#969fc0', textDim: '#7a84a6',
    btnText: '#07090f',
    overlay: 'rgba(7,9,15,.85)', overlayHeavy: 'rgba(7,9,15,.95)', overlayMid: 'rgba(7,9,15,.9)',
  },
};

function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.classic;
  const s = document.documentElement.style;
  s.setProperty('--bg', theme.bg);
  s.setProperty('--surface', theme.surface);
  s.setProperty('--surface2', theme.surface2);
  s.setProperty('--bg-warm', theme.bgWarm);
  s.setProperty('--bg-accent', theme.bgAccent);
  s.setProperty('--bg-deep', theme.bgDeep);
  s.setProperty('--bg-canvas1', theme.bgCanvas1);
  s.setProperty('--bg-canvas2', theme.bgCanvas2);
  s.setProperty('--bg-canvas-d1', theme.bgCanvasD1);
  s.setProperty('--bg-canvas-d2', theme.bgCanvasD2);
  s.setProperty('--text', theme.text);
  s.setProperty('--text-muted', theme.textMuted);
  s.setProperty('--text-dim', theme.textDim);
  s.setProperty('--btn-text', theme.btnText);
  s.setProperty('--overlay', theme.overlay);
  s.setProperty('--overlay-heavy', theme.overlayHeavy);
  s.setProperty('--overlay-mid', theme.overlayMid);
  localStorage.setItem('cq_theme', themeId);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.bg);
}

function renderThemeGrid() {
  const grid = $('settings-theme-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const current = localStorage.getItem('cq_theme') || 'classic';
  Object.entries(THEMES).forEach(([id, theme]) => {
    const swatch = document.createElement('div');
    swatch.className = `settings-theme-swatch${id === current ? ' active' : ''}`;
    swatch.style.background = `linear-gradient(135deg, ${theme.surface}, ${theme.surface2})`;
    swatch.innerHTML = `<span class="swatch-label">${t(theme.key)}</span>`;
    swatch.addEventListener('click', () => {
      applyTheme(id);
      grid.querySelectorAll('.settings-theme-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      toast(t('settings.theme_updated') || 'Tema actualizado', 'success');
    });
    grid.appendChild(swatch);
  });
}

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  setLoading(true);
  applyTheme(localStorage.getItem('cq_theme') || 'classic');
  document.documentElement.lang = getLang();
  await preloadAllTranslations();
  translateHTML();
  updateLangToggle();
  await initFirebase();
  await initRivals();
  // getCurrentUser() is set by initFirebase() if returning from a Google redirect.
  // Fall back to restoreSession() for previously saved sessions (guest or Google).
  const user = getCurrentUser() || restoreSession();
  if (user) {
    await Promise.all([loadAchievementsFromCloud(), loadLearnFromCloud(), loadAcademyFromCloud()]);
    await goToDashboard();
  } else {
    showView('view-login');
  }
  initWiki({ showView, t, toast });
  setLoading(false);
  bindEvents();
  bindViewCleanups();

  window.addEventListener('offline', () => toast(t('offline.message'), 'error'));
  window.addEventListener('online',  () => toast(t('online.message'),  'success'));
}

function updateLangToggle() {
  const btn = $('btn-lang-toggle');
  if (btn) btn.textContent = getLang().toUpperCase();
}

function toggleLanguage() {
  const langs = ['es', 'en', 'fr', 'pt', 'de'];
  const current = getLang();
  const idx = langs.indexOf(current);
  const newLang = langs[(idx + 1) % langs.length];
  setLang(newLang);
  translateHTML();
  updateLangToggle();
  // Re-render current view if on dashboard
  const dashboard = $('view-dashboard');
  if (dashboard && dashboard.classList.contains('active')) {
    goToDashboard().then(() => switchTab(currentTab));
  }
}

// ─── LOGIN VIEW ───────────────────────────────────────────────
function bindLoginEvents() {
  $('btn-google-login').addEventListener('click', async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      await Promise.all([loadAchievementsFromCloud(), loadLearnFromCloud()]);
      await goToDashboard();
    } catch (e) {
      const msg = e?.code === 'auth/unauthorized-domain'
        ? t('error.unauthorized_domain')
        : (e?.code === 'auth/popup-closed-by-user' ? null : t('error.google_signin'));
      if (msg) toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  });

  $('btn-guest-login').addEventListener('click', () => {
    signInAsGuest();
    goToDashboard();
  });
}

// ─── DASHBOARD ────────────────────────────────────────────────
// ─── TAB SWITCHING ───────────────────────────────────────────
let currentTab = 'tab-learn';
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  $(tabId)?.classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
}

// ─── COURSE DEFINITIONS ──────────────────────────────────────
const COURSES = [
  { id: 'cocktails', icon: '🍸', key: 'course.cocktails', rounds: [1, 6, 11, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
  { id: 'spirits',   icon: '🥃', key: 'course.spirits',   rounds: [2, 7, 12] },
  { id: 'techniques',icon: '⚗️', key: 'course.techniques', rounds: [3, 8, 13] },
  { id: 'tools',     icon: '🛠️', key: 'course.tools',      rounds: [4, 9, 14] },
  { id: 'wines',     icon: '🍷', key: 'course.wines',      rounds: [5, 10, 15] },
  { id: 'history',   icon: '📜', key: 'course.history',    rounds: [5, 10, 15] },
];


let lessonEntryPoint = 'learn'; // 'academy' | 'learn'

async function goToDashboard() {
  const user = getCurrentUser();
  if (!user) { showView('view-login'); return; }

  // Header user info
  $('user-name').textContent = user.name;
  const avatarEl = $('user-avatar');
  if (user.photo) {
    const img = document.createElement('img');
    img.src = user.photo;
    img.alt = 'avatar';
    avatarEl.textContent = '';
    avatarEl.appendChild(img);
  } else {
    avatarEl.textContent = user.isGuest ? '👤' : '🍸';
  }

  // Load stats
  const stats = await getUserStats();
  const games = stats?.games || 0;
  const best = stats?.best || 0;
  const avg = games > 0 ? Math.round((stats?.total || 0) / games) : 0;

  // Compute level early so header can use it
  const { xp, streak } = getLearnStats();
  const lvl = getLevelInfo(xp);

  $('stat-games').textContent = games;
  $('stat-best').textContent = best;
  $('stat-avg').textContent = avg;
  $('user-level').textContent = t('learn.level', { n: lvl.level });

  // ── Tab 1: Aprender ──
  $('journey-level-badge').textContent = t('learn.level', { n: lvl.level });
  $('journey-xp-fill').style.width = `${lvl.pct}%`;
  $('journey-xp-text').textContent = lvl.maxLevel ? t('learn.max_level') : `${lvl.cur} / ${lvl.need} XP`;
  $('journey-streak').textContent = `🔥 ${streak}`;

  renderAcademyBanner();
  // Courses grid removed from dashboard — now lives inside Academy Hub

  // ── Tab 2: Jugar ──
  const dailyStatus = getDailyStatus();
  const dailyBadge = $('daily-play-badge');
  if (dailyStatus.played) {
    dailyBadge.textContent = '✓ ' + t('dashboard.completed');
    dailyBadge.classList.add('done');
  } else {
    dailyBadge.textContent = t('dashboard.play');
    dailyBadge.classList.remove('done');
  }

  // Render round cards for Quiz Libre
  renderRoundCards(stats);

  // ── Tab 3: Progreso ──
  $('stat-streak').textContent = streak;
  renderProgressTab(stats);

  translateHTML();
  updateLangToggle();
  showView('view-dashboard');
  switchTab(currentTab);
}

function renderCoursesGrid() {
  const grid = $('courses-grid');
  grid.innerHTML = '';
  const learnRounds = getLearnRounds();

  COURSES.forEach(course => {
    // Calculate mastery from associated learn rounds
    const courseLearnRounds = learnRounds.filter(r => course.rounds.includes(r.id));
    const totalMastery = courseLearnRounds.length > 0
      ? courseLearnRounds.reduce((sum, r) => sum + (r.progress?.masteryScore || 0), 0) / courseLearnRounds.length
      : 0;
    const masteryPct = Math.round(totalMastery * 100);
    const lessonsCount = courseLearnRounds.length;

    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div class="course-icon">${course.icon}</div>
      <div class="course-name">${t(course.key)}</div>
      <div class="course-meta">${lessonsCount} ${t('dashboard.lessons')}</div>
      <div class="course-bar"><div class="course-bar-fill" style="width:${masteryPct}%"></div></div>
      <div class="course-mastery">${masteryPct}%</div>
    `;
    card.addEventListener('click', () => goToLearnHub(course));
    grid.appendChild(card);
  });
}

function renderProgressTab(stats) {
  // Achievement preview
  const achList = getAchievements();
  const achUnlocked = achList.filter(a => a.unlocked).length;
  $('progress-ach-count').textContent = `${achUnlocked}/${achList.length}`;

  const achGrid = $('ach-preview-grid');
  achGrid.innerHTML = '';
  achList.forEach(a => {
    const item = document.createElement('div');
    item.className = `ach-preview-item ${a.unlocked ? 'unlocked' : 'locked'}`;
    item.textContent = a.icon;
    item.title = a.title;
    achGrid.appendChild(item);
  });

  // Leaderboard preview (top 5)
  fetchLeaderboard().then(entries => {
    const list = $('lb-preview-list');
    list.innerHTML = '';
    const user = getCurrentUser();
    entries.slice(0, 5).forEach((entry, i) => {
      const isMe = user && entry.uid === user.uid;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      const item = document.createElement('div');
      item.className = 'leaderboard-entry' + (isMe ? ' leaderboard-me' : '');
      item.innerHTML = `
        <div class="lb-rank">${medal}</div>
        <div class="lb-info"><div class="lb-name">${entry.name}</div></div>
        <div class="lb-level-badge">${t('learn.level', { n: entry.level || 1 })}</div>
      `;
      list.appendChild(item);
    });
    if (entries.length === 0) {
      list.innerHTML = `<div class="leaderboard-empty">${t('leaderboard.empty')}</div>`;
    }
  });

  // Mastery per topic
  const masteryContainer = $('mastery-topics');
  masteryContainer.innerHTML = '';
  const learnRounds = getLearnRounds();

  COURSES.forEach(course => {
    const courseRounds = learnRounds.filter(r => course.rounds.includes(r.id));
    const totalMastery = courseRounds.length > 0
      ? courseRounds.reduce((sum, r) => sum + (r.progress?.masteryScore || 0), 0) / courseRounds.length
      : 0;
    const pct = Math.round(totalMastery * 100);

    const row = document.createElement('div');
    row.className = 'mastery-topic';
    row.innerHTML = `
      <span style="font-size:1.2rem">${course.icon}</span>
      <span class="mastery-topic-name">${t(course.key)}</span>
      <div class="mastery-topic-bar"><div class="mastery-topic-bar-fill" style="width:${pct}%"></div></div>
      <span class="mastery-topic-pct">${pct}%</span>
    `;
    masteryContainer.appendChild(row);
  });
}

function renderRoundCards(stats) {
  const grid = $('rounds-grid');
  grid.innerHTML = '';
  const rounds = getRounds();
  rounds.forEach(r => {
    const best = stats?.rounds?.[r.id] || 0;
    const stars = scoreToStars(best);
    const card = document.createElement('div');
    card.className = 'round-card';
    card.dataset.roundId = r.id;
    card.style.setProperty('--round-color', r.color);
    card.innerHTML = `
      <div class="round-icon">${r.icon}</div>
      <div class="round-info">
        <div class="round-title">${t(r.title)}</div>
        <div class="round-subtitle">${t(r.subtitle)}</div>
        <div class="round-stars">${stars}</div>
        ${best > 0 ? `<div class="round-best">${t('dashboard.best', { n: best })}</div>` : `<div class="round-best">${t('dashboard.no_play')}</div>`}
      </div>
      <div class="round-arrow">→</div>
    `;
    card.addEventListener('click', () => startQuiz(r.id));
    grid.appendChild(card);
  });
}

function scoreToStars(score) {
  if (score === 0) return '☆☆☆';
  if (score < 500) return '★☆☆';
  if (score < 800) return '★★☆';
  return '★★★';
}

// ─── QUIZ ─────────────────────────────────────────────────────
let currentRoundId = null;

function startQuiz(roundId) {
  currentRoundId = roundId;
  showView('view-quiz');

  startRound(roundId, {
    onQuestion: renderQuestion,
    onTick: updateTimer,
    onAnswer: handleAnswer,
    onComplete: handleRoundComplete
  });
}

function renderQuestion({ index, total, question, answers, score }) {
  const round = getRounds().find(r => r.id === currentRoundId);
  $('quiz-round-title').textContent = round ? t(round.title) : '';
  $('quiz-q-current').textContent = index + 1;
  $('quiz-score').textContent = score;
  $('question-text').textContent = t(question);
  $('quiz-progress-fill').style.width = `${((index + 1) / total) * 100}%`;

  const grid = $('answers-grid');
  grid.innerHTML = '';
  answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.dataset.index = i;
    btn.innerHTML = `<span class="answer-letter">${'ABCD'[i]}</span><span class="answer-text">${t(ans)}</span>`;
    btn.addEventListener('click', () => {
      answerQuestion(i, {
        onQuestion: renderQuestion,
        onTick: updateTimer,
        onAnswer: handleAnswer,
        onComplete: handleRoundComplete
      });
    });
    grid.appendChild(btn);
  });

  resetTimerUI(20);
}

function updateTimer(timeLeft) {
  $('quiz-timer').textContent = timeLeft;
  const pct = (timeLeft / 20) * 100;
  const fill = $('timer-circle-fill');
  const dasharray = 100;
  const dashoffset = dasharray - (pct / 100) * dasharray;
  fill.style.strokeDashoffset = dashoffset;
  fill.style.stroke = timeLeft <= 5 ? '#e74c3c' : timeLeft <= 10 ? '#f39c12' : '#27ae60';
}

function resetTimerUI(time) {
  $('quiz-timer').textContent = time;
  const fill = $('timer-circle-fill');
  fill.style.strokeDashoffset = 0;
  fill.style.stroke = '#27ae60';
}

function handleAnswer({ correct, correctIndex, selectedIndex, timeLeft, score, bonus, explanation }) {
  const btns = document.querySelectorAll('.answer-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIndex) btn.classList.add('correct');
    else if (i === selectedIndex && !correct) btn.classList.add('wrong');
  });

  if (score !== undefined) $('quiz-score').textContent = score;

  // Show explanation tooltip briefly
  const questionEl = $('question-text');
  if (explanation) {
    const tip = document.createElement('div');
    tip.className = 'explanation-tip ' + (correct ? 'tip-correct' : 'tip-wrong');
    tip.textContent = t(explanation);
    questionEl.parentNode.insertBefore(tip, questionEl.nextSibling);
    setTimeout(() => tip.remove(), 1800);
  }
}

// ─── RESULTS ─────────────────────────────────────────────────
let _lastScore = 0, _lastCorrects = 0;
let _lastShareData = null;

async function handleRoundComplete({ round, score, timeBonus, corrects, wrongs, answers, questions }) {
  _lastScore = score;
  _lastCorrects = corrects;
  _lastShareData = {
    score,
    corrects,
    total: 10,
    accuracy: Math.round((corrects / 10) * 100),
    timeBonus,
    category: round.title,          // raw multilingual object — translated at render time
    shareText: t('results.share_text', { score, corrects }),
  };
  // Save score
  setLoading(true);
  try {
    await saveScore({ roundId: round.id, roundTitle: t(round.title), score, corrects, wrongs });
  } catch (e) {
    console.warn('Error guardando puntuación:', e);
  }
  setLoading(false);

  // Check achievements for quiz completion
  if (!isDailyMode) {
    const stats = getStats();
    const roundsPlayed = (stats.roundsPlayed || 0) + 1;
    const newly = checkAchievements({
      totalGames: (stats.totalGames || 0) + 1,
      perfectQuiz: corrects === 10 ? true : stats.perfectQuiz,
      roundsPlayed,
    });
    showNewAchievements(newly);
  }
  isDailyMode = false;

  // Render results
  const pct = Math.round((corrects / 10) * 100);
  let emoji = '😢', title = t('results.keep_practicing');
  if (pct >= 90) { emoji = '🏆'; title = t('results.master_bartender'); }
  else if (pct >= 70) { emoji = '🎉'; title = t('results.very_good'); }
  else if (pct >= 50) { emoji = '👍'; title = t('results.good_try'); }

  $('results-emoji').textContent = emoji;
  $('results-title').textContent = title;
  $('results-score-value').textContent = score;
  $('results-correct').textContent = corrects;
  $('results-wrong').textContent = wrongs;
  $('results-time-bonus').textContent = timeBonus;

  // Breakdown
  const bd = $('results-breakdown');
  bd.innerHTML = `<h3 class="breakdown-title">${t('results.breakdown_title')}</h3>`;
  answers.forEach((ans, i) => {
    const item = document.createElement('div');
    item.className = 'breakdown-item ' + (ans.correct ? 'breakdown-correct' : 'breakdown-wrong');
    item.innerHTML = `
      <span class="breakdown-num">${i + 1}</span>
      <span class="breakdown-icon">${ans.correct ? '✅' : '❌'}</span>
      <span class="breakdown-q">${t(questions[i].question)}</span>
      ${ans.correct ? `<span class="breakdown-bonus">+${ans.timeLeft * 5} bonus</span>` : ''}
    `;
    bd.appendChild(item);
  });

  translateHTML();
  showView('view-results');
}

// ─── SHARE ───────────────────────────────────────────────────
async function shareResults() {
  if (_lastShareData) {
    await showShareModal(_lastShareData);
  }
}

// ─── ACHIEVEMENTS helper ──────────────────────────────────────
function showNewAchievements(list) {
  if (!list.length) return;
  list.forEach((a, i) => {
    setTimeout(() => toast(t('achievements.unlocked', { icon: a.icon, title: a.title }), 'success'), i * 1500);
  });
}

// ─── DAILY CHALLENGE ─────────────────────────────────────────
let isDailyMode = false;

function startDailyChallenge() {
  const status = getDailyStatus();
  if (status.played) {
    toast(t('daily.already_played', { corrects: status.corrects, score: status.score }), 'info');
    return;
  }

  isDailyMode = true;
  currentRoundId = 'daily';
  showView('view-quiz');

  const questions = getDailyQuestions();
  const roundData = { id: 'daily', title: t('daily.title'), questions };
  startCustomRound(roundData, {
    onQuestion: (q) => { renderQuestion({ ...q, _daily: true }); },
    onTick: updateTimer,
    onAnswer: handleAnswer,
    onComplete: async (result) => {
      saveDailyResult(result.score, result.corrects);
      const newly = checkAchievements({
        dailyPlayed: (getStats().dailyPlayed || 0) + 1,
        dailyPerfect: result.corrects === 10 ? true : getStats().dailyPerfect,
        totalGames: (getStats().totalGames || 0) + 1,
      });
      showNewAchievements(newly);
      await handleRoundComplete(result);
    }
  });
}

// ─── MINI GAMES ──────────────────────────────────────────────
// Mini-games live as a self-contained Vite build under /games-r3f-demo/.
// Previous attempts with <iframe> had unreliable touch behaviour on iOS
// and intermittent pointer-events capture issues on desktop, so we now
// simply navigate to the games page. The games app has a "← Stirio"
// button in its menu to navigate back.

function goToGames() {
  window.location.href = 'games-r3f-demo/';
}

// ─── SPEED MODE ───────────────────────────────────────────────
let speedAnswered = false;

function goToSpeedMode() {
  speedAnswered = false;
  const q = startSpeed();
  showView('view-speed');
  translateHTML();
  renderSpeedQuestion(q);
  startSpeedTimer(
    (sec) => {
      $('speed-timer').textContent = sec;
      $('speed-timer').classList.toggle('urgent', sec <= 10);
    },
    (result) => {
      const newly = checkAchievements({
        speedMax: Math.max(getStats().speedMax || 0, result.answered),
      });
      showNewAchievements(newly);
      showExtraResult({
        emoji: result.answered >= 20 ? '⚡' : '🏁',
        title: result.answered >= 20 ? t('speed.speedster') : t('speed.time_up'),
        correct: result.correct,
        correctLbl: t('speed.correct_label'),
        score: result.score,
        scoreLbl: t('speed.points_label'),
        extra: result.answered,
        extraLbl: t('speed.answered_label'),
        mode: 'speed',
      });
    }
  );
}

function renderSpeedQuestion({ question, answers, index, total, correct, score }) {
  $('speed-counter').textContent = `${correct}/${index}`;
  $('speed-score').textContent = `${score} pts`;
  $('speed-question').textContent = t(question);
  const grid = $('speed-answers');
  grid.innerHTML = '';
  answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-letter">${'ABCD'[i]}</span><span class="answer-text">${t(ans)}</span>`;
    btn.addEventListener('click', () => {
      if (speedAnswered) return;
      speedAnswered = true;
      const res = answerSpeed(i);
      if (!res) return;
      // Flash feedback
      document.querySelectorAll('#speed-answers .answer-btn').forEach((b, j) => {
        b.disabled = true;
        if (j === res.correctIndex) b.classList.add('correct');
        else if (j === i && !res.correct) b.classList.add('wrong');
      });
      setTimeout(() => {
        speedAnswered = false;
        renderSpeedQuestion(res.next);
      }, 400);
    });
    grid.appendChild(btn);
  });
  speedAnswered = false;
}

// ─── CONSTRUCTOR MODE ─────────────────────────────────────────
let conAnswered = false;

function goToConstructorMode() {
  const q = startConstructor();
  conAnswered = false;
  showView('view-constructor');
  translateHTML();
  renderConstructorQuestion(q);
}

function renderConstructorQuestion({ ingredients, glass, method, answers, correctIndex, index, total }) {
  $('con-q-num').textContent = index + 1;
  const totalEl = document.querySelector('#view-constructor .quiz-q-total');
  if (totalEl) totalEl.textContent = `/${total}`;
  $('con-progress').style.width = `${((index + 1) / total) * 100}%`;
  $('con-meta').innerHTML = `<span>🥃 ${t(glass)}</span><span>🔀 ${t(method)}</span>`;
  const ul = $('con-ingredients');
  ul.innerHTML = '';
  ingredients.forEach(ing => { const li = document.createElement('li'); li.textContent = t(ing); ul.appendChild(li); });

  const grid = $('con-answers');
  grid.innerHTML = '';
  const fb = $('con-feedback');
  fb.className = 'lesson-feedback';
  conAnswered = false;

  answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-letter">${'ABCD'[i]}</span><span class="answer-text">${t(ans)}</span>`;
    btn.addEventListener('click', () => {
      if (conAnswered) return;
      conAnswered = true;
      const res = answerConstructor(i);
      document.querySelectorAll('#con-answers .answer-btn').forEach((b, j) => {
        b.disabled = true;
        if (j === res.correctIndex) b.classList.add('correct');
        else if (j === i && !res.correct) b.classList.add('wrong');
      });
      $('con-fb-icon').textContent = res.correct ? '✅' : '❌';
      $('con-fb-label').textContent = res.correct ? t('constructor.correct') : t('constructor.was', { name: t(answers[res.correctIndex]) });
      fb.className = `lesson-feedback show ${res.correct ? 'fb-correct' : 'fb-wrong'}`;
      const continueBtn = $('btn-con-continue');
      continueBtn.dataset.done = res.done ? '1' : '';
      if (res.done) {
        continueBtn.dataset.correct = res.result.correct;
        continueBtn.dataset.total = res.result.total;
      } else {
        continueBtn.dataset.next = JSON.stringify(res.next);
      }
    });
    grid.appendChild(btn);
  });
}

function handleConstructorContinue() {
  const btn = $('btn-con-continue');
  if (btn.dataset.done === '1') {
    const correct = parseInt(btn.dataset.correct);
    const total = parseInt(btn.dataset.total);
    showExtraResult({
      emoji: correct >= total * 0.8 ? '🍹' : '📝',
      title: correct >= total * 0.8 ? t('constructor.master') : t('constructor.completed'),
      correct, correctLbl: t('constructor.correct_label'),
      score: correct * 10, scoreLbl: t('constructor.xp_label'),
      extra: `${correct}/${total}`, extraLbl: t('constructor.result_label'),
      mode: 'constructor',
    });
    btn.dataset.done = '';
  } else {
    const nextData = btn.dataset.next ? JSON.parse(btn.dataset.next) : null;
    if (nextData) renderConstructorQuestion(nextData);
  }
}

// ─── BLIND TASTING ────────────────────────────────────────────
let blindAnswered = false;
let blindCurrentPayload = null;

function goToBlindMode() {
  const q = startBlind();
  blindCurrentPayload = q;
  blindAnswered = false;
  showView('view-blind');
  translateHTML();
  renderBlindQuestion(q);
}

function renderBlindQuestion({ clues, revealedClues, answers, correctIndex, index, total }) {
  blindCurrentPayload = { clues, revealedClues, answers, correctIndex, index, total };
  const totalEl = document.querySelector('#view-blind .quiz-q-total');
  if (totalEl) totalEl.textContent = `/${total}`;
  $('blind-q-num').textContent = index + 1;
  $('blind-progress').style.width = `${((index + 1) / total) * 100}%`;

  const ul = $('blind-clues');
  ul.innerHTML = '';
  clues.slice(0, revealedClues).forEach(c => {
    const li = document.createElement('li'); li.textContent = t(c); ul.appendChild(li);
  });

  $('btn-blind-reveal').disabled = revealedClues >= clues.length;
  const fb = $('blind-feedback');
  fb.className = 'lesson-feedback';
  blindAnswered = false;

  const grid = $('blind-answers');
  grid.innerHTML = '';
  answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-letter">${'ABCD'[i]}</span><span class="answer-text">${t(ans)}</span>`;
    btn.addEventListener('click', () => {
      if (blindAnswered) return;
      blindAnswered = true;
      const res = answerBlind(i);
      document.querySelectorAll('#blind-answers .answer-btn').forEach((b, j) => {
        b.disabled = true;
        if (j === res.correctIndex) b.classList.add('correct');
        else if (j === i && !res.correct) b.classList.add('wrong');
      });
      $('blind-fb-icon').textContent = res.correct ? '✅' : '❌';
      $('blind-fb-label').textContent = res.correct ? t('blind.correct') : t('blind.incorrect');
      $('blind-fb-name').textContent = t(answers[res.correctIndex]);
      fb.className = `lesson-feedback show ${res.correct ? 'fb-correct' : 'fb-wrong'}`;
      $('btn-blind-continue').dataset.done = res.done ? '1' : '';
      if (res.done) {
        $('btn-blind-continue').dataset.correct = res.result.correct;
        $('btn-blind-continue').dataset.total = res.result.total;
      } else {
        $('btn-blind-continue').dataset.next = JSON.stringify(res.next);
      }
    });
    grid.appendChild(btn);
  });
}

function handleBlindContinue() {
  const btn = $('btn-blind-continue');
  if (btn.dataset.done === '1') {
    const correct = parseInt(btn.dataset.correct);
    const total = parseInt(btn.dataset.total);
    showExtraResult({
      emoji: correct >= total * 0.7 ? '👃' : '🍷',
      title: correct >= total * 0.7 ? t('blind.golden_nose') : t('blind.completed'),
      correct, correctLbl: t('blind.identified_label'),
      score: correct * 15, scoreLbl: t('blind.xp_label'),
      extra: `${correct}/${total}`, extraLbl: t('blind.result_label'),
      mode: 'blind',
    });
    btn.dataset.done = '';
  } else {
    const nextData = btn.dataset.next ? JSON.parse(btn.dataset.next) : null;
    if (nextData) renderBlindQuestion(nextData);
  }
}

// ─── FICHAS ───────────────────────────────────────────────────
let fichasOpened = 0;
let fichasActiveFilters = { category: 'all', glass: 'all', method: 'all' };
let fichasSearchQuery = '';

function goToFichas() {
  showView('view-fichas');
  translateHTML();
  buildFichaFilterChips();
  applyFichaFilters();
  const countEl = $('fichas-total-count');
  if (countEl) countEl.textContent = fichas.length;
}

function renderFichasGrid(list) {
  const grid = $('fichas-grid');
  grid.innerHTML = '';
  list.forEach(f => {
    const card = document.createElement('div');
    card.className = 'ficha-card';
    card.style.setProperty('--ficha-color', f.color);
    card.innerHTML = `<div class="ficha-card-icon">${f.icon}</div><div class="ficha-card-name">${t(f.name)}</div><div class="ficha-card-cat">${t(f.category)}</div>`;
    card.addEventListener('click', () => openFichaDetail(f));
    grid.appendChild(card);
  });
}

function buildChipRow(containerId, items, filterKey) {
  const container = $(containerId);
  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn' + (fichasActiveFilters[filterKey] === 'all' ? ' active' : '');
  allBtn.textContent = t('fichas.filter_all');
  allBtn.dataset.value = 'all';
  allBtn.addEventListener('click', () => {
    fichasActiveFilters[filterKey] = 'all';
    updateChipActive(container, 'all');
    applyFichaFilters();
  });
  container.appendChild(allBtn);

  const seen = new Map();
  fichas.forEach(f => {
    const raw = f['_raw' + filterKey.charAt(0).toUpperCase() + filterKey.slice(1)];
    if (raw && !seen.has(raw)) seen.set(raw, f[filterKey]);
  });
  seen.forEach((localized, raw) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (fichasActiveFilters[filterKey] === raw ? ' active' : '');
    btn.textContent = t(localized);
    btn.dataset.value = raw;
    btn.addEventListener('click', () => {
      fichasActiveFilters[filterKey] = raw;
      updateChipActive(container, raw);
      applyFichaFilters();
    });
    container.appendChild(btn);
  });
}

function updateChipActive(container, value) {
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
}

function buildFichaFilterChips() {
  buildChipRow('fichas-cat-chips', null, 'category');
  buildChipRow('fichas-glass-chips', null, 'glass');
  buildChipRow('fichas-method-chips', null, 'method');
}

function applyFichaFilters() {
  let filtered = fichas;
  if (fichasSearchQuery) {
    const q = fichasSearchQuery;
    filtered = filtered.filter(f =>
      t(f.name).toLowerCase().includes(q) ||
      t(f.category).toLowerCase().includes(q) ||
      f.ingredients.some(ing => t(ing).toLowerCase().includes(q))
    );
  }
  if (fichasActiveFilters.category !== 'all')
    filtered = filtered.filter(f => f._rawCategory === fichasActiveFilters.category);
  if (fichasActiveFilters.glass !== 'all')
    filtered = filtered.filter(f => f._rawGlass === fichasActiveFilters.glass);
  if (fichasActiveFilters.method !== 'all')
    filtered = filtered.filter(f => f._rawMethod === fichasActiveFilters.method);

  renderFichasGrid(filtered);
  $('fichas-count').textContent = `${filtered.length} / ${fichas.length}`;
}

function openFichaDetail(f) {
  fichasOpened++;
  const newly = checkAchievements({ fichasOpened: Math.max(getStats().fichasOpened || 0, fichasOpened) });
  showNewAchievements(newly);

  $('ficha-detail-name').textContent = t(f.name);
  $('ficha-detail-hero').style.background = `linear-gradient(135deg, ${f.color}22, transparent)`;
  $('ficha-detail-icon').textContent = f.icon;
  $('ficha-detail-cat').textContent = t(f.category);
  $('fd-glass').textContent = t(f.glass);
  $('fd-method').textContent = t(f.method);
  $('fd-garnish').textContent = t(f.garnish);
  const ul = $('fd-ingredients');
  ul.innerHTML = '';
  f.ingredients.forEach(i => { const li = document.createElement('li'); li.textContent = t(i); ul.appendChild(li); });
  $('fd-story').textContent = t(f.story);
  showView('view-ficha-detail');
  translateHTML();
}

// ─── ACHIEVEMENTS VIEW ────────────────────────────────────────
function goToAchievements() {
  const list = getAchievements();
  const unlocked = list.filter(a => a.unlocked).length;
  $('ach-count').textContent = `${unlocked}/${list.length}`;
  const grid = $('ach-grid');
  grid.innerHTML = '';
  list.forEach(a => {
    const item = document.createElement('div');
    item.className = `ach-item ${a.unlocked ? 'unlocked' : 'locked'}`;
    item.innerHTML = `<div class="ach-icon">${a.icon}</div><div class="ach-info"><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div></div>`;
    grid.appendChild(item);
  });
  showView('view-achievements');
  translateHTML();
}

// ─── EXTRA RESULT ─────────────────────────────────────────────
let extraResultMode = null;

function showExtraResult({ emoji, title, correct, correctLbl, score, scoreLbl, extra, extraLbl, mode }) {
  extraResultMode = mode;
  $('er-emoji').textContent = emoji;
  $('er-title').textContent = title;
  $('er-correct').textContent = correct;
  $('er-correct-lbl').textContent = correctLbl;
  $('er-score').textContent = score;
  $('er-score-lbl').textContent = scoreLbl;
  $('er-extra').textContent = extra;
  $('er-extra-lbl').textContent = extraLbl;
  showView('view-extra-result');
  translateHTML();
}

// ─── LEARN HUB ───────────────────────────────────────────────
let activeCourse = null;

function goToLearnHub(course = null) {
  activeCourse = course;
  const { xp, streak } = getLearnStats();
  const lvl = getLevelInfo(xp);

  $('learn-streak-val').textContent = streak;
  $('learn-xp-val').textContent = xp;
  $('learn-level-badge').textContent = t('learn.level', { n: lvl.level });
  $('learn-xp-fill').style.width = `${lvl.pct}%`;
  $('learn-xp-text').textContent = lvl.maxLevel ? t('learn.max_level') : `${lvl.cur} / ${lvl.need} XP`;

  // Course filter chip
  const filterEl = $('learn-course-filter');
  if (filterEl) {
    if (course) {
      $('learn-course-filter-name').textContent = `${course.icon} ${t(course.key)}`;
      filterEl.classList.remove('hidden');
    } else {
      filterEl.classList.add('hidden');
    }
  }

  let rounds = getLearnRounds();
  if (course) {
    rounds = rounds.filter(r => course.rounds.includes(r.id));
  }

  const container = $('learn-lessons');
  container.innerHTML = '';
  rounds.forEach(r => {
    const { sessionCount, masteryLevel, masteryKey, masteryIcon, masteryScore } = r.progress;
    const masteryInfo = MASTERY_LEVELS[masteryLevel] || MASTERY_LEVELS[0];
    const pips = [0, 1, 2].map(i =>
      `<span class="mastery-pip${i < masteryLevel ? ' filled' : ''}"></span>`
    ).join('');
    const masteryPct = Math.round(masteryScore * 100);

    const card = document.createElement('div');
    card.className = 'lesson-card';
    card.style.setProperty('--round-color', r.color);
    card.innerHTML = `
      ${masteryLevel >= 2 ? `<div class="lesson-card-badge">${t('learn.mastered')}</div>` : ''}
      <div class="lesson-card-icon">${r.icon}</div>
      <div class="lesson-card-info">
        <div class="lesson-card-title">${t(r.title)}</div>
        <div class="lesson-card-sub">${t(r.subtitle)}</div>
        <div class="lesson-card-progress">
          <div class="lesson-card-bar"><div class="lesson-card-bar-fill" style="width:${masteryPct}%"></div></div>
          <div class="lesson-card-count">${sessionCount > 0 ? t('learn.times_completed', { n: sessionCount }) : t('learn.not_completed')}</div>
        </div>
        <div class="lesson-card-mastery">
          <span class="mastery-pips">${pips}</span>
          <span class="mastery-label-text">${masteryInfo.icon} ${t('learn.mastery_' + masteryKey) || masteryKey}</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => { lessonEntryPoint = 'learn'; beginLesson(r.id); });
    container.appendChild(card);
  });

  showView('view-learn-hub');
  translateHTML();
}

// ─── LESSON ───────────────────────────────────────────────────
let currentLessonRoundId = null;

function beginLesson(roundId) {
  currentLessonRoundId = roundId;
  const payload = startLesson(roundId);
  if (!payload) return;
  showView('view-lesson');
  translateHTML();
  renderTheoryCard(payload);
}

function renderTheoryCard({ theory, roundIcon, sessionProgress }) {
  const { done, total } = sessionProgress;
  const pct = total > 0 ? (done / total) * 100 : 0;
  $('lesson-progress-fill').style.width = `${pct}%`;
  $('lesson-phase-label').textContent = '📖 ' + t('lesson.phase_theory');
  $('lesson-theory-icon').textContent = roundIcon || '🍸';
  $('lesson-theory-text').textContent = theory || '';

  // Show theory wrap, hide question body + feedback
  $('lesson-theory-wrap').classList.remove('hidden');
  $('lesson-body').classList.add('hidden');
  const fb = $('lesson-feedback');
  fb.className = 'lesson-feedback';
}

function renderLessonQuestion({ question, answers, sessionProgress }) {
  const { done, total } = sessionProgress;
  const pct = total > 0 ? ((done + 1) / total) * 100 : 0;
  $('lesson-progress-fill').style.width = `${pct}%`;
  $('lesson-phase-label').textContent = '❓ ' + t('lesson.phase_question');
  $('lesson-q-counter').textContent = `${done + 1} / ${total}`;
  $('lesson-question').textContent = t(question);

  // Hide theory wrap, show question body with animation
  $('lesson-theory-wrap').classList.add('hidden');
  const body = $('lesson-body');
  body.classList.remove('hidden', 'slide-in');
  // Trigger reflow for animation
  void body.offsetWidth;
  body.classList.add('slide-in');

  // Answers
  const grid = $('lesson-answers');
  grid.innerHTML = '';
  answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.dataset.index = i;
    btn.innerHTML = `<span class="answer-letter">${'ABCD'[i]}</span><span class="answer-text">${t(ans)}</span>`;
    btn.addEventListener('click', () => handleLessonAnswer(i));
    grid.appendChild(btn);
  });

  // Hide feedback panel
  $('lesson-feedback').className = 'lesson-feedback';
}

function handleLessonAnswer(selectedIndex) {
  const result = answerLesson(selectedIndex);
  if (!result) return;
  const { correct, correctIndex, selectedIndex: si, explanation } = result;

  // Mark answer buttons
  document.querySelectorAll('#lesson-answers .answer-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIndex) btn.classList.add('correct');
    else if (i === si && !correct) btn.classList.add('wrong');
  });

  // Show feedback panel
  $('lesson-feedback-icon').textContent = correct ? '✅' : '❌';
  $('lesson-feedback-label').textContent = correct ? t('lesson.correct') : t('lesson.incorrect');
  $('lesson-feedback-exp').textContent = explanation ? t(explanation) : '';
  $('lesson-feedback').className = `lesson-feedback show ${correct ? 'fb-correct' : 'fb-wrong'}`;
}

/** Called from "theory continue" button → show question */
function handleTheoryContinue() {
  const result = advanceFromTheory();
  if (!result) return;
  renderLessonQuestion(result);
}

/** Called from "feedback continue" button → show next theory or result */
function handleLessonContinue() {
  const result = advanceLesson();
  if (!result) return;
  if (result.done) {
    showLessonResult(result);
  } else {
    renderTheoryCard(result);
  }
}

function showLessonResult({ xp, correct, total, round, masteryGains, masteryLevel, prevMasteryLevel, levelUp }) {
  const masteryInfo = MASTERY_LEVELS[masteryLevel] || MASTERY_LEVELS[0];
  const pct = Math.round((correct / total) * 100);

  // Emoji + title
  let emoji = '🎉', title = t('lesson.completed');
  if (pct === 100) { emoji = '🏆'; title = t('lesson.perfect'); }
  else if (pct < 50) { emoji = '📚'; title = t('lesson.keep_going'); }
  $('lr-emoji').textContent = emoji;
  $('lr-title').textContent = title;

  // Mastery badge
  $('lr-mastery-icon').textContent = masteryInfo.icon;
  $('lr-mastery-label').textContent = t('learn.mastery_' + masteryInfo.key) || masteryInfo.key;
  $('lr-mastery-badge').style.borderColor = masteryInfo.color;

  // Level-up banner
  const levelUpEl = $('lr-levelup');
  if (levelUp) {
    const prevInfo = MASTERY_LEVELS[prevMasteryLevel] || MASTERY_LEVELS[0];
    $('lr-levelup-text').textContent = `${prevInfo.icon} → ${masteryInfo.icon} ${t('lesson.level_up')}`;
    levelUpEl.classList.remove('hidden');
  } else {
    levelUpEl.classList.add('hidden');
  }

  // Stats
  $('lr-correct').textContent = `${correct}/${total}`;
  $('lr-xp').textContent = `+${xp}`;
  $('lr-concepts').textContent = masteryGains.length;

  // Concept gains list
  const gainsEl = $('lr-gains');
  gainsEl.innerHTML = '';
  masteryGains.forEach(({ before, after }) => {
    const tag = document.createElement('span');
    tag.className = 'lr-gain-tag improved';
    const stars = ['○○○', '●○○', '●●○', '●●●'];
    tag.textContent = `${stars[before]} → ${stars[after]}`;
    gainsEl.appendChild(tag);
  });

  // Store round id for retry/next
  $('btn-lr-retry').dataset.roundId = currentLessonRoundId;
  $('btn-lr-continue').dataset.roundId = currentLessonRoundId;

  // Update dashboard streak banner
  const learnStats = getLearnStats();
  const bannerStreak = $('banner-streak');
  if (bannerStreak) bannerStreak.textContent = `🔥 ${learnStats.streak}`;

  // Achievements
  const stats = getStats();
  const lessonsCompleted = (stats.lessonsCompleted || 0) + 1;
  const newly = checkAchievements({
    lessonsCompleted,
    perfectLesson: pct === 100 ? true : stats.perfectLesson,
    xp: learnStats.xp,
    streak: learnStats.streak,
  });
  showNewAchievements(newly);

  // Mark practice round completed in Academy data if launched from Academy
  if (lessonEntryPoint === 'academy' && currentPracticeRoundId != null) {
    markPracticeCompleted(currentAcademyLevelId, currentPracticeRoundId);
  }

  showView('view-lesson-result');
  translateHTML();
}

// ─── ACADEMY ─────────────────────────────────────────────────
let currentAcademyLevelId = null;
let currentAcademyLessonIndex = null;
let currentPracticeRoundId = null;
let lastAcademyResult = null;

function renderAcademyBanner() {
  const stats = getAcademyStats();
  const levels = getAcademyLevels();
  const completed = Object.values(stats.levels).filter(l => l.completed).length;
  $('academy-banner-progress').textContent = `${completed}/${ACADEMY_LEVELS.length}`;

  const nextLevel = levels.find(l => l.unlocked && !l.completed) || levels[levels.length - 1];
  const subEl = $('academy-banner-sub');
  if (subEl && nextLevel) {
    if (completed >= ACADEMY_LEVELS.length) {
      subEl.textContent = t('academy.all_completed');
    } else {
      subEl.textContent = `${t('academy.current_level')}: ${t(nextLevel.key)}`;
    }
  }
}

function goToAcademyHub() {
  const levels = getAcademyLevels();
  const learnRounds = getLearnRounds();
  const container = $('academy-levels');
  container.innerHTML = '';

  levels.forEach((level, i) => {
    if (i > 0) {
      const conn = document.createElement('div');
      conn.className = 'academy-level-connector';
      container.appendChild(conn);
    }

    // Level header card (non-clickable grouper)
    const card = document.createElement('div');
    const stateClass = level.completed ? 'completed' : level.unlocked ? '' : 'locked';
    card.className = `academy-level-card ${stateClass}`;
    card.style.setProperty('--level-color', level.color);

    let meta = '';
    if (level.completed) {
      meta = `<div class="academy-level-score">✓ ${t('academy.completed')}</div>`;
    } else if (!level.unlocked) {
      meta = `<div class="academy-lock-icon">🔒</div>`;
    }

    let progressHtml = '';
    if (level.unlocked) {
      progressHtml = `<div class="academy-level-progress">${t('academy.lessons_progress', { a: level.lessonsCompleted, b: level.lessonsTotal })}</div>`;
    }

    card.innerHTML = `
      <div class="academy-level-icon">${level.icon}</div>
      <div class="academy-level-info">
        <div class="academy-level-name">${t(level.key)}</div>
        <div class="academy-level-sub">${t(level.descKey)}</div>
        <div class="academy-level-meta">${meta}</div>
        ${progressHtml}
      </div>
    `;
    container.appendChild(card);

    // Unified sequence sub-cards (lessons + practice interleaved)
    if (level.unlocked && level.sequence) {
      const lessonList = document.createElement('div');
      lessonList.className = 'academy-lesson-list';
      lessonList.style.setProperty('--level-color', level.color);

      level.sequence.forEach((seqItem) => {
        const lCard = document.createElement('div');
        let name, completed, unlocked, scoreHtml = '';

        if (seqItem.type === 'lesson') {
          const lesson = level.lessons[seqItem.index];
          name = t(lesson.key);
          completed = seqItem.completed;
          unlocked = seqItem.unlocked;
        } else {
          const round = learnRounds.find(r => r.id === seqItem.roundId);
          name = round ? t(round.title) : `Round ${seqItem.roundId}`;
          completed = seqItem.completed;
          unlocked = seqItem.unlocked;
        }
        if (completed) {
          scoreHtml = `<span class="academy-lesson-score">✓</span>`;
        }

        const lState = completed ? 'completed' : unlocked ? '' : 'locked';
        lCard.className = `academy-lesson-card ${lState}`;

        let statusIcon = '▶';
        if (completed) statusIcon = '';
        else if (!unlocked) statusIcon = '🔒';

        lCard.innerHTML = `
          <span class="academy-lesson-status">${statusIcon}</span>
          <span class="academy-lesson-name">${name}</span>
          ${scoreHtml}
        `;

        if (unlocked) {
          if (seqItem.type === 'lesson') {
            lCard.addEventListener('click', () => beginAcademyLesson(level.id, seqItem.index));
          } else {
            lCard.addEventListener('click', () => {
              lessonEntryPoint = 'academy';
              currentAcademyLevelId = level.id;
              currentPracticeRoundId = seqItem.roundId;
              beginLesson(seqItem.roundId);
            });
          }
        }
        lessonList.appendChild(lCard);
      });

      container.appendChild(lessonList);
    }
  });

  // Free Practice button
  const fpCard = document.createElement('div');
  fpCard.className = 'journey-cta-card journey-cta-secondary academy-free-practice';
  fpCard.innerHTML = `<span>${t('learn.free_practice')}</span><span class="journey-arrow">→</span>`;
  fpCard.addEventListener('click', () => { lessonEntryPoint = 'learn'; goToLearnHub(); });
  container.appendChild(fpCard);

  showView('view-academy-hub');
  translateHTML();
}

/** Navigate to the next item in the Academy sequence after a practice round */
function _navigateToNextAcademySeqItem() {
  const level = ACADEMY_LEVELS.find(l => l.id === currentAcademyLevelId);
  if (!level || !level.sequence) { goToAcademyHub(); return; }

  const currentIdx = level.sequence.findIndex(
    s => s.type === 'practice' && s.roundId === currentPracticeRoundId
  );
  const nextIdx = currentIdx >= 0 ? currentIdx + 1 : -1;

  if (nextIdx >= 0 && nextIdx < level.sequence.length) {
    const next = level.sequence[nextIdx];
    if (next.type === 'lesson') {
      beginAcademyLesson(currentAcademyLevelId, next.index);
    } else {
      lessonEntryPoint = 'academy';
      currentPracticeRoundId = next.roundId;
      beginLesson(next.roundId);
    }
  } else {
    goToAcademyHub();
  }
}

function beginAcademyLesson(levelId, lessonIndex) {
  currentAcademyLevelId = levelId;
  currentAcademyLessonIndex = lessonIndex;
  const payload = startAcademyLesson(levelId, lessonIndex);
  if (!payload) return;
  showView('view-academy-lesson');
  renderAcademyCard(payload);
}

function renderAcademyCard(payload) {
  $('acad-card-wrap').classList.remove('hidden');
  $('acad-question-body').classList.add('hidden');
  $('acad-feedback').className = 'lesson-feedback';

  const cardEl = $('acad-card');
  cardEl.className = `acad-card acad-card-${payload.type}`;

  if (payload.type === 'example') {
    const ficha = fichas.find(f => f.name === payload.cocktail);
    _renderMiniFicha(cardEl, ficha);
  } else {
    const typeLabels = {
      theory: '📖 ' + t('academy.theory'),
      tip:    '💡 ' + t('academy.tip'),
      note:   '📝 ' + t('academy.bartender_note'),
    };
    $('acad-card-type').textContent = typeLabels[payload.type] || '';
    $('acad-card-icon').textContent = payload.type === 'note' ? '🍸' : payload.type === 'tip' ? '💡' : '📖';
    $('acad-card-body').innerHTML = t(payload.key);
  }

  // Progress bar
  const pct = payload.progress ? (payload.progress.done / payload.progress.total) * 100 : 0;
  $('acad-progress-fill').style.width = `${pct}%`;
  $('acad-phase-label').textContent = '📖 ' + t('academy.phase_cards');
}

function _renderMiniFicha(container, ficha) {
  if (!ficha) {
    container.innerHTML = '<div class="acad-card-body">—</div>';
    return;
  }
  $('acad-card-type').textContent = '🍹 ' + t('academy.example');
  $('acad-card-icon').textContent = ficha.icon || '🍸';
  container.querySelector('#acad-card-body').innerHTML = `
    <div class="mini-ficha">
      <div class="mini-ficha-header">
        <span class="mini-ficha-icon">${ficha.icon || '🍸'}</span>
        <span class="mini-ficha-name">${ficha.name}</span>
      </div>
      <div class="mini-ficha-details">
        <div class="mini-ficha-row"><strong>${t('fichas.glass')}:</strong> ${t(ficha.glass)}</div>
        <div class="mini-ficha-row"><strong>${t('fichas.method')}:</strong> ${t(ficha.method)}</div>
        <div class="mini-ficha-row"><strong>${t('fichas.garnish')}:</strong> ${t(ficha.garnish)}</div>
        <div class="mini-ficha-row"><strong>${t('fichas.ingredients')}:</strong></div>
        <ul class="mini-ficha-ingredients">
          ${ficha.ingredients.map(i => `<li>${t(i)}</li>`).join('')}
        </ul>
      </div>
      ${ficha.story ? `<div class="mini-ficha-story">${t(ficha.story)}</div>` : ''}
    </div>
  `;
}

function renderAcademyQuestion(payload) {
  $('acad-card-wrap').classList.add('hidden');
  $('acad-question-body').classList.remove('hidden');
  $('acad-feedback').className = 'lesson-feedback';
  $('acad-phase-label').textContent = '❓ ' + t('academy.phase_assessment');
  $('acad-q-counter').textContent = `${payload.current + 1} / ${payload.total}`;
  $('acad-question').textContent = t(payload.question);

  const grid = $('acad-answers');
  grid.innerHTML = '';
  payload.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.dataset.index = i;
    btn.innerHTML = `<span class="answer-letter">${'ABCD'[i]}</span><span class="answer-text">${t(ans)}</span>`;
    btn.addEventListener('click', () => handleAcademyAnswer(i));
    grid.appendChild(btn);
  });

  // Progress bar
  const pct = payload.progress ? (payload.progress.done / payload.progress.total) * 100 : 0;
  $('acad-progress-fill').style.width = `${pct}%`;

  // Animate in
  const body = $('acad-question-body');
  body.classList.remove('slide-in');
  void body.offsetWidth;
  body.classList.add('slide-in');
}

function handleAcademyAnswer(selectedIndex) {
  const result = answerAcademy(selectedIndex);
  if (!result) return;

  document.querySelectorAll('#acad-answers .answer-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === result.correctIndex) btn.classList.add('correct');
    else if (i === result.selectedIndex && !result.correct) btn.classList.add('wrong');
  });

  $('acad-feedback-icon').textContent = result.correct ? '✅' : '❌';
  $('acad-feedback-label').textContent = result.correct ? t('lesson.correct') : t('lesson.incorrect');
  $('acad-feedback-exp').textContent = result.explanation ? t(result.explanation) : '';
  $('acad-feedback').className = `lesson-feedback show ${result.correct ? 'fb-correct' : 'fb-wrong'}`;
}

function handleAcademyCardAdvance() {
  const result = advanceAcademyCard();
  if (!result) return;
  if (result.phase === 'card') {
    renderAcademyCard(result);
  } else {
    renderAcademyQuestion(result);
  }
}

function handleAcademyContinue() {
  const result = advanceAcademy();
  if (!result) return;
  if (result.done === true) {
    showAcademyResult(result);
  } else {
    renderAcademyQuestion(result);
  }
}

function showAcademyResult(result) {
  lastAcademyResult = result;
  $('ar-emoji').textContent = result.passed ? '🎉' : '📚';
  $('ar-title').textContent = result.passed ? t('academy.passed') : t('academy.failed');
  $('ar-correct').textContent = `${result.correct ?? 0}/${result.total ?? 0}`;
  $('ar-score').textContent = `${result.pct ?? 0}%`;
  $('ar-xp').textContent = `+${result.xp ?? 0}`;

  const passEl = $('ar-pass-indicator');
  passEl.textContent = result.passed
    ? `✅ ${t('academy.pass_label')}`
    : `❌ ${t('academy.fail_label')}`;
  passEl.className = `ar-pass-indicator ${result.passed ? 'passed' : 'failed'}`;

  // Unlock banner
  const unlockEl = $('ar-unlock-banner');
  if (result.levelCompleted && result.unlockNextLevel) {
    $('ar-unlock-text').textContent = `🔓 ${t('academy.level_unlocked', { n: result.levelId + 2 })}: ${t(result.nextLevelKey)}`;
    unlockEl.classList.remove('hidden');
  } else if (result.unlockNextLesson) {
    $('ar-unlock-text').textContent = `🔓 ${t('academy.lesson_unlocked')}`;
    unlockEl.classList.remove('hidden');
  } else if (result.levelCompleted) {
    $('ar-unlock-text').textContent = `🏆 ${t('academy.level_completed')}`;
    unlockEl.classList.remove('hidden');
  } else {
    unlockEl.classList.add('hidden');
  }

  // Next button: show when there's a next sequence item or next level
  const nextBtn = $('btn-ar-next');
  const hasNext = (result.passed && result.nextSeqItem && !result.levelCompleted) ||
    result.unlockNextLevel ||
    (result.passed && result.levelCompleted && result.levelId < ACADEMY_LEVELS.length - 1);
  if (hasNext) {
    nextBtn.textContent = (result.nextSeqItem && !result.levelCompleted)
      ? t('academy.next_lesson')
      : t('academy.next_level');
    nextBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.add('hidden');
  }

  // Achievement check
  const stats = getStats();
  const learnStats = getLearnStats();
  const newly = checkAchievements({
    academyLevels: result.levelsCompleted,
    academyPerfect: result.academyPerfect || stats.academyPerfect,
    xp: learnStats.xp,
    streak: learnStats.streak,
  });
  showNewAchievements(newly);

  showView('view-academy-result');
  translateHTML();
}

// ─── LEADERBOARD ─────────────────────────────────────────────
let currentFilter = null;

async function goToLeaderboard(fromView) {
  $('btn-back-leaderboard').dataset.from = fromView || 'view-dashboard';
  setLoading(true);
  $('leaderboard-filters').innerHTML = '';
  await renderLeaderboard();
  showView('view-leaderboard');
  translateHTML();
  setLoading(false);
}

async function renderLeaderboard() {
  const entries = await fetchLeaderboard();
  const user = getCurrentUser();
  const list = $('leaderboard-list');
  list.innerHTML = '';

  if (entries.length === 0) {
    list.innerHTML = `<div class="leaderboard-empty">${t('leaderboard.empty')}</div>`;
    return;
  }

  entries.forEach((entry, i) => {
    const isMe = user && entry.uid === user.uid;
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    const level = Number(entry.level) || 1;
    const xp = Number(entry.xpTotal) || 0;
    const streak = Number(entry.streakDays) || 0;
    // entry.name comes from Firebase — must be inserted as text, never as HTML, to prevent XSS.
    const name = typeof entry.name === 'string' ? entry.name : '';
    const item = document.createElement('div');
    item.className = 'leaderboard-entry' + (isMe ? ' leaderboard-me' : '');
    const rank = document.createElement('div');
    rank.className = 'lb-rank';
    rank.textContent = medal;
    const info = document.createElement('div');
    info.className = 'lb-info';
    const nameEl = document.createElement('div');
    nameEl.className = 'lb-name';
    nameEl.textContent = name;
    if (isMe) {
      const you = document.createElement('span');
      you.className = 'lb-you';
      you.textContent = ` ${t('leaderboard.you')}`;
      nameEl.appendChild(you);
    }
    const meta = document.createElement('div');
    meta.className = 'lb-meta';
    meta.textContent = `${xp} XP · 🔥 ${streak} ${t('leaderboard.days')}`;
    info.append(nameEl, meta);
    const badge = document.createElement('div');
    badge.className = 'lb-level-badge';
    badge.textContent = t('learn.level', { n: level });
    item.append(rank, info, badge);
    list.appendChild(item);
  });
}

// ─── VIEW CLEANUP BINDING ─────────────────────────────────────
// Ensures timers and Firebase listeners are released when a game/duel view
// is left by any means (back button, nav, language toggle, unexpected flow).
function bindViewCleanups() {
  registerViewCleanup('view-quiz',        () => abortRound());
  registerViewCleanup('view-speed',       () => abortSpeed());
  registerViewCleanup('view-constructor', () => abortConstructor());
  registerViewCleanup('view-blind',       () => abortBlind());
  // Duel uses a 4-view flow (menu → lobby → game → result). Cleanup only when
  // the user is truly exiting the duel flow, not when transitioning between
  // these sub-views. We let the existing resetDuelState() calls in the duel
  // code handle intra-flow transitions; here we clean up on exit-to-dashboard.
  const duelViewIds = new Set(['view-duel', 'view-duel-lobby', 'view-duel-game', 'view-duel-result']);
  const duelCleanupOnLeave = () => {
    // Defer check to next tick: active class has been toggled by showView.
    queueMicrotask(() => {
      const next = document.querySelector('.view.active');
      if (!next || !duelViewIds.has(next.id)) resetDuelState();
    });
  };
  duelViewIds.forEach(id => registerViewCleanup(id, duelCleanupOnLeave));
}

// ─── EVENT BINDING ────────────────────────────────────────────
function bindEvents() {
  bindLoginEvents();
  bindWikiEvents();

  // Language toggle
  $('btn-lang-toggle').addEventListener('click', toggleLanguage);

  // Tab bar switching
  $('tab-bar').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });

  // Quiz Libre toggle
  $('btn-quiz-libre').addEventListener('click', () => {
    const panel = $('rounds-panel');
    panel.classList.toggle('hidden');
  });

  // Reference shortcuts (glossary/map open specific wiki articles)
  if ($('btn-glossary')) $('btn-glossary').addEventListener('click', () => {
    // Open wiki to glossary category
    const wikiBtn = $('btn-wiki');
    if (wikiBtn) wikiBtn.click();
  });
  if ($('btn-map')) $('btn-map').addEventListener('click', () => {
    openArticle('spirits', 'world-map');
  });

  // Dashboard header
  $('btn-leaderboard-header').addEventListener('click', () => goToLeaderboard('view-dashboard'));
  $('btn-logout').addEventListener('click', () => goToSettings());

  // Quiz controls
  $('btn-quit-quiz').addEventListener('click', async () => {
    if (await showConfirm(t('confirm.quit_game'))) {
      abortRound();
      goToDashboard();
    }
  });

  // Results buttons
  $('btn-play-again').addEventListener('click', () => startQuiz(currentRoundId));
  $('btn-share-results').addEventListener('click', shareResults);
  $('btn-leaderboard-results').addEventListener('click', () => goToLeaderboard('view-results'));
  $('btn-home-results').addEventListener('click', () => goToDashboard());

  // Share modal close
  $('btn-share-close').addEventListener('click', closeShareModal);
  $('btn-share-close-2').addEventListener('click', closeShareModal);
  $('share-modal').addEventListener('click', e => {
    if (e.target === $('share-modal')) closeShareModal();
  });

  // Quick modes dashboard
  $('btn-daily').addEventListener('click', () => startDailyChallenge());
  $('btn-speed').addEventListener('click', () => goToSpeedMode());
  $('btn-constructor').addEventListener('click', () => goToConstructorMode());
  $('btn-blind').addEventListener('click', () => goToBlindMode());
  $('btn-fichas').addEventListener('click', () => goToFichas());
  $('btn-achievements').addEventListener('click', () => goToAchievements());
  $('btn-duel').addEventListener('click', () => goToDuelMenu());
  $('btn-duel-home').addEventListener('click', () => goToDuelMenu());
  $('btn-games').addEventListener('click', () => goToGames());

  // Mini games (Phaser)

  // Speed mode
  $('btn-quit-speed').addEventListener('click', async () => { if (await showConfirm(t('confirm.quit'))) { abortSpeed(); goToDashboard(); } });

  // Constructor mode
  $('btn-quit-constructor').addEventListener('click', async () => { if (await showConfirm(t('confirm.quit'))) { abortConstructor(); goToDashboard(); } });
  $('btn-con-continue').addEventListener('click', handleConstructorContinue);

  // Blind tasting
  $('btn-quit-blind').addEventListener('click', async () => { if (await showConfirm(t('confirm.quit'))) { abortBlind(); goToDashboard(); } });
  $('btn-blind-reveal').addEventListener('click', () => {
    const q = revealNextClue();
    if (!q) return;
    blindCurrentPayload = q;
    const ul = $('blind-clues');
    ul.innerHTML = '';
    q.clues.slice(0, q.revealedClues).forEach(c => { const li = document.createElement('li'); li.textContent = t(c); ul.appendChild(li); });
    $('btn-blind-reveal').disabled = q.revealedClues >= q.clues.length;
  });
  $('btn-blind-continue').addEventListener('click', handleBlindContinue);

  // Fichas
  $('btn-back-fichas').addEventListener('click', () => goToDashboard());
  $('btn-back-ficha-detail').addEventListener('click', () => goToFichas());
  $('fichas-search').addEventListener('input', (e) => {
    fichasSearchQuery = e.target.value.toLowerCase();
    applyFichaFilters();
  });
  $('fichas-toggle-filters').addEventListener('click', () => {
    const extra = $('fichas-extra-filters');
    extra.classList.toggle('hidden');
    $('fichas-toggle-filters').textContent = extra.classList.contains('hidden')
      ? t('fichas.more_filters') : t('fichas.less_filters');
  });

  // Achievements
  $('btn-back-achievements').addEventListener('click', () => goToDashboard());

  // Extra result
  $('btn-er-again').addEventListener('click', () => {
    if (extraResultMode === 'speed') goToSpeedMode();
    else if (extraResultMode === 'constructor') goToConstructorMode();
    else if (extraResultMode === 'blind') goToBlindMode();
    else goToDashboard();
  });
  $('btn-er-home').addEventListener('click', () => goToDashboard());

  // Learning mode
  $('btn-back-learn').addEventListener('click', () => goToDashboard());
  $('btn-back-to-academy').addEventListener('click', () => goToAcademyHub());
  $('btn-clear-course-filter').addEventListener('click', () => goToLearnHub());
  $('btn-quit-lesson').addEventListener('click', async () => {
    if (await showConfirm(t('confirm.quit_lesson'))) {
      abortLesson();
      if (lessonEntryPoint === 'academy') goToAcademyHub();
      else goToLearnHub();
    }
  });
  $('btn-lesson-theory-continue').addEventListener('click', () => handleTheoryContinue());
  $('btn-lesson-continue').addEventListener('click', () => handleLessonContinue());
  $('btn-lr-retry').addEventListener('click', () => beginLesson(currentLessonRoundId));
  $('btn-lr-continue').addEventListener('click', () => {
    if (lessonEntryPoint === 'academy') {
      // From Academy: go to next sequence item or back to hub
      _navigateToNextAcademySeqItem();
    } else {
      const rounds = getLearnRounds();
      const idx = rounds.findIndex(r => r.id === currentLessonRoundId);
      const next = rounds[idx + 1];
      if (next) beginLesson(next.id);
      else goToLearnHub();
    }
  });
  $('btn-lr-home').addEventListener('click', () => {
    if (lessonEntryPoint === 'academy') goToAcademyHub();
    else goToLearnHub();
  });

  // Academy mode
  $('btn-academy').addEventListener('click', () => goToAcademyHub());
  $('btn-back-academy').addEventListener('click', () => goToDashboard());
  $('btn-quit-academy').addEventListener('click', async () => {
    if (await showConfirm(t('confirm.quit_lesson'))) { abortAcademy(); goToAcademyHub(); }
  });
  $('btn-acad-next-card').addEventListener('click', () => handleAcademyCardAdvance());
  $('btn-acad-continue').addEventListener('click', () => handleAcademyContinue());
  $('btn-ar-retry').addEventListener('click', () => beginAcademyLesson(currentAcademyLevelId, currentAcademyLessonIndex));
  $('btn-ar-next').addEventListener('click', () => {
    const r = lastAcademyResult;
    if (!r) { goToAcademyHub(); return; }

    // Use sequence-aware navigation: find next item in sequence
    if (r.nextSeqItem && !r.levelCompleted) {
      if (r.nextSeqItem.type === 'lesson') {
        beginAcademyLesson(r.levelId, r.nextSeqItem.index);
      } else {
        lessonEntryPoint = 'academy';
        currentAcademyLevelId = r.levelId;
        currentPracticeRoundId = r.nextSeqItem.roundId;
        beginLesson(r.nextSeqItem.roundId);
      }
    } else if (r.unlockNextLevel) {
      const nextLevel = ACADEMY_LEVELS.find(l => l.id === r.levelId + 1);
      if (nextLevel && nextLevel.sequence && nextLevel.sequence.length > 0) {
        const first = nextLevel.sequence[0];
        if (first.type === 'lesson') beginAcademyLesson(nextLevel.id, first.index);
        else {
          lessonEntryPoint = 'academy';
          currentAcademyLevelId = nextLevel.id;
          currentPracticeRoundId = first.roundId;
          beginLesson(first.roundId);
        }
      } else {
        goToAcademyHub();
      }
    } else {
      goToAcademyHub();
    }
  });
  $('btn-ar-home').addEventListener('click', () => goToAcademyHub());

  // Leaderboard back
  $('btn-back-leaderboard').addEventListener('click', () => {
    const from = $('btn-back-leaderboard').dataset.from || 'view-dashboard';
    if (from === 'view-results') showView('view-results');
    else goToDashboard();
  });

  bindDuelEvents();
  bindSettingsEvents();
}

// ══════════════════════════════════════════════════════════════
// ─── SETTINGS / USER MANAGEMENT ──────────────────────────────
// ══════════════════════════════════════════════════════════════

function goToSettings() {
  const user = getCurrentUser();
  if (!user) return;
  const isGuest = user.isGuest;

  // Toggle sections based on user type
  const googleOnly = ['settings-photo-section', 'settings-account-section', 'settings-danger-section'];
  googleOnly.forEach(id => {
    const el = $(id);
    if (el) el.style.display = isGuest ? 'none' : '';
  });
  const guestNotice = $('settings-guest-notice');
  if (guestNotice) guestNotice.style.display = isGuest ? '' : 'none';

  // Populate avatar
  const avatar = $('settings-avatar');
  if (user.photo) {
    const img = document.createElement('img');
    img.src = user.photo;
    img.alt = 'avatar';
    avatar.textContent = '';
    avatar.appendChild(img);
  } else {
    avatar.textContent = isGuest ? '👤' : '🍸';
  }

  // Populate name
  $('settings-name-input').value = user.name || '';

  // Populate email
  const emailEl = $('settings-email');
  if (emailEl) emailEl.textContent = user.email || '';

  $('settings-photo-status').textContent = '';
  renderThemeGrid();
  showView('view-settings');
}

function bindSettingsEvents() {
  $('btn-settings-back').addEventListener('click', () => goToDashboard());

  // Change photo
  $('btn-change-photo').addEventListener('click', () => $('settings-photo-input').click());
  $('settings-photo-input').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast(t('settings.photo_too_large') || 'La imagen es demasiado grande (máx. 5MB)', 'error');
      return;
    }
    const status = $('settings-photo-status');
    status.textContent = t('settings.uploading') || 'Subiendo...';
    try {
      const url = await uploadProfilePhoto(file);
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'avatar';
      $('settings-avatar').textContent = '';
      $('settings-avatar').appendChild(img);
      status.textContent = '✓';
      toast(t('settings.photo_updated') || 'Foto actualizada', 'success');
    } catch (err) {
      console.error('Photo upload failed:', err);
      status.textContent = '';
      toast(t('settings.photo_error') || 'Error al subir la foto', 'error');
    }
    e.target.value = '';
  });

  // Save name
  $('btn-save-name').addEventListener('click', async () => {
    const name = $('settings-name-input').value.trim();
    if (!name) return;
    const user = getCurrentUser();
    try {
      if (user?.isGuest) {
        updateGuestName(name);
      } else {
        await updateUserProfile({ name });
      }
      toast(t('settings.name_updated') || 'Nombre actualizado', 'success');
    } catch (err) {
      console.error('Name update failed:', err);
      toast(t('settings.name_error') || 'Error al actualizar el nombre', 'error');
    }
  });

  // Sign out
  $('btn-settings-logout').addEventListener('click', async () => {
    if (await showConfirm(t('confirm.sign_out'))) {
      await signOutUser();
      showView('view-login');
    }
  });

  // Delete data
  $('btn-delete-data').addEventListener('click', async () => {
    if (!await showConfirm(t('settings.confirm_delete_data') || '¿Estás seguro de que quieres borrar todos tus datos? Esta acción no se puede deshacer.')) return;
    setLoading(true);
    try {
      await deleteUserData();
      toast(t('settings.data_deleted') || 'Datos eliminados correctamente', 'success');
      goToDashboard();
    } catch (err) {
      console.error('Delete data failed:', err);
      toast(t('settings.delete_error') || 'Error al borrar los datos', 'error');
    } finally {
      setLoading(false);
    }
  });

  // Delete account
  $('btn-delete-account').addEventListener('click', async () => {
    if (!await showConfirm(t('settings.confirm_delete_account') || '¿Estás seguro de que quieres eliminar tu cuenta permanentemente? Esta acción NO se puede deshacer.')) return;
    if (!await showConfirm(t('settings.confirm_delete_account_2') || 'Esta es tu última oportunidad. ¿Eliminar cuenta y todos los datos?')) return;
    setLoading(true);
    try {
      await deleteUserAccount();
      toast(t('settings.account_deleted') || 'Cuenta eliminada', 'success');
      showView('view-login');
    } catch (err) {
      console.error('Delete account failed:', err);
      toast(t('settings.delete_account_error') || 'Error al eliminar la cuenta. Intenta iniciar sesión de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  });
}

// ══════════════════════════════════════════════════════════════
// ─── RIVALS / DUEL MODE ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════

let duelState = {
  roomId: null,
  slot: null,        // 'p1' | 'p2' | 'p3' | 'p4'
  myUid: null,
  myName: null,
  mode: null,        // 'friend-host' | 'friend-join' | 'random'
  code: null,
  maxPlayers: 2,     // 2, 3, or 4
  questions: [],
  currentQ: 0,
  score: 0,
  timer: null,
  timeLeft: 20,
  answered: false,
  gameStarted: false,  // guard: prevents startDuelGame from being called multiple times
  unsubRoom: null,
  unsubLobby: null,    // separate unsub for the lobby listener in random mode
  unsubOnline: null,
  unsubMatch: null,
  matchTimeout: null,
};

function resetDuelState() {
  if (duelState.timer) clearInterval(duelState.timer);
  if (duelState.matchTimeout) clearTimeout(duelState.matchTimeout);
  if (typeof duelState.unsubRoom === 'function') duelState.unsubRoom();
  if (typeof duelState.unsubOnline === 'function') duelState.unsubOnline();
  if (typeof duelState.unsubMatch === 'function') duelState.unsubMatch();
  if (typeof duelState.unsubLobby === 'function') duelState.unsubLobby();
  duelState = {
    roomId: null, slot: null, myUid: null, myName: null,
    mode: null, code: null, maxPlayers: 2, questions: [], currentQ: 0, score: 0,
    timer: null, timeLeft: 20, answered: false, gameStarted: false,
    unsubRoom: null, unsubLobby: null, unsubOnline: null, unsubMatch: null, matchTimeout: null,
  };
}

const ALL_SLOTS = ['p1', 'p2', 'p3', 'p4'];
const MEDALS = ['🥇', '🥈', '🥉', '4.'];

function getSelectedPlayerCount() {
  const active = document.querySelector('#player-count-picker .diff-btn.active');
  return active ? parseInt(active.dataset.players, 10) : 2;
}

/**
 * Render lobby player slots dynamically based on maxPlayers.
 * @param {number} maxPlayers
 * @param {object} players - room.players from Firebase (may be partial)
 * @param {string} myName - current user's display name
 */
function renderLobbyPlayers(maxPlayers, players, myName) {
  const container = $('lobby-players');
  if (!container) return;
  container.innerHTML = '';
  container.className = maxPlayers > 2 ? 'lobby-players lobby-players--multi' : 'lobby-players';

  for (let i = 0; i < maxPlayers; i++) {
    const slot = ALL_SLOTS[i];
    const p = players?.[slot];
    const joined = p && !p.disconnected;

    const div = document.createElement('div');
    div.className = 'lobby-player-slot' + (i > 0 && !joined ? ' lobby-player-slot--rival' : '') + (joined && i > 0 ? ' lobby-player-slot--rival joined' : '');
    div.id = `lobby-slot-${slot}`;

    const avatar = document.createElement('div');
    avatar.className = 'lobby-player-avatar';
    avatar.textContent = joined ? '👤' : '❓';

    const name = document.createElement('div');
    name.className = 'lobby-player-name';
    name.textContent = joined ? (p.name || myName) : t('duel.waiting_opponent');

    div.appendChild(avatar);
    div.appendChild(name);
    container.appendChild(div);

    // Add VS separator between slots (only for 2-player mode)
    if (maxPlayers === 2 && i === 0) {
      const vs = document.createElement('div');
      vs.className = 'lobby-vs';
      vs.textContent = t('duel.vs');
      container.appendChild(vs);
    }
  }

  // Update player count
  const countEl = $('lobby-players-count');
  if (countEl) {
    const joined = ALL_SLOTS.slice(0, maxPlayers).filter(s => players?.[s] && !players[s].disconnected).length;
    countEl.textContent = t('duel.players_joined', { n: joined, max: maxPlayers });
  }
}

/**
 * Set up the game header for the current match.
 * 2 players: use existing left-center-right layout.
 * 3-4 players: use compact scoreboard grid.
 */
function setupGameHeader(maxPlayers, mySlot, myName, players) {
  const h2p = $('duel-header-2p');
  const hMulti = $('duel-header-multi');

  if (maxPlayers <= 2) {
    h2p.classList.remove('hidden');
    hMulti.classList.add('hidden');
    $('duel-me-name').textContent = myName;
    const oppSlot = mySlot === 'p1' ? 'p2' : 'p1';
    const opp = players?.[oppSlot];
    $('duel-rival-name').textContent = opp?.name || t('duel.waiting_opponent');
    $('duel-me-score').textContent = 0;
    $('duel-rival-score').textContent = 0;
  } else {
    h2p.classList.add('hidden');
    hMulti.classList.remove('hidden');
    renderScoreboard(maxPlayers, mySlot, myName, players);
  }
}

/**
 * Render the multi-player scoreboard in game header.
 */
function renderScoreboard(maxPlayers, mySlot, myName, players) {
  const board = $('duel-scoreboard');
  if (!board) return;
  board.innerHTML = '';

  for (let i = 0; i < maxPlayers; i++) {
    const slot = ALL_SLOTS[i];
    const p = players?.[slot];
    const isMe = slot === mySlot;

    const item = document.createElement('div');
    item.className = 'duel-scoreboard-item' + (isMe ? ' duel-scoreboard-item--me' : '');
    item.id = `scoreboard-${slot}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'duel-sb-name';
    nameSpan.textContent = isMe ? myName : (p?.name || '...');

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'duel-sb-score';
    scoreSpan.id = `sb-score-${slot}`;
    scoreSpan.textContent = '0';

    item.appendChild(nameSpan);
    item.appendChild(scoreSpan);
    board.appendChild(item);
  }
}

/**
 * Update a single player's score in the scoreboard (multi-player mode).
 */
function updateScoreboardScore(slot, score) {
  const el = $(`sb-score-${slot}`);
  if (!el) return;
  el.textContent = score;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 200);
}

// ─── Duel Menu ────────────────────────────────────────────────

async function goToDuelMenu() {
  if (!isRivalsReady()) {
    toast(t('duel.no_connection'), 'error');
    return;
  }

  resetDuelState();

  const user = getCurrentUser();
  // Resolve Firebase UID BEFORE showing the menu so buttons are never
  // clickable while duelState.myUid is still null (race condition).
  let uid;
  if (user.isGuest) {
    // For guests: create/restore an anonymous Firebase Auth session.
    uid = await ensureAnonymousAuth();
    if (!uid) { toast(t('duel.no_connection'), 'error'); return; }
  } else {
    // For Google users: wait for Firebase Auth to restore the session token
    // from IndexedDB before any RTDB operation (auth.currentUser is set async).
    await waitForFirebaseAuthUid();
    uid = user.uid;
  }
  duelState.myUid = uid;
  duelState.myName = user.name;

  showView('view-duel'); // shown only after UID is guaranteed set

  try {
    // Set presence
    await setPresence(uid, user.name);

    // Listen for online count
    duelState.unsubOnline = await listenOnlineCount(n => {
      const el = $('duel-online-count');
      if (el) el.textContent = t('duel.online_count', { n });
    });
  } catch (e) {
    // Non-fatal: presence/counter may fail but duel menu remains usable
    console.warn('Rivals presence error:', e);
  }
}

async function leaveDuelMenu() {
  $('friend-mode-picker').classList.add('hidden');
  if (duelState.myUid) await removePresence(duelState.myUid);
  resetDuelState();
  goToDashboard();
}

// ─── Duel Lobby ───────────────────────────────────────────────

function showLobbySection(mode) {
  ['lobby-host-section', 'lobby-join-section', 'lobby-random-section'].forEach(id => {
    const el = $(id);
    if (el) el.classList.add('hidden');
  });
  if (mode === 'friend-host')  $('lobby-host-section').classList.remove('hidden');
  if (mode === 'friend-join')  $('lobby-join-section').classList.remove('hidden');
  if (mode === 'random')       $('lobby-random-section').classList.remove('hidden');
}

function withTimeout(promise, ms) {
  let id;
  const t = new Promise((_, reject) => { id = setTimeout(() => reject(new Error('timeout')), ms); });
  return Promise.race([promise, t]).finally(() => clearTimeout(id));
}

async function goToDuelLobby(mode) {
  if (!duelState.myUid) {
    toast(t('duel.no_connection'), 'error');
    return;
  }

  // Cancel any existing lobby listeners before switching modes (e.g. host → join)
  if (typeof duelState.unsubRoom === 'function') { duelState.unsubRoom(); duelState.unsubRoom = null; }
  if (typeof duelState.unsubLobby === 'function') { duelState.unsubLobby(); duelState.unsubLobby = null; }

  duelState.mode = mode;

  // Prepare a language-agnostic setup from a random round
  const rounds = getLocalizedRounds(getLang());
  const randomRound = rounds[Math.floor(Math.random() * rounds.length)];
  const setup = prepareDuelSetup(randomRound);

  if (mode === 'friend-host') {
    const maxPlayers = getSelectedPlayerCount();
    duelState.maxPlayers = maxPlayers;
    setLoading(true);
    try {
      const { roomId, code } = await withTimeout(createFriendRoom(duelState.myUid, duelState.myName, setup, maxPlayers), 10_000);
      if (!duelState.myUid) { setLoading(false); return; } // user navigated away
      duelState.roomId = roomId;
      duelState.slot = 'p1';
      duelState.code = code;

      // Only transition to lobby after successful room creation
      showView('view-duel-lobby');
      showLobbySection('friend-host');
      const initialPlayers = { p1: { uid: duelState.myUid, name: duelState.myName } };
      renderLobbyPlayers(maxPlayers, initialPlayers, duelState.myName);
      $('btn-start-duel').classList.add('hidden');
      $('lobby-code-display').textContent = code;
      setLoading(false);

      await registerPlayerDisconnect(roomId, 'p1');
      duelState.unsubRoom = await listenRoom(roomId, room => {
        if (!room) return;
        const max = room.maxPlayers || 2;
        renderLobbyPlayers(max, room.players, duelState.myName);
        // Show start button when all slots are filled
        const joinedCount = ALL_SLOTS.slice(0, max).filter(s => room.players?.[s] && !room.players[s].disconnected).length;
        if (joinedCount >= max) {
          $('btn-start-duel').classList.remove('hidden');
        } else {
          $('btn-start-duel').classList.add('hidden');
        }
        if (room.status === 'playing') {
          startDuelGame(room);
        }
      });
    } catch (e) {
      setLoading(false);
      console.error('[duel] friend-host lobby error:', e);
      toast(t('duel.no_connection'), 'error');
    }

  } else if (mode === 'friend-join') {
    // Transition immediately — no async op until user submits a code
    duelState.maxPlayers = 2; // will be updated when room data arrives
    showView('view-duel-lobby');
    showLobbySection('friend-join');
    renderLobbyPlayers(2, {}, duelState.myName);
    $('btn-start-duel').classList.add('hidden');

  } else if (mode === 'random') {
    duelState.maxPlayers = 2; // random is always 2-player
    setLoading(true);
    try {
      const result = await withTimeout(joinQueue(duelState.myUid, duelState.myName, setup), 10_000);
      if (!duelState.myUid) { setLoading(false); return; } // user navigated away

      // Only transition to lobby after successful queue join
      showView('view-duel-lobby');
      showLobbySection('random');
      renderLobbyPlayers(2, { p1: { uid: duelState.myUid, name: duelState.myName } }, duelState.myName);
      $('btn-start-duel').classList.add('hidden');
      setLoading(false);

      if (!result.waiting) {
        // Immediately matched — room is already 'playing'. Store lobby listener in
        // unsubLobby so startDuelGame can cancel it independently of unsubRoom.
        duelState.roomId = result.roomId;
        duelState.slot = result.slot;
        await registerPlayerDisconnect(result.roomId, result.slot);
        duelState.unsubLobby = await listenRoom(result.roomId, room => {
          if (!room) return;
          handleRandomRoomUpdate(room);
        });
      } else {
        // Waiting in queue — listen for match notification with 30s timeout
        duelState.slot = 'p1';
        duelState.matchTimeout = setTimeout(async () => {
          if (typeof duelState.unsubMatch === 'function') { duelState.unsubMatch(); duelState.unsubMatch = null; }
          await leaveQueue(duelState.myUid).catch(() => {});
          resetDuelState();
          goToDuelMenu();
          toast(t('duel.no_rivals_found'), 'info');
        }, 30_000);

        duelState.unsubMatch = await listenForMatch(duelState.myUid, async ({ roomId }) => {
          clearTimeout(duelState.matchTimeout); duelState.matchTimeout = null;
          if (typeof duelState.unsubMatch === 'function') { duelState.unsubMatch(); duelState.unsubMatch = null; }
          await clearMatchNotif(duelState.myUid);
          duelState.roomId = roomId;
          await registerPlayerDisconnect(roomId, 'p1');
          // Room is already 'playing' when P1 gets the match notification.
          // Store in unsubLobby so startDuelGame can cancel it independently.
          duelState.unsubLobby = await listenRoom(roomId, room => {
            if (!room) return;
            handleRandomRoomUpdate(room);
          });
        });
      }
    } catch (e) {
      setLoading(false);
      console.error('[duel] random lobby error:', e);
      toast(t('duel.no_connection'), 'error');
    }
  }
}

function handleRandomRoomUpdate(room) {
  renderLobbyPlayers(2, room.players, duelState.myName);
  if (room.status === 'playing') {
    startDuelGame(room);
  }
}

async function handleJoinByCode() {
  const code = ($('lobby-code-input').value || '').trim().toUpperCase();
  if (code.length !== 6) { toast(t('duel.invalid_code'), 'error'); return; }

  setLoading(true);
  try {
    const result = await withTimeout(joinByCode(duelState.myUid, duelState.myName, code), 10_000);
    setLoading(false);

    if (result === null) { toast(t('duel.invalid_code'), 'error'); return; }
    if (result === 'full') { toast(t('duel.room_full'), 'error'); return; }

    // joinByCode now returns { roomId, slot } for multi-player support
    const joinedRoomId = result.roomId;
    const joinedSlot = result.slot;
    duelState.roomId = joinedRoomId;
    duelState.slot = joinedSlot;
    $('lobby-code-input').value = '';

    await registerPlayerDisconnect(joinedRoomId, joinedSlot);

    // Hide the code input and show the waiting-for-host state.
    showLobbySection('p2-waiting');

    duelState.unsubRoom = await listenRoom(joinedRoomId, room => {
      if (!room) return;
      const max = room.maxPlayers || 2;
      duelState.maxPlayers = max;
      renderLobbyPlayers(max, room.players, duelState.myName);

      // Check if host disconnected
      const host = room.players?.p1;
      if (host?.disconnected) {
        toast(t('duel.rival_left'), 'error');
        cleanupAndGoToDuelMenu();
        return;
      }
      if (room.status === 'playing') {
        startDuelGame(room);
      }
    });
  } catch (e) {
    setLoading(false);
    console.error('[duel] join-by-code error:', e);
    toast(t('duel.no_connection'), 'error');
  }
}

async function handleStartDuel() {
  if (!duelState.roomId) return;
  try {
    await startRoom(duelState.roomId);
  } catch (e) {
    console.error('[duel] startRoom error:', e);
    toast(t('duel.no_connection'), 'error');
  }
}

// ─── Duel Game ────────────────────────────────────────────────

function startDuelGame(roomData) {
  // Guard: Firebase onValue fires immediately, so this can be called before the
  // outer await listenRoom() resolves (race condition in random mode). Only start once.
  if (duelState.gameStarted) return;
  duelState.gameStarted = true;

  // Stop the lobby room listener (friend mode) and/or the random-mode lobby listener
  if (typeof duelState.unsubRoom === 'function') {
    duelState.unsubRoom();
    duelState.unsubRoom = null;
  }
  if (typeof duelState.unsubLobby === 'function') {
    duelState.unsubLobby();
    duelState.unsubLobby = null;
  }

  const maxPlayers = roomData?.maxPlayers || duelState.maxPlayers || 2;
  duelState.maxPlayers = maxPlayers;

  // Reconstruct questions locally in the player's own language
  if (roomData?.setup) {
    duelState.questions = loadDuelQuestionsFromSetup(roomData.setup);
  }

  // Set up game header based on player count
  setupGameHeader(maxPlayers, duelState.slot, duelState.myName, roomData?.players);

  // Subscribe to live score updates
  let resultShown = false;
  listenRoom(duelState.roomId, room => {
    if (!room || resultShown) return;

    const max = room.maxPlayers || 2;
    const me = room.players?.[duelState.slot];

    // Update opponent scores and check disconnects
    if (max <= 2) {
      // 2-player: use existing rival score display
      const opponentSlot = duelState.slot === 'p1' ? 'p2' : 'p1';
      const oppNow = room.players?.[opponentSlot];
      if (oppNow) {
        $('duel-rival-score').textContent = oppNow.score || 0;
        if (oppNow.disconnected) {
          resultShown = true;
          toast(t('duel.rival_left'), 'error');
          stopDuelTimer();
          finishGame(duelState.roomId).catch(() => {});
          showDuelResultMulti(room.players, max);
          return;
        }
      }
    } else {
      // Multi-player: update scoreboard and check disconnects
      let anyDisconnect = false;
      for (let i = 0; i < max; i++) {
        const s = ALL_SLOTS[i];
        if (s === duelState.slot) continue;
        const p = room.players?.[s];
        if (p) {
          updateScoreboardScore(s, p.score || 0);
          if (p.disconnected && !anyDisconnect) {
            anyDisconnect = true;
            toast(t('duel.player_left'), 'info');
          }
        }
      }
    }

    // Check if game is finished
    const myProgress = Math.max(duelState.currentQ, me?.currentQ || 0);
    const myFinished = myProgress >= QUESTIONS_PER_DUEL;

    // Wait for all non-disconnected players to finish
    let allFinished = true;
    for (let i = 0; i < max; i++) {
      const s = ALL_SLOTS[i];
      const p = room.players?.[s];
      if (p && !p.disconnected && (p.currentQ || 0) < QUESTIONS_PER_DUEL) {
        allFinished = false;
        break;
      }
    }

    if (room.status === 'finished' && me && myFinished && allFinished) {
      resultShown = true;
      stopDuelTimer();
      showDuelResultMulti(room.players, max);
    }
  }).then(unsub => { duelState.unsubRoom = unsub; });

  showView('view-duel-game');
  duelState.currentQ = 0;
  duelState.score = 0;
  duelState.answered = false;

  renderDuelQuestion();
}

function renderDuelQuestion() {
  const q = duelState.questions[duelState.currentQ];
  if (!q) return;

  duelState.answered = false;
  duelState.timeLeft = 20;

  // Progress
  const pct = (duelState.currentQ / QUESTIONS_PER_DUEL) * 100;
  $('duel-progress-fill').style.width = pct + '%';
  $('duel-q-num').textContent = duelState.currentQ + 1;
  // Keep multi-player counter in sync
  const qNumMulti = $('duel-q-num-multi');
  if (qNumMulti) qNumMulti.textContent = duelState.currentQ + 1;

  // Timer display
  $('duel-timer-num').textContent = duelState.timeLeft;
  $('duel-timer-num').classList.remove('urgent');
  const timerMulti = $('duel-timer-num-multi');
  if (timerMulti) { timerMulti.textContent = duelState.timeLeft; timerMulti.classList.remove('urgent'); }

  // Question text
  $('duel-question').textContent = t(q.question);

  // Answers
  const grid = $('duel-answers');
  grid.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-letter">${labels[i]}</span><span class="answer-text">${t(ans)}</span>`;
    btn.addEventListener('click', () => handleDuelAnswer(i));
    grid.appendChild(btn);
  });

  // Score display
  if (duelState.maxPlayers <= 2) {
    $('duel-me-score').textContent = duelState.score;
  } else {
    updateScoreboardScore(duelState.slot, duelState.score);
  }

  startDuelTimer();
}

function startDuelTimer() {
  stopDuelTimer();
  duelState.timer = setInterval(() => {
    duelState.timeLeft--;
    $('duel-timer-num').textContent = duelState.timeLeft;
    if (duelState.timeLeft <= 5) $('duel-timer-num').classList.add('urgent');
    // Sync multi-player timer
    const tm = $('duel-timer-num-multi');
    if (tm) { tm.textContent = duelState.timeLeft; if (duelState.timeLeft <= 5) tm.classList.add('urgent'); }
    if (duelState.timeLeft <= 0) {
      stopDuelTimer();
      if (!duelState.answered) handleDuelTimeout();
    }
  }, 1000);
}

function stopDuelTimer() {
  clearInterval(duelState.timer);
  duelState.timer = null;
}

async function handleDuelAnswer(selectedIndex) {
  if (duelState.answered) return;
  stopDuelTimer();
  duelState.answered = true;

  const q = duelState.questions[duelState.currentQ];
  const correct = selectedIndex === q.correctIndex;
  const points = calcScore(correct, duelState.timeLeft);
  duelState.score += points;

  // Visual feedback on answer buttons
  const btns = $('duel-answers').querySelectorAll('.answer-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add('correct');
    else if (i === selectedIndex && !correct) btn.classList.add('wrong');
  });

  // Bump my score display
  if (duelState.maxPlayers <= 2) {
    const scoreEl = $('duel-me-score');
    scoreEl.textContent = duelState.score;
    scoreEl.classList.add('bump');
    setTimeout(() => scoreEl.classList.remove('bump'), 200);
  } else {
    updateScoreboardScore(duelState.slot, duelState.score);
  }

  // Sync to Firebase
  rtdbSubmitAnswer(duelState.roomId, duelState.slot, duelState.currentQ, correct, duelState.timeLeft)
    .catch(() => {});

  // Advance after brief pause
  setTimeout(() => advanceDuelQuestion(), 1200);
}

async function handleDuelTimeout() {
  duelState.answered = true;

  const q = duelState.questions[duelState.currentQ];
  const btns = $('duel-answers').querySelectorAll('.answer-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add('correct');
  });

  rtdbSubmitAnswer(duelState.roomId, duelState.slot, duelState.currentQ, false, 0)
    .catch(() => {});

  setTimeout(() => advanceDuelQuestion(), 1200);
}

async function advanceDuelQuestion() {
  duelState.currentQ++;
  if (duelState.currentQ >= QUESTIONS_PER_DUEL) {
    // All questions done — signal finish; result shown via listenRoom
    await finishGame(duelState.roomId).catch(() => {});
    return;
  }
  renderDuelQuestion();
}

// ─── Duel Result ──────────────────────────────────────────────

/**
 * Show results for multi-player duel (works for 2, 3, or 4 players).
 * Reads scores from room.players and renders a ranked list.
 */
function showDuelResultMulti(players, maxPlayers) {
  if (typeof duelState.unsubRoom === 'function') duelState.unsubRoom();

  // Build ranked list of players
  const ranked = [];
  for (let i = 0; i < maxPlayers; i++) {
    const slot = ALL_SLOTS[i];
    const p = players?.[slot];
    if (!p) continue;
    const isMe = slot === duelState.slot;
    ranked.push({
      name: isMe ? duelState.myName : (p.name || '?'),
      score: isMe ? Math.max(duelState.score, p.score || 0) : (p.score || 0),
      isMe,
      disconnected: !!p.disconnected,
    });
  }
  ranked.sort((a, b) => b.score - a.score);

  // Determine my position
  const myEntry = ranked.find(r => r.isMe);
  const myScore = myEntry?.score || 0;
  const topScore = ranked[0]?.score || 0;

  let icon, title;
  if (myScore > 0 && myScore >= topScore) { icon = '🏆'; title = t('duel.victory'); }
  else if (myScore === topScore && topScore > 0) { icon = '🤝'; title = t('duel.tie'); }
  else { icon = '😔'; title = t('duel.defeat'); }

  $('duel-result-icon').textContent = icon;
  $('duel-result-title').textContent = title;

  // Render ranked score cards
  const container = $('duel-final-scores');
  container.innerHTML = '';
  container.className = maxPlayers > 2 ? 'duel-final-scores duel-final-scores--multi' : 'duel-final-scores';

  ranked.forEach((entry, idx) => {
    const card = document.createElement('div');
    card.className = 'duel-score-card' + (entry.score >= topScore && entry.score > 0 ? ' winner' : '');

    const medal = document.createElement('span');
    medal.className = 'duel-rank-medal';
    medal.textContent = MEDALS[idx] || `${idx + 1}.`;

    const label = document.createElement('div');
    label.className = 'duel-score-label';
    label.textContent = entry.name + (entry.disconnected ? ' ⚡' : '');

    const value = document.createElement('div');
    value.className = 'duel-score-value';
    value.textContent = entry.score + ' pts';

    card.appendChild(medal);
    card.appendChild(label);
    card.appendChild(value);
    container.appendChild(card);
  });

  showView('view-duel-result');
}

/**
 * Legacy 2-player result display (used by bot mode).
 */
function showDuelResult(myScore, oppScore, oppName) {
  if (typeof duelState.unsubRoom === 'function') duelState.unsubRoom();

  const players = {};
  players[duelState.slot || 'p1'] = { name: duelState.myName, score: myScore };
  const oppSlot = duelState.slot === 'p1' ? 'p2' : 'p1';
  players[oppSlot] = { name: oppName, score: oppScore };

  showDuelResultMulti(players, 2);
}

function cleanupAndGoToDuelMenu() {
  if (duelState.roomId && duelState.slot) {
    leaveRoom(duelState.roomId, duelState.slot).catch(() => {});
  }
  if (duelState.myUid) {
    leaveQueue(duelState.myUid).catch(() => {});
  }
  resetDuelState();
  goToDuelMenu();
}

// ─── Duel Event Bindings (called from bindEvents) ─────────────

function bindDuelEvents() {
  $('btn-back-duel').addEventListener('click', () => leaveDuelMenu());

  $('btn-challenge-friend').addEventListener('click', () => {
    $('friend-mode-picker').classList.toggle('hidden');
    $('duel-difficulty-picker').classList.add('hidden'); // close bot picker if open
  });
  $('btn-host-room').addEventListener('click', () => {
    $('friend-mode-picker').classList.add('hidden');
    goToDuelLobby('friend-host');
  });
  $('btn-join-room').addEventListener('click', () => {
    $('friend-mode-picker').classList.add('hidden');
    goToDuelLobby('friend-join');
  });

  $('btn-random-rival').addEventListener('click', () => goToDuelLobby('random'));

  $('btn-back-duel-lobby').addEventListener('click', async () => {
    if (duelState.myUid) await leaveQueue(duelState.myUid).catch(() => {});
    if (duelState.roomId && duelState.slot) {
      await leaveRoom(duelState.roomId, duelState.slot).catch(() => {});
    }
    resetDuelState();
    goToDuelMenu();
  });

  // Inside lobby: friend-join mode — the host button switches to "enter code" flow
  // We reuse lobby, but show join section via a secondary approach:
  // btn-challenge-friend opens host mode. User can switch to join mode
  // by clicking the lobby back button (returns to duel menu) then choosing manually.
  // For simplicity, the lobby "join" section is only shown when p2 enters code
  // which is triggered from a special context.
  // Actually: btn-challenge-friend → host mode (show code)
  //           A separate button "Unirse con código" would be nice, but to keep
  //           existing button count, we handle join from the lobby host section itself:
  //           The lobby also shows a "Tengo un código" option in the host section.
  // For now, the flow is: host creates → shares code → joiner navigates to lobby-join.
  // We'll add a toggle inside the lobby to switch between host/join.
  // This is handled via btn-challenge-friend → goToDuelLobby('friend-host'),
  // and a "¿Tienes un código?" link in the lobby will call goToDuelLobby('friend-join').

  // Switch between host and join modes in lobby
  $('btn-switch-to-join').addEventListener('click', async () => {
    // Cancel current host room and switch to join mode
    if (duelState.roomId && duelState.slot === 'p1') {
      await leaveRoom(duelState.roomId, 'p1').catch(() => {});
      duelState.roomId = null;
      duelState.code = null;
      duelState.slot = null;
    }
    if (typeof duelState.unsubRoom === 'function') { duelState.unsubRoom(); duelState.unsubRoom = null; }
    showLobbySection('friend-join');
    $('lobby-code-input').value = '';
    $('lobby-code-input').focus();
  });
  $('btn-switch-to-host').addEventListener('click', () => goToDuelLobby('friend-host'));

  $('btn-join-code').addEventListener('click', () => handleJoinByCode());
  $('lobby-code-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleJoinByCode();
  });

  $('btn-copy-code').addEventListener('click', () => {
    const code = duelState.code;
    if (!code) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(() => toast(t('duel.code_copied'), 'success'));
    } else {
      // Fallback: select the code display text
      const range = document.createRange();
      range.selectNodeContents($('lobby-code-display'));
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      toast(t('duel.code_copied'), 'success');
    }
  });

  $('btn-start-duel').addEventListener('click', () => handleStartDuel());

  // Bot rival
  $('btn-bot-rival').addEventListener('click', () => {
    $('duel-difficulty-picker').classList.toggle('hidden');
    $('friend-mode-picker').classList.add('hidden'); // close friend picker if open
  });
  $('duel-difficulty-picker').querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $('duel-difficulty-picker').classList.add('hidden');
      startBotDuel(btn.dataset.diff);
    });
  });

  $('btn-duel-rematch').addEventListener('click', () => {
    resetBotDuelState();
    resetDuelState();
    goToDuelMenu();
  });
  $('btn-duel-exit').addEventListener('click', () => {
    resetBotDuelState();
    resetDuelState();
    goToDashboard();
  });

  // Player count picker toggle (inside friend-mode-picker)
  $('player-count-picker').querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $('player-count-picker').querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ══════════════════════════════════════════════════════════════
// ─── BOT DUEL MODE ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

let botDuelState = {
  questions: [],
  currentQ: 0,
  myScore: 0,
  botScore: 0,
  botName: '',
  difficulty: 'medium',
  lang: '',
  humanTimer: null,
  botTimer: null,
  timeLeft: 20,
  answered: false,
  botScheduled: null, // { correct, answerTime }
};

function resetBotDuelState() {
  clearInterval(botDuelState.humanTimer);
  clearTimeout(botDuelState.botTimer);
  botDuelState = {
    questions: [], currentQ: 0, myScore: 0, botScore: 0,
    botName: '', difficulty: 'medium', lang: '',
    humanTimer: null, botTimer: null,
    timeLeft: 20, answered: false, botScheduled: null,
  };
}

function startBotDuel(difficulty) {
  resetBotDuelState();

  const user = getCurrentUser();
  const lang = getLang();
  const rounds = getLocalizedRounds(lang);
  const randomRound = rounds[Math.floor(Math.random() * rounds.length)];

  botDuelState.questions = prepareDuelQuestions(randomRound);
  botDuelState.difficulty = difficulty || 'medium';
  botDuelState.lang = lang;
  botDuelState.botName = getBotName();
  botDuelState.myScore = 0;
  botDuelState.botScore = 0;

  // Set up header names
  $('duel-me-name').textContent = user.name;
  $('duel-rival-name').textContent = botDuelState.botName;
  $('duel-me-score').textContent = 0;
  $('duel-rival-score').textContent = 0;

  showView('view-duel-game');
  renderBotQuestion();
}

function renderBotQuestion() {
  const q = botDuelState.questions[botDuelState.currentQ];
  if (!q) return;

  botDuelState.answered = false;
  botDuelState.timeLeft = 20;

  // Schedule bot answer for this question
  botDuelState.botScheduled = scheduleBotAnswer(botDuelState.difficulty);

  // Progress bar & counter
  const pct = (botDuelState.currentQ / QUESTIONS_PER_DUEL) * 100;
  $('duel-progress-fill').style.width = pct + '%';
  $('duel-q-num').textContent = botDuelState.currentQ + 1;

  // Timer display
  $('duel-timer-num').textContent = botDuelState.timeLeft;
  $('duel-timer-num').classList.remove('urgent');

  // Question text
  $('duel-question').textContent = t(q.question);

  // Answer buttons — wired to bot handler
  const grid = $('duel-answers');
  grid.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-letter">${labels[i]}</span><span class="answer-text">${t(ans)}</span>`;
    btn.addEventListener('click', () => handleBotPlayerAnswer(i));
    grid.appendChild(btn);
  });

  // Scores
  $('duel-me-score').textContent = botDuelState.myScore;
  $('duel-rival-score').textContent = botDuelState.botScore;

  // Start human countdown
  startBotHumanTimer();

  // Schedule bot's answer to arrive independently
  const { answerTime } = botDuelState.botScheduled;
  botDuelState.botTimer = setTimeout(() => {
    // Bot answers — only update score display (human still has time)
    if (!botDuelState.answered) {
      applyBotAnswer(); // updates botScore, bumps rival display
    }
  }, answerTime * 1000);
}

function startBotHumanTimer() {
  clearInterval(botDuelState.humanTimer);
  botDuelState.humanTimer = setInterval(() => {
    botDuelState.timeLeft--;
    $('duel-timer-num').textContent = botDuelState.timeLeft;
    if (botDuelState.timeLeft <= 5) $('duel-timer-num').classList.add('urgent');
    if (botDuelState.timeLeft <= 0) {
      clearInterval(botDuelState.humanTimer);
      if (!botDuelState.answered) handleBotPlayerTimeout();
    }
  }, 1000);
}

function applyBotAnswer() {
  const { correct } = botDuelState.botScheduled;
  // Bot's timeLeft when it "answered" = 20 - answerTime (approximate, ≥ 0)
  const botTimeLeft = Math.max(0, Math.round(20 - botDuelState.botScheduled.answerTime));
  const points = correct ? 100 + botTimeLeft * 5 : 0;
  botDuelState.botScore += points;

  // Update rival score with bump animation
  const scoreEl = $('duel-rival-score');
  scoreEl.textContent = botDuelState.botScore;
  scoreEl.classList.add('bump');
  setTimeout(() => scoreEl.classList.remove('bump'), 200);

  // Mark bot as having answered so we don't double-apply
  botDuelState.botScheduled = { ...botDuelState.botScheduled, applied: true };
}

function handleBotPlayerAnswer(selectedIndex) {
  if (botDuelState.answered) return;
  clearInterval(botDuelState.humanTimer);
  clearTimeout(botDuelState.botTimer);
  botDuelState.answered = true;

  // Apply bot answer if not yet done
  if (!botDuelState.botScheduled?.applied) applyBotAnswer();

  const q = botDuelState.questions[botDuelState.currentQ];
  const correct = selectedIndex === q.correctIndex;
  const points = correct ? 100 + botDuelState.timeLeft * 5 : 0;
  botDuelState.myScore += points;

  // Visual feedback
  const btns = $('duel-answers').querySelectorAll('.answer-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add('correct');
    else if (i === selectedIndex && !correct) btn.classList.add('wrong');
  });

  // Update my score with bump
  const myScoreEl = $('duel-me-score');
  myScoreEl.textContent = botDuelState.myScore;
  myScoreEl.classList.add('bump');
  setTimeout(() => myScoreEl.classList.remove('bump'), 200);

  setTimeout(() => advanceBotQuestion(), 1200);
}

function handleBotPlayerTimeout() {
  clearTimeout(botDuelState.botTimer);
  botDuelState.answered = true;

  if (!botDuelState.botScheduled?.applied) applyBotAnswer();

  const q = botDuelState.questions[botDuelState.currentQ];
  const btns = $('duel-answers').querySelectorAll('.answer-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add('correct');
  });

  setTimeout(() => advanceBotQuestion(), 1200);
}

function advanceBotQuestion() {
  botDuelState.currentQ++;
  if (botDuelState.currentQ >= QUESTIONS_PER_DUEL) {
    showBotResult();
    return;
  }
  renderBotQuestion();
}

function showBotResult() {
  showDuelResult(botDuelState.myScore, botDuelState.botScore, botDuelState.botName);
}

// ─── SERVICE WORKER ───────────────────────────────────────────
function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('sw.js').then(reg => {
    // New SW waiting → show update toast
    const promptUpdate = () => {
      const el = $('toast');
      el.textContent = t('sw.update');
      el.className = 'toast toast-update show';
      clearTimeout(el._t);
      // Drop any previous handler before re-binding so repeated updatefound
      // events never stack listeners on the same element.
      if (el._ut) el.removeEventListener('click', el._ut);
      el._ut = () => {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
          // Safety net: some browsers don't fire controllerchange reliably.
          setTimeout(() => window.location.reload(), 1500);
        } else {
          // No waiting worker (already activated): a reload picks up the new assets.
          window.location.reload();
        }
      };
      el.addEventListener('click', el._ut, { once: true });
    };

    if (reg.waiting) {
      promptUpdate();
    }

    reg.addEventListener('updatefound', () => {
      const newSW = reg.installing;
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          promptUpdate();
        }
      });
    });
  }).catch(err => console.warn('SW registration failed:', err));
}

// ─── START ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => { init(); registerSW(); });
