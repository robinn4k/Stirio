// ─── Wiki Data: All categories, articles and content ───────────────────
// Migrated from bartenders-wiki + expanded with new educational content

export const WIKI_CATEGORIES = [
  {
    id: 'cocktails',
    icon: '🍸',
    gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    has3d: true,
    articles: [
      {
        id: 'margarita',
        icon: '🍋',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'margarita', colors: ['#f1c40f', '#e67e22'], layers: [0.7, 0.3] },
        ingredients: ['50 ml Tequila 100% Agave', '20 ml Triple Sec', '15 ml Jugo de Lima Fresco'],
        method: 'shake',
        garnish: 'salt-rim',
      },
      {
        id: 'mojito',
        icon: '🌿',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'highball', colors: ['#2ecc71', '#f1c40f', '#ecf0f1'], layers: [0.2, 0.5, 0.3] },
        ingredients: ['45 ml Ron Blanco', '20 ml Jugo de Lima', '6 Ramas de Menta', '2 cdtas Azucar', 'Soda'],
        method: 'muddle',
        garnish: 'mint-sprig',
      },
      {
        id: 'dry-martini',
        icon: '🫒',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'martini', colors: ['#ecf0f1'], layers: [1.0] },
        ingredients: ['60 ml Ginebra', '10 ml Vermouth Seco'],
        method: 'stir',
        garnish: 'olive',
      },
      {
        id: 'negroni',
        icon: '🍊',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'rocks', colors: ['#c0392b', '#e74c3c'], layers: [0.6, 0.4] },
        ingredients: ['30 ml Ginebra', '30 ml Campari', '30 ml Vermouth Dulce'],
        method: 'stir',
        garnish: 'orange-slice',
      },
      {
        id: 'old-fashioned',
        icon: '🥃',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'rocks', colors: ['#d35400', '#e67e22'], layers: [0.8, 0.2] },
        ingredients: ['45 ml Bourbon', '1 Terron de Azucar', '2-3 Gotas Angostura', 'Agua'],
        method: 'build',
        garnish: 'orange-peel',
      },
      {
        id: 'pina-colada',
        icon: '🍍',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'hurricane', colors: ['#f1c40f', '#ecf0f1'], layers: [0.6, 0.4] },
        ingredients: ['50 ml Ron Blanco', '30 ml Crema de Coco', '50 ml Jugo de Pina'],
        method: 'blend',
        garnish: 'pineapple-wedge',
      },
      {
        id: 'cosmopolitan',
        icon: '🌸',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'martini', colors: ['#e91e63', '#f06292'], layers: [0.8, 0.2] },
        ingredients: ['40 ml Vodka Citron', '15 ml Cointreau', '15 ml Jugo de Lima', '30 ml Jugo de Arandanos'],
        method: 'shake',
        garnish: 'lemon-twist',
      },
      {
        id: 'espresso-martini',
        icon: '☕',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'martini', colors: ['#3e2723', '#4e342e', '#d7ccc8'], layers: [0.6, 0.2, 0.2] },
        ingredients: ['50 ml Vodka', '30 ml Licor de Cafe', '10 ml Jarabe', '1 Espresso'],
        method: 'shake',
        garnish: 'coffee-beans',
      },
      {
        id: 'gin-fizz',
        icon: '🫧',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'highball', colors: ['#ecf0f1', '#bdc3c7'], layers: [0.7, 0.3] },
        ingredients: ['45 ml Ginebra', '30 ml Jugo de Limon', '10 ml Jarabe', 'Soda'],
        method: 'shake',
        garnish: 'lemon-wheel',
      },
      {
        id: 'bellini',
        icon: '🍑',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'flute', colors: ['#ffcc80', '#ffe0b2'], layers: [0.5, 0.5] },
        ingredients: ['100 ml Prosecco', '50 ml Pure de Durazno Blanco'],
        method: 'build',
        garnish: 'none',
      },
      {
        id: 'pisco-sour',
        icon: '🥚',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'rocks', colors: ['#fff9c4', '#f5f5dc', '#ffffff'], layers: [0.5, 0.3, 0.2] },
        ingredients: ['60 ml Pisco', '30 ml Jugo de Limon', '20 ml Jarabe', '1 Clara de Huevo'],
        method: 'shake',
        garnish: 'bitters-drops',
      },
      {
        id: 'hurricane',
        icon: '🌀',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'hurricane', colors: ['#e74c3c', '#e67e22', '#f39c12'], layers: [0.4, 0.3, 0.3] },
        ingredients: ['50 ml Ron Blanco', '50 ml Ron Oscuro', '25 ml Maracuya', '25 ml Naranja', '10 ml Jarabe', '10 ml Granadina'],
        method: 'shake',
        garnish: 'orange-cherry',
      },
      {
        id: 'negroni-sbagliato',
        icon: '🥂',
        has3d: true,
        scene: 'cocktail-glass',
        sceneParams: { glass: 'rocks', colors: ['#c0392b', '#e74c3c', '#f5f5dc'], layers: [0.4, 0.3, 0.3] },
        ingredients: ['30 ml Campari', '30 ml Vermouth Dulce', '30 ml Prosecco'],
        method: 'build',
        garnish: 'orange-slice',
      },
    ]
  },
  {
    id: 'techniques',
    icon: '🔧',
    gradient: 'linear-gradient(135deg, #3498db, #2980b9)',
    has3d: true,
    articles: [
      {
        id: 'shake',
        icon: '🫨',
        has3d: true,
        scene: 'technique-shake',
      },
      {
        id: 'stir',
        icon: '🥄',
        has3d: true,
        scene: 'technique-stir',
      },
      {
        id: 'muddle',
        icon: '🪵',
        has3d: true,
        scene: 'technique-muddle',
      },
      {
        id: 'build',
        icon: '🧱',
        has3d: true,
        scene: 'technique-build',
      },
      {
        id: 'layer',
        icon: '🌈',
        has3d: true,
        scene: 'technique-layer',
      },
      {
        id: 'strain',
        icon: '🫗',
        has3d: true,
        scene: 'technique-strain',
      },
      {
        id: 'blend',
        icon: '🌪️',
        has3d: true,
        scene: 'technique-blend',
      },
    ]
  },
  {
    id: 'spirits',
    icon: '🥃',
    gradient: 'linear-gradient(135deg, #e67e22, #d35400)',
    has3d: true,
    articles: [
      { id: 'whisky', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', has3d: false },
      { id: 'gin', icon: '🌿', has3d: false },
      { id: 'rum', icon: '🏝️', has3d: false },
      { id: 'vodka', icon: '❄️', has3d: false },
      { id: 'tequila', icon: '🌵', has3d: false },
      { id: 'brandy', icon: '🍇', has3d: false },
      { id: 'distillation', icon: '⚗️', has3d: true, scene: 'alambique' },
      { id: 'fermentation', icon: '🫧', has3d: false },
    ]
  },
  {
    id: 'history',
    icon: '📜',
    gradient: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
    has3d: false,
    articles: [
      { id: 'timeline', icon: '📅', has3d: false },
      { id: 'origins', icon: '🏛️', has3d: false },
      { id: 'prohibition', icon: '🚫', has3d: false },
      { id: 'iba', icon: '🏅', has3d: false },
      { id: 'tiki-culture', icon: '🗿', has3d: false },
    ]
  },
  {
    id: 'tools',
    icon: '🛠️',
    gradient: 'linear-gradient(135deg, #1abc9c, #16a085)',
    has3d: true,
    articles: [
      { id: 'shaker', icon: '🫙', has3d: true, scene: 'tool-shaker' },
      { id: 'jigger', icon: '🔢', has3d: true, scene: 'tool-jigger' },
      { id: 'strainer', icon: '🫗', has3d: true, scene: 'tool-strainer' },
      { id: 'muddler', icon: '🪵', has3d: true, scene: 'tool-muddler' },
      { id: 'bar-spoon', icon: '🥄', has3d: true, scene: 'tool-barspoon' },
      { id: 'glassware', icon: '🥂', has3d: true, scene: 'glassware' },
    ]
  },
  {
    id: 'wines',
    icon: '🍷',
    gradient: 'linear-gradient(135deg, #722f37, #9b2335)',
    has3d: false,
    articles: [
      { id: 'red-wines', icon: '🔴', has3d: false },
      { id: 'white-wines', icon: '⚪', has3d: false },
      { id: 'sparkling', icon: '🫧', has3d: false },
      { id: 'fortified', icon: '🏰', has3d: false },
      { id: 'vermouth', icon: '🌿', has3d: false },
    ]
  },
  {
    id: 'glossary',
    icon: '📚',
    gradient: 'linear-gradient(135deg, #34495e, #2c3e50)',
    has3d: false,
    articles: [
      { id: 'spirits-terms', icon: '📖', has3d: false },
      { id: 'bar-terms', icon: '📋', has3d: false },
      { id: 'tasting-terms', icon: '👅', has3d: false },
      { id: 'service-terms', icon: '🍽️', has3d: false },
    ]
  }
];

// ─── Article Content (i18n keys map to lang.js) ──────────────────────
// Full article content keyed by "category.article" id
// Each entry has: title key, sections[], optional 3d scene config

export const WIKI_ARTICLES = {
  // ── COCKTAILS ──────────────────────────────────────────────
  'cocktails.margarita': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'margarita', colors: ['#f1c40f','#e67e22'], layers: [0.7,0.3] }},
      { type: 'info-grid', items: ['glass:margarita', 'method:shake', 'garnish:salt-rim'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.mojito': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'highball', colors: ['#2ecc71','#f1c40f','#ecf0f1'], layers: [0.2,0.5,0.3] }},
      { type: 'info-grid', items: ['glass:highball', 'method:muddle', 'garnish:mint-sprig'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.dry-martini': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'martini', colors: ['#ecf0f1'], layers: [1.0] }},
      { type: 'info-grid', items: ['glass:martini', 'method:stir', 'garnish:olive'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.negroni': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'rocks', colors: ['#c0392b','#e74c3c'], layers: [0.6,0.4] }},
      { type: 'info-grid', items: ['glass:rocks', 'method:stir', 'garnish:orange-slice'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.old-fashioned': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'rocks', colors: ['#d35400','#e67e22'], layers: [0.8,0.2] }},
      { type: 'info-grid', items: ['glass:rocks', 'method:build', 'garnish:orange-peel'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.pina-colada': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'hurricane', colors: ['#f1c40f','#ecf0f1'], layers: [0.6,0.4] }},
      { type: 'info-grid', items: ['glass:hurricane', 'method:blend', 'garnish:pineapple-wedge'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.cosmopolitan': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'martini', colors: ['#e91e63','#f06292'], layers: [0.8,0.2] }},
      { type: 'info-grid', items: ['glass:martini', 'method:shake', 'garnish:lemon-twist'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.espresso-martini': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'martini', colors: ['#3e2723','#4e342e','#d7ccc8'], layers: [0.6,0.2,0.2] }},
      { type: 'info-grid', items: ['glass:martini', 'method:shake', 'garnish:coffee-beans'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.gin-fizz': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'highball', colors: ['#ecf0f1','#bdc3c7'], layers: [0.7,0.3] }},
      { type: 'info-grid', items: ['glass:highball', 'method:shake', 'garnish:lemon-wheel'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.bellini': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'flute', colors: ['#ffcc80','#ffe0b2'], layers: [0.5,0.5] }},
      { type: 'info-grid', items: ['glass:flute', 'method:build', 'garnish:none'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.pisco-sour': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'rocks', colors: ['#fff9c4','#f5f5dc','#ffffff'], layers: [0.5,0.3,0.2] }},
      { type: 'info-grid', items: ['glass:rocks', 'method:shake', 'garnish:bitters-drops'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.hurricane': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'hurricane', colors: ['#e74c3c','#e67e22','#f39c12'], layers: [0.4,0.3,0.3] }},
      { type: 'info-grid', items: ['glass:hurricane', 'method:shake', 'garnish:orange-cherry'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },
  'cocktails.negroni-sbagliato': {
    sections: [
      { type: 'hero-3d', scene: 'cocktail-glass', params: { glass: 'rocks', colors: ['#c0392b','#e74c3c','#f5f5dc'], layers: [0.4,0.3,0.3] }},
      { type: 'info-grid', items: ['glass:rocks', 'method:build', 'garnish:orange-slice'] },
      { type: 'ingredients' },
      { type: 'steps' },
      { type: 'history' },
    ]
  },

  // ── TECHNIQUES ─────────────────────────────────────────────
  'techniques.shake': {
    sections: [
      { type: 'hero-3d', scene: 'technique-shake' },
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'when_to_use' },
      { type: 'step-list', key: 'steps' },
      { type: 'tips', key: 'tips' },
      { type: 'common-errors', key: 'errors' },
    ]
  },
  'techniques.stir': {
    sections: [
      { type: 'hero-3d', scene: 'technique-stir' },
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'when_to_use' },
      { type: 'step-list', key: 'steps' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'techniques.muddle': {
    sections: [
      { type: 'hero-3d', scene: 'technique-muddle' },
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'techniques.build': {
    sections: [
      { type: 'hero-3d', scene: 'technique-build' },
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
    ]
  },
  'techniques.layer': {
    sections: [
      { type: 'hero-3d', scene: 'technique-layer' },
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'techniques.strain': {
    sections: [
      { type: 'hero-3d', scene: 'technique-strain' },
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
    ]
  },
  'techniques.blend': {
    sections: [
      { type: 'hero-3d', scene: 'technique-blend' },
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
    ]
  },

  // ── SPIRITS ────────────────────────────────────────────────
  'spirits.whisky': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'regions' },
    ]
  },
  'spirits.gin': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'botanicals' },
      { type: 'text-block', key: 'styles' },
    ]
  },
  'spirits.rum': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'regions' },
    ]
  },
  'spirits.vodka': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'production' },
    ]
  },
  'spirits.tequila': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'production' },
    ]
  },
  'spirits.brandy': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'types' },
    ]
  },
  'spirits.distillation': {
    sections: [
      { type: 'hero-3d', scene: 'alambique' },
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'process' },
    ]
  },
  'spirits.fermentation': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'process' },
    ]
  },

  // ── HISTORY ────────────────────────────────────────────────
  'history.timeline': {
    sections: [
      { type: 'timeline' },
    ]
  },
  'history.origins': {
    sections: [
      { type: 'text-block', key: 'description' },
    ]
  },
  'history.prohibition': {
    sections: [
      { type: 'text-block', key: 'description' },
    ]
  },
  'history.iba': {
    sections: [
      { type: 'text-block', key: 'description' },
    ]
  },
  'history.tiki-culture': {
    sections: [
      { type: 'text-block', key: 'description' },
    ]
  },

  // ── TOOLS ──────────────────────────────────────────────────
  'tools.shaker': {
    sections: [
      { type: 'hero-3d', scene: 'tool-shaker' },
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'types' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'tools.jigger': {
    sections: [
      { type: 'hero-3d', scene: 'tool-jigger' },
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'sizes' },
    ]
  },
  'tools.strainer': {
    sections: [
      { type: 'hero-3d', scene: 'tool-strainer' },
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'types' },
    ]
  },
  'tools.muddler': {
    sections: [
      { type: 'hero-3d', scene: 'tool-muddler' },
      { type: 'text-block', key: 'description' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'tools.bar-spoon': {
    sections: [
      { type: 'hero-3d', scene: 'tool-barspoon' },
      { type: 'text-block', key: 'description' },
    ]
  },
  'tools.glassware': {
    sections: [
      { type: 'hero-3d', scene: 'glassware' },
      { type: 'text-block', key: 'description' },
      { type: 'glass-gallery' },
    ]
  },

  // ── WINES ──────────────────────────────────────────────────
  'wines.red-wines': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'varieties' }] },
  'wines.white-wines': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'varieties' }] },
  'wines.sparkling': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'types' }] },
  'wines.fortified': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'types' }] },
  'wines.vermouth': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'types' }] },

  // ── GLOSSARY ───────────────────────────────────────────────
  'glossary.spirits-terms': { sections: [{ type: 'glossary-list' }] },
  'glossary.bar-terms': { sections: [{ type: 'glossary-list' }] },
  'glossary.tasting-terms': { sections: [{ type: 'glossary-list' }] },
  'glossary.service-terms': { sections: [{ type: 'glossary-list' }] },
};

// ─── Timeline data (migrated from bartenders-wiki historia.html) ─────
export const TIMELINE_DATA = [
  { year: '~100,000 a.C.', key: 'natural_fermentation' },
  { year: '~8,000 a.C.', key: 'agriculture' },
  { year: '~5,000 a.C.', key: 'wine_beer' },
  { year: '~3,000 a.C.', key: 'egypt_mesopotamia' },
  { year: '~800 a.C.', key: 'greece_rome' },
  { year: '~200', key: 'china_alchemy' },
  { year: '~800', key: 'arab_distillation' },
  { year: '~1100', key: 'european_spirits' },
  { year: '~1450', key: 'coffee_discovery' },
  { year: '~1600', key: 'colonial_spirits' },
  { year: '~1800', key: 'cocktail_birth' },
  { year: '1862', key: 'jerry_thomas' },
  { year: '1920-1933', key: 'prohibition' },
  { year: '1951', key: 'iba_founded' },
  { year: '1960s', key: 'tiki_era' },
  { year: '2000s', key: 'craft_revolution' },
  { year: '2020+', key: 'modern_era' },
];

// ─── Glossary terms ──────────────────────────────────────────────────
export const GLOSSARY_DATA = {
  'spirits-terms': [
    'aguardiente', 'destilado', 'alcohol', 'ethanol', 'proof',
    'abv', 'cask_strength', 'single_malt', 'blended', 'aged',
    'barrel', 'pot_still', 'column_still', 'mash', 'wash',
    'congeners', 'heads', 'hearts', 'tails', 'angel_share',
  ],
  'bar-terms': [
    'dash', 'jigger', 'neat', 'on_the_rocks', 'straight_up',
    'dirty', 'dry', 'wet', 'twist', 'float',
    'rim', 'chaser', 'back', 'call', 'well',
    'top_shelf', 'speed_rail', 'mise_en_place', 'free_pour', 'measured_pour',
  ],
  'tasting-terms': [
    'nose', 'palate', 'finish', 'body', 'mouthfeel',
    'aroma', 'bouquet', 'crisp', 'dry', 'sweet',
    'bitter', 'sour', 'umami', 'astringent', 'smooth',
  ],
  'service-terms': [
    'upsell', 'suggestive_sell', 'comp', 'tab', 'last_call',
    'happy_hour', 'service_bar', 'garnish_tray', 'ice_well', 'pour_test',
  ],
};
