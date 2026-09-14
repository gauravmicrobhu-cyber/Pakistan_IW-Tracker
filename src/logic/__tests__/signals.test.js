import { describe, it, expect } from 'vitest';
import { isPakistanSignal } from '../signals.js';

describe('isPakistanSignal', () => {
  it('returns false for empty/null/undefined text', () => {
    expect(isPakistanSignal('')).toBe(false);
    expect(isPakistanSignal(null)).toBe(false);
    expect(isPakistanSignal(undefined)).toBe(false);
  });

  it('returns false for text with no Pakistan-linked keyword', () => {
    expect(isPakistanSignal('A routine market update from Mumbai')).toBe(false);
  });

  it('matches a known keyword case-insensitively', () => {
    expect(isPakistanSignal('DG ISPR held a press briefing today')).toBe(true);
    expect(isPakistanSignal('dg ispr held a press briefing today')).toBe(true);
  });

  it('matches whole-word keywords padded with spaces (e.g. " paf ")', () => {
    expect(isPakistanSignal('a PAF jet was seen overhead')).toBe(true);
  });

  it('matches a multi-word keyword like "radio pakistan"', () => {
    expect(isPakistanSignal('according to Radio Pakistan sources')).toBe(true);
  });
});
