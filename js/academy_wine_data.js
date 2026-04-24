// ─────────────────────────────────────────────────────────────
// academy_wine_data.js – Sommelier Academy level & lesson content
// Same shape as academy_data.js (ACADEMY_LEVELS): each level has
// { id, key, descKey, icon, color, passThreshold, lessons[], sequence[], questions[] }
// All user-visible strings are i18n keys resolved at render time.
// ─────────────────────────────────────────────────────────────

export const ACADEMY_WINE_LEVELS = [
  // ═══════════════════════════════════════════════════════════
  // LEVEL 0 — Fundamentos del vino
  // ═══════════════════════════════════════════════════════════
  {
    id: 0,
    key: 'academy.wine.l0.title',
    descKey: 'academy.wine.l0.desc',
    icon: '🍇',
    color: '#8e1b3d',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.wine.l0.les0',
        cards: [
          { type: 'theory', key: 'academy.wine.l0.t1' },
          { type: 'tip',    key: 'academy.wine.l0.tip1' },
          { type: 'theory', key: 'academy.wine.l0.t2' },
          { type: 'note',   key: 'academy.wine.l0.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.wine.l0.les0.q1', a: ['academy.wine.l0.les0.q1a1','academy.wine.l0.les0.q1a2','academy.wine.l0.les0.q1a3','academy.wine.l0.les0.q1a4'], exp: 'academy.wine.l0.les0.q1exp' },
          { q: 'academy.wine.l0.les0.q2', a: ['academy.wine.l0.les0.q2a1','academy.wine.l0.les0.q2a2','academy.wine.l0.les0.q2a3','academy.wine.l0.les0.q2a4'], exp: 'academy.wine.l0.les0.q2exp' },
          { q: 'academy.wine.l0.les0.q3', a: ['academy.wine.l0.les0.q3a1','academy.wine.l0.les0.q3a2','academy.wine.l0.les0.q3a3','academy.wine.l0.les0.q3a4'], exp: 'academy.wine.l0.les0.q3exp' },
        ],
      },
      {
        key: 'academy.wine.l0.les1',
        cards: [
          { type: 'theory', key: 'academy.wine.l0.t3' },
          { type: 'tip',    key: 'academy.wine.l0.tip2' },
          { type: 'theory', key: 'academy.wine.l0.t4' },
          { type: 'note',   key: 'academy.wine.l0.note2' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.wine.l0.les1.q1', a: ['academy.wine.l0.les1.q1a1','academy.wine.l0.les1.q1a2','academy.wine.l0.les1.q1a3','academy.wine.l0.les1.q1a4'], exp: 'academy.wine.l0.les1.q1exp' },
          { q: 'academy.wine.l0.les1.q2', a: ['academy.wine.l0.les1.q2a1','academy.wine.l0.les1.q2a2','academy.wine.l0.les1.q2a3','academy.wine.l0.les1.q2a4'], exp: 'academy.wine.l0.les1.q2exp' },
          { q: 'academy.wine.l0.les1.q3', a: ['academy.wine.l0.les1.q3a1','academy.wine.l0.les1.q3a2','academy.wine.l0.les1.q3a3','academy.wine.l0.les1.q3a4'], exp: 'academy.wine.l0.les1.q3exp' },
        ],
      },
      {
        key: 'academy.wine.l0.les2',
        cards: [
          { type: 'theory', key: 'academy.wine.l0.t5' },
          { type: 'tip',    key: 'academy.wine.l0.tip3' },
          { type: 'theory', key: 'academy.wine.l0.t6' },
          { type: 'note',   key: 'academy.wine.l0.note3' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.wine.l0.les2.q1', a: ['academy.wine.l0.les2.q1a1','academy.wine.l0.les2.q1a2','academy.wine.l0.les2.q1a3','academy.wine.l0.les2.q1a4'], exp: 'academy.wine.l0.les2.q1exp' },
          { q: 'academy.wine.l0.les2.q2', a: ['academy.wine.l0.les2.q2a1','academy.wine.l0.les2.q2a2','academy.wine.l0.les2.q2a3','academy.wine.l0.les2.q2a4'], exp: 'academy.wine.l0.les2.q2exp' },
          { q: 'academy.wine.l0.les2.q3', a: ['academy.wine.l0.les2.q3a1','academy.wine.l0.les2.q3a2','academy.wine.l0.les2.q3a3','academy.wine.l0.les2.q3a4'], exp: 'academy.wine.l0.les2.q3exp' },
        ],
      },
    ],
    sequence: [
      { type: 'lesson', index: 0 },
      { type: 'lesson', index: 1 },
      { type: 'lesson', index: 2 },
    ],
    questions: [],
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 1 — Cata y servicio
  // ═══════════════════════════════════════════════════════════
  {
    id: 1,
    key: 'academy.wine.l1.title',
    descKey: 'academy.wine.l1.desc',
    icon: '🍷',
    color: '#5a0f28',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.wine.l1.les0',
        cards: [
          { type: 'theory', key: 'academy.wine.l1.t1' },
          { type: 'tip',    key: 'academy.wine.l1.tip1' },
          { type: 'theory', key: 'academy.wine.l1.t2' },
          { type: 'note',   key: 'academy.wine.l1.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.wine.l1.les0.q1', a: ['academy.wine.l1.les0.q1a1','academy.wine.l1.les0.q1a2','academy.wine.l1.les0.q1a3','academy.wine.l1.les0.q1a4'], exp: 'academy.wine.l1.les0.q1exp' },
          { q: 'academy.wine.l1.les0.q2', a: ['academy.wine.l1.les0.q2a1','academy.wine.l1.les0.q2a2','academy.wine.l1.les0.q2a3','academy.wine.l1.les0.q2a4'], exp: 'academy.wine.l1.les0.q2exp' },
          { q: 'academy.wine.l1.les0.q3', a: ['academy.wine.l1.les0.q3a1','academy.wine.l1.les0.q3a2','academy.wine.l1.les0.q3a3','academy.wine.l1.les0.q3a4'], exp: 'academy.wine.l1.les0.q3exp' },
        ],
      },
      {
        key: 'academy.wine.l1.les1',
        cards: [
          { type: 'theory', key: 'academy.wine.l1.t3' },
          { type: 'tip',    key: 'academy.wine.l1.tip2' },
          { type: 'theory', key: 'academy.wine.l1.t4' },
          { type: 'note',   key: 'academy.wine.l1.note2' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.wine.l1.les1.q1', a: ['academy.wine.l1.les1.q1a1','academy.wine.l1.les1.q1a2','academy.wine.l1.les1.q1a3','academy.wine.l1.les1.q1a4'], exp: 'academy.wine.l1.les1.q1exp' },
          { q: 'academy.wine.l1.les1.q2', a: ['academy.wine.l1.les1.q2a1','academy.wine.l1.les1.q2a2','academy.wine.l1.les1.q2a3','academy.wine.l1.les1.q2a4'], exp: 'academy.wine.l1.les1.q2exp' },
          { q: 'academy.wine.l1.les1.q3', a: ['academy.wine.l1.les1.q3a1','academy.wine.l1.les1.q3a2','academy.wine.l1.les1.q3a3','academy.wine.l1.les1.q3a4'], exp: 'academy.wine.l1.les1.q3exp' },
        ],
      },
      {
        key: 'academy.wine.l1.les2',
        cards: [
          { type: 'theory', key: 'academy.wine.l1.t5' },
          { type: 'tip',    key: 'academy.wine.l1.tip3' },
          { type: 'theory', key: 'academy.wine.l1.t6' },
          { type: 'note',   key: 'academy.wine.l1.note3' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.wine.l1.les2.q1', a: ['academy.wine.l1.les2.q1a1','academy.wine.l1.les2.q1a2','academy.wine.l1.les2.q1a3','academy.wine.l1.les2.q1a4'], exp: 'academy.wine.l1.les2.q1exp' },
          { q: 'academy.wine.l1.les2.q2', a: ['academy.wine.l1.les2.q2a1','academy.wine.l1.les2.q2a2','academy.wine.l1.les2.q2a3','academy.wine.l1.les2.q2a4'], exp: 'academy.wine.l1.les2.q2exp' },
          { q: 'academy.wine.l1.les2.q3', a: ['academy.wine.l1.les2.q3a1','academy.wine.l1.les2.q3a2','academy.wine.l1.les2.q3a3','academy.wine.l1.les2.q3a4'], exp: 'academy.wine.l1.les2.q3exp' },
        ],
      },
    ],
    sequence: [
      { type: 'lesson', index: 0 },
      { type: 'lesson', index: 1 },
      { type: 'lesson', index: 2 },
    ],
    questions: [],
  },
];
