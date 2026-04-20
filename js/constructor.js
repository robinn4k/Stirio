import { fichas } from './fichas.js';
import { shuffle } from './utils.js';

// Generate questions: show ingredients → pick the cocktail name
// Works with both plain string names and multilingual {es,en,fr,pt,de} name objects
function buildQuestions() {
  const names = fichas.map(f => f.name); // keep object references

  return shuffle(fichas.map(f => {
    // Wrong options: 3 other name objects/strings (different references)
    const others = shuffle(names.filter(n => n !== f.name)).slice(0, 3);
    const answers = shuffle([f.name, ...others]);
    return {
      ingredients: f.ingredients,  // array of multilingual objects or strings
      glass: f.glass,               // multilingual object or string
      method: f.method,             // multilingual object or string
      correctName: f.name,          // multilingual object or string
      answers,                      // array of name objects/strings
      correctIndex: answers.indexOf(f.name), // reference equality
    };
  }));
}

let cs = null;

export function startConstructor() {
  const questions = buildQuestions();
  cs = { questions, index: 0, correct: 0, answered: 0, history: [] };
  return _payload();
}

function _payload() {
  const q = cs.questions[cs.index];
  return { ...q, index: cs.index, total: cs.questions.length, correct: cs.correct };
}

export function answerConstructor(selectedIndex) {
  if (!cs) return null;
  const q = cs.questions[cs.index];
  const ok = selectedIndex === q.correctIndex;
  if (ok) cs.correct++;
  cs.history.push({
    name: q.correctName,
    answers: q.answers,
    correctIndex: q.correctIndex,
    selectedIndex,
    correct: ok,
  });
  cs.answered++;
  cs.index++;
  const done = cs.index >= cs.questions.length;
  return {
    correct: ok,
    correctIndex: q.correctIndex,
    selectedIndex,
    done,
    result: done ? { correct: cs.correct, total: cs.questions.length, history: cs.history.slice() } : null,
    next: done ? null : _payload(),
  };
}

export function abortConstructor() { cs = null; }
