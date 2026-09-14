import { describe, it, expect } from 'vitest';
import { clusterByDate, labelCluster, normalizeSourceName } from '../cluster.js';

describe('clusterByDate', () => {
  it('returns an empty array for no items', () => {
    expect(clusterByDate([], 10)).toEqual([]);
  });

  it('ignores items with no date', () => {
    expect(clusterByDate([{ title: 'no date' }], 10)).toEqual([]);
  });

  it('groups items within the gap window into one cluster, dropping singletons', () => {
    const items = [
      { title: 'a', date: '2025-05-01' },
      { title: 'b', date: '2025-05-03' }, // 2 days after a — within a 10-day gap
      { title: 'c', date: '2025-06-01' }, // far away — its own singleton, dropped (needs >=2)
    ];
    const clusters = clusterByDate(items, 10);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].map(i => i.title)).toEqual(['a', 'b']);
  });

  it('splits into separate clusters when the gap exceeds gapDays', () => {
    const items = [
      { title: 'a', date: '2025-01-01' },
      { title: 'b', date: '2025-01-02' },
      { title: 'c', date: '2025-03-01' },
      { title: 'd', date: '2025-03-02' },
    ];
    const clusters = clusterByDate(items, 5);
    expect(clusters).toHaveLength(2);
    expect(clusters[0].map(i => i.title)).toEqual(['a', 'b']);
    expect(clusters[1].map(i => i.title)).toEqual(['c', 'd']);
  });

  it('sorts unsorted input by date before clustering', () => {
    const items = [
      { title: 'later', date: '2025-05-03' },
      { title: 'earlier', date: '2025-05-01' },
    ];
    const clusters = clusterByDate(items, 10);
    expect(clusters[0].map(i => i.title)).toEqual(['earlier', 'later']);
  });

  it('treats a gap exactly equal to gapDays as still within the same cluster', () => {
    const items = [
      { title: 'a', date: '2025-05-01' },
      { title: 'b', date: '2025-05-11' }, // exactly 10 days later
    ];
    expect(clusterByDate(items, 10)).toHaveLength(1);
  });
});

describe('labelCluster', () => {
  it('matches a known event keyword in the joined titles', () => {
    const cluster = [
      { title: 'Coverage of Operation Sindoor response', date: '2025-05-08' },
      { title: 'Follow-up sindoor narrative', date: '2025-05-09' },
    ];
    expect(labelCluster(cluster)).toBe('Operation Sindoor response window');
  });

  it('falls back to a generic date-range label when no keyword matches', () => {
    const cluster = [
      { title: 'Some unrelated incident', date: '2025-05-01' },
      { title: 'Another unrelated incident', date: '2025-05-03' },
    ];
    const label = labelCluster(cluster);
    expect(label).toMatch(/^Event window \(/);
    expect(label).toContain('01 MAY 2025');
    expect(label).toContain('03 MAY 2025');
  });
});

describe('normalizeSourceName', () => {
  it('returns null for falsy input', () => {
    expect(normalizeSourceName(null)).toBeNull();
    expect(normalizeSourceName('')).toBeNull();
  });

  it('takes the text before the first separator (paren/slash/comma)', () => {
    expect(normalizeSourceName('BBC (verified)')).toBe('BBC');
    expect(normalizeSourceName('PTI/ANI')).toBe('PTI');
    expect(normalizeSourceName('NDTV, cross-checked')).toBe('NDTV');
  });

  it('trims whitespace around the extracted name', () => {
    expect(normalizeSourceName('  Reuters  / wire')).toBe('Reuters');
  });

  it('returns null when the extracted name is shorter than 2 characters', () => {
    expect(normalizeSourceName('X (formerly Twitter)')).toBeNull();
  });
});
