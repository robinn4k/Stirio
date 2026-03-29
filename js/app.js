import { initFirebase, signInWithGoogle, signInAsGuest, signOutUser, restoreSession, getCurrentUser, updateGuestName } from './auth.js';
import { startRound, startCustomRound, answerQuestion, abortRound, getRounds } from './quiz.js';
import { saveScore, fetchLeaderboard, getUserStats } from './leaderboard.js';
import { getLearnStats, getLevelInfo, getLearnRounds, startLesson, answerLesson, advanceLesson, advanceFromTheory, abortLesson, MASTERY_LEVELS, getMasteryLevel } from './learn.js';
import { getDailyStatus, getDailyQuestions, saveDailyResult } from './daily.js';
import { startSpeed, startSpeedTimer, answerSpeed, abortSpeed } from './speed.js';
import { getAchievements, checkAchievements, updateStats, getStats } from './achievements.js';
import { fichas } from './fichas.js';
import { startConstructor, answerConstructor, abortConstructor } from './constructor.js';
import { startBlind, answerBlind, revealNextClue, abortBlind } from './blind.js';
import { getLang, setLang, t, translateHTML } from './lang.js';
import { loadAchievementsFromCloud } from './achievements.js';
import { loadLearnFromCloud } from './learn.js';
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
import { initWiki, bindWikiEvents } from './wiki.js';
import { isTelegram, initTelegram, getTelegramUser, hapticImpact, hapticNotification, hapticSelection, showBackButton, hideBackButton } from './telegram.js';

// ─── DOM helpers ─────────────────────────────────────────────
const $ = id => document.getElementById(id);
const showView = id => {
  setLoading(false); // always clear any pending loading spinner on navigation
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(id).classList.add('active');
  // Telegram: show/hide back button based on view
  if (isTelegram) {
    if (id === 'view-dashboard' || id === 'view-login') hideBackButton();
    else showBackButton();
  }
};
const setLoading = show => $('loading').classList.toggle('hidden', !show);
const toast = (msg, type = 'info') => {
  const el = $('toast');
  el.textContent = msg;
  el.className = `toast toast-${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
  // Telegram: haptic feedback on toasts
  if (isTelegram) {
    if (type === 'success') hapticNotification('success');
    else if (type === 'error') hapticNotification('error');
    else hapticImpact('light');
  }
};

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  setLoading(true);

  // Telegram Mini App: init early to apply theme and expand
  if (isTelegram) {
    document.body.classList.add('tg-app');
    initTelegram();
    // Auto-detect language from Telegram user
    const tgUser = getTelegramUser();
    if (tgUser?.languageCode) {
      const supported = ['es', 'en', 'fr', 'pt', 'de'];
      const tgLang = tgUser.languageCode.slice(0, 2);
      if (supported.includes(tgLang)) setLang(tgLang);
    }
  }

  document.documentElement.lang = getLang();
  translateHTML();
  updateLangToggle();
  await initFirebase();
  await initRivals();

  // Telegram: auto-login as guest with Telegram user name
  if (isTelegram && !getCurrentUser() && !restoreSession()) {
    const tgUser = getTelegramUser();
    const guestName = tgUser?.displayName || 'Telegram User';
    signInAsGuest();
    updateGuestName(guestName);
  }

  const user = getCurrentUser() || restoreSession();
  if (user) {
    await Promise.all([loadAchievementsFromCloud(), loadLearnFromCloud()]);
    await goToDashboard();
  } else {
    showView('view-login');
  }
  initWiki({ showView, t, toast });
  setLoading(false);
  bindEvents();

  // Telegram: handle back button events
  if (isTelegram) {
    window.addEventListener('telegram-back', () => {
      const active = document.querySelector('.view.active');
      if (!active) return;
      const id = active.id;
      // Navigate back based on current view
      if (id === 'view-dashboard') {
        window.Telegram.WebApp.close();
      } else {
        // Click the back button in the current view's header
        const backBtn = active.querySelector('.icon-btn:first-child');
        if (backBtn) backBtn.click();
        else goToDashboard();
      }
    });
  }

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
    goToDashboard();
  }
}

// ─── LOGIN VIEW ───────────────────────────────────────────────
function bindLoginEvents() {
  $('btn-google-login').addEventListener('click', async () => {
    setLoading(true);
    try {
      // signInWithGoogle() calls signInWithRedirect() — the page will navigate
      // away to Google. The result is handled by getRedirectResult() in initFirebase()
      // when the app loads again after the redirect.
      await signInWithGoogle();
      // If we reach here the redirect has not fired yet (e.g. unsupported browser
      // fallback) — keep the spinner; the page will reload anyway.
    } catch (e) {
      const msg = e?.code === 'auth/unauthorized-domain'
        ? t('error.unauthorized_domain')
        : t('error.google_signin');
      toast(msg, 'error');
      setLoading(false);
    }
  });

  $('btn-guest-login').addEventListener('click', () => {
    signInAsGuest();
    goToDashboard();
  });
}

// ─── DASHBOARD ────────────────────────────────────────────────
async function goToDashboard() {
  const user = getCurrentUser();
  if (!user) { showView('view-login'); return; }

  // Header user info
  $('user-name').textContent = user.name;
  $('user-avatar').textContent = user.isGuest ? '👤' : '🍸';

  // Load stats
  const stats = await getUserStats();
  const games = stats?.games || 0;
  const best = stats?.best || 0;
  const avg = games > 0 ? Math.round((stats?.total || 0) / games) : 0;
  const completedRounds = stats?.rounds ? Object.keys(stats.rounds).length : 0;

  $('stat-games').textContent = games;
  $('stat-best').textContent = best;
  $('stat-avg').textContent = avg;
  if ($('stat-rounds')) $('stat-rounds').textContent = completedRounds;
  $('user-best').textContent = t('dashboard.best', { n: best });

  // Update learn banner streak
  const { streak } = getLearnStats();
  $('banner-streak').textContent = `🔥 ${streak}`;

  // Daily challenge badge
  const dailyStatus = getDailyStatus();
  const dailyBadge = $('qm-daily-badge');
  if (dailyStatus.played) {
    dailyBadge.textContent = '✓';
    dailyBadge.classList.add('show');
    dailyBadge.style.background = 'var(--green)';
  } else {
    dailyBadge.classList.remove('show');
  }

  // Achievement badge (unlocked count)
  const achList = getAchievements();
  const achUnlocked = achList.filter(a => a.unlocked).length;
  const achBadge = $('qm-ach-badge');
  achBadge.textContent = achUnlocked;
  achBadge.classList.toggle('show', achUnlocked > 0);
  achBadge.style.background = 'var(--gold)';
  achBadge.style.color = '#0d0508';

  // Render round cards
  renderRoundCards(stats);
  translateHTML();
  updateLangToggle();
  showView('view-dashboard');
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

function goToFichas() {
  showView('view-fichas');
  translateHTML();
  renderFichasGrid(fichas);
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
function goToLearnHub() {
  const { xp, streak } = getLearnStats();
  const lvl = getLevelInfo(xp);

  $('learn-streak-val').textContent = streak;
  $('learn-xp-val').textContent = xp;
  $('learn-level-badge').textContent = t('learn.level', { n: lvl.level });
  $('learn-xp-fill').style.width = `${lvl.pct}%`;
  $('learn-xp-text').textContent = lvl.maxLevel ? t('learn.max_level') : `${lvl.cur} / ${lvl.need} XP`;

  const container = $('learn-lessons');
  container.innerHTML = '';
  getLearnRounds().forEach(r => {
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
    card.addEventListener('click', () => beginLesson(r.id));
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

  showView('view-lesson-result');
  translateHTML();
}

// ─── LEADERBOARD ─────────────────────────────────────────────
let currentFilter = null;

async function goToLeaderboard(fromView) {
  $('btn-back-leaderboard').dataset.from = fromView || 'view-dashboard';
  setLoading(true);
  await renderLeaderboard(null);
  buildLeaderboardFilters();
  showView('view-leaderboard');
  translateHTML();
  setLoading(false);
}

function buildLeaderboardFilters() {
  const bar = $('leaderboard-filters');
  bar.innerHTML = `<button class="filter-btn active" data-filter="all">${t('leaderboard.all')}</button>`;
  const rounds = getRounds();
  rounds.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = r.id;
    btn.textContent = r.icon + ' ' + t(r.title);
    bar.appendChild(btn);
  });
  bar.addEventListener('click', async e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter === 'all' ? null : parseInt(btn.dataset.filter);
    currentFilter = filter;
    setLoading(true);
    await renderLeaderboard(filter);
    setLoading(false);
  });
}

async function renderLeaderboard(roundId) {
  const scores = await fetchLeaderboard(roundId);
  const user = getCurrentUser();
  const list = $('leaderboard-list');
  list.innerHTML = '';

  if (scores.length === 0) {
    list.innerHTML = `<div class="leaderboard-empty">${t('leaderboard.empty')}</div>`;
    return;
  }

  scores.forEach((entry, i) => {
    const isMe = user && entry.uid === user.uid;
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    const dateLang = getLang() === 'en' ? 'en-US' : 'es-ES';
    const date = new Date(entry.date).toLocaleDateString(dateLang, { day: '2-digit', month: 'short' });
    const item = document.createElement('div');
    item.className = 'leaderboard-entry' + (isMe ? ' leaderboard-me' : '');
    item.innerHTML = `
      <div class="lb-rank">${medal}</div>
      <div class="lb-info">
        <div class="lb-name">${entry.name}${isMe ? ` <span class="lb-you">${t('leaderboard.you')}</span>` : ''}</div>
        <div class="lb-meta">${entry.roundTitle} · ${date}</div>
      </div>
      <div class="lb-score">${entry.score} pts</div>
    `;
    list.appendChild(item);
  });
}

// ─── EVENT BINDING ────────────────────────────────────────────
function bindEvents() {
  bindLoginEvents();
  bindWikiEvents();

  // Language toggle
  $('btn-lang-toggle').addEventListener('click', toggleLanguage);

  // Dashboard header
  $('btn-leaderboard-header').addEventListener('click', () => goToLeaderboard('view-dashboard'));
  $('btn-logout').addEventListener('click', async () => {
    const user = getCurrentUser();
    if (user?.isGuest) {
      showView('view-login');
      return;
    }
    if (confirm(t('confirm.sign_out'))) {
      await signOutUser();
      showView('view-login');
    }
  });

  // Quiz controls
  $('btn-quit-quiz').addEventListener('click', () => {
    if (confirm(t('confirm.quit_game'))) {
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

  // Speed mode
  $('btn-quit-speed').addEventListener('click', () => { if (confirm(t('confirm.quit'))) { abortSpeed(); goToDashboard(); } });

  // Constructor mode
  $('btn-quit-constructor').addEventListener('click', () => { if (confirm(t('confirm.quit'))) { abortConstructor(); goToDashboard(); } });
  $('btn-con-continue').addEventListener('click', handleConstructorContinue);

  // Blind tasting
  $('btn-quit-blind').addEventListener('click', () => { if (confirm(t('confirm.quit'))) { abortBlind(); goToDashboard(); } });
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
    const q = e.target.value.toLowerCase();
    renderFichasGrid(fichas.filter(f => t(f.name).toLowerCase().includes(q) || t(f.category).toLowerCase().includes(q)));
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
  $('btn-go-learn').addEventListener('click', () => goToLearnHub());
  $('btn-back-learn').addEventListener('click', () => goToDashboard());
  $('btn-quit-lesson').addEventListener('click', () => {
    if (confirm(t('confirm.quit_lesson'))) { abortLesson(); goToLearnHub(); }
  });
  $('btn-lesson-theory-continue').addEventListener('click', () => handleTheoryContinue());
  $('btn-lesson-continue').addEventListener('click', () => handleLessonContinue());
  $('btn-lr-retry').addEventListener('click', () => beginLesson(currentLessonRoundId));
  $('btn-lr-continue').addEventListener('click', () => {
    const rounds = getLearnRounds();
    const idx = rounds.findIndex(r => r.id === currentLessonRoundId);
    const next = rounds[idx + 1];
    if (next) beginLesson(next.id); else goToLearnHub();
  });
  $('btn-lr-home').addEventListener('click', () => goToLearnHub());

  // Leaderboard back
  $('btn-back-leaderboard').addEventListener('click', () => {
    const from = $('btn-back-leaderboard').dataset.from || 'view-dashboard';
    if (from === 'view-results') showView('view-results');
    else goToDashboard();
  });

  bindDuelEvents();
}

// ══════════════════════════════════════════════════════════════
// ─── RIVALS / DUEL MODE ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════

let duelState = {
  roomId: null,
  slot: null,        // 'p1' | 'p2'
  myUid: null,
  myName: null,
  mode: null,        // 'friend-host' | 'friend-join' | 'random'
  code: null,
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
    mode: null, code: null, questions: [], currentQ: 0, score: 0,
    timer: null, timeLeft: 20, answered: false, gameStarted: false,
    unsubRoom: null, unsubLobby: null, unsubOnline: null, unsubMatch: null, matchTimeout: null,
  };
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
    setLoading(true);
    try {
      const { roomId, code } = await withTimeout(createFriendRoom(duelState.myUid, duelState.myName, setup), 10_000);
      if (!duelState.myUid) { setLoading(false); return; } // user navigated away
      duelState.roomId = roomId;
      duelState.slot = 'p1';
      duelState.code = code;

      // Only transition to lobby after successful room creation
      showView('view-duel-lobby');
      showLobbySection('friend-host');
      $('lobby-p1-name').textContent = duelState.myName;
      $('lobby-p2-name').textContent = t('duel.waiting_opponent');
      $('lobby-p2-avatar').textContent = '❓';
      $('lobby-p2-name').closest('.lobby-player-slot').classList.remove('joined');
      $('btn-start-duel').classList.add('hidden');
      $('lobby-code-display').textContent = code;
      setLoading(false);

      await registerPlayerDisconnect(roomId, 'p1');
      duelState.unsubRoom = await listenRoom(roomId, room => {
        if (!room) return;
        const p2 = room.players?.p2;
        if (p2 && !p2.disconnected) {
          $('lobby-p2-name').textContent = p2.name;
          $('lobby-p2-avatar').textContent = '👤';
          $('lobby-p2-name').closest('.lobby-player-slot').classList.add('joined');
          $('btn-start-duel').classList.remove('hidden');
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
    showView('view-duel-lobby');
    showLobbySection('friend-join');
    $('lobby-p1-name').textContent = t('duel.waiting_opponent');
    $('lobby-p2-name').textContent = duelState.myName;
    $('lobby-p2-avatar').textContent = '❓';
    $('lobby-p2-name').closest('.lobby-player-slot').classList.remove('joined');
    $('btn-start-duel').classList.add('hidden');

  } else if (mode === 'random') {
    setLoading(true);
    try {
      const result = await withTimeout(joinQueue(duelState.myUid, duelState.myName, setup), 10_000);
      if (!duelState.myUid) { setLoading(false); return; } // user navigated away

      // Only transition to lobby after successful queue join
      showView('view-duel-lobby');
      showLobbySection('random');
      $('lobby-p1-name').textContent = duelState.myName;
      $('lobby-p2-name').textContent = t('duel.waiting_opponent');
      $('lobby-p2-avatar').textContent = '❓';
      $('lobby-p2-name').closest('.lobby-player-slot').classList.remove('joined');
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
  const p1 = room.players?.p1;
  const p2 = room.players?.p2;
  const opponentData = duelState.slot === 'p1' ? p2 : p1;
  const lobbyEl = $('lobby-p2-name');
  if (opponentData && !opponentData.disconnected && lobbyEl) {
    lobbyEl.textContent = opponentData.name;
    $('lobby-p2-avatar').textContent = '👤';
    const rivalSlot = lobbyEl.closest('.lobby-player-slot');
    if (rivalSlot) rivalSlot.classList.add('joined');
  }
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
    if (result === 'self') { toast(t('duel.invalid_code'), 'error'); return; }

    duelState.roomId = result;
    duelState.slot = 'p2';
    $('lobby-code-input').value = '';

    await registerPlayerDisconnect(result, 'p2');

    // P2 joined — hide the code input and show the waiting-for-host state.
    // Passing an unknown mode to showLobbySection hides all three sections so
    // only the player slots remain visible. This prevents P2 from thinking the
    // join failed (if the input were still shown) and navigating back.
    showLobbySection('p2-waiting');
    $('lobby-p2-name').textContent = duelState.myName;
    $('lobby-p2-avatar').textContent = '👤';
    $('lobby-p2-name').closest('.lobby-player-slot').classList.add('joined');

    duelState.unsubRoom = await listenRoom(result, room => {
      if (!room) return;
      const p1 = room.players?.p1;
      if (p1) {
        $('lobby-p2-name').textContent = duelState.myName;
        $('lobby-p1-name').textContent = p1.name;
      }
      if (p1?.disconnected) {
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

  // Reconstruct questions locally in the player's own language
  if (roomData?.setup) {
    duelState.questions = loadDuelQuestionsFromSetup(roomData.setup);
  }

  // Set opponent name from room data
  const opponentSlot = duelState.slot === 'p1' ? 'p2' : 'p1';
  const opp = roomData?.players?.[opponentSlot];
  if (opp) $('duel-rival-name').textContent = opp.name || t('duel.waiting_opponent');

  // Subscribe to live score updates
  let resultShown = false;
  listenRoom(duelState.roomId, room => {
    if (!room || resultShown) return;

    const oppNow = room.players?.[opponentSlot];
    if (oppNow) {
      $('duel-rival-score').textContent = oppNow.score || 0;
      if (oppNow.disconnected) {
        resultShown = true;
        toast(t('duel.rival_left'), 'error');
        stopDuelTimer();
        finishGame(duelState.roomId).catch(() => {});
        showDuelResult(duelState.score, oppNow.score || 0, oppNow.name || '?');
        return;
      }
    }

    const me = room.players?.[duelState.slot];
    // Use Firebase me.currentQ as fallback: when the opponent finishes first and sets
    // status='finished', our local duelState.currentQ may not yet be incremented
    // (the 1.2s setTimeout hasn't fired), but Firebase already has our last answer.
    const myProgress = Math.max(duelState.currentQ, me?.currentQ || 0);
    const myFinished = myProgress >= QUESTIONS_PER_DUEL;
    // Wait for the opponent's final answer to be synced before reading their score.
    // Without this check, if we finish first we'd show the result immediately with
    // the opponent's partial score (e.g. 485 instead of their eventual 885).
    const oppFinished = (oppNow?.currentQ || 0) >= QUESTIONS_PER_DUEL;
    if (room.status === 'finished' && me && myFinished && oppFinished) {
      resultShown = true;
      const myScore = Math.max(duelState.score, me.score || 0);
      const oppScore = oppNow?.score || 0;
      const oppName = oppNow?.name || t('duel.waiting_opponent');
      stopDuelTimer();
      showDuelResult(myScore, oppScore, oppName);
    }
  }).then(unsub => { duelState.unsubRoom = unsub; });

  showView('view-duel-game');
  $('duel-me-name').textContent = duelState.myName;
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

  // Timer display
  $('duel-timer-num').textContent = duelState.timeLeft;
  $('duel-timer-num').classList.remove('urgent');

  // Question text
  $('duel-question').textContent = typeof q.question === 'object'
    ? (q.question[getLang()] ?? q.question.en ?? q.question.es ?? '')
    : q.question;

  // Answers
  const grid = $('duel-answers');
  grid.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    const ansText = typeof ans === 'object' ? (ans[getLang()] ?? ans.en ?? ans.es ?? '') : ans;
    btn.innerHTML = `<span class="answer-letter">${labels[i]}</span><span class="answer-text">${ansText}</span>`;
    btn.addEventListener('click', () => handleDuelAnswer(i));
    grid.appendChild(btn);
  });

  // Score display
  $('duel-me-score').textContent = duelState.score;

  startDuelTimer();
}

function startDuelTimer() {
  stopDuelTimer();
  duelState.timer = setInterval(() => {
    duelState.timeLeft--;
    $('duel-timer-num').textContent = duelState.timeLeft;
    if (duelState.timeLeft <= 5) $('duel-timer-num').classList.add('urgent');
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
  $('duel-me-score').textContent = duelState.score;
  const scoreEl = $('duel-me-score');
  scoreEl.classList.add('bump');
  setTimeout(() => scoreEl.classList.remove('bump'), 200);

  // Sync to Firebase
  rtdbSubmitAnswer(duelState.roomId, duelState.slot, duelState.currentQ, correct, duelState.timeLeft, duelState.score)
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

  rtdbSubmitAnswer(duelState.roomId, duelState.slot, duelState.currentQ, false, 0, duelState.score)
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

function showDuelResult(myScore, oppScore, oppName) {
  if (typeof duelState.unsubRoom === 'function') duelState.unsubRoom();

  let icon, title;
  if (myScore > oppScore) { icon = '🏆'; title = t('duel.victory'); }
  else if (myScore < oppScore) { icon = '😔'; title = t('duel.defeat'); }
  else { icon = '🤝'; title = t('duel.tie'); }

  $('duel-result-icon').textContent = icon;
  $('duel-result-title').textContent = title;

  $('duel-final-me-label').textContent = duelState.myName;
  $('duel-final-me-score').textContent = myScore + ' pts';
  $('duel-final-rival-label').textContent = oppName;
  $('duel-final-rival-score').textContent = oppScore + ' pts';

  // Highlight winner
  $('duel-final-me').classList.toggle('winner', myScore >= oppScore && myScore > 0);
  $('duel-final-rival').classList.toggle('winner', oppScore > myScore);

  showView('view-duel-result');
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
  $('btn-duel-home').addEventListener('click', () => {
    resetBotDuelState();
    resetDuelState();
    goToDashboard();
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

  // Question text — use lang captured at game-start to match question data
  const lang = botDuelState.lang || getLang();
  $('duel-question').textContent = typeof q.question === 'object'
    ? (q.question[lang] ?? q.question.en ?? q.question.es ?? '')
    : q.question;

  // Answer buttons — wired to bot handler
  const grid = $('duel-answers');
  grid.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    const ansText = typeof ans === 'object' ? (ans[lang] ?? ans.en ?? ans.es ?? '') : ans;
    btn.innerHTML = `<span class="answer-letter">${labels[i]}</span><span class="answer-text">${ansText}</span>`;
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
      el._ut = () => {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
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
