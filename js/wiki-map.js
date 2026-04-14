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
};

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

  // Create map
  mapInstance = L.map(container, {
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

    marker.bindPopup(`
      <div class="spirit-popup">
        <div class="spirit-popup-icon">${region.icon}</div>
        <div class="spirit-popup-title">${name}</div>
        <div class="spirit-popup-spirit" style="color:${color}">${spiritName}</div>
        <div class="spirit-popup-desc">${desc}</div>
      </div>
    `, {
      className: 'spirit-popup-container',
      maxWidth: 250,
    });
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
