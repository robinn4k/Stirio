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
    id: 'daiquiri',
    category: 'Cocktails',
    title: 'The Classic Daiquiri',
    subtitle: '60 seconds · Rum, lime, sugar',
    emoji: '🍋',
    accent: 'cyan',
    xp: 50,
    difficulty: 'Beginner',
    game: 'ratio',
    steps: [
      {
        kind: 'intro',
        title: 'El Daiquiri',
        body: 'Uno de los seis cócteles básicos. Tres ingredientes, equilibrio puro: ron, zumo de lima y almíbar.',
        fact: 'Inventado en 1898 en las minas de Daiquirí, Cuba. Hemingway lo prefería sin azúcar y con pomelo.'
      },
      {
        kind: 'ratio',
        prompt: 'Ajusta las proporciones clásicas.',
        targets: { Ron: 60, 'Zumo de lima': 22, 'Almíbar 1:1': 15 },
        tolerance: 5,
      },
      {
        kind: 'multi',
        prompt: '¿Qué técnica se usa para prepararlo?',
        options: ['Shake con hielo', 'Stir', 'Build', 'Muddle', 'Layer'],
        correct: ['Shake con hielo'],
        hint: 'Cuando hay cítricos, casi siempre se agita.'
      },
      {
        kind: 'choice',
        prompt: '¿En qué vaso se sirve tradicionalmente?',
        options: ['Copa coupe', 'Highball', 'Rocks / Old-Fashioned', 'Martini recto'],
        correct: 0,
        explain: 'Copa coupe, colado fino y sin hielo — es un cóctel corto.'
      },
    ],
  },
  {
    id: 'oldfashioned',
    category: 'Cocktails',
    title: 'Old Fashioned 101',
    subtitle: '60 seconds · El abuelo de los cócteles',
    emoji: '🥃',
    accent: 'violet',
    xp: 55,
    difficulty: 'Intermediate',
    game: 'choice',
    steps: [
      {
        kind: 'intro',
        title: 'El Old Fashioned',
        body: 'La definición original de "cocktail" (1806): licor, azúcar, agua y bitters. Sin florituras.',
        fact: 'El nombre nace en el Pendennis Club de Louisville, KY, cuando los clientes pedían "old fashioned whiskey cocktails".'
      },
      {
        kind: 'multi',
        prompt: 'Selecciona los 4 ingredientes clásicos.',
        options: ['Bourbon o Rye', 'Azúcar / almíbar', 'Angostura bitters', 'Naranja (twist)', 'Lima', 'Soda', 'Vermut'],
        correct: ['Bourbon o Rye', 'Azúcar / almíbar', 'Angostura bitters', 'Naranja (twist)'],
      },
      {
        kind: 'choice',
        prompt: '¿Cómo se integra el azúcar?',
        options: ['Disuelto con bitters antes del destilado', 'En shaker con hielo', 'Flotado al final', 'Muddled con naranja y cereza'],
        correct: 0,
        explain: 'Se disuelve con los bitters y unas gotas de agua o soda antes de añadir el whiskey.'
      },
      {
        kind: 'choice',
        prompt: 'Garnish clásica:',
        options: ['Twist de naranja expresado', 'Rodaja de lima', 'Menta', 'Sal en el borde'],
        correct: 0,
        explain: 'El aceite de la piel de naranja es lo que aromatiza la copa. La cereza es opcional.'
      },
    ],
  },
  {
    id: 'mojito',
    category: 'Cocktails',
    title: 'Mojito Build',
    subtitle: '60 seconds · La Habana en un vaso',
    emoji: '🌿',
    accent: 'berry',
    xp: 45,
    difficulty: 'Beginner',
    game: 'multi',
    steps: [
      {
        kind: 'intro',
        title: 'El Mojito',
        body: 'Cóctel cubano construido directamente en el vaso. Menta fresca, lima, azúcar, ron blanco y soda — en ese orden.',
      },
      {
        kind: 'multi',
        prompt: 'Selecciona los 5 ingredientes del Mojito clásico.',
        options: ['Ron blanco', 'Menta fresca', 'Zumo de lima', 'Azúcar', 'Soda', 'Angostura', 'Triple sec', 'Vermut'],
        correct: ['Ron blanco', 'Menta fresca', 'Zumo de lima', 'Azúcar', 'Soda'],
      },
      {
        kind: 'choice',
        prompt: '¿Qué técnica aplicas a la menta?',
        options: ['Presionar suavemente sin romperla', 'Muddle fuerte para romper todo', 'Quemarla con soplete', 'Dejarla solo como decoración'],
        correct: 0,
        explain: 'Se presiona con cuidado para liberar aceites sin romper la clorofila — si no, amarga.'
      },
      {
        kind: 'choice',
        prompt: '¿En qué vaso se sirve?',
        options: ['Highball con hielo', 'Copa coupe', 'Rocks', 'Martini'],
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
  {
    id: 'margarita',
    category: 'Cocktails',
    title: 'Margarita Perfecta',
    subtitle: '60 seconds · El sour mexicano',
    emoji: '🍹',
    accent: 'lime',
    xp: 55,
    difficulty: 'Intermediate',
    game: 'ratio',
    steps: [
      {
        kind: 'intro',
        title: 'La Margarita',
        body: 'Tequila, triple sec y zumo de lima. Familia sour — siempre cítrico y dulce en tensión.',
        fact: 'Según una de las versiones más aceptadas, la creó Carlos "Danny" Herrera en 1938 en Tijuana.'
      },
      {
        kind: 'ratio',
        prompt: 'Proporción clásica (IBA).',
        targets: { 'Tequila blanco': 50, 'Triple sec': 20, 'Zumo de lima': 15 },
        tolerance: 5,
      },
      {
        kind: 'choice',
        prompt: 'Borde del vaso:',
        options: ['Sal (media luna)', 'Azúcar', 'Nada', 'Cacao'],
        correct: 0,
        explain: 'Se escarcha sólo media luna para que quien no quiera sal pueda beber por el otro lado.'
      },
      {
        kind: 'multi',
        prompt: '¿Qué técnica se usa?',
        options: ['Shake con hielo', 'Stir', 'Muddle', 'Build'],
        correct: ['Shake con hielo'],
      },
    ],
  },
  {
    id: 'manhattan',
    category: 'Cocktails',
    title: 'Manhattan',
    subtitle: '60 seconds · Stirred, no sacudido',
    emoji: '🥃',
    accent: 'berry',
    xp: 55,
    difficulty: 'Intermediate',
    game: 'choice',
    steps: [
      {
        kind: 'intro',
        title: 'El Manhattan',
        body: 'Rye (o bourbon), vermut rosso y unas gotas de angostura. Stirred — solo stirring, nunca shake.',
        fact: 'Atribuido al Manhattan Club de NY hacia 1874.'
      },
      {
        kind: 'ratio',
        prompt: 'Proporción clásica:',
        targets: { 'Rye whiskey': 60, 'Vermut rosso': 30, 'Angostura (gotas)': 2 },
        tolerance: 6,
      },
      {
        kind: 'choice',
        prompt: 'Garnish tradicional:',
        options: ['Cereza marrasquino', 'Twist de naranja', 'Aceituna', 'Menta'],
        correct: 0,
      },
      {
        kind: 'choice',
        prompt: '¿Cuál es la variante "Perfect"?',
        options: ['Mitad vermut dulce, mitad seco', 'Sin bitters', 'Con clara de huevo', 'Con soda'],
        correct: 0,
        explain: 'El Perfect Manhattan usa 15 ml de cada tipo de vermut.'
      },
    ],
  },
  {
    id: 'whiskeysour',
    category: 'Cocktails',
    title: 'Whiskey Sour',
    subtitle: '60 seconds · El sour americano',
    emoji: '🍋',
    accent: 'amber',
    xp: 50,
    difficulty: 'Beginner',
    game: 'ratio',
    steps: [
      {
        kind: 'intro',
        title: 'Whiskey Sour',
        body: 'Bourbon, zumo de lima/limón y almíbar. La clara de huevo (versión "classic") añade cuerpo y espuma.',
      },
      {
        kind: 'ratio',
        prompt: 'Proporción sin clara:',
        targets: { Bourbon: 60, 'Zumo de limón': 30, 'Almíbar 1:1': 15 },
        tolerance: 5,
      },
      {
        kind: 'choice',
        prompt: '¿Qué técnica enriquece la textura?',
        options: ['Dry shake con clara, luego shake con hielo', 'Stir largo', 'Muddle de la clara', 'Layer al final'],
        correct: 0,
        explain: 'Dry shake primero emulsiona la clara; el segundo shake con hielo enfría sin romper la espuma.'
      },
      {
        kind: 'choice',
        prompt: 'Garnish clásica:',
        options: ['Cereza y media rodaja de naranja (flag)', 'Sal en el borde', 'Menta', 'Twist de pepino'],
        correct: 0,
      },
    ],
  },
  {
    id: 'cosmo',
    category: 'Cocktails',
    title: 'Cosmopolitan',
    subtitle: '60 seconds · El ícono de los 90',
    emoji: '🍸',
    accent: 'berry',
    xp: 45,
    difficulty: 'Beginner',
    game: 'multi',
    steps: [
      {
        kind: 'intro',
        title: 'Cosmopolitan',
        body: 'Vodka cítrica, triple sec, zumo de arándanos y un toque de lima. Rosa, ácido, seco.',
      },
      {
        kind: 'multi',
        prompt: 'Selecciona los 4 ingredientes clásicos:',
        options: ['Vodka cítrica', 'Triple sec (Cointreau)', 'Zumo de arándano', 'Zumo de lima', 'Ron', 'Ginebra', 'Soda'],
        correct: ['Vodka cítrica', 'Triple sec (Cointreau)', 'Zumo de arándano', 'Zumo de lima'],
      },
      {
        kind: 'choice',
        prompt: 'Técnica:',
        options: ['Shake con hielo, colado doble', 'Stir', 'Build', 'Layer'],
        correct: 0,
      },
      {
        kind: 'choice',
        prompt: 'Garnish:',
        options: ['Twist de naranja flameado', 'Sal', 'Aceituna', 'Menta'],
        correct: 0,
        explain: 'El flameado quema los aceites esenciales sobre la superficie.'
      },
    ],
  },
  {
    id: 'martini',
    category: 'Cocktails',
    title: 'Dry Martini',
    subtitle: '60 seconds · Gin, vermut, aceituna',
    emoji: '🫒',
    accent: 'cyan',
    xp: 60,
    difficulty: 'Intermediate',
    game: 'ratio',
    steps: [
      {
        kind: 'intro',
        title: 'Dry Martini',
        body: 'Gin y vermut seco, stirred (nunca shaken — a pesar de Bond). Cuanto menos vermut, más "dry".',
        fact: 'Churchill decía que basta con mirar la botella de vermut mientras se sirve el gin.'
      },
      {
        kind: 'ratio',
        prompt: 'Proporción "medium-dry" (IBA):',
        targets: { Gin: 60, 'Vermut seco': 10 },
        tolerance: 4,
      },
      {
        kind: 'choice',
        prompt: 'Técnica correcta:',
        options: ['Stir con hielo hasta diluir, colado fino', 'Shake fuerte', 'Build directo en copa', 'Muddle previo'],
        correct: 0,
      },
      {
        kind: 'choice',
        prompt: 'Garnish clásica:',
        options: ['Aceituna o twist de limón', 'Cereza', 'Naranja flameada', 'Menta'],
        correct: 0,
        explain: 'Aceituna para el sabor salino; twist de limón para aromatizar con los aceites cítricos.'
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
  LESSONS, ACHIEVEMENTS, CATEGORIES,
  ALL_FICHAS, TRIVIA_ROUNDS,
  buildLessonFromRound, DAILY_LESSON, SPEED_LESSON,
  getAcademyLevels, buildAcademyLesson, buildAcademyPractice,
});
