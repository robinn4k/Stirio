// ─────────────────────────────────────────────────────────────
// academy_coffee_data.js – Barista Academy level & lesson content
// Same shape as academy_data.js (ACADEMY_LEVELS): each level has
// { id, key, descKey, icon, color, passThreshold, lessons[], sequence[], questions[] }
// All user-visible strings are i18n keys resolved at render time.
// ─────────────────────────────────────────────────────────────

export const ACADEMY_COFFEE_LEVELS = [
  // ═══════════════════════════════════════════════════════════
  // LEVEL 0 — Fundamentos del café
  // ═══════════════════════════════════════════════════════════
  {
    id: 0,
    key: 'academy.coffee.l0.title',
    descKey: 'academy.coffee.l0.desc',
    icon: '☕',
    color: '#6b3a17',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.coffee.l0.les0',
        cards: [
          { type: 'theory', key: 'academy.coffee.l0.t1' },
          { type: 'tip',    key: 'academy.coffee.l0.tip1' },
          { type: 'theory', key: 'academy.coffee.l0.t2' },
          { type: 'note',   key: 'academy.coffee.l0.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l0.les0.q1', a: ['academy.coffee.l0.les0.q1a1','academy.coffee.l0.les0.q1a2','academy.coffee.l0.les0.q1a3','academy.coffee.l0.les0.q1a4'], exp: 'academy.coffee.l0.les0.q1exp' },
          { q: 'academy.coffee.l0.les0.q2', a: ['academy.coffee.l0.les0.q2a1','academy.coffee.l0.les0.q2a2','academy.coffee.l0.les0.q2a3','academy.coffee.l0.les0.q2a4'], exp: 'academy.coffee.l0.les0.q2exp' },
          { q: 'academy.coffee.l0.les0.q3', a: ['academy.coffee.l0.les0.q3a1','academy.coffee.l0.les0.q3a2','academy.coffee.l0.les0.q3a3','academy.coffee.l0.les0.q3a4'], exp: 'academy.coffee.l0.les0.q3exp' },
        ],
      },
      {
        key: 'academy.coffee.l0.les1',
        cards: [
          { type: 'theory', key: 'academy.coffee.l0.t3' },
          { type: 'tip',    key: 'academy.coffee.l0.tip2' },
          { type: 'theory', key: 'academy.coffee.l0.t4' },
          { type: 'note',   key: 'academy.coffee.l0.note2' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l0.les1.q1', a: ['academy.coffee.l0.les1.q1a1','academy.coffee.l0.les1.q1a2','academy.coffee.l0.les1.q1a3','academy.coffee.l0.les1.q1a4'], exp: 'academy.coffee.l0.les1.q1exp' },
          { q: 'academy.coffee.l0.les1.q2', a: ['academy.coffee.l0.les1.q2a1','academy.coffee.l0.les1.q2a2','academy.coffee.l0.les1.q2a3','academy.coffee.l0.les1.q2a4'], exp: 'academy.coffee.l0.les1.q2exp' },
          { q: 'academy.coffee.l0.les1.q3', a: ['academy.coffee.l0.les1.q3a1','academy.coffee.l0.les1.q3a2','academy.coffee.l0.les1.q3a3','academy.coffee.l0.les1.q3a4'], exp: 'academy.coffee.l0.les1.q3exp' },
        ],
      },
      {
        key: 'academy.coffee.l0.les2',
        cards: [
          { type: 'theory', key: 'academy.coffee.l0.t5' },
          { type: 'tip',    key: 'academy.coffee.l0.tip3' },
          { type: 'theory', key: 'academy.coffee.l0.t6' },
          { type: 'note',   key: 'academy.coffee.l0.note3' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l0.les2.q1', a: ['academy.coffee.l0.les2.q1a1','academy.coffee.l0.les2.q1a2','academy.coffee.l0.les2.q1a3','academy.coffee.l0.les2.q1a4'], exp: 'academy.coffee.l0.les2.q1exp' },
          { q: 'academy.coffee.l0.les2.q2', a: ['academy.coffee.l0.les2.q2a1','academy.coffee.l0.les2.q2a2','academy.coffee.l0.les2.q2a3','academy.coffee.l0.les2.q2a4'], exp: 'academy.coffee.l0.les2.q2exp' },
          { q: 'academy.coffee.l0.les2.q3', a: ['academy.coffee.l0.les2.q3a1','academy.coffee.l0.les2.q3a2','academy.coffee.l0.les2.q3a3','academy.coffee.l0.les2.q3a4'], exp: 'academy.coffee.l0.les2.q3exp' },
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
  // LEVEL 1 — Espresso y leche
  // ═══════════════════════════════════════════════════════════
  {
    id: 1,
    key: 'academy.coffee.l1.title',
    descKey: 'academy.coffee.l1.desc',
    icon: '🥛',
    color: '#8a5a3a',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.coffee.l1.les0',
        cards: [
          { type: 'theory', key: 'academy.coffee.l1.t1' },
          { type: 'tip',    key: 'academy.coffee.l1.tip1' },
          { type: 'theory', key: 'academy.coffee.l1.t2' },
          { type: 'note',   key: 'academy.coffee.l1.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l1.les0.q1', a: ['academy.coffee.l1.les0.q1a1','academy.coffee.l1.les0.q1a2','academy.coffee.l1.les0.q1a3','academy.coffee.l1.les0.q1a4'], exp: 'academy.coffee.l1.les0.q1exp' },
          { q: 'academy.coffee.l1.les0.q2', a: ['academy.coffee.l1.les0.q2a1','academy.coffee.l1.les0.q2a2','academy.coffee.l1.les0.q2a3','academy.coffee.l1.les0.q2a4'], exp: 'academy.coffee.l1.les0.q2exp' },
          { q: 'academy.coffee.l1.les0.q3', a: ['academy.coffee.l1.les0.q3a1','academy.coffee.l1.les0.q3a2','academy.coffee.l1.les0.q3a3','academy.coffee.l1.les0.q3a4'], exp: 'academy.coffee.l1.les0.q3exp' },
        ],
      },
      {
        key: 'academy.coffee.l1.les1',
        cards: [
          { type: 'theory', key: 'academy.coffee.l1.t3' },
          { type: 'tip',    key: 'academy.coffee.l1.tip2' },
          { type: 'theory', key: 'academy.coffee.l1.t4' },
          { type: 'note',   key: 'academy.coffee.l1.note2' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l1.les1.q1', a: ['academy.coffee.l1.les1.q1a1','academy.coffee.l1.les1.q1a2','academy.coffee.l1.les1.q1a3','academy.coffee.l1.les1.q1a4'], exp: 'academy.coffee.l1.les1.q1exp' },
          { q: 'academy.coffee.l1.les1.q2', a: ['academy.coffee.l1.les1.q2a1','academy.coffee.l1.les1.q2a2','academy.coffee.l1.les1.q2a3','academy.coffee.l1.les1.q2a4'], exp: 'academy.coffee.l1.les1.q2exp' },
          { q: 'academy.coffee.l1.les1.q3', a: ['academy.coffee.l1.les1.q3a1','academy.coffee.l1.les1.q3a2','academy.coffee.l1.les1.q3a3','academy.coffee.l1.les1.q3a4'], exp: 'academy.coffee.l1.les1.q3exp' },
        ],
      },
      {
        key: 'academy.coffee.l1.les2',
        cards: [
          { type: 'theory', key: 'academy.coffee.l1.t5' },
          { type: 'tip',    key: 'academy.coffee.l1.tip3' },
          { type: 'theory', key: 'academy.coffee.l1.t6' },
          { type: 'note',   key: 'academy.coffee.l1.note3' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l1.les2.q1', a: ['academy.coffee.l1.les2.q1a1','academy.coffee.l1.les2.q1a2','academy.coffee.l1.les2.q1a3','academy.coffee.l1.les2.q1a4'], exp: 'academy.coffee.l1.les2.q1exp' },
          { q: 'academy.coffee.l1.les2.q2', a: ['academy.coffee.l1.les2.q2a1','academy.coffee.l1.les2.q2a2','academy.coffee.l1.les2.q2a3','academy.coffee.l1.les2.q2a4'], exp: 'academy.coffee.l1.les2.q2exp' },
          { q: 'academy.coffee.l1.les2.q3', a: ['academy.coffee.l1.les2.q3a1','academy.coffee.l1.les2.q3a2','academy.coffee.l1.les2.q3a3','academy.coffee.l1.les2.q3a4'], exp: 'academy.coffee.l1.les2.q3exp' },
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
  // LEVEL 2 — Orígenes y procesado
  // ═══════════════════════════════════════════════════════════
  {
    id: 2,
    key: 'academy.coffee.l2.title',
    descKey: 'academy.coffee.l2.desc',
    icon: '🌍',
    color: '#4a2612',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.coffee.l2.les0',
        cards: [
          { type: 'theory', key: 'academy.coffee.l2.t1' },
          { type: 'tip',    key: 'academy.coffee.l2.tip1' },
          { type: 'theory', key: 'academy.coffee.l2.t2' },
          { type: 'note',   key: 'academy.coffee.l2.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l2.les0.q1', a: ['academy.coffee.l2.les0.q1a1','academy.coffee.l2.les0.q1a2','academy.coffee.l2.les0.q1a3','academy.coffee.l2.les0.q1a4'], exp: 'academy.coffee.l2.les0.q1exp' },
          { q: 'academy.coffee.l2.les0.q2', a: ['academy.coffee.l2.les0.q2a1','academy.coffee.l2.les0.q2a2','academy.coffee.l2.les0.q2a3','academy.coffee.l2.les0.q2a4'], exp: 'academy.coffee.l2.les0.q2exp' },
          { q: 'academy.coffee.l2.les0.q3', a: ['academy.coffee.l2.les0.q3a1','academy.coffee.l2.les0.q3a2','academy.coffee.l2.les0.q3a3','academy.coffee.l2.les0.q3a4'], exp: 'academy.coffee.l2.les0.q3exp' },
        ],
      },
      {
        key: 'academy.coffee.l2.les1',
        cards: [
          { type: 'theory', key: 'academy.coffee.l2.t3' },
          { type: 'tip',    key: 'academy.coffee.l2.tip2' },
          { type: 'theory', key: 'academy.coffee.l2.t4' },
          { type: 'note',   key: 'academy.coffee.l2.note2' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l2.les1.q1', a: ['academy.coffee.l2.les1.q1a1','academy.coffee.l2.les1.q1a2','academy.coffee.l2.les1.q1a3','academy.coffee.l2.les1.q1a4'], exp: 'academy.coffee.l2.les1.q1exp' },
          { q: 'academy.coffee.l2.les1.q2', a: ['academy.coffee.l2.les1.q2a1','academy.coffee.l2.les1.q2a2','academy.coffee.l2.les1.q2a3','academy.coffee.l2.les1.q2a4'], exp: 'academy.coffee.l2.les1.q2exp' },
          { q: 'academy.coffee.l2.les1.q3', a: ['academy.coffee.l2.les1.q3a1','academy.coffee.l2.les1.q3a2','academy.coffee.l2.les1.q3a3','academy.coffee.l2.les1.q3a4'], exp: 'academy.coffee.l2.les1.q3exp' },
        ],
      },
      {
        key: 'academy.coffee.l2.les2',
        cards: [
          { type: 'theory', key: 'academy.coffee.l2.t5' },
          { type: 'tip',    key: 'academy.coffee.l2.tip3' },
          { type: 'theory', key: 'academy.coffee.l2.t6' },
          { type: 'note',   key: 'academy.coffee.l2.note3' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l2.les2.q1', a: ['academy.coffee.l2.les2.q1a1','academy.coffee.l2.les2.q1a2','academy.coffee.l2.les2.q1a3','academy.coffee.l2.les2.q1a4'], exp: 'academy.coffee.l2.les2.q1exp' },
          { q: 'academy.coffee.l2.les2.q2', a: ['academy.coffee.l2.les2.q2a1','academy.coffee.l2.les2.q2a2','academy.coffee.l2.les2.q2a3','academy.coffee.l2.les2.q2a4'], exp: 'academy.coffee.l2.les2.q2exp' },
          { q: 'academy.coffee.l2.les2.q3', a: ['academy.coffee.l2.les2.q3a1','academy.coffee.l2.les2.q3a2','academy.coffee.l2.les2.q3a3','academy.coffee.l2.les2.q3a4'], exp: 'academy.coffee.l2.les2.q3exp' },
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
  // LEVEL 3 — Métodos de filtrado y cata
  // ═══════════════════════════════════════════════════════════
  {
    id: 3,
    key: 'academy.coffee.l3.title',
    descKey: 'academy.coffee.l3.desc',
    icon: '🫘',
    color: '#2f1a0b',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.coffee.l3.les0',
        cards: [
          { type: 'theory', key: 'academy.coffee.l3.t1' },
          { type: 'tip',    key: 'academy.coffee.l3.tip1' },
          { type: 'theory', key: 'academy.coffee.l3.t2' },
          { type: 'note',   key: 'academy.coffee.l3.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l3.les0.q1', a: ['academy.coffee.l3.les0.q1a1','academy.coffee.l3.les0.q1a2','academy.coffee.l3.les0.q1a3','academy.coffee.l3.les0.q1a4'], exp: 'academy.coffee.l3.les0.q1exp' },
          { q: 'academy.coffee.l3.les0.q2', a: ['academy.coffee.l3.les0.q2a1','academy.coffee.l3.les0.q2a2','academy.coffee.l3.les0.q2a3','academy.coffee.l3.les0.q2a4'], exp: 'academy.coffee.l3.les0.q2exp' },
          { q: 'academy.coffee.l3.les0.q3', a: ['academy.coffee.l3.les0.q3a1','academy.coffee.l3.les0.q3a2','academy.coffee.l3.les0.q3a3','academy.coffee.l3.les0.q3a4'], exp: 'academy.coffee.l3.les0.q3exp' },
        ],
      },
      {
        key: 'academy.coffee.l3.les1',
        cards: [
          { type: 'theory', key: 'academy.coffee.l3.t3' },
          { type: 'tip',    key: 'academy.coffee.l3.tip2' },
          { type: 'theory', key: 'academy.coffee.l3.t4' },
          { type: 'note',   key: 'academy.coffee.l3.note2' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l3.les1.q1', a: ['academy.coffee.l3.les1.q1a1','academy.coffee.l3.les1.q1a2','academy.coffee.l3.les1.q1a3','academy.coffee.l3.les1.q1a4'], exp: 'academy.coffee.l3.les1.q1exp' },
          { q: 'academy.coffee.l3.les1.q2', a: ['academy.coffee.l3.les1.q2a1','academy.coffee.l3.les1.q2a2','academy.coffee.l3.les1.q2a3','academy.coffee.l3.les1.q2a4'], exp: 'academy.coffee.l3.les1.q2exp' },
          { q: 'academy.coffee.l3.les1.q3', a: ['academy.coffee.l3.les1.q3a1','academy.coffee.l3.les1.q3a2','academy.coffee.l3.les1.q3a3','academy.coffee.l3.les1.q3a4'], exp: 'academy.coffee.l3.les1.q3exp' },
        ],
      },
      {
        key: 'academy.coffee.l3.les2',
        cards: [
          { type: 'theory', key: 'academy.coffee.l3.t5' },
          { type: 'tip',    key: 'academy.coffee.l3.tip3' },
          { type: 'theory', key: 'academy.coffee.l3.t6' },
          { type: 'note',   key: 'academy.coffee.l3.note3' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.coffee.l3.les2.q1', a: ['academy.coffee.l3.les2.q1a1','academy.coffee.l3.les2.q1a2','academy.coffee.l3.les2.q1a3','academy.coffee.l3.les2.q1a4'], exp: 'academy.coffee.l3.les2.q1exp' },
          { q: 'academy.coffee.l3.les2.q2', a: ['academy.coffee.l3.les2.q2a1','academy.coffee.l3.les2.q2a2','academy.coffee.l3.les2.q2a3','academy.coffee.l3.les2.q2a4'], exp: 'academy.coffee.l3.les2.q2exp' },
          { q: 'academy.coffee.l3.les2.q3', a: ['academy.coffee.l3.les2.q3a1','academy.coffee.l3.les2.q3a2','academy.coffee.l3.les2.q3a3','academy.coffee.l3.les2.q3a4'], exp: 'academy.coffee.l3.les2.q3exp' },
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
