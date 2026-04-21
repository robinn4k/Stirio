// ─────────────────────────────────────────────────────────────
// academy_data.js – Cocktail Academy level & lesson content
// All user-visible strings are i18n keys resolved at render time.
// ─────────────────────────────────────────────────────────────

export const ACADEMY_LEVELS = [
  // ═══════════════════════════════════════════════════════════
  // LEVEL 0 — Foundations
  // ═══════════════════════════════════════════════════════════
  {
    id: 0,
    key: 'academy.l0.title',
    descKey: 'academy.l0.desc',
    icon: '🔧',
    color: '#3498db',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.l0.les0',
        cards: [
          { type: 'theory', key: 'academy.l0.t1' },
          { type: 'tip',    key: 'academy.l0.tip1' },
          { type: 'theory', key: 'academy.l0.t2' },
          { type: 'note',   key: 'academy.l0.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l0.les0.q1', a: ['academy.l0.les0.q1a1','academy.l0.les0.q1a2','academy.l0.les0.q1a3','academy.l0.les0.q1a4'], exp: 'academy.l0.les0.q1exp' },
          { q: 'academy.l0.les0.q2', a: ['academy.l0.les0.q2a1','academy.l0.les0.q2a2','academy.l0.les0.q2a3','academy.l0.les0.q2a4'], exp: 'academy.l0.les0.q2exp' },
          { q: 'academy.l0.les0.q3', a: ['academy.l0.les0.q3a1','academy.l0.les0.q3a2','academy.l0.les0.q3a3','academy.l0.les0.q3a4'], exp: 'academy.l0.les0.q3exp' },
        ]
      },
      {
        key: 'academy.l0.les1',
        cards: [
          { type: 'theory', key: 'academy.l0.t3' },
          { type: 'tip',    key: 'academy.l0.tip2' },
          { type: 'example', cocktail: 'Old Fashioned' },
          { type: 'theory', key: 'academy.l0.t4' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l0.les1.q1', a: ['academy.l0.les1.q1a1','academy.l0.les1.q1a2','academy.l0.les1.q1a3','academy.l0.les1.q1a4'], exp: 'academy.l0.les1.q1exp' },
          { q: 'academy.l0.les1.q2', a: ['academy.l0.les1.q2a1','academy.l0.les1.q2a2','academy.l0.les1.q2a3','academy.l0.les1.q2a4'], exp: 'academy.l0.les1.q2exp' },
          { q: 'academy.l0.les1.q3', a: ['academy.l0.les1.q3a1','academy.l0.les1.q3a2','academy.l0.les1.q3a3','academy.l0.les1.q3a4'], exp: 'academy.l0.les1.q3exp' },
        ]
      },
      {
        key: 'academy.l0.les2',
        cards: [
          { type: 'theory', key: 'academy.l0.t5' },
          { type: 'tip',    key: 'academy.l0.tip3' },
          { type: 'note',   key: 'academy.l0.note2' },
          { type: 'example', cocktail: 'Daiquiri' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l0.les2.q1', a: ['academy.l0.les2.q1a1','academy.l0.les2.q1a2','academy.l0.les2.q1a3','academy.l0.les2.q1a4'], exp: 'academy.l0.les2.q1exp' },
          { q: 'academy.l0.les2.q2', a: ['academy.l0.les2.q2a1','academy.l0.les2.q2a2','academy.l0.les2.q2a3','academy.l0.les2.q2a4'], exp: 'academy.l0.les2.q2exp' },
          { q: 'academy.l0.les2.q3', a: ['academy.l0.les2.q3a1','academy.l0.les2.q3a2','academy.l0.les2.q3a3','academy.l0.les2.q3a4'], exp: 'academy.l0.les2.q3exp' },
        ]
      },
    ],
    // Tools → techniques → 6 base spirits. Practices follow their matching lesson.
    sequence: [
      { type: 'lesson', index: 0 },
      { type: 'practice', roundId: 4 },
      { type: 'practice', roundId: 14 },
      { type: 'lesson', index: 1 },
      { type: 'practice', roundId: 3 },
      { type: 'lesson', index: 2 },
      { type: 'practice', roundId: 8 },
      { type: 'practice', roundId: 20 },
      { type: 'practice', roundId: 21 },
    ],
    questions: [
      { q: 'academy.l0.q1',  a: ['academy.l0.q1a1','academy.l0.q1a2','academy.l0.q1a3','academy.l0.q1a4'], exp: 'academy.l0.q1exp' },
      { q: 'academy.l0.q2',  a: ['academy.l0.q2a1','academy.l0.q2a2','academy.l0.q2a3','academy.l0.q2a4'], exp: 'academy.l0.q2exp' },
      { q: 'academy.l0.q3',  a: ['academy.l0.q3a1','academy.l0.q3a2','academy.l0.q3a3','academy.l0.q3a4'], exp: 'academy.l0.q3exp' },
      { q: 'academy.l0.q4',  a: ['academy.l0.q4a1','academy.l0.q4a2','academy.l0.q4a3','academy.l0.q4a4'], exp: 'academy.l0.q4exp' },
      { q: 'academy.l0.q5',  a: ['academy.l0.q5a1','academy.l0.q5a2','academy.l0.q5a3','academy.l0.q5a4'], exp: 'academy.l0.q5exp' },
      { q: 'academy.l0.q6',  a: ['academy.l0.q6a1','academy.l0.q6a2','academy.l0.q6a3','academy.l0.q6a4'], exp: 'academy.l0.q6exp' },
      { q: 'academy.l0.q7',  a: ['academy.l0.q7a1','academy.l0.q7a2','academy.l0.q7a3','academy.l0.q7a4'], exp: 'academy.l0.q7exp' },
      { q: 'academy.l0.q8',  a: ['academy.l0.q8a1','academy.l0.q8a2','academy.l0.q8a3','academy.l0.q8a4'], exp: 'academy.l0.q8exp' },
      { q: 'academy.l0.q9',  a: ['academy.l0.q9a1','academy.l0.q9a2','academy.l0.q9a3','academy.l0.q9a4'], exp: 'academy.l0.q9exp' },
      { q: 'academy.l0.q10', a: ['academy.l0.q10a1','academy.l0.q10a2','academy.l0.q10a3','academy.l0.q10a4'], exp: 'academy.l0.q10exp' },
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 1 — Highballs & Collins
  // ═══════════════════════════════════════════════════════════
  {
    id: 1,
    key: 'academy.l1.title',
    descKey: 'academy.l1.desc',
    icon: '🥤',
    color: '#27ae60',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.l1.les0',
        cards: [
          { type: 'theory', key: 'academy.l1.t1' },
          { type: 'tip',    key: 'academy.l1.tip1' },
          { type: 'example', cocktail: 'Cuba Libre' },
          { type: 'note',   key: 'academy.l1.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l1.les0.q1', a: ['academy.l1.les0.q1a1','academy.l1.les0.q1a2','academy.l1.les0.q1a3','academy.l1.les0.q1a4'], exp: 'academy.l1.les0.q1exp' },
          { q: 'academy.l1.les0.q2', a: ['academy.l1.les0.q2a1','academy.l1.les0.q2a2','academy.l1.les0.q2a3','academy.l1.les0.q2a4'], exp: 'academy.l1.les0.q2exp' },
          { q: 'academy.l1.les0.q3', a: ['academy.l1.les0.q3a1','academy.l1.les0.q3a2','academy.l1.les0.q3a3','academy.l1.les0.q3a4'], exp: 'academy.l1.les0.q3exp' },
        ]
      },
      {
        key: 'academy.l1.les1',
        cards: [
          { type: 'theory', key: 'academy.l1.t2' },
          { type: 'example', cocktail: 'Moscow Mule' },
          { type: 'tip',    key: 'academy.l1.tip2' },
          { type: 'example', cocktail: 'John Collins' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l1.les1.q1', a: ['academy.l1.les1.q1a1','academy.l1.les1.q1a2','academy.l1.les1.q1a3','academy.l1.les1.q1a4'], exp: 'academy.l1.les1.q1exp' },
          { q: 'academy.l1.les1.q2', a: ['academy.l1.les1.q2a1','academy.l1.les1.q2a2','academy.l1.les1.q2a3','academy.l1.les1.q2a4'], exp: 'academy.l1.les1.q2exp' },
          { q: 'academy.l1.les1.q3', a: ['academy.l1.les1.q3a1','academy.l1.les1.q3a2','academy.l1.les1.q3a3','academy.l1.les1.q3a4'], exp: 'academy.l1.les1.q3exp' },
        ]
      },
      {
        key: 'academy.l1.les2',
        cards: [
          { type: 'theory', key: 'academy.l1.t3' },
          { type: 'example', cocktail: 'Paloma' },
          { type: 'note',   key: 'academy.l1.note2' },
          { type: 'example', cocktail: "Dark 'n' Stormy" },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l1.les2.q1', a: ['academy.l1.les2.q1a1','academy.l1.les2.q1a2','academy.l1.les2.q1a3','academy.l1.les2.q1a4'], exp: 'academy.l1.les2.q1exp' },
          { q: 'academy.l1.les2.q2', a: ['academy.l1.les2.q2a1','academy.l1.les2.q2a2','academy.l1.les2.q2a3','academy.l1.les2.q2a4'], exp: 'academy.l1.les2.q2exp' },
          { q: 'academy.l1.les2.q3', a: ['academy.l1.les2.q3a1','academy.l1.les2.q3a2','academy.l1.les2.q3a3','academy.l1.les2.q3a4'], exp: 'academy.l1.les2.q3exp' },
        ]
      },
    ],
    sequence: [
      { type: 'lesson', index: 0 },
      { type: 'practice', roundId: 1 },
      { type: 'lesson', index: 1 },
      { type: 'practice', roundId: 6 },
      { type: 'lesson', index: 2 },
    ],
    questions: [
      { q: 'academy.l1.q1',  a: ['academy.l1.q1a1','academy.l1.q1a2','academy.l1.q1a3','academy.l1.q1a4'], exp: 'academy.l1.q1exp' },
      { q: 'academy.l1.q2',  a: ['academy.l1.q2a1','academy.l1.q2a2','academy.l1.q2a3','academy.l1.q2a4'], exp: 'academy.l1.q2exp' },
      { q: 'academy.l1.q3',  a: ['academy.l1.q3a1','academy.l1.q3a2','academy.l1.q3a3','academy.l1.q3a4'], exp: 'academy.l1.q3exp' },
      { q: 'academy.l1.q4',  a: ['academy.l1.q4a1','academy.l1.q4a2','academy.l1.q4a3','academy.l1.q4a4'], exp: 'academy.l1.q4exp' },
      { q: 'academy.l1.q5',  a: ['academy.l1.q5a1','academy.l1.q5a2','academy.l1.q5a3','academy.l1.q5a4'], exp: 'academy.l1.q5exp' },
      { q: 'academy.l1.q6',  a: ['academy.l1.q6a1','academy.l1.q6a2','academy.l1.q6a3','academy.l1.q6a4'], exp: 'academy.l1.q6exp' },
      { q: 'academy.l1.q7',  a: ['academy.l1.q7a1','academy.l1.q7a2','academy.l1.q7a3','academy.l1.q7a4'], exp: 'academy.l1.q7exp' },
      { q: 'academy.l1.q8',  a: ['academy.l1.q8a1','academy.l1.q8a2','academy.l1.q8a3','academy.l1.q8a4'], exp: 'academy.l1.q8exp' },
      { q: 'academy.l1.q9',  a: ['academy.l1.q9a1','academy.l1.q9a2','academy.l1.q9a3','academy.l1.q9a4'], exp: 'academy.l1.q9exp' },
      { q: 'academy.l1.q10', a: ['academy.l1.q10a1','academy.l1.q10a2','academy.l1.q10a3','academy.l1.q10a4'], exp: 'academy.l1.q10exp' },
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 2 — Sours & Daisies
  // ═══════════════════════════════════════════════════════════
  {
    id: 2,
    key: 'academy.l2.title',
    descKey: 'academy.l2.desc',
    icon: '🍋',
    color: '#f39c12',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.l2.les0',
        cards: [
          { type: 'theory', key: 'academy.l2.t1' },
          { type: 'tip',    key: 'academy.l2.tip1' },
          { type: 'example', cocktail: 'Whiskey Sour' },
          { type: 'note',   key: 'academy.l2.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l2.les0.q1', a: ['academy.l2.les0.q1a1','academy.l2.les0.q1a2','academy.l2.les0.q1a3','academy.l2.les0.q1a4'], exp: 'academy.l2.les0.q1exp' },
          { q: 'academy.l2.les0.q2', a: ['academy.l2.les0.q2a1','academy.l2.les0.q2a2','academy.l2.les0.q2a3','academy.l2.les0.q2a4'], exp: 'academy.l2.les0.q2exp' },
          { q: 'academy.l2.les0.q3', a: ['academy.l2.les0.q3a1','academy.l2.les0.q3a2','academy.l2.les0.q3a3','academy.l2.les0.q3a4'], exp: 'academy.l2.les0.q3exp' },
        ]
      },
      {
        key: 'academy.l2.les1',
        cards: [
          { type: 'theory', key: 'academy.l2.t2' },
          { type: 'example', cocktail: 'Daiquiri' },
          { type: 'tip',    key: 'academy.l2.tip2' },
          { type: 'example', cocktail: 'Margarita' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l2.les1.q1', a: ['academy.l2.les1.q1a1','academy.l2.les1.q1a2','academy.l2.les1.q1a3','academy.l2.les1.q1a4'], exp: 'academy.l2.les1.q1exp' },
          { q: 'academy.l2.les1.q2', a: ['academy.l2.les1.q2a1','academy.l2.les1.q2a2','academy.l2.les1.q2a3','academy.l2.les1.q2a4'], exp: 'academy.l2.les1.q2exp' },
          { q: 'academy.l2.les1.q3', a: ['academy.l2.les1.q3a1','academy.l2.les1.q3a2','academy.l2.les1.q3a3','academy.l2.les1.q3a4'], exp: 'academy.l2.les1.q3exp' },
        ]
      },
      {
        key: 'academy.l2.les2',
        cards: [
          { type: 'theory', key: 'academy.l2.t3' },
          { type: 'example', cocktail: 'Pisco Sour' },
          { type: 'note',   key: 'academy.l2.note2' },
          { type: 'example', cocktail: 'Sidecar' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l2.les2.q1', a: ['academy.l2.les2.q1a1','academy.l2.les2.q1a2','academy.l2.les2.q1a3','academy.l2.les2.q1a4'], exp: 'academy.l2.les2.q1exp' },
          { q: 'academy.l2.les2.q2', a: ['academy.l2.les2.q2a1','academy.l2.les2.q2a2','academy.l2.les2.q2a3','academy.l2.les2.q2a4'], exp: 'academy.l2.les2.q2exp' },
          { q: 'academy.l2.les2.q3', a: ['academy.l2.les2.q3a1','academy.l2.les2.q3a2','academy.l2.les2.q3a3','academy.l2.les2.q3a4'], exp: 'academy.l2.les2.q3exp' },
        ]
      },
      {
        key: 'academy.l2.les3',
        cards: [
          { type: 'theory', key: 'academy.l2.t4' },
          { type: 'tip',    key: 'academy.l2.tip3' },
          { type: 'example', cocktail: "Bee's Knees" },
          { type: 'example', cocktail: 'Penicillin' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l2.les3.q1', a: ['academy.l2.les3.q1a1','academy.l2.les3.q1a2','academy.l2.les3.q1a3','academy.l2.les3.q1a4'], exp: 'academy.l2.les3.q1exp' },
          { q: 'academy.l2.les3.q2', a: ['academy.l2.les3.q2a1','academy.l2.les3.q2a2','academy.l2.les3.q2a3','academy.l2.les3.q2a4'], exp: 'academy.l2.les3.q2exp' },
          { q: 'academy.l2.les3.q3', a: ['academy.l2.les3.q3a1','academy.l2.les3.q3a2','academy.l2.les3.q3a3','academy.l2.les3.q3a4'], exp: 'academy.l2.les3.q3exp' },
        ]
      },
    ],
    sequence: [
      { type: 'lesson', index: 0 },
      { type: 'practice', roundId: 1 },
      { type: 'lesson', index: 1 },
      { type: 'practice', roundId: 11 },
      { type: 'lesson', index: 2 },
      { type: 'practice', roundId: 16 },
      { type: 'practice', roundId: 17 },
      { type: 'lesson', index: 3 },
    ],
    questions: [
      { q: 'academy.l2.q1',  a: ['academy.l2.q1a1','academy.l2.q1a2','academy.l2.q1a3','academy.l2.q1a4'], exp: 'academy.l2.q1exp' },
      { q: 'academy.l2.q2',  a: ['academy.l2.q2a1','academy.l2.q2a2','academy.l2.q2a3','academy.l2.q2a4'], exp: 'academy.l2.q2exp' },
      { q: 'academy.l2.q3',  a: ['academy.l2.q3a1','academy.l2.q3a2','academy.l2.q3a3','academy.l2.q3a4'], exp: 'academy.l2.q3exp' },
      { q: 'academy.l2.q4',  a: ['academy.l2.q4a1','academy.l2.q4a2','academy.l2.q4a3','academy.l2.q4a4'], exp: 'academy.l2.q4exp' },
      { q: 'academy.l2.q5',  a: ['academy.l2.q5a1','academy.l2.q5a2','academy.l2.q5a3','academy.l2.q5a4'], exp: 'academy.l2.q5exp' },
      { q: 'academy.l2.q6',  a: ['academy.l2.q6a1','academy.l2.q6a2','academy.l2.q6a3','academy.l2.q6a4'], exp: 'academy.l2.q6exp' },
      { q: 'academy.l2.q7',  a: ['academy.l2.q7a1','academy.l2.q7a2','academy.l2.q7a3','academy.l2.q7a4'], exp: 'academy.l2.q7exp' },
      { q: 'academy.l2.q8',  a: ['academy.l2.q8a1','academy.l2.q8a2','academy.l2.q8a3','academy.l2.q8a4'], exp: 'academy.l2.q8exp' },
      { q: 'academy.l2.q9',  a: ['academy.l2.q9a1','academy.l2.q9a2','academy.l2.q9a3','academy.l2.q9a4'], exp: 'academy.l2.q9exp' },
      { q: 'academy.l2.q10', a: ['academy.l2.q10a1','academy.l2.q10a2','academy.l2.q10a3','academy.l2.q10a4'], exp: 'academy.l2.q10exp' },
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 3 — Spirit-Forward
  // ═══════════════════════════════════════════════════════════
  {
    id: 3,
    key: 'academy.l3.title',
    descKey: 'academy.l3.desc',
    icon: '🥃',
    color: '#8e44ad',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.l3.les0',
        cards: [
          { type: 'theory', key: 'academy.l3.t1' },
          { type: 'tip',    key: 'academy.l3.tip1' },
          { type: 'example', cocktail: 'Old Fashioned' },
          { type: 'note',   key: 'academy.l3.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l3.les0.q1', a: ['academy.l3.les0.q1a1','academy.l3.les0.q1a2','academy.l3.les0.q1a3','academy.l3.les0.q1a4'], exp: 'academy.l3.les0.q1exp' },
          { q: 'academy.l3.les0.q2', a: ['academy.l3.les0.q2a1','academy.l3.les0.q2a2','academy.l3.les0.q2a3','academy.l3.les0.q2a4'], exp: 'academy.l3.les0.q2exp' },
          { q: 'academy.l3.les0.q3', a: ['academy.l3.les0.q3a1','academy.l3.les0.q3a2','academy.l3.les0.q3a3','academy.l3.les0.q3a4'], exp: 'academy.l3.les0.q3exp' },
        ]
      },
      {
        key: 'academy.l3.les1',
        cards: [
          { type: 'theory', key: 'academy.l3.t2' },
          { type: 'example', cocktail: 'Manhattan' },
          { type: 'tip',    key: 'academy.l3.tip2' },
          { type: 'example', cocktail: 'Negroni' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l3.les1.q1', a: ['academy.l3.les1.q1a1','academy.l3.les1.q1a2','academy.l3.les1.q1a3','academy.l3.les1.q1a4'], exp: 'academy.l3.les1.q1exp' },
          { q: 'academy.l3.les1.q2', a: ['academy.l3.les1.q2a1','academy.l3.les1.q2a2','academy.l3.les1.q2a3','academy.l3.les1.q2a4'], exp: 'academy.l3.les1.q2exp' },
          { q: 'academy.l3.les1.q3', a: ['academy.l3.les1.q3a1','academy.l3.les1.q3a2','academy.l3.les1.q3a3','academy.l3.les1.q3a4'], exp: 'academy.l3.les1.q3exp' },
        ]
      },
      {
        key: 'academy.l3.les2',
        cards: [
          { type: 'theory', key: 'academy.l3.t3' },
          { type: 'example', cocktail: 'Dry Martini' },
          { type: 'note',   key: 'academy.l3.note2' },
          { type: 'example', cocktail: 'Sazerac' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l3.les2.q1', a: ['academy.l3.les2.q1a1','academy.l3.les2.q1a2','academy.l3.les2.q1a3','academy.l3.les2.q1a4'], exp: 'academy.l3.les2.q1exp' },
          { q: 'academy.l3.les2.q2', a: ['academy.l3.les2.q2a1','academy.l3.les2.q2a2','academy.l3.les2.q2a3','academy.l3.les2.q2a4'], exp: 'academy.l3.les2.q2exp' },
          { q: 'academy.l3.les2.q3', a: ['academy.l3.les2.q3a1','academy.l3.les2.q3a2','academy.l3.les2.q3a3','academy.l3.les2.q3a4'], exp: 'academy.l3.les2.q3exp' },
        ]
      },
      {
        key: 'academy.l3.les3',
        cards: [
          { type: 'theory', key: 'academy.l3.t4' },
          { type: 'example', cocktail: 'Boulevardier' },
          { type: 'tip',    key: 'academy.l3.tip3' },
          { type: 'example', cocktail: 'Vieux Carré' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l3.les3.q1', a: ['academy.l3.les3.q1a1','academy.l3.les3.q1a2','academy.l3.les3.q1a3','academy.l3.les3.q1a4'], exp: 'academy.l3.les3.q1exp' },
          { q: 'academy.l3.les3.q2', a: ['academy.l3.les3.q2a1','academy.l3.les3.q2a2','academy.l3.les3.q2a3','academy.l3.les3.q2a4'], exp: 'academy.l3.les3.q2exp' },
          { q: 'academy.l3.les3.q3', a: ['academy.l3.les3.q3a1','academy.l3.les3.q3a2','academy.l3.les3.q3a3','academy.l3.les3.q3a4'], exp: 'academy.l3.les3.q3exp' },
        ]
      },
    ],
    // Spirit-forward classics pair with vermouth/fortified wine theory.
    sequence: [
      { type: 'lesson', index: 0 },
      { type: 'practice', roundId: 2 },
      { type: 'lesson', index: 1 },
      { type: 'practice', roundId: 7 },
      { type: 'practice', roundId: 19 },
      { type: 'lesson', index: 2 },
      { type: 'practice', roundId: 12 },
      { type: 'practice', roundId: 18 },
      { type: 'lesson', index: 3 },
    ],
    questions: [
      { q: 'academy.l3.q1',  a: ['academy.l3.q1a1','academy.l3.q1a2','academy.l3.q1a3','academy.l3.q1a4'], exp: 'academy.l3.q1exp' },
      { q: 'academy.l3.q2',  a: ['academy.l3.q2a1','academy.l3.q2a2','academy.l3.q2a3','academy.l3.q2a4'], exp: 'academy.l3.q2exp' },
      { q: 'academy.l3.q3',  a: ['academy.l3.q3a1','academy.l3.q3a2','academy.l3.q3a3','academy.l3.q3a4'], exp: 'academy.l3.q3exp' },
      { q: 'academy.l3.q4',  a: ['academy.l3.q4a1','academy.l3.q4a2','academy.l3.q4a3','academy.l3.q4a4'], exp: 'academy.l3.q4exp' },
      { q: 'academy.l3.q5',  a: ['academy.l3.q5a1','academy.l3.q5a2','academy.l3.q5a3','academy.l3.q5a4'], exp: 'academy.l3.q5exp' },
      { q: 'academy.l3.q6',  a: ['academy.l3.q6a1','academy.l3.q6a2','academy.l3.q6a3','academy.l3.q6a4'], exp: 'academy.l3.q6exp' },
      { q: 'academy.l3.q7',  a: ['academy.l3.q7a1','academy.l3.q7a2','academy.l3.q7a3','academy.l3.q7a4'], exp: 'academy.l3.q7exp' },
      { q: 'academy.l3.q8',  a: ['academy.l3.q8a1','academy.l3.q8a2','academy.l3.q8a3','academy.l3.q8a4'], exp: 'academy.l3.q8exp' },
      { q: 'academy.l3.q9',  a: ['academy.l3.q9a1','academy.l3.q9a2','academy.l3.q9a3','academy.l3.q9a4'], exp: 'academy.l3.q9exp' },
      { q: 'academy.l3.q10', a: ['academy.l3.q10a1','academy.l3.q10a2','academy.l3.q10a3','academy.l3.q10a4'], exp: 'academy.l3.q10exp' },
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 4 — Tropical & Tiki
  // ═══════════════════════════════════════════════════════════
  {
    id: 4,
    key: 'academy.l4.title',
    descKey: 'academy.l4.desc',
    icon: '🌴',
    color: '#e67e22',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.l4.les0',
        cards: [
          { type: 'theory', key: 'academy.l4.t1' },
          { type: 'note',   key: 'academy.l4.note1' },
          { type: 'example', cocktail: 'Mai Tai' },
          { type: 'tip',    key: 'academy.l4.tip1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l4.les0.q1', a: ['academy.l4.les0.q1a1','academy.l4.les0.q1a2','academy.l4.les0.q1a3','academy.l4.les0.q1a4'], exp: 'academy.l4.les0.q1exp' },
          { q: 'academy.l4.les0.q2', a: ['academy.l4.les0.q2a1','academy.l4.les0.q2a2','academy.l4.les0.q2a3','academy.l4.les0.q2a4'], exp: 'academy.l4.les0.q2exp' },
          { q: 'academy.l4.les0.q3', a: ['academy.l4.les0.q3a1','academy.l4.les0.q3a2','academy.l4.les0.q3a3','academy.l4.les0.q3a4'], exp: 'academy.l4.les0.q3exp' },
        ]
      },
      {
        key: 'academy.l4.les1',
        cards: [
          { type: 'theory', key: 'academy.l4.t2' },
          { type: 'example', cocktail: 'Zombie' },
          { type: 'tip',    key: 'academy.l4.tip2' },
          { type: 'example', cocktail: 'Piña Colada' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l4.les1.q1', a: ['academy.l4.les1.q1a1','academy.l4.les1.q1a2','academy.l4.les1.q1a3','academy.l4.les1.q1a4'], exp: 'academy.l4.les1.q1exp' },
          { q: 'academy.l4.les1.q2', a: ['academy.l4.les1.q2a1','academy.l4.les1.q2a2','academy.l4.les1.q2a3','academy.l4.les1.q2a4'], exp: 'academy.l4.les1.q2exp' },
          { q: 'academy.l4.les1.q3', a: ['academy.l4.les1.q3a1','academy.l4.les1.q3a2','academy.l4.les1.q3a3','academy.l4.les1.q3a4'], exp: 'academy.l4.les1.q3exp' },
        ]
      },
      {
        key: 'academy.l4.les2',
        cards: [
          { type: 'theory', key: 'academy.l4.t3' },
          { type: 'example', cocktail: "Planter's Punch" },
          { type: 'note',   key: 'academy.l4.note2' },
          { type: 'example', cocktail: 'Singapore Sling' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l4.les2.q1', a: ['academy.l4.les2.q1a1','academy.l4.les2.q1a2','academy.l4.les2.q1a3','academy.l4.les2.q1a4'], exp: 'academy.l4.les2.q1exp' },
          { q: 'academy.l4.les2.q2', a: ['academy.l4.les2.q2a1','academy.l4.les2.q2a2','academy.l4.les2.q2a3','academy.l4.les2.q2a4'], exp: 'academy.l4.les2.q2exp' },
          { q: 'academy.l4.les2.q3', a: ['academy.l4.les2.q3a1','academy.l4.les2.q3a2','academy.l4.les2.q3a3','academy.l4.les2.q3a4'], exp: 'academy.l4.les2.q3exp' },
        ]
      },
    ],
    // Rum-heavy tiki arc, closed with the regional-precision round.
    sequence: [
      { type: 'lesson', index: 0 },
      { type: 'practice', roundId: 6 },
      { type: 'lesson', index: 1 },
      { type: 'practice', roundId: 20 },
      { type: 'lesson', index: 2 },
      { type: 'practice', roundId: 25 },
    ],
    questions: [
      { q: 'academy.l4.q1',  a: ['academy.l4.q1a1','academy.l4.q1a2','academy.l4.q1a3','academy.l4.q1a4'], exp: 'academy.l4.q1exp' },
      { q: 'academy.l4.q2',  a: ['academy.l4.q2a1','academy.l4.q2a2','academy.l4.q2a3','academy.l4.q2a4'], exp: 'academy.l4.q2exp' },
      { q: 'academy.l4.q3',  a: ['academy.l4.q3a1','academy.l4.q3a2','academy.l4.q3a3','academy.l4.q3a4'], exp: 'academy.l4.q3exp' },
      { q: 'academy.l4.q4',  a: ['academy.l4.q4a1','academy.l4.q4a2','academy.l4.q4a3','academy.l4.q4a4'], exp: 'academy.l4.q4exp' },
      { q: 'academy.l4.q5',  a: ['academy.l4.q5a1','academy.l4.q5a2','academy.l4.q5a3','academy.l4.q5a4'], exp: 'academy.l4.q5exp' },
      { q: 'academy.l4.q6',  a: ['academy.l4.q6a1','academy.l4.q6a2','academy.l4.q6a3','academy.l4.q6a4'], exp: 'academy.l4.q6exp' },
      { q: 'academy.l4.q7',  a: ['academy.l4.q7a1','academy.l4.q7a2','academy.l4.q7a3','academy.l4.q7a4'], exp: 'academy.l4.q7exp' },
      { q: 'academy.l4.q8',  a: ['academy.l4.q8a1','academy.l4.q8a2','academy.l4.q8a3','academy.l4.q8a4'], exp: 'academy.l4.q8exp' },
      { q: 'academy.l4.q9',  a: ['academy.l4.q9a1','academy.l4.q9a2','academy.l4.q9a3','academy.l4.q9a4'], exp: 'academy.l4.q9exp' },
      { q: 'academy.l4.q10', a: ['academy.l4.q10a1','academy.l4.q10a2','academy.l4.q10a3','academy.l4.q10a4'], exp: 'academy.l4.q10exp' },
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 5 — Advanced Techniques
  // ═══════════════════════════════════════════════════════════
  {
    id: 5,
    key: 'academy.l5.title',
    descKey: 'academy.l5.desc',
    icon: '💎',
    color: '#e74c3c',
    passThreshold: 70,
    lessons: [
      {
        key: 'academy.l5.les0',
        cards: [
          { type: 'theory', key: 'academy.l5.t1' },
          { type: 'tip',    key: 'academy.l5.tip1' },
          { type: 'example', cocktail: 'Ramos Fizz' },
          { type: 'note',   key: 'academy.l5.note1' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l5.les0.q1', a: ['academy.l5.les0.q1a1','academy.l5.les0.q1a2','academy.l5.les0.q1a3','academy.l5.les0.q1a4'], exp: 'academy.l5.les0.q1exp' },
          { q: 'academy.l5.les0.q2', a: ['academy.l5.les0.q2a1','academy.l5.les0.q2a2','academy.l5.les0.q2a3','academy.l5.les0.q2a4'], exp: 'academy.l5.les0.q2exp' },
          { q: 'academy.l5.les0.q3', a: ['academy.l5.les0.q3a1','academy.l5.les0.q3a2','academy.l5.les0.q3a3','academy.l5.les0.q3a4'], exp: 'academy.l5.les0.q3exp' },
        ]
      },
      {
        key: 'academy.l5.les1',
        cards: [
          { type: 'theory', key: 'academy.l5.t2' },
          { type: 'example', cocktail: 'Porto Flip' },
          { type: 'tip',    key: 'academy.l5.tip2' },
          { type: 'example', cocktail: 'Clover Club' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l5.les1.q1', a: ['academy.l5.les1.q1a1','academy.l5.les1.q1a2','academy.l5.les1.q1a3','academy.l5.les1.q1a4'], exp: 'academy.l5.les1.q1exp' },
          { q: 'academy.l5.les1.q2', a: ['academy.l5.les1.q2a1','academy.l5.les1.q2a2','academy.l5.les1.q2a3','academy.l5.les1.q2a4'], exp: 'academy.l5.les1.q2exp' },
          { q: 'academy.l5.les1.q3', a: ['academy.l5.les1.q3a1','academy.l5.les1.q3a2','academy.l5.les1.q3a3','academy.l5.les1.q3a4'], exp: 'academy.l5.les1.q3exp' },
        ]
      },
      {
        key: 'academy.l5.les2',
        cards: [
          { type: 'theory', key: 'academy.l5.t3' },
          { type: 'example', cocktail: 'Brandy Crusta' },
          { type: 'note',   key: 'academy.l5.note2' },
          { type: 'example', cocktail: 'Last Word' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l5.les2.q1', a: ['academy.l5.les2.q1a1','academy.l5.les2.q1a2','academy.l5.les2.q1a3','academy.l5.les2.q1a4'], exp: 'academy.l5.les2.q1exp' },
          { q: 'academy.l5.les2.q2', a: ['academy.l5.les2.q2a1','academy.l5.les2.q2a2','academy.l5.les2.q2a3','academy.l5.les2.q2a4'], exp: 'academy.l5.les2.q2exp' },
          { q: 'academy.l5.les2.q3', a: ['academy.l5.les2.q3a1','academy.l5.les2.q3a2','academy.l5.les2.q3a3','academy.l5.les2.q3a4'], exp: 'academy.l5.les2.q3exp' },
        ]
      },
      {
        key: 'academy.l5.les3',
        cards: [
          { type: 'theory', key: 'academy.l5.t4' },
          { type: 'tip',    key: 'academy.l5.tip3' },
          { type: 'example', cocktail: 'French 75' },
          { type: 'example', cocktail: 'Gin Fizz' },
        ],
        passThreshold: 70,
        questions: [
          { q: 'academy.l5.les3.q1', a: ['academy.l5.les3.q1a1','academy.l5.les3.q1a2','academy.l5.les3.q1a3','academy.l5.les3.q1a4'], exp: 'academy.l5.les3.q1exp' },
          { q: 'academy.l5.les3.q2', a: ['academy.l5.les3.q2a1','academy.l5.les3.q2a2','academy.l5.les3.q2a3','academy.l5.les3.q2a4'], exp: 'academy.l5.les3.q2exp' },
          { q: 'academy.l5.les3.q3', a: ['academy.l5.les3.q3a1','academy.l5.les3.q3a2','academy.l5.les3.q3a3','academy.l5.les3.q3a4'], exp: 'academy.l5.les3.q3exp' },
        ]
      },
    ],
    // Modern mixology pioneers (9, 13) land here before the capstone IBA deep-dive.
    sequence: [
      { type: 'lesson', index: 0 },
      { type: 'practice', roundId: 5 },
      { type: 'practice', roundId: 10 },
      { type: 'lesson', index: 1 },
      { type: 'practice', roundId: 15 },
      { type: 'practice', roundId: 22 },
      { type: 'lesson', index: 2 },
      { type: 'practice', roundId: 9 },
      { type: 'practice', roundId: 13 },
      { type: 'practice', roundId: 23 },
      { type: 'practice', roundId: 24 },
      { type: 'lesson', index: 3 },
    ],
    questions: [
      { q: 'academy.l5.q1',  a: ['academy.l5.q1a1','academy.l5.q1a2','academy.l5.q1a3','academy.l5.q1a4'], exp: 'academy.l5.q1exp' },
      { q: 'academy.l5.q2',  a: ['academy.l5.q2a1','academy.l5.q2a2','academy.l5.q2a3','academy.l5.q2a4'], exp: 'academy.l5.q2exp' },
      { q: 'academy.l5.q3',  a: ['academy.l5.q3a1','academy.l5.q3a2','academy.l5.q3a3','academy.l5.q3a4'], exp: 'academy.l5.q3exp' },
      { q: 'academy.l5.q4',  a: ['academy.l5.q4a1','academy.l5.q4a2','academy.l5.q4a3','academy.l5.q4a4'], exp: 'academy.l5.q4exp' },
      { q: 'academy.l5.q5',  a: ['academy.l5.q5a1','academy.l5.q5a2','academy.l5.q5a3','academy.l5.q5a4'], exp: 'academy.l5.q5exp' },
      { q: 'academy.l5.q6',  a: ['academy.l5.q6a1','academy.l5.q6a2','academy.l5.q6a3','academy.l5.q6a4'], exp: 'academy.l5.q6exp' },
      { q: 'academy.l5.q7',  a: ['academy.l5.q7a1','academy.l5.q7a2','academy.l5.q7a3','academy.l5.q7a4'], exp: 'academy.l5.q7exp' },
      { q: 'academy.l5.q8',  a: ['academy.l5.q8a1','academy.l5.q8a2','academy.l5.q8a3','academy.l5.q8a4'], exp: 'academy.l5.q8exp' },
      { q: 'academy.l5.q9',  a: ['academy.l5.q9a1','academy.l5.q9a2','academy.l5.q9a3','academy.l5.q9a4'], exp: 'academy.l5.q9exp' },
      { q: 'academy.l5.q10', a: ['academy.l5.q10a1','academy.l5.q10a2','academy.l5.q10a3','academy.l5.q10a4'], exp: 'academy.l5.q10exp' },
    ]
  },
];
