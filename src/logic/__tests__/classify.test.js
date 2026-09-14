import { describe, it, expect } from 'vitest';
import { guessType } from '../classify.js';

describe('guessType', () => {
  it('maps a recognised keyword to its vector type', () => {
    expect(guessType('Twitter')).toBe('social');
    expect(guessType('Fake Media outlet')).toBe('media');
    expect(guessType('a Cyber intrusion')).toBe('cyber');
    expect(guessType('Diplomatic channel')).toBe('diplo');
    expect(guessType('Proxy front organisation')).toBe('proxy');
    expect(guessType('PsyOps campaign')).toBe('psyops');
  });

  it('is case-insensitive', () => {
    expect(guessType('WHATSAPP')).toBe('social');
  });

  it('returns null when no keyword matches', () => {
    expect(guessType('something completely unrelated')).toBeNull();
  });
});
