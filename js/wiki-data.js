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
      { id: 'double-strain', icon: '🫗', has3d: false },
      { id: 'dry-shake', icon: '🥚', has3d: false },
      { id: 'fat-wash', icon: '🧈', has3d: false },
      { id: 'infusion', icon: '🌶️', has3d: false },
      { id: 'swizzle', icon: '🌴', has3d: false },
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
      { id: 'shochu', icon: '🇯🇵', has3d: false },
      { id: 'grappa', icon: '🍇', has3d: false },
      { id: 'calvados', icon: '🍏', has3d: false },
      { id: 'genever', icon: '🏠', has3d: false },
      { id: 'cognac', icon: '🥃', has3d: false },
      { id: 'armagnac', icon: '⚜️', has3d: false },
      { id: 'eau-de-vie', icon: '🍐', has3d: false },
      { id: 'rhum-agricole', icon: '🌴', has3d: false },
      { id: 'bourbon-rye', icon: '🌽', has3d: false },
      { id: 'scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', has3d: false },
      { id: 'irish-whiskey', icon: '☘️', has3d: false },
      { id: 'applejack', icon: '🍎', has3d: false },
      { id: 'slivovitz', icon: '🇷🇸', has3d: false },
      { id: 'zubrowka', icon: '🦬', has3d: false },
      { id: 'fireball', icon: '🔥', has3d: false },
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
      { id: 'golden-age', icon: '🎩', has3d: false },
      { id: 'prohibition', icon: '🚫', has3d: false },
      { id: 'iba', icon: '🏅', has3d: false },
      { id: 'tiki-culture', icon: '🗿', has3d: false },
      { id: 'cocktail-renaissance', icon: '✨', has3d: false },
      { id: 'molecular-mixology', icon: '🧪', has3d: false },
      { id: 'legendary-bars', icon: '🍹', has3d: false },
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
      { id: 'lillet', icon: '🥂', has3d: false },
      { id: 'dubonnet', icon: '💎', has3d: false },
      { id: 'sherry', icon: '🏺', has3d: false },
      { id: 'port', icon: '🍷', has3d: false },
      { id: 'madeira', icon: '🏝️', has3d: false },
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
      { id: 'cointreau', icon: '🍊', has3d: false },
      { id: 'grand-marnier', icon: '🎀', has3d: false },
      { id: 'curacao', icon: '🔵', has3d: false },
      { id: 'galliano', icon: '🌾', has3d: false },
      { id: 'strega', icon: '🧙', has3d: false },
      { id: 'cherry-heering', icon: '🍒', has3d: false },
      { id: 'midori', icon: '🍈', has3d: false },
      { id: 'licor-43', icon: '🇪🇸', has3d: false },
      { id: 'falernum', icon: '🏝️', has3d: false },
      { id: 'pimms', icon: '🇬🇧', has3d: false },
      { id: 'sloe-gin', icon: '🫐', has3d: false },
      { id: 'creme-de-cassis', icon: '🍇', has3d: false },
      { id: 'ginger-liqueur', icon: '🫚', has3d: false },
      { id: 'ancho-reyes', icon: '🌶️', has3d: false },
      { id: 'amarula', icon: '🐘', has3d: false },
      { id: 'tia-maria', icon: '☕', has3d: false },
      { id: 'advocaat', icon: '🥚', has3d: false },
      { id: 'underberg', icon: '🌱', has3d: false },
      { id: 'genepi', icon: '🏔️', has3d: false },
      { id: 'creme-de-mure', icon: '🫐', has3d: false },
      { id: 'creme-de-peche', icon: '🍑', has3d: false },
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
      { id: 'jagermeister', icon: '🦌', has3d: false },
      { id: 'becherovka', icon: '🇨🇿', has3d: false },
      { id: 'amaro-nonino', icon: '🍯', has3d: false },
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
      { id: 'soda-water', icon: '💧', has3d: false },
      { id: 'cola', icon: '🥤', has3d: false },
      { id: 'champagne-prosecco', icon: '🥂', has3d: false },
      { id: 'coconut', icon: '🥥', has3d: false },
      { id: 'juices', icon: '🧃', has3d: false },
      { id: 'coffee-espresso', icon: '☕', has3d: false },
      { id: 'eggs-dairy', icon: '🥚', has3d: false },
      { id: 'herbs-spices', icon: '🌿', has3d: false },
      { id: 'creme-de-violette', icon: '💜', has3d: false },
      { id: 'allspice-dram', icon: '🫙', has3d: false },
    ]
  },
  {
    id: 'beer',
    icon: '🍺',
    gradient: 'linear-gradient(135deg, #f0b429, #d4940a)',
    has3d: false,
    articles: [
      { id: 'cerveza', icon: '🍻', has3d: false },
      { id: 'sidra', icon: '🍏', has3d: false },
    ]
  },
  {
    id: 'families',
    icon: '👪',
    gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    has3d: false,
    articles: [
      { id: 'sours-family', icon: '🍋', has3d: false },
      { id: 'fizz-family', icon: '🫧', has3d: false },
      { id: 'flip-family', icon: '🥚', has3d: false },
      { id: 'julep-family', icon: '🌿', has3d: false },
      { id: 'punch-family', icon: '🏺', has3d: false },
      { id: 'tiki-family', icon: '🗿', has3d: false },
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
  },
  // ─── Categories below are seeded by tools/ai-content/seed.py from
  // tools/ai-content/backlog.json. Articles arrays start empty and grow
  // 3/day via the auto cron (see ai-content-auto.yml).
  {
    id: 'bartenders',
    icon: '👤',
    gradient: 'linear-gradient(135deg, #c0392b, #8e44ad)',
    has3d: false,
    articles: []
  },
  {
    id: 'bars',
    icon: '🍸',
    gradient: 'linear-gradient(135deg, #16a085, #2c3e50)',
    has3d: false,
    articles: []
  },
  {
    id: 'regions',
    icon: '🌍',
    gradient: 'linear-gradient(135deg, #27ae60, #2980b9)',
    has3d: false,
    articles: [
      { id: 'italy-aperitivo-culture', icon: '🌍', has3d: false },
      { id: 'italy-amaro-culture', icon: '🌍', has3d: false },
      { id: 'italy-vermouth-piedmont', icon: '🌍', has3d: false },
      { id: 'france-aperitif-tradition', icon: '🌍', has3d: false },
      { id: 'france-cocktail-history', icon: '🌍', has3d: false },
      { id: 'japan-bar-precision', icon: '🌍', has3d: false },
      { id: 'japan-highball-culture', icon: '🌍', has3d: false },
      { id: 'mexico-cantinas', icon: '🌍', has3d: false },
      { id: 'mexico-pulqueria-tradition', icon: '🌍', has3d: false },
      { id: 'cuba-mojito-history', icon: '🌍', has3d: false },
      { id: 'cuba-bodeguita-floridita', icon: '🌍', has3d: false },
      { id: 'peru-pisco-culture', icon: '🌍', has3d: false },
      { id: 'brazil-caipirinha-culture', icon: '🌍', has3d: false },
      { id: 'scotland-whisky-tour', icon: '🌍', has3d: false },
      { id: 'scotland-distillery-history', icon: '🌍', has3d: false },
      { id: 'ireland-pub-culture', icon: '🌍', has3d: false },
      { id: 'england-london-cocktail-renaissance', icon: '🌍', has3d: false },
      { id: 'england-gin-craze', icon: '🌍', has3d: false },
      { id: 'usa-prohibition', icon: '🌍', has3d: false },
      { id: 'usa-tiki-revival', icon: '🌍', has3d: false },
      { id: 'usa-craft-cocktail-revival', icon: '🌍', has3d: false },
      { id: 'scandinavia-aquavit', icon: '🌍', has3d: false },
      { id: 'scandinavia-akvavit-rituals', icon: '🌍', has3d: false },
      { id: 'korea-soju-culture', icon: '🌍', has3d: false },
      { id: 'thailand-mekong-spirit', icon: '🌍', has3d: false },
      { id: 'vietnam-rice-spirits', icon: '🌍', has3d: false },
      { id: 'india-feni-goa', icon: '🌍', has3d: false },
      { id: 'china-baijiu-banquet', icon: '🌍', has3d: false },
      { id: 'ethiopia-tej-honey-wine', icon: '🌍', has3d: false },
      { id: 'mexico-mezcal-oaxaca', icon: '🌍', has3d: false },
      { id: 'mexico-tequila-jalisco', icon: '🌍', has3d: false },
      { id: 'caribbean-rum-tour', icon: '🌍', has3d: false },
      { id: 'argentina-fernet-coke', icon: '🌍', has3d: false },
      { id: 'hong-kong-bar-scene', icon: '🌍', has3d: false },
      { id: 'singapore-cocktail-scene', icon: '🌍', has3d: false },
      { id: 'australia-bar-scene', icon: '🌍', has3d: false },
      { id: 'south-africa-brandy-history', icon: '🌍', has3d: false },
      { id: 'germany-beer-purity', icon: '🌍', has3d: false },
      { id: 'belgium-beer-monasteries', icon: '🌍', has3d: false },
      { id: 'czech-pilsner-origin', icon: '🌍', has3d: false },
      { id: 'russia-vodka-tradition', icon: '🌍', has3d: false },
      { id: 'poland-vodka-tradition', icon: '🌍', has3d: false },
      { id: 'spain-sherry-jerez', icon: '🌍', has3d: false },
      { id: 'portugal-port-douro', icon: '🌍', has3d: false },
      { id: 'georgia-qvevri-wine', icon: '🌍', has3d: false },
      { id: 'turkey-raki-meze', icon: '🌍', has3d: false },
      { id: 'greece-ouzo-tradition', icon: '🌍', has3d: false },
      { id: 'lebanon-arak-tradition', icon: '🌍', has3d: false },
      { id: 'iran-history-of-wine', icon: '🌍', has3d: false },
      { id: 'egypt-distillation-roots', icon: '🌍', has3d: false }
    ]
  },
  {
    id: 'ice',
    icon: '🧊',
    gradient: 'linear-gradient(135deg, #74b9ff, #0984e3)',
    has3d: false,
    articles: [
      { id: 'ice-history-natural-trade', icon: '🧊', has3d: false },
      { id: 'ice-physics-of-cooling', icon: '🧊', has3d: false },
      { id: 'ice-clarity-science', icon: '🧊', has3d: false },
      { id: 'ice-shapes-spheres', icon: '🧊', has3d: false },
      { id: 'ice-shapes-large-cubes', icon: '🧊', has3d: false },
      { id: 'ice-shapes-collins', icon: '🧊', has3d: false },
      { id: 'ice-shapes-king-cube', icon: '🧊', has3d: false },
      { id: 'ice-shaved-japanese', icon: '🧊', has3d: false },
      { id: 'ice-crushed-pebble', icon: '🧊', has3d: false },
      { id: 'ice-cracked', icon: '🧊', has3d: false },
      { id: 'ice-block-craft', icon: '🧊', has3d: false },
      { id: 'ice-flavored', icon: '🧊', has3d: false },
      { id: 'ice-balls-techniques', icon: '🧊', has3d: false },
      { id: 'ice-temperature-targets', icon: '🧊', has3d: false },
      { id: 'ice-dilution-math', icon: '🧊', has3d: false },
      { id: 'ice-vs-no-ice-stirring', icon: '🧊', has3d: false },
      { id: 'ice-machine-types', icon: '🧊', has3d: false },
      { id: 'ice-storage-bar', icon: '🧊', has3d: false },
      { id: 'ice-carving-art', icon: '🧊', has3d: false },
      { id: 'ice-spear-collins', icon: '🧊', has3d: false }
    ]
  },
  {
    id: 'garnishes',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, #00b894, #6c5ce7)',
    has3d: false,
    articles: [
      { id: 'garnish-citrus-twist-theory', icon: '🌿', has3d: false },
      { id: 'garnish-citrus-peel-expression', icon: '🌿', has3d: false },
      { id: 'garnish-flame-orange', icon: '🌿', has3d: false },
      { id: 'garnish-cherry-luxardo', icon: '🌿', has3d: false },
      { id: 'garnish-cherry-amarena', icon: '🌿', has3d: false },
      { id: 'garnish-olive-castelvetrano', icon: '🌿', has3d: false },
      { id: 'garnish-olive-cocktail', icon: '🌿', has3d: false },
      { id: 'garnish-onion-pickled', icon: '🌿', has3d: false },
      { id: 'garnish-mint-sprig', icon: '🌿', has3d: false },
      { id: 'garnish-mint-slap', icon: '🌿', has3d: false },
      { id: 'garnish-basil-leaf', icon: '🌿', has3d: false },
      { id: 'garnish-rosemary-sprig', icon: '🌿', has3d: false },
      { id: 'garnish-thyme-sprig', icon: '🌿', has3d: false },
      { id: 'garnish-lavender-sprig', icon: '🌿', has3d: false },
      { id: 'garnish-edible-flower-pansy', icon: '🌿', has3d: false },
      { id: 'garnish-edible-flower-borage', icon: '🌿', has3d: false },
      { id: 'garnish-edible-flower-marigold', icon: '🌿', has3d: false },
      { id: 'garnish-dehydrated-citrus', icon: '🌿', has3d: false },
      { id: 'garnish-dehydrated-pineapple', icon: '🌿', has3d: false },
      { id: 'garnish-dehydrated-apple', icon: '🌿', has3d: false },
      { id: 'garnish-pineapple-frond', icon: '🌿', has3d: false },
      { id: 'garnish-cinnamon-stick', icon: '🌿', has3d: false },
      { id: 'garnish-star-anise', icon: '🌿', has3d: false },
      { id: 'garnish-clove', icon: '🌿', has3d: false },
      { id: 'garnish-nutmeg-grated', icon: '🌿', has3d: false },
      { id: 'garnish-cocoa-powder', icon: '🌿', has3d: false },
      { id: 'garnish-salt-rim', icon: '🌿', has3d: false },
      { id: 'garnish-sugar-rim', icon: '🌿', has3d: false },
      { id: 'garnish-tajin-rim', icon: '🌿', has3d: false },
      { id: 'garnish-graham-rim', icon: '🌿', has3d: false },
      { id: 'garnish-bitters-drop-art', icon: '🌿', has3d: false },
      { id: 'garnish-aerated-foam', icon: '🌿', has3d: false }
    ]
  },
  {
    id: 'science',
    icon: '🧪',
    gradient: 'linear-gradient(135deg, #6c5ce7, #fd79a8)',
    has3d: false,
    articles: []
  },
  {
    id: 'cocktails',
    icon: '🍹',
    gradient: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
    has3d: false,
    articles: []
  },
  {
    id: 'pairings',
    icon: '🍴',
    gradient: 'linear-gradient(135deg, #d35400, #8e44ad)',
    has3d: false,
    articles: [
      { id: 'maridaje-principios-basicos', icon: '🍴', has3d: false },
      { id: 'food-pairing-hypothesis', icon: '🍴', has3d: false },
      { id: 'umami-quinto-sabor', icon: '🍴', has3d: false },
      { id: 'maridaje-tinto-carne', icon: '🍴', has3d: false },
      { id: 'maridaje-blanco-pescado', icon: '🍴', has3d: false },
      { id: 'maridaje-jerez-tapas', icon: '🍴', has3d: false },
      { id: 'espresso-y-postre', icon: '🍴', has3d: false },
      { id: 'aperitivo-italiano-spritz-negroni', icon: '🍴', has3d: false },
      { id: 'cerveza-y-queso-garrett-oliver', icon: '🍴', has3d: false },
      { id: 'mocktails-arte-del-no-alcohol', icon: '🍴', has3d: false },
      { id: 'gastrofisica-spence', icon: '🍴', has3d: false },
      { id: 'neurogastronomia-shepherd', icon: '🍴', has3d: false },
      { id: 'compuestos-aromaticos-y-maridaje', icon: '🍴', has3d: false },
      { id: 'estructura-vs-aroma-en-maridaje', icon: '🍴', has3d: false },
      { id: 'kokumi-y-grasa-en-maridaje', icon: '🍴', has3d: false },
      { id: 'maridaje-champagne-aperitivo', icon: '🍴', has3d: false },
      { id: 'maridaje-oporto-queso-azul', icon: '🍴', has3d: false },
      { id: 'maridaje-riesling-cocina-asiatica', icon: '🍴', has3d: false },
      { id: 'maridaje-natural-wine-comida', icon: '🍴', has3d: false },
      { id: 'maridaje-rosado-verano', icon: '🍴', has3d: false },
      { id: 'maridaje-vinos-naranjas', icon: '🍴', has3d: false },
      { id: 'maridajes-imposibles-esparrago-alcachofa', icon: '🍴', has3d: false },
      { id: 'cafe-especialidad-y-queso', icon: '🍴', has3d: false },
      { id: 'espresso-martini-historia', icon: '🍴', has3d: false },
      { id: 'irish-coffee-clasico', icon: '🍴', has3d: false },
      { id: 'carajillo-tradicion-iberica', icon: '🍴', has3d: false },
      { id: 'tiki-cocteles-y-comida-isleña', icon: '🍴', has3d: false },
      { id: 'highballs-japoneses-con-sushi', icon: '🍴', has3d: false },
      { id: 'cocteles-mexicanos-con-tacos', icon: '🍴', has3d: false },
      { id: 'brunch-cocteles-bloody-french-75', icon: '🍴', has3d: false },
      { id: 'menus-degustacion-cocteleros-death-and-co', icon: '🍴', has3d: false },
      { id: 'cocteles-de-sobremesa-digestivos', icon: '🍴', has3d: false },
      { id: 'tapas-y-cocteles-modernos', icon: '🍴', has3d: false },
      { id: 'ipa-con-picante', icon: '🍴', has3d: false },
      { id: 'stout-con-chocolate-y-ostras', icon: '🍴', has3d: false },
      { id: 'lambic-con-fruta-y-queso', icon: '🍴', has3d: false },
      { id: 'hefeweizen-con-brunch', icon: '🍴', has3d: false },
      { id: 'trapense-belga-con-cocina-monastica', icon: '🍴', has3d: false },
      { id: 'whisky-y-chocolate', icon: '🍴', has3d: false },
      { id: 'mezcal-con-mole-y-oaxaca', icon: '🍴', has3d: false },
      { id: 'gin-con-mariscos-y-ceviche', icon: '🍴', has3d: false },
      { id: 'ron-con-cocina-caribena', icon: '🍴', has3d: false },
      { id: 'sake-con-sushi-y-sashimi', icon: '🍴', has3d: false },
      { id: 'vodka-con-caviar-y-zakuski', icon: '🍴', has3d: false },
      { id: 'umami-vegetal-tomate-mushroom-miso', icon: '🍴', has3d: false },
      { id: 'brasicas-y-bebidas', icon: '🍴', has3d: false },
      { id: 'alta-cocina-vegetal-eleven-madison', icon: '🍴', has3d: false },
      { id: 'citricos-en-cocteleria', icon: '🍴', has3d: false },
      { id: 'frutas-tropicales-y-ron', icon: '🍴', has3d: false },
      { id: 'drupas-y-vinos-dulces', icon: '🍴', has3d: false },
      { id: 'sauternes-y-foie-gras', icon: '🍴', has3d: false },
      { id: 'pedro-ximenez-y-helado', icon: '🍴', has3d: false },
      { id: 'vintage-port-y-stilton', icon: '🍴', has3d: false },
      { id: 'tokaji-y-postres-de-fruta', icon: '🍴', has3d: false },
      { id: 'tabla-de-quesos-composicion', icon: '🍴', has3d: false },
      { id: 'sancerre-y-queso-de-cabra', icon: '🍴', has3d: false },
      { id: 'comte-y-vin-jaune', icon: '🍴', has3d: false },
      { id: 'manchego-y-tempranillo', icon: '🍴', has3d: false },
      { id: 'te-y-comida-segun-familia', icon: '🍴', has3d: false },
      { id: 'kombucha-como-maridaje', icon: '🍴', has3d: false },
      { id: 'shrubs-y-platos-grasos', icon: '🍴', has3d: false }
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
  'techniques.double-strain': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'when' }, { type: 'text-block', key: 'how' }, { type: 'tips', key: 'tips' }] },
  'techniques.dry-shake': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'when' }, { type: 'text-block', key: 'how' }, { type: 'tips', key: 'tips' }] },
  'techniques.fat-wash': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'when' }, { type: 'text-block', key: 'how' }, { type: 'tips', key: 'tips' }] },
  'techniques.infusion': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'when' }, { type: 'text-block', key: 'how' }, { type: 'tips', key: 'tips' }] },
  'techniques.swizzle': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'when' }, { type: 'text-block', key: 'how' }, { type: 'tips', key: 'tips' }] },

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
  'spirits.shochu': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.grappa': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.calvados': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.genever': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.cognac': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.armagnac': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.eau-de-vie': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.rhum-agricole': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.bourbon-rye': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.scotch': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.irish-whiskey': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.applejack': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.slivovitz': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.zubrowka': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'spirits.fireball': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
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

  'wines.lillet': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'wines.dubonnet': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'wines.sherry': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'wines.port': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'wines.madeira': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },

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

  'liqueurs.cointreau': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.grand-marnier': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.curacao': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.galliano': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.strega': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.cherry-heering': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.midori': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.licor-43': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.falernum': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.pimms': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.sloe-gin': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.creme-de-cassis': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.ginger-liqueur': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.ancho-reyes': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.amarula': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.tia-maria': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.advocaat': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.underberg': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.genepi': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.creme-de-mure': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'liqueurs.creme-de-peche': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },

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

  'amaros.jagermeister': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.becherovka': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'amaros.amaro-nonino': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },

  // ── MIXERS ────────────────────────────────────────────────
  'mixers.tonic-water': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.ginger-beer': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.syrups': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.citrus-juices': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.soda-water': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.cola': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.champagne-prosecco': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.coconut': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.juices': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.coffee-espresso': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.eggs-dairy': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.herbs-spices': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.creme-de-violette': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'mixers.allspice-dram': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },

  // ── BEER & CIDER ─────────────────────────────────────────
  'beer.cerveza': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },
  'beer.sidra': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'history' }, { type: 'text-block', key: 'production' }, { type: 'text-block', key: 'types' }, { type: 'text-block', key: 'tasting' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }] },

  // ── FAMILIES (cocktail families/structures) ────────────────
  'families.sours-family': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'structure' }, { type: 'text-block', key: 'examples' }, { type: 'tips', key: 'tips' }] },
  'families.fizz-family': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'structure' }, { type: 'text-block', key: 'examples' }, { type: 'tips', key: 'tips' }] },
  'families.flip-family': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'structure' }, { type: 'text-block', key: 'examples' }, { type: 'tips', key: 'tips' }] },
  'families.julep-family': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'structure' }, { type: 'text-block', key: 'examples' }, { type: 'tips', key: 'tips' }] },
  'families.punch-family': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'structure' }, { type: 'text-block', key: 'examples' }, { type: 'tips', key: 'tips' }] },
  'families.tiki-family': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'origin' }, { type: 'text-block', key: 'structure' }, { type: 'text-block', key: 'examples' }, { type: 'tips', key: 'tips' }] },

  // ── GLOSSARY ───────────────────────────────────────────────
  'glossary.spirits-terms': { sections: [{ type: 'glossary-list' }] },
  'glossary.bar-terms': { sections: [{ type: 'glossary-list' }] },
  'glossary.tasting-terms': { sections: [{ type: 'glossary-list' }] },
  'glossary.service-terms': { sections: [{ type: 'glossary-list' }] },

  // ── PAIRINGS ───────────────────────────────────────────────
  'pairings.maridaje-principios-basicos': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.food-pairing-hypothesis': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.umami-quinto-sabor': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridaje-tinto-carne': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridaje-blanco-pescado': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridaje-jerez-tapas': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.espresso-y-postre': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.aperitivo-italiano-spritz-negroni': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.cerveza-y-queso-garrett-oliver': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.mocktails-arte-del-no-alcohol': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.gastrofisica-spence': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.neurogastronomia-shepherd': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.compuestos-aromaticos-y-maridaje': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.estructura-vs-aroma-en-maridaje': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.kokumi-y-grasa-en-maridaje': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridaje-champagne-aperitivo': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridaje-oporto-queso-azul': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridaje-riesling-cocina-asiatica': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridaje-natural-wine-comida': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridaje-rosado-verano': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridaje-vinos-naranjas': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.maridajes-imposibles-esparrago-alcachofa': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.cafe-especialidad-y-queso': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.espresso-martini-historia': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.irish-coffee-clasico': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.carajillo-tradicion-iberica': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.tiki-cocteles-y-comida-isleña': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.highballs-japoneses-con-sushi': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.cocteles-mexicanos-con-tacos': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.brunch-cocteles-bloody-french-75': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.menus-degustacion-cocteleros-death-and-co': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.cocteles-de-sobremesa-digestivos': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.tapas-y-cocteles-modernos': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.ipa-con-picante': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.stout-con-chocolate-y-ostras': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.lambic-con-fruta-y-queso': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.hefeweizen-con-brunch': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.trapense-belga-con-cocina-monastica': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.whisky-y-chocolate': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.mezcal-con-mole-y-oaxaca': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.gin-con-mariscos-y-ceviche': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.ron-con-cocina-caribena': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.sake-con-sushi-y-sashimi': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.vodka-con-caviar-y-zakuski': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.umami-vegetal-tomate-mushroom-miso': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.brasicas-y-bebidas': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.alta-cocina-vegetal-eleven-madison': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.citricos-en-cocteleria': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.frutas-tropicales-y-ron': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.drupas-y-vinos-dulces': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.sauternes-y-foie-gras': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.pedro-ximenez-y-helado': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.vintage-port-y-stilton': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.tokaji-y-postres-de-fruta': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.tabla-de-quesos-composicion': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.sancerre-y-queso-de-cabra': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.comte-y-vin-jaune': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.manchego-y-tempranillo': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.te-y-comida-segun-familia': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.kombucha-como-maridaje': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'pairings.shrubs-y-platos-grasos': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'principles' }, { type: 'text-block', key: 'classic_pairings' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },

  // ── ICE ────────────────────────────────────────────────────
  'ice.ice-history-natural-trade': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-physics-of-cooling': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-clarity-science': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-shapes-spheres': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-shapes-large-cubes': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-shapes-collins': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-shapes-king-cube': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-shaved-japanese': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-crushed-pebble': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-cracked': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-block-craft': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-flavored': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-balls-techniques': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-temperature-targets': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-dilution-math': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-vs-no-ice-stirring': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-machine-types': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-storage-bar': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-carving-art': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'ice.ice-spear-collins': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'science' }, { type: 'text-block', key: 'technique' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },


  // ── GARNISHES ──────────────────────────────────────────────
  'garnishes.garnish-citrus-twist-theory': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-citrus-peel-expression': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-flame-orange': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-cherry-luxardo': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-cherry-amarena': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-olive-castelvetrano': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-olive-cocktail': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-onion-pickled': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-mint-sprig': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-mint-slap': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-basil-leaf': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-rosemary-sprig': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-thyme-sprig': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-lavender-sprig': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-edible-flower-pansy': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-edible-flower-borage': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-edible-flower-marigold': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-dehydrated-citrus': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-dehydrated-pineapple': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-dehydrated-apple': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-pineapple-frond': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-cinnamon-stick': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-star-anise': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-clove': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-nutmeg-grated': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-cocoa-powder': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-salt-rim': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-sugar-rim': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-tajin-rim': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-graham-rim': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-bitters-drop-art': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'garnishes.garnish-aerated-foam': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'how' }, { type: 'text-block', key: 'cocktails' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },


  // ── REGIONS ────────────────────────────────────────────────
  'regions.italy-aperitivo-culture': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.italy-amaro-culture': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.italy-vermouth-piedmont': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.france-aperitif-tradition': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.france-cocktail-history': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.japan-bar-precision': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.japan-highball-culture': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.mexico-cantinas': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.mexico-pulqueria-tradition': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.cuba-mojito-history': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.cuba-bodeguita-floridita': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.peru-pisco-culture': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.brazil-caipirinha-culture': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.scotland-whisky-tour': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.scotland-distillery-history': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.ireland-pub-culture': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.england-london-cocktail-renaissance': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.england-gin-craze': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.usa-prohibition': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.usa-tiki-revival': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.usa-craft-cocktail-revival': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.scandinavia-aquavit': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.scandinavia-akvavit-rituals': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.korea-soju-culture': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.thailand-mekong-spirit': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.vietnam-rice-spirits': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.india-feni-goa': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.china-baijiu-banquet': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.ethiopia-tej-honey-wine': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.mexico-mezcal-oaxaca': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.mexico-tequila-jalisco': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.caribbean-rum-tour': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.argentina-fernet-coke': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.hong-kong-bar-scene': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.singapore-cocktail-scene': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.australia-bar-scene': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.south-africa-brandy-history': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.germany-beer-purity': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.belgium-beer-monasteries': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.czech-pilsner-origin': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.russia-vodka-tradition': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.poland-vodka-tradition': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.spain-sherry-jerez': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.portugal-port-douro': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.georgia-qvevri-wine': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.turkey-raki-meze': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.greece-ouzo-tradition': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.lebanon-arak-tradition': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.iran-history-of-wine': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },
  'regions.egypt-distillation-roots': { sections: [{ type: 'text-block', key: 'description' }, { type: 'text-block', key: 'terroir' }, { type: 'text-block', key: 'signature' }, { type: 'tips', key: 'tips' }, { type: 'text-block', key: 'sources' }] },

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

// ─── Window bridge ──────────────────────────────────────────────────────
// Expose the catalog for Babel-in-browser consumers (KnowledgeScreen) that
// can't use ES-module imports. wiki.html keeps importing these as ESM exports.
if (typeof window !== 'undefined') {
  window.WIKI_CATEGORIES = WIKI_CATEGORIES;
  window.WIKI_ARTICLES = WIKI_ARTICLES;
  window.TIMELINE_DATA = TIMELINE_DATA;
  window.GLOSSARY_DATA = GLOSSARY_DATA;
}
