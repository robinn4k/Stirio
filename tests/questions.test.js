import { describe, it, expect } from 'vitest';

import { rounds as roundsEs } from '../js/i18n/questions_es.js';
import { rounds as roundsEn } from '../js/i18n/questions_en.js';
import { rounds as roundsDe } from '../js/i18n/questions_de.js';
import { rounds as roundsFr } from '../js/i18n/questions_fr.js';
import { rounds as roundsPt } from '../js/i18n/questions_pt.js';

const allLangs = { es: roundsEs, en: roundsEn, de: roundsDe, fr: roundsFr, pt: roundsPt };
const langCodes = Object.keys(allLangs);

// ─── Structural consistency across all 5 language files ──────

describe('Question file structural consistency', () => {
  it('all files have the same number of rounds', () => {
    const expected = roundsEs.length;
    for (const lang of langCodes) {
      expect(allLangs[lang].length, `${lang} round count`).toBe(expected);
    }
  });

  it('all files have matching round IDs in the same order', () => {
    const ids = roundsEs.map(r => r.id);
    for (const lang of langCodes) {
      expect(allLangs[lang].map(r => r.id), `${lang} round IDs`).toEqual(ids);
    }
  });

  it('all files have the same question count per round', () => {
    for (let i = 0; i < roundsEs.length; i++) {
      const expected = roundsEs[i].questions.length;
      for (const lang of langCodes) {
        expect(
          allLangs[lang][i].questions.length,
          `${lang} round ${roundsEs[i].id} question count`
        ).toBe(expected);
      }
    }
  });

  it('every question has exactly 4 answers', () => {
    for (const lang of langCodes) {
      for (const round of allLangs[lang]) {
        for (let qi = 0; qi < round.questions.length; qi++) {
          expect(
            round.questions[qi].a.length,
            `${lang} round ${round.id} q${qi + 1} answer count`
          ).toBe(4);
        }
      }
    }
  });

  it('all rounds share the same icon across languages', () => {
    for (let i = 0; i < roundsEs.length; i++) {
      for (const lang of langCodes) {
        expect(
          allLangs[lang][i].icon,
          `${lang} round ${roundsEs[i].id} icon`
        ).toBe(roundsEs[i].icon);
      }
    }
  });

  it('all rounds share the same color across languages', () => {
    for (let i = 0; i < roundsEs.length; i++) {
      for (const lang of langCodes) {
        expect(
          allLangs[lang][i].color,
          `${lang} round ${roundsEs[i].id} color`
        ).toBe(roundsEs[i].color);
      }
    }
  });
});

// ─── Required fields ─────────────────────────────────────────

describe('Required fields', () => {
  it('every round has id, title, subtitle, icon, color, questions', () => {
    const requiredFields = ['id', 'title', 'subtitle', 'icon', 'color', 'questions'];
    for (const lang of langCodes) {
      for (const round of allLangs[lang]) {
        for (const field of requiredFields) {
          expect(round, `${lang} round ${round.id}`).toHaveProperty(field);
          expect(round[field], `${lang} round ${round.id}.${field}`).toBeTruthy();
        }
      }
    }
  });

  it('every question has q, a, exp', () => {
    const requiredFields = ['q', 'a', 'exp'];
    for (const lang of langCodes) {
      for (const round of allLangs[lang]) {
        for (let qi = 0; qi < round.questions.length; qi++) {
          const question = round.questions[qi];
          for (const field of requiredFields) {
            expect(question, `${lang} round ${round.id} q${qi + 1}`).toHaveProperty(field);
            expect(question[field], `${lang} round ${round.id} q${qi + 1}.${field}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('no answer option is empty', () => {
    for (const lang of langCodes) {
      for (const round of allLangs[lang]) {
        for (let qi = 0; qi < round.questions.length; qi++) {
          for (let ai = 0; ai < round.questions[qi].a.length; ai++) {
            expect(
              round.questions[qi].a[ai],
              `${lang} round ${round.id} q${qi + 1} a${ai + 1}`
            ).toBeTruthy();
          }
        }
      }
    }
  });
});
