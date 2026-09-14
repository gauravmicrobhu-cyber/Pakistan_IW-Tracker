import { describe, it, expect, vi } from 'vitest';

// computeNationalPosture pulls `incidents` from state.js and `computeCampaignIndex` /
// `postureFactorState` from render/analytics.js (a real-world coupling carried over unchanged
// from the original monolith). Mock both dependency modules so this stays a fast, deterministic
// unit test instead of dragging in the whole render tree + localStorage-backed seed data.
vi.mock('../../state.js', () => ({
  incidents: [
    { type: 'social', sev: 'critical', date: new Date().toISOString().slice(0, 10) }, // recent, critical, threat
    { type: 'cyber', sev: 'low', date: '2019-01-01' }, // old, non-critical, threat
    { type: 'response', sev: 'low', date: new Date().toISOString().slice(0, 10) }, // response
  ],
}));

vi.mock('../../render/analytics.js', () => ({
  computeCampaignIndex: () => [
    { key: 'sindoor', vol: 2, composite: 80 },
    { key: 'ongoing', vol: 1, composite: 20 },
  ],
  postureFactorState: { intensity: true, recency: true, severity: true, response: true },
}));

const { computeNationalPosture, statusForPosture } = await import('../posture.js');

describe('statusForPosture', () => {
  it('returns CRITICAL at/above 70', () => {
    expect(statusForPosture(70).label).toBe('CRITICAL');
    expect(statusForPosture(100).label).toBe('CRITICAL');
  });

  it('returns ELEVATED between 40 and 69', () => {
    expect(statusForPosture(40).label).toBe('ELEVATED');
    expect(statusForPosture(69).label).toBe('ELEVATED');
  });

  it('returns GUARDED below 40', () => {
    expect(statusForPosture(39).label).toBe('GUARDED');
    expect(statusForPosture(0).label).toBe('GUARDED');
  });
});

describe('computeNationalPosture', () => {
  it('returns four factors and a composite score derived from them', () => {
    const { factors, composite } = computeNationalPosture();
    expect(factors.map(f => f.id)).toEqual(['intensity', 'recency', 'severity', 'response']);
    factors.forEach(f => {
      expect(f.val).toBeGreaterThanOrEqual(0);
      expect(f.val).toBeLessThanOrEqual(100);
    });
    // composite is the mean of the four factor values (all active by default)
    const expectedComposite = Math.round(factors.reduce((s, f) => s + f.val, 0) / factors.length);
    expect(composite).toBe(expectedComposite);
  });

  it('intensity factor is the volume-weighted mean of campaign composites', () => {
    const { factors } = computeNationalPosture();
    const intensity = factors.find(f => f.id === 'intensity').val;
    // (80*2 + 20*1) / 3 = 60
    expect(intensity).toBe(60);
  });
});
