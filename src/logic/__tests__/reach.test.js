import { describe, it, expect } from 'vitest';
import { parseReachValue, formatCompactNumber } from '../reach.js';

describe('parseReachValue', () => {
  it('returns null for empty/null/undefined input', () => {
    expect(parseReachValue(null)).toBeNull();
    expect(parseReachValue(undefined)).toBeNull();
    expect(parseReachValue('')).toBeNull();
  });

  it('parses "2.4M impressions" style suffixes', () => {
    expect(parseReachValue('2.4M impressions')).toBeCloseTo(2.4e6);
  });

  it('parses lakh/crore/million/billion/thousand unit words', () => {
    expect(parseReachValue('3 lakh views')).toBeCloseTo(3e5);
    expect(parseReachValue('1.2 crore views')).toBeCloseTo(1.2e7);
    expect(parseReachValue('5 million accounts')).toBeCloseTo(5e6);
    expect(parseReachValue('1.1 billion reach')).toBeCloseTo(1.1e9);
    expect(parseReachValue('40 thousand shares')).toBeCloseTo(4e4);
  });

  it('parses comma-formatted counts', () => {
    expect(parseReachValue('reached 12,500 accounts')).toBe(12500);
  });

  it('parses k/m/b suffixes case-insensitively', () => {
    expect(parseReachValue('500k views')).toBeCloseTo(5e5);
    expect(parseReachValue('2B views')).toBeCloseTo(2e9);
  });

  it('picks the largest candidate when multiple numbers are present', () => {
    // "2 accounts, 40,000 followers" -> should prefer the larger figure
    expect(parseReachValue('2 accounts, 40,000 followers')).toBe(40000);
  });

  it('returns null for non-quantifiable text like "Thousands of..." (no digit)', () => {
    expect(parseReachValue('Thousands of sockpuppet profiles reported')).toBeNull();
  });

  it('returns null for purely descriptive text with no numbers', () => {
    expect(parseReachValue('National broadcast')).toBeNull();
    expect(parseReachValue('Industry-wide')).toBeNull();
  });
});

describe('formatCompactNumber', () => {
  it('formats billions', () => {
    expect(formatCompactNumber(2.5e9)).toBe('2.5B');
    expect(formatCompactNumber(1.2e10)).toBe('12B');
  });

  it('formats millions', () => {
    expect(formatCompactNumber(3.4e6)).toBe('3.4M');
    expect(formatCompactNumber(1.5e7)).toBe('15M');
  });

  it('formats thousands', () => {
    expect(formatCompactNumber(4200)).toBe('4.2K');
    expect(formatCompactNumber(15000)).toBe('15K');
  });

  it('formats sub-thousand numbers as a plain rounded integer', () => {
    expect(formatCompactNumber(42)).toBe('42');
    expect(formatCompactNumber(0)).toBe('0');
    expect(formatCompactNumber(999)).toBe('999');
  });
});
