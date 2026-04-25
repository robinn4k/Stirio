// Stirio — Mode registry (Phase 5a).
//
// Single source of truth for the 16 play modes. Consumed by:
//   • js/screens/ModeSheet.jsx — to render the grouped picker (mode='any')
//     and to look up icons / colors when rendering a single-mode card.
//   • js/screens/Home.jsx       — (Phase 5b) to drive section reorganization.
//   • js/app.jsx                — (future) to resolve openMode() to a route.
//
// Each entry has:
//   id        string — used as openMode() arg AND as i18n key prefix
//                      (mode.<id>.title / .sub / .body / .cta)
//   group     'aprender' | 'jugar' | 'consultar'
//   icon      emoji shown in the picker tile and per-mode card hero
//   color     CSS token used as the tile's accent
//   route     optional — name of the router route this mode opens
//   special   optional — 'daily' | 'speed' for modes that build a lesson
//                        eagerly instead of navigating to a subscreen
//
// Group rationale (decided in Phase 5 planning):
//   aprender  — flows that teach (Daily, Speed, Academy, Free Quiz)
//   jugar     — head-to-head & mini-games (Duel, Builder, Blind, Arcade,
//               Memory, Rhythm, Comanda)
//   consultar — reference / reading (Recetas, Wiki, Glosario, Mapa, Library)

export const MODES = [
  // ───── Aprender ─────────────────────────────────────────────────────────
  { id: 'daily',    group: 'aprender',  icon: '📅',  color: 'var(--amber)',  special: 'daily' },
  { id: 'speed',    group: 'aprender',  icon: '⚡',  color: 'var(--amber)',  special: 'speed' },
  { id: 'academy',  group: 'aprender',  icon: '🎓',  color: 'var(--cyan)',   route: 'academy-hub' },
  { id: 'freequiz', group: 'aprender',  icon: '🎲',  color: 'var(--violet)', route: 'freequiz' },

  // ───── Jugar ────────────────────────────────────────────────────────────
  { id: 'duel',     group: 'jugar',     icon: '⚔️',  color: 'var(--berry)',  route: 'duel' },
  { id: 'builder',  group: 'jugar',     icon: '🍹',  color: 'var(--amber)',  route: 'builder' },
  { id: 'blind',    group: 'jugar',     icon: '👃',  color: 'var(--violet)', route: 'blind' },
  { id: 'arcade',   group: 'jugar',     icon: '🕹️',  color: 'var(--cyan)',   route: 'arcade' },
  { id: 'memory',   group: 'jugar',     icon: '🧠',  color: 'var(--berry)',  route: 'memory' },
  { id: 'rhythm',   group: 'jugar',     icon: '🥁',  color: 'var(--amber)',  route: 'rhythm' },
  { id: 'comanda',  group: 'jugar',     icon: '🎟️',  color: 'var(--violet)', route: 'comanda' },

  // ───── Consultar ────────────────────────────────────────────────────────
  { id: 'iba',      group: 'consultar', icon: '📖',  color: 'var(--amber)',  route: 'iba' },
  { id: 'wiki',     group: 'consultar', icon: '📜',  color: 'var(--cyan)',   route: 'wiki' },
  { id: 'glossary', group: 'consultar', icon: '📝',  color: 'var(--berry)',  route: 'glossary' },
  { id: 'map',      group: 'consultar', icon: '🗺️',  color: 'var(--violet)', route: 'map' },
  { id: 'library',  group: 'consultar', icon: '📚',  color: 'var(--cyan)',   route: 'library' },
];

export const MODE_GROUPS = ['aprender', 'jugar', 'consultar'];

export const getMode = (id) => MODES.find(m => m.id === id) || null;

export const getModesByGroup = (group) => MODES.filter(m => m.group === group);
