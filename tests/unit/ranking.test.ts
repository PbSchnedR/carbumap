import { describe, expect, it } from 'vitest';
import { distanceKm } from '../../src/domain/distance';
import { isStale, lowestPriceStationIds, rankStations, type RankedStation } from '../../src/domain/ranking';
import type { FuelPrice, Station } from '../../src/domain/stations';

const ORIGIN = { lat: 48.8566, lon: 2.3522 };
const NOW = new Date('2026-09-17T12:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;
// 1 km vers le nord ≈ 1/111,195 degré de latitude.
const KM_IN_LAT = 1 / ((2 * Math.PI * 6371) / 360);

function station(id: number, kmNorth: number, prices: Station['prices']): Station {
  return {
    id,
    address: `${id} rue du Test`,
    postalCode: '75000',
    city: 'Paris',
    position: { lat: ORIGIN.lat + kmNorth * KM_IN_LAT, lon: ORIGIN.lon },
    prices,
  };
}

const price = (value: number, updatedAt = NOW): FuelPrice => ({ price: value, updatedAt });

const rank = (stations: Station[], options: Partial<Parameters<typeof rankStations>[1]> = {}) =>
  rankStations(stations, { fuel: 'gazole', radiusKm: 10, origin: ORIGIN, now: NOW, ...options });

describe('rankStations', () => {
  it('exclut les stations sans prix pour le carburant choisi', () => {
    const stations = [station(1, 1, { gazole: price(2) }), station(2, 1, { e10: price(1.9) })];
    expect(rank(stations).map((r) => r.station.id)).toEqual([1]);
  });

  it('exclut les stations au-delà du rayon et inclut celles exactement au rayon', () => {
    const atRadius = station(1, 5, { gazole: price(2) });
    const exact = distanceKm(ORIGIN, atRadius.position);
    const beyond = station(2, 5.01, { gazole: price(2) });
    const ranked = rank([atRadius, beyond], { radiusKm: exact });
    expect(ranked.map((r) => r.station.id)).toEqual([1]);
  });

  it('applique le rayon choisi', () => {
    const stations = [station(1, 3, { gazole: price(2) }), station(2, 8, { gazole: price(2) })];
    expect(rank(stations, { radiusKm: 5 }).map((r) => r.station.id)).toEqual([1]);
    expect(rank(stations, { radiusKm: 10 }).map((r) => r.station.id)).toEqual([1, 2]);
  });

  it('trie par prix croissant, puis distance croissante, puis id croissant', () => {
    const stations = [
      station(5, 2, { gazole: price(2.1) }),
      station(4, 3, { gazole: price(1.9) }),
      station(3, 1, { gazole: price(1.9) }),
      station(2, 1, { gazole: price(2.1) }),
      station(1, 1, { gazole: price(2.1) }),
    ];
    expect(rank(stations).map((r) => r.station.id)).toEqual([3, 4, 1, 2, 5]);
  });

  it('renvoie la station, le prix, la distance et le signalement « ancien »', () => {
    const s = station(1, 2, { gazole: price(2.449) });
    const [result] = rank([s]);
    expect(result.station).toBe(s);
    expect(result.price).toEqual(price(2.449));
    expect(result.distanceKm).toBeCloseTo(2, 6);
    expect(result.isStale).toBe(false);
  });

  it("signale les prix de plus de 7 jours sans changer l'ordre", () => {
    const old = new Date(NOW.getTime() - 8 * DAY_MS);
    const stations = [station(1, 1, { gazole: price(1.5, old) }), station(2, 1, { gazole: price(2) })];
    const ranked = rank(stations);
    expect(ranked.map((r) => [r.station.id, r.isStale])).toEqual([
      [1, true],
      [2, false],
    ]);
  });

  it('renvoie une liste vide pour une entrée vide', () => {
    expect(rank([])).toEqual([]);
  });

  it('ne modifie pas le tableau reçu', () => {
    const stations = [station(1, 1, { gazole: price(2.1) }), station(2, 1, { gazole: price(1.9) })];
    const copy = [...stations];
    rank(stations);
    expect(stations).toEqual(copy);
  });
});

describe('isStale', () => {
  it("n'est pas ancien à exactement 7 jours", () => {
    expect(isStale(new Date(NOW.getTime() - 7 * DAY_MS), NOW)).toBe(false);
  });

  it('est ancien au-delà de 7 jours', () => {
    expect(isStale(new Date(NOW.getTime() - 7 * DAY_MS - 1), NOW)).toBe(true);
  });
});

describe('lowestPriceStationIds', () => {
  const ranked = (entries: [number, number][]): RankedStation[] =>
    entries.map(([id, value]) => ({ station: station(id, 1, {}), price: price(value), distanceKm: 1, isStale: false }));

  it('renvoie un ensemble vide pour un classement vide', () => {
    expect(lowestPriceStationIds([])).toEqual(new Set());
  });

  it('renvoie la station au prix le plus bas', () => {
    expect(lowestPriceStationIds(ranked([[1, 1.9], [2, 2.1]]))).toEqual(new Set([1]));
  });

  it('renvoie toutes les stations à égalité au prix le plus bas', () => {
    expect(lowestPriceStationIds(ranked([[1, 1.899], [2, 1.899], [3, 1.949]]))).toEqual(new Set([1, 2]));
  });

  it("ne dépend pas de l'ordre et ne modifie pas le tableau reçu", () => {
    const input = ranked([[3, 1.949], [2, 1.899], [1, 1.899]]);
    const copy = [...input];
    expect(lowestPriceStationIds(input)).toEqual(new Set([1, 2]));
    expect(input).toEqual(copy);
  });
});
