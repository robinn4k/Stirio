import { localizeFicha } from '../i18n/fichas_i18n.js';
import { IBA_UNFORGETTABLES } from './iba_unforgettables.js';
import { IBA_CONTEMPORARY } from './iba_contemporary.js';
import { IBA_NEW_ERA } from './iba_new_era.js';

const ALL_RAW = [
  ...IBA_UNFORGETTABLES,
  ...IBA_CONTEMPORARY,
  ...IBA_NEW_ERA,
];

const seen = new Set();
export const fichas = ALL_RAW.filter(f => {
  if (seen.has(f.name)) return false;
  seen.add(f.name);
  return true;
}).map(localizeFicha);
