// Stirio data + helpers
// Shared via window to be accessible across Babel script files

const LESSONS = [
  {
    id: 'negroni',
    category: 'Cocktails',
    title: 'The Negroni Triangle',
    subtitle: '60 seconds · Equal parts, unequal legend',
    emoji: '🍊',
    accent: 'amber',
    xp: 60,
    difficulty: 'Classic',
    game: 'ratio',
    steps: [
      {
        kind: 'intro',
        title: 'The Negroni',
        body: 'Three spirits. Three equal parts. One of the most balanced cocktails ever invented — and the easiest to mess up if you can\'t name the trio.',
        fact: 'Count Camillo Negroni asked his bartender to strengthen his Americano in 1919. The swap heard round the world.'
      },
      {
        kind: 'multi',
        prompt: 'Pick the three ingredients that make a classic Negroni.',
        options: ['Gin', 'Campari', 'Sweet Vermouth', 'Tequila', 'Lime Juice', 'Absinthe'],
        correct: ['Gin', 'Campari', 'Sweet Vermouth'],
        hint: 'One botanical, one bitter, one fortified.'
      },
      {
        kind: 'ratio',
        prompt: 'Set the ratio. Equal-parts is the whole point.',
        targets: { Gin: 30, Campari: 30, 'Sweet Vermouth': 30 },
        tolerance: 4,
      },
      {
        kind: 'choice',
        prompt: 'Garnish?',
        options: ['Orange peel, expressed', 'Lime wedge', 'Mint sprig', 'Olive'],
        correct: 0,
        explain: 'A flamed orange twist — you want the citrus oils, not the flesh.'
      },
    ],
  },
  {
    id: 'chord',
    category: 'Music',
    title: 'Hear the Chord',
    subtitle: '60 seconds · Train your ear',
    emoji: '🎹',
    accent: 'cyan',
    xp: 50,
    difficulty: 'Beginner',
    game: 'audio',
    steps: [
      {
        kind: 'intro',
        title: 'Major vs Minor',
        body: 'The difference between happy and sad is one note — the third. Train your ear to spot it in under a second.',
        fact: 'A major third is 4 semitones above the root. A minor third is 3. That\'s the whole story.'
      },
      {
        kind: 'earTrain',
        prompt: 'Listen. Is this chord major or minor?',
        chord: 'major',
      },
      {
        kind: 'earTrain',
        prompt: 'Again. Major or minor?',
        chord: 'minor',
      },
      {
        kind: 'choice',
        prompt: 'Which of these songs famously opens on a minor chord?',
        options: ['Stairway to Heaven', 'Here Comes the Sun', 'Happy Birthday', 'Twinkle Twinkle'],
        correct: 0,
        explain: 'That A-minor arpeggio is one of the most famous openings in rock.'
      },
    ],
  },
  {
    id: 'hemingway',
    category: 'Writing',
    title: 'Hemingway Cuts',
    subtitle: '60 seconds · Murder your darlings',
    emoji: '✒️',
    accent: 'violet',
    xp: 55,
    difficulty: 'Intermediate',
    game: 'edit',
    steps: [
      {
        kind: 'intro',
        title: 'Less is More',
        body: 'Great writing is rewriting. Your job: strip a sentence to the bone without losing the meaning.',
      },
      {
        kind: 'cutWords',
        prompt: 'Tap the words that need to go.',
        sentence: 'In my own personal opinion, I actually really think that we should probably just go ahead and begin.',
        kill: ['own', 'personal', 'actually', 'really', 'probably', 'just', 'ahead', 'and'],
      },
      {
        kind: 'choice',
        prompt: 'Which opening hooks hardest?',
        options: [
          'It was a bright cold day in April, and the clocks were striking thirteen.',
          'The weather on that particular day in April was quite cold and bright, and curiously, every clock in the area was striking thirteen for some reason.',
          'Something happened in April that was strange.',
          'April. Clocks. Thirteen.',
        ],
        correct: 0,
        explain: 'Orwell\'s opener. Concrete, specific, and the last word flips reality.'
      },
    ],
  },
  {
    id: 'color',
    category: 'Art',
    title: 'Color Theory Sprint',
    subtitle: '60 seconds · Complements & chaos',
    emoji: '🎨',
    accent: 'berry',
    xp: 45,
    difficulty: 'Beginner',
    game: 'color',
    steps: [
      {
        kind: 'intro',
        title: 'The Wheel',
        body: 'Complementary colors sit across the wheel. Analogous colors sit beside each other. Triadic forms an equilateral triangle.',
      },
      {
        kind: 'colorMatch',
        prompt: 'Tap the complement of this color.',
        base: 'oklch(0.7 0.2 30)', // warm red
        options: ['oklch(0.7 0.18 210)', 'oklch(0.8 0.15 100)', 'oklch(0.6 0.2 320)', 'oklch(0.5 0.05 0)'],
        correct: 0,
      },
      {
        kind: 'choice',
        prompt: 'Which word describes a palette of oranges and reds?',
        options: ['Analogous', 'Complementary', 'Triadic', 'Monochrome'],
        correct: 0,
      },
    ],
  },
  {
    id: 'espresso',
    category: 'Cocktails',
    title: 'Espresso Martini Shake',
    subtitle: '60 seconds · Crema or nothing',
    emoji: '☕',
    accent: 'lime',
    xp: 50,
    difficulty: 'Intermediate',
    game: 'timing',
    steps: [
      {
        kind: 'intro',
        title: 'The Crema',
        body: 'The Espresso Martini\'s signature foam comes from one thing: shaking hard, cold, and long enough to emulsify the coffee oils.',
      },
      {
        kind: 'timing',
        prompt: 'Tap when the shake hits peak foam (aim for 12 seconds).',
        target: 12,
        tolerance: 2,
      },
      {
        kind: 'multi',
        prompt: 'Which three go in the shaker?',
        options: ['Vodka', 'Espresso', 'Coffee Liqueur', 'Cream', 'Cola', 'Simple Syrup'],
        correct: ['Vodka', 'Espresso', 'Coffee Liqueur'],
      },
      {
        kind: 'choice',
        prompt: 'Garnish?',
        options: ['3 coffee beans', 'Lemon twist', 'Cinnamon stick', 'Nothing'],
        correct: 0,
        explain: 'Three beans: health, happiness, prosperity. One bean if you\'re cynical.'
      },
    ],
  },
];

const ACHIEVEMENTS = [
  { id: 'first', label: 'First Sip', icon: '🍸', desc: 'Finish your first lesson', earned: true },
  { id: 'streak3', label: '3-Day Streak', icon: '🔥', desc: 'Three days in a row', earned: true },
  { id: 'perfect', label: 'Perfect Round', icon: '💎', desc: 'A flawless 60 seconds', earned: true },
  { id: 'mixer', label: 'Polymath', icon: '🧩', desc: 'Lesson in every category', earned: false },
  { id: 'speed', label: 'Fast Pour', icon: '⚡', desc: 'Finish under 45s', earned: false },
  { id: 'night', label: 'Night Owl', icon: '🌙', desc: 'Lesson after midnight', earned: true },
  { id: 'century', label: 'Centurion', icon: '💯', desc: '100 correct in a row', earned: false },
  { id: 'connoisseur', label: 'Connoisseur', icon: '👑', desc: 'Master 10 topics', earned: false },
];

const LEADERBOARD = [
  { name: 'mira_k', xp: 12840, country: '🇪🇸', badge: '👑' },
  { name: 'nocturne', xp: 11202, country: '🇯🇵', badge: '🌙' },
  { name: 'basil.drop', xp: 10988, country: '🇫🇷', badge: '🌿' },
  { name: 'you', xp: 9420, country: '🌍', badge: '🔥', self: true },
  { name: 'vermouth_vic', xp: 9011, country: '🇮🇹', badge: '🍸' },
  { name: 'tenor.clef', xp: 8720, country: '🇬🇧', badge: '🎹' },
  { name: 'pigment', xp: 8455, country: '🇳🇱', badge: '🎨' },
];

const CATEGORIES = [
  { id: 'cocktails', name: 'Cocktails', emoji: '🍸', count: 42, color: 'amber' },
  { id: 'music', name: 'Music', emoji: '🎹', count: 28, color: 'cyan' },
  { id: 'writing', name: 'Writing', emoji: '✒️', count: 24, color: 'violet' },
  { id: 'art', name: 'Art & Design', emoji: '🎨', count: 31, color: 'berry' },
];

// ═══════════════ BRIDGE con datos reales del repo ═══════════════
// repo-data.js expone window.StirioRepo con: IBA_UNFORGETTABLES, IBA_CONTEMPORARY,
// IBA_NEW_ERA, DIFFORDS_COCKTAILS, ROUNDS_ES (las 24 rondas de trivia en español).

const repo = window.StirioRepo || {};

// Todas las fichas combinadas (~90 IBA + ~90 Difford's = ~180)
const ALL_FICHAS = [
  ...(repo.IBA_UNFORGETTABLES || []),
  ...(repo.IBA_CONTEMPORARY || []),
  ...(repo.IBA_NEW_ERA || []),
  ...(repo.DIFFORDS_COCKTAILS || []),
];

// Los archivos IBA no llevan `family`; los asignamos a partir del método/vaso para la Academia
const familyFromFicha = (f) => {
  if (f.family) return f.family;
  const name = (f.name || '').toLowerCase();
  const method = (f.method || '').toLowerCase();
  const glass = (f.glass || '').toLowerCase();
  if (name.includes('sour') || name.includes('fizz') || name.includes('daiquiri') || name.includes('margarita') || name.includes('sidecar') || name.includes('white lady') || name.includes('aviation') || name.includes('clover')) return 'Sour';
  if (glass.includes('highball') || glass.includes('collins') || glass.includes('tumbler')) return 'Highball';
  if (name.includes('martini') || name.includes('manhattan') || name.includes('negroni') || name.includes('boulevardier') || name.includes('rob roy') || name.includes('martinez') || method.includes('remov')) return 'Stirred';
  if (name.includes('tiki') || name.includes('zombie') || name.includes('mai tai') || name.includes('jungle') || name.includes('painkiller') || name.includes('navy grog')) return 'Tiki';
  if (name.includes('old fashioned') || name.includes('sazerac') || name.includes('rusty') || name.includes('vieux') || name.includes('stinger')) return 'Old-school';
  return 'Mixed';
};
ALL_FICHAS.forEach(f => { f._family = familyFromFicha(f); });

// Academy: 6 familias → curamos fichas de ALL_FICHAS
const ACADEMY_FAMILIES = [
  { id: 'highball',  title: 'Highball',    subtitle: 'Largos, refrescantes, efervescentes', icon: '🫧', color: 'oklch(0.72 0.15 200)', match: 'Highball' },
  { id: 'sour',      title: 'Sours',       subtitle: 'Destilado, cítrico y dulce',          icon: '🍋', color: 'oklch(0.82 0.17 90)',  match: 'Sour' },
  { id: 'stirred',   title: 'Martini & Manhattan', subtitle: 'Removidos, elegantes, espirituosos', icon: '🍸', color: 'oklch(0.75 0.14 310)', match: 'Stirred' },
  { id: 'oldschool', title: 'Old‑school',  subtitle: 'Whisky, azúcar, bitters — el canon',   icon: '🥃', color: 'oklch(0.65 0.15 45)',  match: 'Old-school' },
  { id: 'tiki',      title: 'Tiki',        subtitle: 'Ron, frutas, exuberancia',            icon: '🌴', color: 'oklch(0.75 0.18 25)',  match: 'Tiki' },
  { id: 'mixed',     title: 'Mixtos',      subtitle: 'Contemporáneos y experimentales',     icon: '🧪', color: 'oklch(0.72 0.14 170)', match: 'Mixed' },
];
ACADEMY_FAMILIES.forEach(fam => {
  fam.fichas = ALL_FICHAS.filter(f => f._family === fam.match);
});

// Rondas de trivia (las 24 ES reales del repo)
const TRIVIA_ROUNDS = repo.ROUNDS_ES || [];
// Cada pregunta viene como {q, a:[correct, ...distractors], exp}. La opción correcta es siempre a[0].
const normalizeQ = (raw) => {
  const opts = raw.a.slice();
  const correct = opts[0];
  // barajar
  const shuffled = opts.slice().sort(() => Math.random() - 0.5);
  return {
    kind: 'choice',
    prompt: raw.q,
    options: shuffled,
    correct: shuffled.indexOf(correct),
    explain: raw.exp,
  };
};

// Helper para traducir con interpolación dentro de data.js
const _tp = (k, params, fallback) => {
  if (window.stLang && window.stLang.t) return window.stLang.t(k, params);
  return fallback;
};

// Construye una "lección" a partir de una ronda del repo
const buildLessonFromRound = (round) => ({
  id: 'round-' + round.id,
  category: 'Cocktails',
  title: round.title,
  subtitle: _tp('round.subtitle_fmt', { subtitle: round.subtitle, count: round.questions.length }, `${round.subtitle} · ${round.questions.length} preguntas`),
  emoji: round.icon,
  accent: 'amber',
  xp: round.questions.length * 10,
  difficulty: 'Classic',
  game: 'quiz',
  _roundColor: round.color,
  steps: [
    {
      kind: 'intro',
      title: round.title,
      body: round.subtitle,
      fact: _tp('round.intro_fact', { count: round.questions.length, total: TRIVIA_ROUNDS.length }, `${round.questions.length} preguntas seleccionadas de ${TRIVIA_ROUNDS.length} rondas de trivia oficial.`),
    },
    ...round.questions.map(normalizeQ),
  ],
});

// Reto Diario: usa el MISMO algoritmo que js/daily.js (todaySeed = YYYYMMDD UTC,
// xor-shift PRNG, Fisher-Yates) — así React y el módulo legacy generan
// exactamente la misma pregunta del día.
const todaySeed = () => {
  const d = new Date();
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
};
const seededRng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };
};
const pickDailyQuestions = (n = 10) => {
  // Prefer localized rounds (language-aware) when js/questions.js está cargado
  const rounds = (window.stQuestions && window.stQuestions.getLocalizedRounds)
    ? window.stQuestions.getLocalizedRounds((window.stLang && window.stLang.getLang && window.stLang.getLang()) || 'es')
    : TRIVIA_ROUNDS;
  const allQ = rounds.flatMap(r => r.questions.map(q => ({ ...q, _round: r.title, _color: r.color })));
  if (!allQ.length) return [];
  const rng = seededRng(todaySeed());
  const pool = allQ.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
};
const DAILY_LESSON = () => {
  const qs = pickDailyQuestions(10);
  const lang = (window.stLang && window.stLang.getLang && window.stLang.getLang()) || 'es';
  const localeMap = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', pt: 'pt-PT', de: 'de-DE' };
  const dateStr = new Date().toLocaleDateString(localeMap[lang] || 'es-ES', { day: 'numeric', month: 'long' });
  const title = _tp('daily.card_title', {}, 'Reto Diario');
  return {
    id: 'daily-' + todaySeed(),
    category: 'Daily',
    title,
    subtitle: _tp('daily.card_subtitle', { date: dateStr }, `10 preguntas · ${dateStr}`),
    emoji: '📅',
    accent: 'amber',
    xp: 150,
    difficulty: 'Mix',
    game: 'quiz',
    steps: [
      {
        kind: 'intro',
        title,
        body: _tp('daily.card_body', {}, 'Diez preguntas elegidas al azar de las 24 rondas oficiales. Se renueva a medianoche.'),
        fact: _tp('daily.card_fact', {}, 'Mismo reto para todos los jugadores del día.'),
      },
      ...qs.map(normalizeQ),
    ],
  };
};

// Velocidad 60s: preguntas aleatorias infinitas
const SPEED_LESSON = () => {
  const allQ = TRIVIA_ROUNDS.flatMap(r => r.questions);
  const shuffled = allQ.sort(() => Math.random() - 0.5).slice(0, 30);
  return {
    id: 'speed-' + Date.now(),
    category: 'Speed',
    title: _tp('speed.card_title', {}, 'Velocidad'),
    subtitle: _tp('speed.card_subtitle', {}, 'Cuantas más aciertes en 60s, más XP'),
    emoji: '⚡',
    accent: 'amber',
    xp: 200,
    difficulty: 'Fast',
    game: 'quiz',
    _timed: 60,
    steps: [
      {
        kind: 'intro',
        title: _tp('speed.card_title', {}, 'Velocidad'),
        body: _tp('speed.card_body', {}, 'El reloj corre. Cada acierto suma. Cada fallo no resta pero cuesta tiempo.'),
      },
      ...shuffled.map(normalizeQ),
    ],
  };
};

// ── Academy: puente a js/academy_data.js (6 niveles con lecciones reales) ──
// window.stAcademyData se carga de forma asíncrona via import dinámico en index.html.
// Exponemos getter dinámico para que, cuando esté disponible, la UI ya use los
// niveles reales (6 niveles × 3-4 lecciones × 3 preguntas cada una + practice rondas).
const getAcademyLevels = () => (window.stAcademyData && window.stAcademyData.ACADEMY_LEVELS) || [];

// Traduce una key i18n usando lang.js si está cargado; si no, devuelve la key.
const _t = (key, fallback) => {
  if (!key) return fallback || '';
  if (window.stLang && window.stLang.t) return window.stLang.t(key);
  return fallback || key;
};

// Construye el payload de LessonPlayer para una lección de Academia.
// Convierte las "cards" (theory/tip/note/example) en steps 'intro' y las
// preguntas i18n en steps 'choice'.
const buildAcademyLesson = (level, lessonIdx) => {
  const lesson = level.lessons[lessonIdx];
  if (!lesson) return null;
  const cardTitle = {
    theory: _tp('lesson.card_theory', {}, '📖 Teoría'),
    tip: _tp('lesson.card_tip', {}, '💡 Consejo'),
    note: _tp('lesson.card_note', {}, '📝 Nota'),
    example: _tp('lesson.card_example', {}, '🍸 Ejemplo'),
  };
  const cardSteps = (lesson.cards || []).map(card => {
    const body = card.cocktail
      ? _tp('lesson.example_body', { cocktail: card.cocktail }, `Ejemplo clásico: ${card.cocktail}. Estudia su receta, técnica y balance.`)
      : _t(card.key, '');
    return { kind: 'intro', title: cardTitle[card.type] || cardTitle.theory, body, fact: '' };
  });
  const questionSteps = (lesson.questions || []).map(q => {
    const correctText = _t(q.a[0]);
    const shuffled = q.a.map(k => _t(k)).sort(() => Math.random() - 0.5);
    return {
      kind: 'choice',
      prompt: _t(q.q),
      options: shuffled,
      correct: shuffled.indexOf(correctText),
      explain: _t(q.exp),
    };
  });
  return {
    id: `academy-l${level.id}-les${lessonIdx}`,
    category: 'Academy',
    title: _t(level.key),
    subtitle: _t(lesson.key),
    emoji: level.icon,
    accent: 'amber',
    xp: lesson.questions.length * 20,
    difficulty: 'Academy',
    game: 'lesson',
    _roundColor: level.color,
    steps: [
      { kind: 'intro', title: _t(level.key), body: _t(lesson.key), fact: _t(level.descKey) },
      ...cardSteps,
      ...questionSteps,
    ],
  };
};

// Construye un "practice" desde una ronda de TRIVIA_ROUNDS referenciada por la sequence.
const buildAcademyPractice = (level, roundId) => {
  const round = TRIVIA_ROUNDS.find(r => r.id === roundId);
  if (!round) return null;
  const lesson = buildLessonFromRound(round);
  return { ...lesson, id: `academy-practice-l${level.id}-r${roundId}`, emoji: level.icon, _roundColor: level.color };
};

Object.assign(window, {
  LESSONS, ACHIEVEMENTS, LEADERBOARD, CATEGORIES,
  ALL_FICHAS, ACADEMY_FAMILIES, TRIVIA_ROUNDS,
  buildLessonFromRound, DAILY_LESSON, SPEED_LESSON,
  getAcademyLevels, buildAcademyLesson, buildAcademyPractice,
});
