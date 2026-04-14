import { rounds as roundsEs } from './i18n/questions_es.js';
import { rounds as roundsEn } from './i18n/questions_en.js';
import { rounds as roundsDe } from './i18n/questions_de.js';
import { rounds as roundsFr } from './i18n/questions_fr.js';
import { rounds as roundsPt } from './i18n/questions_pt.js';
import { getLang } from './lang.js';

const langMap = { es: roundsEs, en: roundsEn, de: roundsDe, fr: roundsFr, pt: roundsPt };

/** Returns rounds translated to the given (or current) language */
export function getLocalizedRounds(lang) {
  const l = lang || getLang();
  return langMap[l] || langMap.en;
}
