import { describe, expect, it } from 'vitest';
import { distanceKm } from '../../src/domain/distance';

const PARIS = { lat: 48.8566, lon: 2.3522 };
const LYON = { lat: 45.764, lon: 4.8357 };

describe('distanceKm', () => {
  it('vaut 0 entre un point et lui-même', () => {
    expect(distanceKm(PARIS, PARIS)).toBe(0);
  });

  it('est symétrique', () => {
    expect(distanceKm(PARIS, LYON)).toBe(distanceKm(LYON, PARIS));
  });

  it('donne Paris → Lyon à 1 % près de 391,5 km', () => {
    const d = distanceKm(PARIS, LYON);
    expect(Math.abs(d - 391.5) / 391.5).toBeLessThan(0.01);
  });

  it('donne ~111,2 km pour 1 degré de latitude', () => {
    // 1° le long d'un méridien = 2πR / 360 avec R = 6 371 km, référence indépendante de haversine.
    const expected = (2 * Math.PI * 6371) / 360;
    expect(distanceKm({ lat: 45, lon: 3 }, { lat: 46, lon: 3 })).toBeCloseTo(expected, 6);
  });
});
