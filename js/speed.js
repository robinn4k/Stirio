import { getLocalizedRounds } from './questions.js';
import { getLang } from './lang.js';
import { shuffle } from './utils.js';

const TOTAL_TIME = 60;
const PTS = 50;

let ss = null;

function allQuestions() {
  const q = shuffle(getLocalizedRounds(getLang()).flatMap(r => r.questions));
  return q.map(q => {
    const correct = q.a[0];
    const answers = shuffle(q.a);
    return { question: q.q, answers, correctIndex: answers.indexOf(correct) };
  });
}

export function startSpeed() {
  const questions = allQuestions();
  ss = { questions, index: 0, correct: 0, answered: 0, score: 0, timeLeft: TOTAL_TIME, timer: null, running: false };
  return _payload();
}

function _payload() {
  const q = ss.questions[ss.index];
  return { question: q.question, answers: q.answers, correctIndex: q.correctIndex, index: ss.index, total: ss.questions.length, timeLeft: ss.timeLeft, correct: ss.correct, score: ss.score };
}

export function startSpeedTimer(onTick, onEnd) {
  if (!ss) return;
  ss.running = true;
  ss.timer = setInterval(() => {
    ss.timeLeft--;
    onTick(ss.timeLeft);
    if (ss.timeLeft <= 0) {
      _stop();
      onEnd(_result());
    }
  }, 1000);
}

export function answerSpeed(selectedIndex) {
  if (!ss || !ss.running) return null;
  const q = ss.questions[ss.index];
  const ok = selectedIndex === q.correctIndex;
  if (ok) { ss.correct++; ss.score += PTS; }
  ss.answered++;
  ss.index++;
  // When pool exhausted, reshuffle for a fresh set (avoids immediate repetition)
  if (ss.index >= ss.questions.length) {
    ss.questions = allQuestions();
    ss.index = 0;
  }
  return { correct: ok, correctIndex: q.correctIndex, selectedIndex, next: _payload() };
}

export function abortSpeed() { _stop(); ss = null; }

function _stop() {
  if (ss?.timer) { clearInterval(ss.timer); ss.timer = null; }
  if (ss) ss.running = false;
}

function _result() {
  return { correct: ss.correct, answered: ss.answered, score: ss.score };
}

export function getSpeedResult() { return ss ? _result() : null; }
