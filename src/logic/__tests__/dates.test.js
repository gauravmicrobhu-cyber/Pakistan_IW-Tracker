import { describe, it, expect, beforeEach } from 'vitest';
import { formatDate, formatGdeltDate, dayIdxToDate } from '../dates.js';
import { setTimelineMinTs } from '../../state.js';

describe('formatDate', () => {
  it('returns an em dash for falsy input', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('formats an ISO date string as DD MON YYYY (uppercase, en-IN locale)', () => {
    const result = formatDate('2025-05-07');
    expect(result).toMatch(/^07 MAY 2025$/);
  });

  it('formats a leap-day date correctly', () => {
    expect(formatDate('2020-02-29')).toBe('29 FEB 2020');
  });
});

describe('formatGdeltDate', () => {
  it('parses a GDELT YYYYMMDDTHHMMSSZ timestamp into a readable string', () => {
    const result = formatGdeltDate('20250507T143000Z');
    // Should contain the day and month at minimum; exact hour formatting is locale-dependent
    // on hour12 rendering but the date portion must be stable.
    expect(result).toMatch(/07 May/);
  });
});

describe('dayIdxToDate', () => {
  beforeEach(() => {
    // Fix the timeline epoch to a known instant for deterministic assertions.
    setTimelineMinTs(Date.UTC(2025, 0, 1)); // 2025-01-01T00:00:00Z
  });

  it('returns the epoch date itself for index 0', () => {
    const d = dayIdxToDate(0);
    expect(d.getTime()).toBe(Date.UTC(2025, 0, 1));
  });

  it('adds `idx` whole days to the timeline epoch', () => {
    const d = dayIdxToDate(10);
    expect(d.getTime()).toBe(Date.UTC(2025, 0, 11));
  });

  it('handles negative indices by going backwards', () => {
    const d = dayIdxToDate(-1);
    expect(d.getTime()).toBe(Date.UTC(2024, 11, 31));
  });
});
