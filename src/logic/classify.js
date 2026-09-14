import { typeMap } from '../data/lookups.js';

export function guessType(str) {
  const s = str.toLowerCase();
  for (const [k,v] of Object.entries(typeMap)) { if (s.includes(k)) return v; }
  return null;
}

