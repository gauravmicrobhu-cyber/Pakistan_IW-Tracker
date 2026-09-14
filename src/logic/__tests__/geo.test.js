import { describe, it, expect } from 'vitest';
import { greatCircleArc } from '../geo.js';

describe('greatCircleArc', () => {
  const origin = { lat: 33.6844, lng: 73.0479 };
  const dest = { lat: 28.6139, lng: 77.2090 };

  it('returns 41 points (STEPS=40, inclusive of both ends)', () => {
    const pts = greatCircleArc(origin, dest, 6);
    expect(pts).toHaveLength(41);
  });

  it('starts exactly at the origin and ends exactly at the destination', () => {
    const pts = greatCircleArc(origin, dest, 6);
    expect(pts[0]).toEqual([origin.lat, origin.lng]);
    expect(pts[pts.length - 1]).toEqual([dest.lat, dest.lng]);
  });

  it('bows the midpoint away from a straight line when curveHeight > 0', () => {
    const straightMidLat = (origin.lat + dest.lat) / 2;
    const straightMidLng = (origin.lng + dest.lng) / 2;
    const pts = greatCircleArc(origin, dest, 6);
    const mid = pts[20]; // midpoint of the 41-point curve
    const dist = Math.hypot(mid[0] - straightMidLat, mid[1] - straightMidLng);
    expect(dist).toBeGreaterThan(0);
  });

  it('produces a straight line (no bow) when curveHeight is 0', () => {
    const pts = greatCircleArc(origin, dest, 0);
    const mid = pts[20];
    const straightMidLat = (origin.lat + dest.lat) / 2;
    const straightMidLng = (origin.lng + dest.lng) / 2;
    expect(mid[0]).toBeCloseTo(straightMidLat, 6);
    expect(mid[1]).toBeCloseTo(straightMidLng, 6);
  });

  it('handles identical origin and destination without throwing (degenerate case)', () => {
    const pts = greatCircleArc(origin, origin, 6);
    expect(pts).toHaveLength(41);
    pts.forEach(p => {
      expect(Number.isFinite(p[0])).toBe(true);
      expect(Number.isFinite(p[1])).toBe(true);
    });
  });
});
