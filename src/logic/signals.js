import { pakSignalKeywords } from '../data/pakSignalKeywords.js';

export function isPakistanSignal(text) {
  const t = (' ' + (text||'').toLowerCase() + ' ');
  return pakSignalKeywords.some(kw => t.includes(kw));
}

