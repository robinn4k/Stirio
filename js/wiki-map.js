// ─── Wiki Map: Interactive world map of spirit production regions ─────
import { t } from './lang.js';

let mapInstance = null;

// ─── Region data: spirit production areas around the world ──────────
const SPIRIT_REGIONS = [
  // Whisky
  { id: 'scotch', spirit: 'whisky', lat: 56.49, lng: -4.20, icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'irish-whiskey', spirit: 'whisky', lat: 53.35, lng: -6.26, icon: '☘️' },
  { id: 'bourbon', spirit: 'whisky', lat: 38.25, lng: -85.76, icon: '🥃' },
  { id: 'japanese-whisky', spirit: 'whisky', lat: 34.69, lng: 135.50, icon: '🇯🇵' },
  // Gin
  { id: 'london-gin', spirit: 'gin', lat: 51.51, lng: -0.13, icon: '🌿' },
  { id: 'genever', spirit: 'gin', lat: 52.37, lng: 4.90, icon: '🇳🇱' },
  // Tequila & Mezcal
  { id: 'tequila', spirit: 'tequila', lat: 20.88, lng: -103.84, icon: '🌵' },
  { id: 'mezcal', spirit: 'mezcal', lat: 17.07, lng: -96.72, icon: '🔥' },
  // Ron / Rum
  { id: 'ron-cuba', spirit: 'rum', lat: 23.11, lng: -82.37, icon: '🇨🇺' },
  { id: 'ron-jamaica', spirit: 'rum', lat: 18.11, lng: -77.30, icon: '🏝️' },
  { id: 'ron-puerto-rico', spirit: 'rum', lat: 18.47, lng: -66.11, icon: '🇵🇷' },
  { id: 'ron-barbados', spirit: 'rum', lat: 13.19, lng: -59.54, icon: '🇧🇧' },
  { id: 'ron-guatemala', spirit: 'rum', lat: 14.63, lng: -90.51, icon: '🇬🇹' },
  { id: 'rhum-agricole', spirit: 'rum', lat: 14.64, lng: -61.02, icon: '🍬' },
  // Vodka
  { id: 'vodka-poland', spirit: 'vodka', lat: 52.23, lng: 21.01, icon: '🇵🇱' },
  { id: 'vodka-russia', spirit: 'vodka', lat: 55.76, lng: 37.62, icon: '❄️' },
  { id: 'vodka-sweden', spirit: 'vodka', lat: 59.33, lng: 18.07, icon: '🇸🇪' },
  // Brandy / Coñac
  { id: 'cognac', spirit: 'brandy', lat: 45.69, lng: -0.33, icon: '🍇' },
  { id: 'armagnac', spirit: 'brandy', lat: 43.65, lng: 0.08, icon: '🏰' },
  { id: 'brandy-jerez', spirit: 'brandy', lat: 36.69, lng: -6.14, icon: '🇪🇸' },
  { id: 'calvados', spirit: 'brandy', lat: 48.88, lng: -0.17, icon: '🍎' },
  { id: 'grappa', spirit: 'brandy', lat: 46.07, lng: 11.12, icon: '🇮🇹' },
  // Pisco
  { id: 'pisco-peru', spirit: 'pisco', lat: -13.72, lng: -76.21, icon: '🇵🇪' },
  { id: 'pisco-chile', spirit: 'pisco', lat: -30.03, lng: -71.34, icon: '🇨🇱' },
  // Orujo
  { id: 'orujo', spirit: 'orujo', lat: 42.88, lng: -8.54, icon: '⚗️' },
  // Cachaça
  { id: 'cachaca', spirit: 'cachaca', lat: -19.92, lng: -43.94, icon: '🇧🇷' },
  // Sake
  { id: 'sake', spirit: 'sake', lat: 34.97, lng: 135.77, icon: '🍶' },
  // Soju
  { id: 'soju', spirit: 'soju', lat: 37.57, lng: 126.98, icon: '🇰🇷' },
  // Baijiu
  { id: 'baijiu', spirit: 'baijiu', lat: 29.59, lng: 106.55, icon: '🇨🇳' },
  // Aquavit
  { id: 'aquavit', spirit: 'aquavit', lat: 59.91, lng: 10.75, icon: '🇳🇴' },
  // Raki / Ouzo
  { id: 'raki', spirit: 'raki', lat: 41.01, lng: 28.98, icon: '🇹🇷' },
  { id: 'ouzo', spirit: 'ouzo', lat: 37.97, lng: 23.73, icon: '🇬🇷' },
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
