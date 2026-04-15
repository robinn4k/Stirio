// ─── Wiki Data: All categories, articles and content ───────────────────
// Migrated from bartenders-wiki + expanded with new educational content

export const WIKI_CATEGORIES = [
  {
    id: 'techniques',
    icon: '🔧',
    gradient: 'linear-gradient(135deg, #3498db, #2980b9)',
    has3d: false,
    articles: [
      { id: 'shake', icon: '🫨', has3d: false },
      { id: 'stir', icon: '🥄', has3d: false },
      { id: 'muddle', icon: '🪵', has3d: false },
      { id: 'build', icon: '🧱', has3d: false },
      { id: 'layer', icon: '🌈', has3d: false },
      { id: 'strain', icon: '🫗', has3d: false },
      { id: 'blend', icon: '🌪️', has3d: false },
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
      { id: 'mezcal', icon: '🔥', has3d: false },
      { id: 'cachaca', icon: '🇧🇷', has3d: false },
      { id: 'pisco', icon: '🏔️', has3d: false },
      { id: 'sake', icon: '🍶', has3d: false },
      { id: 'soju', icon: '🇰🇷', has3d: false },
      { id: 'baijiu', icon: '🇨🇳', has3d: false },
      { id: 'aquavit', icon: '🌾', has3d: false },
      { id: 'absinthe', icon: '💚', has3d: false },
      { id: 'raki-ouzo-arak', icon: '⭐', has3d: false },
      { id: 'world-map', icon: '🗺️', has3d: false },
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
    id: 'liqueurs',
    icon: '🍸',
    gradient: 'linear-gradient(135deg, #f4d03f, #f39c12)',
    has3d: false,
    articles: [
      { id: 'triple-sec', icon: '🍊', has3d: false },
      { id: 'chartreuse', icon: '💚', has3d: false },
      { id: 'benedictine', icon: '✝️', has3d: false },
      { id: 'maraschino', icon: '🍒', has3d: false },
      { id: 'amaretto', icon: '🌰', has3d: false },
      { id: 'kahlua', icon: '☕', has3d: false },
      { id: 'baileys', icon: '🥛', has3d: false },
      { id: 'creme-liqueurs', icon: '🎨', has3d: false },
      { id: 'sambuca', icon: '⚫', has3d: false },
      { id: 'limoncello', icon: '🍋', has3d: false },
      { id: 'drambuie', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', has3d: false },
      { id: 'st-germain', icon: '🌸', has3d: false },
      { id: 'chambord', icon: '👑', has3d: false },
      { id: 'frangelico', icon: '🫒', has3d: false },
      { id: 'pastis', icon: '☀️', has3d: false },
    ]
  },
  {
    id: 'amaros',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, #6e2c00, #a04000)',
    has3d: false,
    articles: [
      { id: 'campari', icon: '🔴', has3d: false },
      { id: 'aperol', icon: '🟠', has3d: false },
      { id: 'fernet', icon: '🖤', has3d: false },
      { id: 'amaro-italiano', icon: '🇮🇹', has3d: false },
      { id: 'cynar', icon: '🌿', has3d: false },
      { id: 'angostura-bitters', icon: '💧', has3d: false },
      { id: 'peychauds-bitters', icon: '❤️', has3d: false },
      { id: 'orange-bitters', icon: '🟡', has3d: false },
      { id: 'suze', icon: '🌼', has3d: false },
    ]
  },
  {
    id: 'mixers',
    icon: '🧊',
    gradient: 'linear-gradient(135deg, #00b4d8, #0077b6)',
    has3d: false,
    articles: [
      { id: 'tonic-water', icon: '🫧', has3d: false },
      { id: 'ginger-beer', icon: '🫚', has3d: false },
      { id: 'syrups', icon: '🍯', has3d: false },
      { id: 'citrus-juices', icon: '🍋', has3d: false },
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
  // ── TECHNIQUES ─────────────────────────────────────────────
  'techniques.shake': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'when_to_use' },
      { type: 'step-list', key: 'steps' },
      { type: 'tips', key: 'tips' },
      { type: 'common-errors', key: 'errors' },
    ]
  },
  'techniques.stir': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'when_to_use' },
      { type: 'step-list', key: 'steps' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'techniques.muddle': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'techniques.build': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
    ]
  },
  'techniques.layer': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'techniques.strain': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
    ]
  },
  'techniques.blend': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'step-list', key: 'steps' },
    ]
  },

  // ── SPIRITS ────────────────────────────────────────────────
  'spirits.whisky': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'regions' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.gin': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'botanicals' },
      { type: 'text-block', key: 'styles' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.rum': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'regions' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.vodka': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.tequila': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.brandy': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.mezcal': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.cachaca': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.pisco': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.sake': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.soju': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.baijiu': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.aquavit': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.absinthe': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.raki-ouzo-arak': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'production' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'spirits.world-map': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'spirit-map' },
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
  'wines.red-wines': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'varieties' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'wines.white-wines': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'varieties' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'wines.sparkling': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'wines.fortified': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },
  'wines.vermouth': {
    sections: [
      { type: 'text-block', key: 'description' },
      { type: 'text-block', key: 'origin' },
      { type: 'text-block', key: 'history' },
      { type: 'text-block', key: 'types' },
      { type: 'text-block', key: 'tasting' },
      { type: 'text-block', key: 'cocktails' },
      { type: 'tips', key: 'tips' },
    ]
  },

  // ── LIQUEURS ───────────────────────────────────────────────
  'liqueurs.triple-sec': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.chartreuse': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.benedictine': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.maraschino': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.amaretto': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.kahlua': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.baileys': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.creme-liqueurs': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.sambuca': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.limoncello': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.drambuie': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.st-germain': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.chambord': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.frangelico': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.pastis': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },

  // ── AMAROS & BITTERS ──────────────────────────────────────
  'amaros.campari': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.aperol': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.fernet': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.amaro-italiano': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.cynar': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.angostura-bitters': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.peychauds-bitters': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.orange-bitters': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.suze': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },

  // ── MIXERS ────────────────────────────────────────────────
  'mixers.tonic-water': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.ginger-beer': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.syrups': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.citrus-juices': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },

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
