import { vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock fetch globally so lang.js can load translation JSON files in all tests
// (Node's native fetch cannot handle relative URLs like 'i18n/es.json')
const i18nDir = resolve(import.meta.dirname, '..', 'i18n');

globalThis.fetch = vi.fn((url) => {
  const match = String(url).match(/i18n\/(\w+)\.json/);
  if (!match) return Promise.reject(new Error('Not found: ' + url));
  const lang = match[1];
  const filePath = resolve(i18nDir, `${lang}.json`);
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  return Promise.resolve({ json: () => Promise.resolve(data) });
});
