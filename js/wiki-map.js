// ─── Wiki Map: Interactive world map of spirit production regions ─────
import { t } from './lang.js';

let mapInstance = null;

// ─── Region data: spirit production areas around the world ──────────
const SPIRIT_REGIONS = [
  // ── Whisky ──
  { id: 'scotch', spirit: 'whisky', lat: 56.49, lng: -4.20, icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', origin: 'Scotland', place: 'Highlands / Speyside / Islay', dateCreated: '1494' },
  { id: 'irish-whiskey', spirit: 'whisky', lat: 53.35, lng: -6.26, icon: '☘️', origin: 'Ireland', place: 'Dublin / Cork', dateCreated: 's. XV' },
  { id: 'bourbon', spirit: 'whisky', lat: 38.25, lng: -85.76, icon: '🥃', origin: 'USA', place: 'Kentucky', dateCreated: 's. XVIII' },
  { id: 'japanese-whisky', spirit: 'whisky', lat: 34.69, lng: 135.50, icon: '🇯🇵', origin: 'Japan', place: 'Yamazaki / Yoichi', dateCreated: '1923' },
  // ── Gin ──
  { id: 'london-gin', spirit: 'gin', lat: 51.51, lng: -0.13, icon: '🌿', origin: 'England', place: 'London', dateCreated: 's. XVII' },
  { id: 'genever', spirit: 'gin', lat: 52.37, lng: 4.90, icon: '🇳🇱', origin: 'Netherlands', place: 'Amsterdam / Schiedam', dateCreated: 's. XVII' },
  // ── Tequila & Mezcal ──
  { id: 'tequila', spirit: 'tequila', lat: 20.88, lng: -103.84, icon: '🌵', origin: 'Mexico', place: 'Tequila, Jalisco', dateCreated: 's. XVI' },
  { id: 'mezcal', spirit: 'mezcal', lat: 17.07, lng: -96.72, icon: '🔥', origin: 'Mexico', place: 'Oaxaca', dateCreated: 's. XVI' },
  // ── Ron / Rum ──
  { id: 'ron-cuba', spirit: 'rum', lat: 23.11, lng: -82.37, icon: '🇨🇺', origin: 'Cuba', place: 'Havana / Santiago', dateCreated: 's. XVII' },
  { id: 'ron-jamaica', spirit: 'rum', lat: 18.11, lng: -77.30, icon: '🏝️', origin: 'Jamaica', place: 'Kingston', dateCreated: '1650s' },
  { id: 'ron-puerto-rico', spirit: 'rum', lat: 18.47, lng: -66.11, icon: '🇵🇷', origin: 'Puerto Rico', place: 'San Juan', dateCreated: 's. XVII' },
  { id: 'ron-barbados', spirit: 'rum', lat: 13.19, lng: -59.54, icon: '🇧🇧', origin: 'Barbados', place: 'Bridgetown', dateCreated: '1640s' },
  { id: 'ron-guatemala', spirit: 'rum', lat: 14.63, lng: -90.51, icon: '🇬🇹', origin: 'Guatemala', place: 'Quetzaltenango', dateCreated: 's. XIX' },
  { id: 'rhum-agricole', spirit: 'rum', lat: 14.64, lng: -61.02, icon: '🍬', origin: 'Martinique', place: 'Fort-de-France', dateCreated: 's. XVII' },
  // ── Vodka ──
  { id: 'vodka-poland', spirit: 'vodka', lat: 52.23, lng: 21.01, icon: '🇵🇱', origin: 'Poland', place: 'Warsaw / Poznan', dateCreated: 's. VIII-IX' },
  { id: 'vodka-russia', spirit: 'vodka', lat: 55.76, lng: 37.62, icon: '❄️', origin: 'Russia', place: 'Moscow', dateCreated: 's. VIII-IX' },
  { id: 'vodka-sweden', spirit: 'vodka', lat: 59.33, lng: 18.07, icon: '🇸🇪', origin: 'Sweden', place: 'Stockholm / Ahus', dateCreated: 's. XV' },
  // ── Brandy / Cognac ──
  { id: 'cognac', spirit: 'brandy', lat: 45.69, lng: -0.33, icon: '🍇', origin: 'France', place: 'Cognac', dateCreated: 's. XVI' },
  { id: 'armagnac', spirit: 'brandy', lat: 43.65, lng: 0.08, icon: '🏰', origin: 'France', place: 'Gascony', dateCreated: 's. XIV' },
  { id: 'brandy-jerez', spirit: 'brandy', lat: 36.69, lng: -6.14, icon: '🇪🇸', origin: 'Spain', place: 'Jerez de la Frontera', dateCreated: 's. XVI' },
  { id: 'calvados', spirit: 'brandy', lat: 48.88, lng: -0.17, icon: '🍎', origin: 'France', place: 'Normandy', dateCreated: 's. XVI' },
  { id: 'grappa', spirit: 'brandy', lat: 46.07, lng: 11.12, icon: '🇮🇹', origin: 'Italy', place: 'Veneto / Trentino', dateCreated: 's. XIV' },
  // ── Pisco ──
  { id: 'pisco-peru', spirit: 'pisco', lat: -13.72, lng: -76.21, icon: '🇵🇪', origin: 'Peru', place: 'Ica / Pisco', dateCreated: 's. XVI' },
  { id: 'pisco-chile', spirit: 'pisco', lat: -30.03, lng: -71.34, icon: '🇨🇱', origin: 'Chile', place: 'Elqui Valley', dateCreated: 's. XVI' },
  // ── Orujo ──
  { id: 'orujo', spirit: 'orujo', lat: 42.88, lng: -8.54, icon: '⚗️', origin: 'Spain', place: 'Galicia', dateCreated: 's. XVI' },
  // ── Cachaca ──
  { id: 'cachaca', spirit: 'cachaca', lat: -19.92, lng: -43.94, icon: '🇧🇷', origin: 'Brazil', place: 'Minas Gerais', dateCreated: '1530s' },
  // ── Sake ──
  { id: 'sake', spirit: 'sake', lat: 34.97, lng: 135.77, icon: '🍶', origin: 'Japan', place: 'Fushimi, Kyoto', dateCreated: '~700 d.C.' },
  // ── Soju ──
  { id: 'soju', spirit: 'soju', lat: 37.57, lng: 126.98, icon: '🇰🇷', origin: 'South Korea', place: 'Seoul', dateCreated: 's. XIII' },
  // ── Baijiu ──
  { id: 'baijiu', spirit: 'baijiu', lat: 29.59, lng: 106.55, icon: '🇨🇳', origin: 'China', place: 'Sichuan / Guizhou', dateCreated: '~800 d.C.' },
  // ── Aquavit ──
  { id: 'aquavit', spirit: 'aquavit', lat: 59.91, lng: 10.75, icon: '🇳🇴', origin: 'Norway / Scandinavia', place: 'Oslo', dateCreated: 's. XV' },
  // ── Raki / Ouzo ──
  { id: 'raki', spirit: 'raki', lat: 41.01, lng: 28.98, icon: '🇹🇷', origin: 'Turkey', place: 'Istanbul', dateCreated: 's. XVII' },
  { id: 'ouzo', spirit: 'ouzo', lat: 37.97, lng: 23.73, icon: '🇬🇷', origin: 'Greece', place: 'Lesbos / Athens', dateCreated: 's. XIX' },
  // ── Additional Rum ──
  { id: 'ron-dominicana', spirit: 'rum', lat: 18.47, lng: -69.90, icon: '🇩🇴', origin: 'Dominican Republic', place: 'Santo Domingo', dateCreated: 's. XVI' },
  { id: 'ron-venezuela', spirit: 'rum', lat: 10.50, lng: -66.92, icon: '🇻🇪', origin: 'Venezuela', place: 'Caracas', dateCreated: 's. XVIII' },
  { id: 'ron-colombia', spirit: 'rum', lat: 6.25, lng: -75.56, icon: '🇨🇴', origin: 'Colombia', place: 'Medellin', dateCreated: 's. XVII' },
  { id: 'ron-panama', spirit: 'rum', lat: 8.98, lng: -79.52, icon: '🇵🇦', origin: 'Panama', place: 'Herrera', dateCreated: 's. XVIII' },
  { id: 'ron-trinidad', spirit: 'rum', lat: 10.65, lng: -61.50, icon: '🇹🇹', origin: 'Trinidad & Tobago', place: 'Port of Spain', dateCreated: 's. XVII' },
  { id: 'ron-guyana', spirit: 'rum', lat: 6.80, lng: -58.16, icon: '🏴', origin: 'Guyana', place: 'Demerara', dateCreated: 's. XVII' },
  // ── Additional Agave ──
  { id: 'raicilla', spirit: 'mezcal', lat: 20.68, lng: -105.25, icon: '🌿', origin: 'Mexico', place: 'Jalisco (Sierra Occidental)', dateCreated: 's. XVII' },
  { id: 'sotol', spirit: 'mezcal', lat: 28.63, lng: -106.09, icon: '🏜️', origin: 'Mexico', place: 'Chihuahua', dateCreated: 's. XVI' },
  { id: 'bacanora', spirit: 'mezcal', lat: 28.95, lng: -109.41, icon: '🌵', origin: 'Mexico', place: 'Sonora', dateCreated: 's. XVII' },
  // ── Eaux de Vie / Fruit Spirits ──
  { id: 'kirsch', spirit: 'eaudevie', lat: 47.99, lng: 7.85, icon: '🍒', origin: 'Germany', place: 'Black Forest', dateCreated: 's. XVI' },
  { id: 'absinthe', spirit: 'eaudevie', lat: 46.77, lng: 6.63, icon: '🧚', origin: 'Switzerland / France', place: 'Val-de-Travers', dateCreated: '1792' },
  // ── Shochu ──
  { id: 'shochu', spirit: 'sake', lat: 31.60, lng: 130.56, icon: '🇯🇵', origin: 'Japan', place: 'Kagoshima / Kyushu', dateCreated: 's. XVI' },

  // ══ VINOS FORTIFICADOS ══
  // ── Jerez / Sherry ──
  { id: 'fino-jerez', spirit: 'fortified', lat: 36.69, lng: -6.14, icon: '🍷', origin: 'Spain', place: 'Jerez de la Frontera', dateCreated: 's. XVIII' },
  { id: 'manzanilla', spirit: 'fortified', lat: 36.78, lng: -6.35, icon: '🌊', origin: 'Spain', place: 'Sanlúcar de Barrameda', dateCreated: 's. XVIII' },
  // ── Oporto ──
  { id: 'porto', spirit: 'fortified', lat: 41.14, lng: -8.61, icon: '🇵🇹', origin: 'Portugal', place: 'Douro Valley', dateCreated: 's. XVII' },
  // ── Madeira ──
  { id: 'madeira', spirit: 'fortified', lat: 32.63, lng: -16.90, icon: '🏝️', origin: 'Portugal', place: 'Madeira Island', dateCreated: 's. XV' },

  // ══ VERMUTS Y APERITIVOS ══
  { id: 'vermut-rosso', spirit: 'vermouth', lat: 45.07, lng: 7.69, icon: '🍸', origin: 'Italy', place: 'Turin', dateCreated: '1786' },
  { id: 'vermut-dry', spirit: 'vermouth', lat: 43.18, lng: 3.00, icon: '🌿', origin: 'France', place: 'Marseillan', dateCreated: '1813' },
  { id: 'dubonnet', spirit: 'vermouth', lat: 48.86, lng: 2.35, icon: '🇫🇷', origin: 'France', place: 'Paris', dateCreated: 's. XIX' },
  { id: 'lillet', spirit: 'vermouth', lat: 44.78, lng: -0.30, icon: '🍋', origin: 'France', place: 'Podensac, Bordeaux', dateCreated: '1872' },

  // ══ LICORES MONASTICOS Y DE HIERBAS ══
  { id: 'chartreuse', spirit: 'liqueur', lat: 45.37, lng: 5.59, icon: '🟢', origin: 'France', place: 'Voiron', dateCreated: '1605' },
  { id: 'benedictine', spirit: 'liqueur', lat: 49.76, lng: 0.38, icon: '✝️', origin: 'France', place: 'Fécamp', dateCreated: '1510' },
  { id: 'galliano', spirit: 'liqueur', lat: 43.32, lng: 11.33, icon: '🌟', origin: 'Italy', place: 'Tuscany', dateCreated: '1896' },
  { id: 'strega', spirit: 'liqueur', lat: 41.13, lng: 14.78, icon: '🧙', origin: 'Italy', place: 'Benevento', dateCreated: '1860' },
  { id: 'drambuie', spirit: 'liqueur', lat: 55.95, lng: -3.19, icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', origin: 'Scotland', place: 'Edinburgh', dateCreated: '1745' },

  // ══ LICORES CITRICOS ══
  { id: 'cointreau', spirit: 'liqueur', lat: 47.47, lng: -0.56, icon: '🍊', origin: 'France', place: 'Angers', dateCreated: '1875' },
  { id: 'grand-marnier', spirit: 'liqueur', lat: 45.69, lng: -0.33, icon: '🥃', origin: 'France', place: 'Cognac region', dateCreated: '1880' },
  { id: 'curacao', spirit: 'liqueur', lat: 12.17, lng: -68.98, icon: '🏝️', origin: 'Curaçao / Netherlands', place: 'Curaçao Island', dateCreated: 's. XIX' },

  // ══ LICORES DE FRUTAS Y FLORES ══
  { id: 'maraschino', spirit: 'liqueur', lat: 44.12, lng: 15.23, icon: '🍒', origin: 'Croatia / Italy', place: 'Zadar', dateCreated: '1821' },
  { id: 'st-germain', spirit: 'liqueur', lat: 45.90, lng: 6.12, icon: '🌸', origin: 'France', place: 'French Alps', dateCreated: '2007' },
  { id: 'chambord', spirit: 'liqueur', lat: 47.62, lng: 1.52, icon: '👑', origin: 'France', place: 'Loire Valley', dateCreated: '1685' },
  { id: 'creme-cassis', spirit: 'liqueur', lat: 47.32, lng: 5.04, icon: '🫐', origin: 'France', place: 'Burgundy', dateCreated: '1841' },

  // ══ LICORES DE SEMILLAS Y CREMAS ══
  { id: 'amaretto', spirit: 'liqueur', lat: 45.70, lng: 8.63, icon: '🌰', origin: 'Italy', place: 'Saronno', dateCreated: '1525' },
  { id: 'frangelico', spirit: 'liqueur', lat: 44.70, lng: 8.04, icon: '🌰', origin: 'Italy', place: 'Piedmont', dateCreated: 's. XVIII' },
  { id: 'kahlua', spirit: 'liqueur', lat: 19.20, lng: -96.13, icon: '☕', origin: 'Mexico', place: 'Veracruz', dateCreated: '1936' },
  { id: 'baileys', spirit: 'liqueur', lat: 53.35, lng: -6.26, icon: '🥛', origin: 'Ireland', place: 'Dublin', dateCreated: '1974' },

  // ══ AMAROS ITALIANOS ══
  { id: 'fernet-branca', spirit: 'amaro', lat: 45.46, lng: 9.19, icon: '🌿', origin: 'Italy', place: 'Milan', dateCreated: '1845' },
  { id: 'amaro-averna', spirit: 'amaro', lat: 37.49, lng: 14.06, icon: '🍋', origin: 'Italy', place: 'Caltanissetta, Sicily', dateCreated: '1868' },
  { id: 'amaro-montenegro', spirit: 'amaro', lat: 44.49, lng: 11.34, icon: '🏔️', origin: 'Italy', place: 'Bologna', dateCreated: '1885' },
  { id: 'cynar', spirit: 'amaro', lat: 45.41, lng: 11.88, icon: '🌿', origin: 'Italy', place: 'Padua', dateCreated: '1952' },
  { id: 'ramazzotti', spirit: 'amaro', lat: 45.47, lng: 9.18, icon: '🍊', origin: 'Italy', place: 'Milan', dateCreated: '1815' },
  { id: 'nonino', spirit: 'amaro', lat: 46.10, lng: 13.24, icon: '🍇', origin: 'Italy', place: 'Friuli', dateCreated: '1933' },
  { id: 'braulio', spirit: 'amaro', lat: 46.47, lng: 10.37, icon: '🏔️', origin: 'Italy', place: 'Bormio', dateCreated: '1875' },

  // ══ AMARGOS CENTROEUROPEOS ══
  { id: 'jagermeister', spirit: 'amaro', lat: 52.16, lng: 10.53, icon: '🦌', origin: 'Germany', place: 'Wolfenbüttel', dateCreated: '1934' },
  { id: 'underberg', spirit: 'amaro', lat: 51.43, lng: 6.60, icon: '🌿', origin: 'Germany', place: 'Rheinberg', dateCreated: '1846' },

  // ══ APERITIVOS AMARGOS ROJOS ══
  { id: 'campari', spirit: 'aperitivo', lat: 45.47, lng: 9.19, icon: '🔴', origin: 'Italy', place: 'Milan', dateCreated: '1860' },
  { id: 'aperol', spirit: 'aperitivo', lat: 45.41, lng: 11.88, icon: '🧡', origin: 'Italy', place: 'Padua', dateCreated: '1919' },
  { id: 'suze', spirit: 'aperitivo', lat: 48.86, lng: 2.35, icon: '💛', origin: 'France', place: 'Paris', dateCreated: '1889' },

  // ══ COCKTAIL BITTERS ══
  { id: 'angostura', spirit: 'bitters', lat: 10.65, lng: -61.50, icon: '🏷️', origin: 'Trinidad & Tobago', place: 'Port of Spain', dateCreated: '1824' },
  { id: 'peychauds', spirit: 'bitters', lat: 29.95, lng: -90.07, icon: '⚜️', origin: 'USA', place: 'New Orleans', dateCreated: '1830' },
  { id: 'orange-bitters', spirit: 'bitters', lat: 51.51, lng: -0.13, icon: '🍊', origin: 'England', place: 'London', dateCreated: 's. XIX' },

  // ══ WIKI: FASE 1 — SPIRITS FALTANTES ══
  { id: 'applejack', spirit: 'brandy', lat: 40.85, lng: -74.43, icon: '🍎', origin: 'USA', place: 'New Jersey (Laird\u2019s)', dateCreated: '1698' },
  { id: 'slivovitz', spirit: 'eaudevie', lat: 44.02, lng: 20.92, icon: '🫐', origin: 'Serbia / Balkans', place: 'Šumadija', dateCreated: 's. XVI' },
  { id: 'zubrowka', spirit: 'vodka', lat: 52.70, lng: 23.87, icon: '🦬', origin: 'Poland', place: 'Białowieża Forest', dateCreated: 's. XVI' },
  { id: 'fireball', spirit: 'whisky', lat: 51.05, lng: -114.07, icon: '🔥', origin: 'Canada', place: 'Calgary, Alberta', dateCreated: '1984' },

  // ══ WIKI: FASE 1 — LICORES FALTANTES ══
  { id: 'triple-sec', spirit: 'liqueur', lat: 47.26, lng: -0.08, icon: '🍊', origin: 'France', place: 'Saumur (Combier)', dateCreated: '1834' },
  { id: 'sambuca', spirit: 'liqueur', lat: 42.09, lng: 11.80, icon: '⚫', origin: 'Italy', place: 'Civitavecchia (Molinari)', dateCreated: '1945' },
  { id: 'limoncello', spirit: 'liqueur', lat: 40.63, lng: 14.60, icon: '🍋', origin: 'Italy', place: 'Amalfi / Sorrento / Capri', dateCreated: 's. XX' },
  { id: 'pastis', spirit: 'liqueur', lat: 43.30, lng: 5.37, icon: '☀️', origin: 'France', place: 'Marseille (Ricard)', dateCreated: '1932' },
  { id: 'cherry-heering', spirit: 'liqueur', lat: 55.68, lng: 12.57, icon: '🍒', origin: 'Denmark', place: 'Copenhagen', dateCreated: '1818' },
  { id: 'midori', spirit: 'liqueur', lat: 34.69, lng: 135.50, icon: '🍈', origin: 'Japan', place: 'Osaka (Suntory)', dateCreated: '1978' },
  { id: 'licor-43', spirit: 'liqueur', lat: 37.60, lng: -0.98, icon: '🇪🇸', origin: 'Spain', place: 'Cartagena, Murcia', dateCreated: '1946' },
  { id: 'falernum', spirit: 'liqueur', lat: 13.10, lng: -59.62, icon: '🏝️', origin: 'Barbados', place: 'Caribbean', dateCreated: 's. XVIII' },
  { id: 'pimms', spirit: 'liqueur', lat: 51.52, lng: -0.09, icon: '🇬🇧', origin: 'England', place: 'London', dateCreated: '1823' },
  { id: 'sloe-gin', spirit: 'liqueur', lat: 50.37, lng: -4.14, icon: '🫐', origin: 'England', place: 'Plymouth', dateCreated: 's. XVII' },
  { id: 'ancho-reyes', spirit: 'liqueur', lat: 19.04, lng: -98.21, icon: '🌶️', origin: 'Mexico', place: 'Puebla', dateCreated: '2013' },
  { id: 'amarula', spirit: 'liqueur', lat: -25.75, lng: 28.19, icon: '🐘', origin: 'South Africa', place: 'Phalaborwa', dateCreated: '1989' },
  { id: 'tia-maria', spirit: 'liqueur', lat: 18.01, lng: -76.80, icon: '☕', origin: 'Jamaica', place: 'Kingston', dateCreated: '1940s' },
  { id: 'advocaat', spirit: 'liqueur', lat: 52.09, lng: 5.12, icon: '🥚', origin: 'Netherlands', place: 'Utrecht', dateCreated: 's. XIX' },
  { id: 'genepi', spirit: 'liqueur', lat: 45.54, lng: 6.87, icon: '🏔️', origin: 'France / Italy', place: 'Alps (Savoie / Aosta)', dateCreated: 's. XIX' },
  { id: 'creme-de-mure', spirit: 'liqueur', lat: 47.32, lng: 5.04, icon: '🫐', origin: 'France', place: 'Burgundy', dateCreated: 's. XX' },
  { id: 'creme-de-peche', spirit: 'liqueur', lat: 45.65, lng: 5.92, icon: '🍑', origin: 'France', place: 'Savoie', dateCreated: 's. XX' },
  { id: 'creme-de-violette', spirit: 'liqueur', lat: 48.58, lng: 7.75, icon: '💜', origin: 'France / Austria', place: 'Alsace / Vienna', dateCreated: 's. XIX' },
  { id: 'allspice-dram', spirit: 'liqueur', lat: 18.11, lng: -77.30, icon: '🫙', origin: 'Jamaica', place: 'Kingston', dateCreated: 's. XIX' },

  // ══ WIKI: FASE 1 — AMAROS FALTANTES ══
  { id: 'becherovka', spirit: 'amaro', lat: 50.23, lng: 12.87, icon: '🇨🇿', origin: 'Czech Republic', place: 'Karlovy Vary', dateCreated: '1807' },

  // ══ FASE 2 — VINOS TINTOS ══
  { id: 'bordeaux', spirit: 'wine', lat: 44.84, lng: -0.58, icon: '🍇', origin: 'France', place: 'Bordeaux / Médoc / Saint-Émilion', dateCreated: 's. I' },
  { id: 'burgundy', spirit: 'wine', lat: 47.05, lng: 4.84, icon: '🍷', origin: 'France', place: 'Côte d\u2019Or', dateCreated: 's. VI' },
  { id: 'rhone', spirit: 'wine', lat: 44.93, lng: 4.89, icon: '🍇', origin: 'France', place: 'Rhône Valley', dateCreated: 's. I' },
  { id: 'rioja', spirit: 'wine', lat: 42.46, lng: -2.45, icon: '🇪🇸', origin: 'Spain', place: 'La Rioja / Haro', dateCreated: 's. XI' },
  { id: 'ribera-duero', spirit: 'wine', lat: 41.50, lng: -3.92, icon: '🍇', origin: 'Spain', place: 'Ribera del Duero', dateCreated: 's. XII' },
  { id: 'priorat', spirit: 'wine', lat: 41.18, lng: 0.80, icon: '🏔️', origin: 'Spain', place: 'Priorat, Cataluña', dateCreated: 's. XII' },
  { id: 'chianti', spirit: 'wine', lat: 43.47, lng: 11.31, icon: '🇮🇹', origin: 'Italy', place: 'Tuscany', dateCreated: 's. XIII' },
  { id: 'barolo', spirit: 'wine', lat: 44.61, lng: 7.94, icon: '🍷', origin: 'Italy', place: 'Piedmont / Langhe', dateCreated: 's. XIX' },
  { id: 'brunello', spirit: 'wine', lat: 43.06, lng: 11.49, icon: '🍇', origin: 'Italy', place: 'Montalcino, Tuscany', dateCreated: '1888' },
  { id: 'napa', spirit: 'wine', lat: 38.30, lng: -122.29, icon: '🇺🇸', origin: 'USA', place: 'Napa Valley, California', dateCreated: 's. XIX' },
  { id: 'sonoma', spirit: 'wine', lat: 38.44, lng: -122.71, icon: '🌲', origin: 'USA', place: 'Sonoma, California', dateCreated: 's. XIX' },
  { id: 'willamette', spirit: 'wine', lat: 45.10, lng: -123.08, icon: '🇺🇸', origin: 'USA', place: 'Willamette Valley, Oregon', dateCreated: '1965' },
  { id: 'mendoza', spirit: 'wine', lat: -32.89, lng: -68.85, icon: '🇦🇷', origin: 'Argentina', place: 'Mendoza / Valle de Uco', dateCreated: 's. XVI' },
  { id: 'colchagua', spirit: 'wine', lat: -34.64, lng: -71.36, icon: '🇨🇱', origin: 'Chile', place: 'Valle de Colchagua', dateCreated: 's. XVI' },
  { id: 'stellenbosch', spirit: 'wine', lat: -33.94, lng: 18.86, icon: '🇿🇦', origin: 'South Africa', place: 'Stellenbosch', dateCreated: '1679' },
  { id: 'barossa', spirit: 'wine', lat: -34.53, lng: 138.95, icon: '🇦🇺', origin: 'Australia', place: 'Barossa Valley', dateCreated: '1842' },

  // ══ FASE 2 — VINOS BLANCOS Y DULCES ══
  { id: 'loire-valley', spirit: 'wine', lat: 47.30, lng: 2.83, icon: '🏰', origin: 'France', place: 'Loire / Sancerre / Vouvray', dateCreated: 's. V' },
  { id: 'alsace', spirit: 'wine', lat: 48.24, lng: 7.36, icon: '🍇', origin: 'France', place: 'Alsace', dateCreated: 's. IX' },
  { id: 'rias-baixas', spirit: 'wine', lat: 42.57, lng: -8.77, icon: '🌊', origin: 'Spain', place: 'Rías Baixas, Galicia', dateCreated: 's. XII' },
  { id: 'mosel', spirit: 'wine', lat: 49.75, lng: 6.98, icon: '🇩🇪', origin: 'Germany', place: 'Mosel Valley', dateCreated: 's. II' },
  { id: 'rheingau', spirit: 'wine', lat: 49.99, lng: 7.98, icon: '🍷', origin: 'Germany', place: 'Rheingau', dateCreated: 's. IX' },
  { id: 'tokaj', spirit: 'wine', lat: 48.12, lng: 21.40, icon: '🍯', origin: 'Hungary', place: 'Tokaj', dateCreated: 's. XVI' },
  { id: 'marlborough', spirit: 'wine', lat: -41.52, lng: 173.95, icon: '🇳🇿', origin: 'New Zealand', place: 'Marlborough', dateCreated: '1973' },

  // ══ FASE 2 — ESPUMOSOS ══
  { id: 'champagne', spirit: 'sparkling', lat: 49.04, lng: 3.96, icon: '🥂', origin: 'France', place: 'Reims / Épernay', dateCreated: 's. XVII' },
  { id: 'cremant', spirit: 'sparkling', lat: 48.24, lng: 7.36, icon: '🫧', origin: 'France', place: 'Alsace / Loire / Burgundy', dateCreated: 's. XIX' },
  { id: 'cava', spirit: 'sparkling', lat: 41.38, lng: 1.71, icon: '🫧', origin: 'Spain', place: 'Penedès, Cataluña', dateCreated: '1872' },
  { id: 'prosecco', spirit: 'sparkling', lat: 45.89, lng: 12.18, icon: '🇮🇹', origin: 'Italy', place: 'Valdobbiadene, Veneto', dateCreated: 's. XIX' },
  { id: 'franciacorta', spirit: 'sparkling', lat: 45.55, lng: 10.03, icon: '🥂', origin: 'Italy', place: 'Lombardy', dateCreated: '1961' },
  { id: 'asti', spirit: 'sparkling', lat: 44.90, lng: 8.21, icon: '🍇', origin: 'Italy', place: 'Piedmont', dateCreated: 's. XIX' },
  { id: 'sekt', spirit: 'sparkling', lat: 50.00, lng: 8.27, icon: '🇩🇪', origin: 'Germany', place: 'Rheinhessen', dateCreated: 's. XIX' },
  { id: 'english-sparkling', spirit: 'sparkling', lat: 50.95, lng: -0.44, icon: '🇬🇧', origin: 'England', place: 'Sussex / Kent', dateCreated: '1988' },

  // ══ FASE 2 — CERVEZA Y SIDRA ══
  { id: 'cerveza-pilsner', spirit: 'beer', lat: 49.75, lng: 13.38, icon: '🍺', origin: 'Czech Republic', place: 'Pilsen', dateCreated: '1842' },
  { id: 'cerveza-munich', spirit: 'beer', lat: 48.14, lng: 11.58, icon: '🇩🇪', origin: 'Germany', place: 'Munich / Bavaria', dateCreated: 's. XVI' },
  { id: 'cerveza-dublin', spirit: 'beer', lat: 53.34, lng: -6.26, icon: '☘️', origin: 'Ireland', place: 'Dublin (Guinness)', dateCreated: '1759' },
  { id: 'cerveza-belgium', spirit: 'beer', lat: 50.85, lng: 4.35, icon: '🍻', origin: 'Belgium', place: 'Brussels / Flanders', dateCreated: 's. XII' },
  { id: 'cerveza-portland', spirit: 'beer', lat: 45.52, lng: -122.68, icon: '🍺', origin: 'USA', place: 'Portland / Pacific Northwest', dateCreated: '1980s' },
  { id: 'sidra-asturias', spirit: 'beer', lat: 43.36, lng: -5.85, icon: '🍏', origin: 'Spain', place: 'Asturias / Oviedo', dateCreated: 's. I' },
  { id: 'sidra-normandie', spirit: 'beer', lat: 49.18, lng: -0.37, icon: '🍎', origin: 'France', place: 'Normandy', dateCreated: 's. XI' },

  // ══ FASE 3 — REFRESCOS ══
  { id: 'coca-cola', spirit: 'soda', lat: 33.76, lng: -84.39, icon: '🥤', origin: 'USA', place: 'Atlanta, Georgia', dateCreated: '1886' },
  { id: 'pepsi', spirit: 'soda', lat: 35.11, lng: -77.04, icon: '🥤', origin: 'USA', place: 'New Bern, North Carolina', dateCreated: '1893' },
  { id: 'dr-pepper', spirit: 'soda', lat: 31.55, lng: -97.15, icon: '🥤', origin: 'USA', place: 'Waco, Texas', dateCreated: '1885' },
  { id: 'schweppes', spirit: 'soda', lat: 46.20, lng: 6.14, icon: '🫧', origin: 'Switzerland / UK', place: 'Geneva / London', dateCreated: '1783' },
  { id: 'fever-tree', spirit: 'soda', lat: 51.51, lng: -0.08, icon: '🌳', origin: 'England', place: 'London', dateCreated: '2005' },
  { id: 'canada-dry', spirit: 'soda', lat: 43.65, lng: -79.38, icon: '🍁', origin: 'Canada', place: 'Toronto', dateCreated: '1904' },
  { id: 'ginger-beer-jamaica', spirit: 'soda', lat: 18.02, lng: -76.80, icon: '🫚', origin: 'Jamaica', place: 'Kingston', dateCreated: 's. XVIII' },
  { id: 'irn-bru', spirit: 'soda', lat: 55.86, lng: -4.25, icon: '🧡', origin: 'Scotland', place: 'Glasgow', dateCreated: '1901' },
  { id: 'bitter-kas', spirit: 'soda', lat: 43.26, lng: -2.93, icon: '🟠', origin: 'Spain', place: 'Vitoria / País Vasco', dateCreated: '1956' },
  { id: 'guarana', spirit: 'soda', lat: -3.12, lng: -60.02, icon: '🌰', origin: 'Brazil', place: 'Amazonas / Maués', dateCreated: '1921' },
  { id: 'inca-kola', spirit: 'soda', lat: -12.05, lng: -77.04, icon: '💛', origin: 'Peru', place: 'Lima', dateCreated: '1935' },
  { id: 'ramune', spirit: 'soda', lat: 35.68, lng: 139.69, icon: '🇯🇵', origin: 'Japan', place: 'Tokyo / Kobe', dateCreated: '1884' },

  // ══ FASE 3 — CAFÉ ══
  { id: 'coffee-ethiopia', spirit: 'coffee', lat: 7.25, lng: 36.52, icon: '🌱', origin: 'Ethiopia', place: 'Kaffa / Sidamo / Yirgacheffe', dateCreated: 's. IX' },
  { id: 'coffee-yemen', spirit: 'coffee', lat: 13.32, lng: 43.24, icon: '⛰️', origin: 'Yemen', place: 'Mocha', dateCreated: 's. XV' },
  { id: 'coffee-colombia', spirit: 'coffee', lat: 4.81, lng: -75.69, icon: '🇨🇴', origin: 'Colombia', place: 'Eje Cafetero', dateCreated: 's. XVIII' },
  { id: 'coffee-brazil', spirit: 'coffee', lat: -21.17, lng: -44.97, icon: '🇧🇷', origin: 'Brazil', place: 'Minas Gerais', dateCreated: 's. XVIII' },
  { id: 'coffee-jamaica', spirit: 'coffee', lat: 18.04, lng: -76.56, icon: '🏔️', origin: 'Jamaica', place: 'Blue Mountains', dateCreated: '1728' },
  { id: 'espresso-italy', spirit: 'coffee', lat: 45.46, lng: 9.19, icon: '☕', origin: 'Italy', place: 'Milan / Turin', dateCreated: '1884' },
  { id: 'coffee-kenya', spirit: 'coffee', lat: -0.43, lng: 36.96, icon: '🌍', origin: 'Kenya', place: 'Central Highlands', dateCreated: '1893' },

  // ══ FASE 3 — TÉ ══
  { id: 'tea-fujian', spirit: 'tea', lat: 27.33, lng: 117.36, icon: '🍵', origin: 'China', place: 'Fujian / Wuyi', dateCreated: 's. III a.C.' },
  { id: 'tea-yunnan', spirit: 'tea', lat: 22.01, lng: 100.80, icon: '🍃', origin: 'China', place: 'Yunnan (Pu-erh)', dateCreated: 's. VII' },
  { id: 'tea-darjeeling', spirit: 'tea', lat: 27.04, lng: 88.26, icon: '🇮🇳', origin: 'India', place: 'Darjeeling', dateCreated: '1841' },
  { id: 'tea-assam', spirit: 'tea', lat: 26.74, lng: 94.22, icon: '🌿', origin: 'India', place: 'Assam', dateCreated: '1837' },
  { id: 'tea-uji', spirit: 'tea', lat: 34.88, lng: 135.81, icon: '🍵', origin: 'Japan', place: 'Uji, Kyoto', dateCreated: 's. XII' },
  { id: 'tea-ceylon', spirit: 'tea', lat: 6.97, lng: 80.79, icon: '🇱🇰', origin: 'Sri Lanka', place: 'Nuwara Eliya', dateCreated: '1867' },
  { id: 'tea-taiwan', spirit: 'tea', lat: 23.57, lng: 120.90, icon: '⛰️', origin: 'Taiwan', place: 'Alishan', dateCreated: 's. XVIII' },
  { id: 'mate', spirit: 'tea', lat: -31.42, lng: -64.18, icon: '🧉', origin: 'Argentina / Paraguay', place: 'Misiones / Paraguay', dateCreated: 's. XVI' },
];

// Spirit color mapping for markers
const SPIRIT_COLORS = {
  whisky: '#d35400',
  gin: '#27ae60',
  tequila: '#f39c12',
  mezcal: '#e67e22',
  rum: '#c0392b',
  vodka: '#3498db',
  brandy: '#8e44ad',
  pisco: '#f1c40f',
  orujo: '#7f8c8d',
  cachaca: '#2ecc71',
  sake: '#ecf0f1',
  soju: '#1abc9c',
  baijiu: '#e74c3c',
  aquavit: '#2980b9',
  raki: '#9b59b6',
  ouzo: '#34495e',
  eaudevie: '#a3d977',
  fortified: '#722f37',
  vermouth: '#c39bd3',
  liqueur: '#f4d03f',
  amaro: '#6e2c00',
  aperitivo: '#e74c3c',
  bitters: '#d4ac0d',
  wine: '#922b3e',
  sparkling: '#f5d76e',
  beer: '#d4a017',
  soda: '#e84393',
  coffee: '#6f4e37',
  tea: '#4a9960',
};

// Category groups for filtering. Order matters for the UI.
const FILTER_GROUPS = [
  { id: 'spirits',    spirits: ['whisky','gin','tequila','mezcal','rum','vodka','brandy','pisco','orujo','cachaca','sake','soju','baijiu','aquavit','raki','ouzo','eaudevie'] },
  { id: 'wine',       spirits: ['wine','fortified'] },
  { id: 'sparkling',  spirits: ['sparkling'] },
  { id: 'liqueur',    spirits: ['liqueur','vermouth'] },
  { id: 'amaro',      spirits: ['amaro','aperitivo','bitters'] },
  { id: 'beer',       spirits: ['beer'] },
  { id: 'soda',       spirits: ['soda'] },
  { id: 'coffee',     spirits: ['coffee'] },
  { id: 'tea',        spirits: ['tea'] },
];

// Markers kept in memory so the filter can toggle them on/off.
let markersByGroup = {};
let activeGroups = new Set();

function groupIdForSpirit(spirit) {
  for (const g of FILTER_GROUPS) {
    if (g.spirits.includes(spirit)) return g.id;
  }
  return 'spirits';
}

function applyFilter() {
  if (!mapInstance) return;
  Object.entries(markersByGroup).forEach(([groupId, markers]) => {
    const visible = activeGroups.has(groupId);
    markers.forEach(m => {
      if (visible) {
        if (!mapInstance.hasLayer(m)) m.addTo(mapInstance);
      } else {
        if (mapInstance.hasLayer(m)) mapInstance.removeLayer(m);
      }
    });
  });
}

function buildFilterPanel(container) {
  const panel = document.createElement('div');
  panel.className = 'spirit-map-filter';

  FILTER_GROUPS.forEach(group => {
    const color = SPIRIT_COLORS[group.spirits[0]] || '#ffffff';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'spirit-map-filter-btn active';
    btn.dataset.group = group.id;
    btn.style.setProperty('--filter-color', color);
    btn.innerHTML = `
      <span class="spirit-map-filter-dot" style="background:${color}"></span>
      <span class="spirit-map-filter-label">${t(`wiki.map.filter.${group.id}`)}</span>
    `;
    btn.addEventListener('click', () => {
      if (activeGroups.has(group.id)) {
        activeGroups.delete(group.id);
        btn.classList.remove('active');
      } else {
        activeGroups.add(group.id);
        btn.classList.add('active');
      }
      applyFilter();
    });
    panel.appendChild(btn);
  });

  container.appendChild(panel);
}

/**
 * Initialize or update the spirit regions map.
 * @param {HTMLElement} container — the DOM element to mount the map into
 */
export function initSpiritMap(container) {
  if (!container) return;
  // Ensure Leaflet is loaded
  if (typeof L === 'undefined') {
    container.innerHTML = '<p style="text-align:center;padding:2rem;color:#aaa;">Map loading...</p>';
    return;
  }

  // Destroy previous instance
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  markersByGroup = {};
  activeGroups = new Set(FILTER_GROUPS.map(g => g.id));

  // Reset container and build layout: filter panel + map body
  container.innerHTML = '';
  container.classList.add('spirit-map-root');
  buildFilterPanel(container);
  const mapBody = document.createElement('div');
  mapBody.className = 'spirit-map-body';
  container.appendChild(mapBody);

  // Create map
  mapInstance = L.map(mapBody, {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 8,
    zoomControl: true,
    attributionControl: false,
  });

  // Dark-themed tile layer (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapInstance);

  // Add markers for each region
  SPIRIT_REGIONS.forEach(region => {
    const color = SPIRIT_COLORS[region.spirit] || '#ffffff';
    const name = t(`wiki.map.${region.id}`);
    const desc = t(`wiki.map.${region.id}.desc`);
    const spiritName = t(`wiki.map.spirit.${region.spirit}`);

    const markerIcon = L.divIcon({
      className: 'spirit-marker',
      html: `<div class="spirit-marker-dot" style="background:${color};box-shadow:0 0 8px ${color}">${region.icon}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([region.lat, region.lng], { icon: markerIcon }).addTo(mapInstance);

    // Build origin line: "Origin · Place"
    const originParts = [region.origin, region.place].filter(Boolean);
    const originLine = originParts.join(' · ');

    // Build date line: "Since XXXX"
    const dateLine = region.dateCreated
      ? `${t('wiki.map.since')} ${region.dateCreated}`
      : '';

    marker.bindPopup(`
      <div class="spirit-popup">
        <div class="spirit-popup-icon">${region.icon}</div>
        <div class="spirit-popup-title">${name}</div>
        <div class="spirit-popup-spirit" style="color:${color}">${spiritName}</div>
        ${originLine ? `<div class="spirit-popup-origin">${originLine}</div>` : ''}
        ${dateLine ? `<div class="spirit-popup-date">${dateLine}</div>` : ''}
        <div class="spirit-popup-desc">${desc}</div>
      </div>
    `, {
      className: 'spirit-popup-container',
      maxWidth: 280,
    });

    const groupId = groupIdForSpirit(region.spirit);
    if (!markersByGroup[groupId]) markersByGroup[groupId] = [];
    markersByGroup[groupId].push(marker);
  });

  // Force map to resize correctly
  setTimeout(() => mapInstance.invalidateSize(), 100);
}

/**
 * Dispose map instance.
 */
export function disposeMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
}
