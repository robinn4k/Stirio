import { getDb, getCurrentUser, isFirebaseReady } from './auth.js';

const KEY = 'cq_achievements';

export const ALL = [
  { id: 'first_game',      icon: '🎯', title: 'Primera Partida',    desc: 'Completa tu primer quiz' },
  { id: 'perfect_quiz',    icon: '⭐', title: 'Quiz Perfecto',       desc: '10/10 en cualquier ronda de quiz' },
  { id: 'daily_first',     icon: '📅', title: 'Reto del Día',        desc: 'Completa el Reto Diario por primera vez' },
  { id: 'daily_perfect',   icon: '🏅', title: 'Día Perfecto',        desc: '10/10 en el Reto Diario' },
  { id: 'speed_20',        icon: '⚡', title: 'Velocista',           desc: 'Responde 20+ preguntas en Modo Velocidad' },
  { id: 'speed_30',        icon: '🚀', title: 'Supersónico',         desc: 'Responde 30+ preguntas en Modo Velocidad' },
  { id: 'streak_3',        icon: '🔥', title: 'En Racha',            desc: 'Mantén una racha de aprendizaje de 3 días' },
  { id: 'streak_7',        icon: '💥', title: 'Semana Perfecta',     desc: 'Mantén una racha de aprendizaje de 7 días' },
  { id: 'lessons_5',       icon: '📚', title: 'Estudiante',          desc: 'Completa 5 lecciones de aprendizaje' },
  { id: 'lessons_10',      icon: '🎓', title: 'Graduado',            desc: 'Completa 10 lecciones de aprendizaje' },
  { id: 'xp_500',          icon: '💫', title: 'Acumulador',          desc: 'Consigue 500 XP en Modo Aprendizaje' },
  { id: 'perfect_lesson',  icon: '❤️',  title: 'Sin Rasguños',        desc: 'Completa una lección sin perder ninguna vida' },
  { id: 'all_rounds',      icon: '🌍', title: 'Explorador',          desc: 'Juega todas las 10 rondas al menos una vez' },
  { id: 'fichas_reader',   icon: '📖', title: 'Estudioso',           desc: 'Abre 5 fichas de referencia distintas' },
];

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { unlocked: [], stats: {} }; }
  catch { return { unlocked: [], stats: {} }; }
}

function save(d) {
  localStorage.setItem(KEY, JSON.stringify(d));
  // Fire-and-forget cloud sync
  syncToCloud(d);
}

async function syncToCloud(data) {
  const user = getCurrentUser();
  if (!isFirebaseReady() || !user || user.isGuest) return;
  try {
    const db = getDb();
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    await setDoc(doc(db, 'users', user.uid), { achievements: data }, { merge: true });
  } catch (e) { console.warn('achievements cloud sync failed:', e); }
}

export async function loadAchievementsFromCloud() {
  const user = getCurrentUser();
  if (!isFirebaseReady() || !user || user.isGuest) return;
  try {
    const db = getDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists() && snap.data().achievements) {
      const cloud = snap.data().achievements;
      const local = load();
      // Merge: keep union of unlocked achievements and max of each stat
      const merged = {
        unlocked: [...new Set([...(local.unlocked || []), ...(cloud.unlocked || [])])],
        stats: { ...local.stats }
      };
      if (cloud.stats) {
        for (const [k, v] of Object.entries(cloud.stats)) {
          if (typeof v === 'number') {
            merged.stats[k] = Math.max(merged.stats[k] || 0, v);
          } else if (!(k in merged.stats)) {
            merged.stats[k] = v;
          }
        }
      }
      localStorage.setItem(KEY, JSON.stringify(merged));
      // Sync merged result back to cloud
      syncToCloud(merged);
    }
  } catch (e) { console.warn('achievements cloud load failed:', e); }
}

export function getAchievements() {
  const { unlocked } = load();
  return ALL.map(a => ({ ...a, unlocked: unlocked.includes(a.id) }));
}

export function getStats() { return load().stats || {}; }

export function updateStats(patch) {
  const d = load();
  d.stats = { ...d.stats, ...patch };
  save(d);
}

// Call after any game event. Returns array of newly unlocked achievements.
export function checkAchievements(statsPatch) {
  const d = load();
  d.stats = { ...d.stats, ...statsPatch };

  const s = d.stats;
  const map = {
    first_game:      (s.totalGames || 0) >= 1,
    perfect_quiz:    !!s.perfectQuiz,
    daily_first:     (s.dailyPlayed || 0) >= 1,
    daily_perfect:   !!s.dailyPerfect,
    speed_20:        (s.speedMax || 0) >= 20,
    speed_30:        (s.speedMax || 0) >= 30,
    streak_3:        (s.streak || 0) >= 3,
    streak_7:        (s.streak || 0) >= 7,
    lessons_5:       (s.lessonsCompleted || 0) >= 5,
    lessons_10:      (s.lessonsCompleted || 0) >= 10,
    xp_500:          (s.xp || 0) >= 500,
    perfect_lesson:  !!s.perfectLesson,
    all_rounds:      (s.roundsPlayed || 0) >= 10,
    fichas_reader:   (s.fichasOpened || 0) >= 5,
  };

  const newlyUnlocked = [];
  ALL.forEach(a => {
    if (!d.unlocked.includes(a.id) && map[a.id]) {
      d.unlocked.push(a.id);
      newlyUnlocked.push(a);
    }
  });

  save(d);
  return newlyUnlocked;
}
