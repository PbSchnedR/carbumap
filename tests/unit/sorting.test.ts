import { describe, expect, it } from 'vitest';
import type { RankedStation } from '../../src/domain/ranking';
import { DEFAULT_SORT, sortRanked } from '../../src/domain/sorting';

const NOW = new Date('2026-09-17T12:00:00Z');

function entry(id: number, price: number, distanceKm: number, updatedAt: Date | null = NOW): RankedStation {
  return {
    station: {
      id,
      address: `${id} rue du Test`,
      postalCode: '75000',
      city: 'Paris',
      position: { lat: 48.85, lon: 2.35 },
      prices: {},
    },
    // Une date absente n'existe pas dans le modèle : on la simule pour le tri défensif.
    price: { price, updatedAt: updatedAt as Date },
    distanceKm,
    isStale: false,
  };
}

const ids = (entries: RankedStation[]) => entries.map((e) => e.station.id);

describe('DEFAULT_SORT', () => {
  it('est le prix croissant', () => {
    expect(DEFAULT_SORT).toEqual({ column: 'price', direction: 'asc' });
  });
});

describe('sortRanked', () => {
  it('reproduit l’ordre de 001 : prix, puis distance, puis id', () => {
    const entries = [entry(5, 2.1, 2), entry(4, 1.9, 3), entry(3, 1.9, 1), entry(2, 2.1, 1), entry(1, 2.1, 1)];
    expect(ids(sortRanked(entries, DEFAULT_SORT))).toEqual([3, 4, 1, 2, 5]);
  });

  it('trie par distance dans les deux sens', () => {
    const entries = [entry(1, 2.1, 5), entry(2, 1.9, 1), entry(3, 2.0, 3)];
    expect(ids(sortRanked(entries, { column: 'distance', direction: 'asc' }))).toEqual([2, 3, 1]);
    expect(ids(sortRanked(entries, { column: 'distance', direction: 'desc' }))).toEqual([1, 3, 2]);
  });

  it('trie par date de mise à jour dans les deux sens', () => {
    const older = new Date('2026-09-10T12:00:00Z');
    const oldest = new Date('2026-08-01T12:00:00Z');
    const entries = [entry(1, 2, 1, older), entry(2, 2, 1, NOW), entry(3, 2, 1, oldest)];
    expect(ids(sortRanked(entries, { column: 'updatedAt', direction: 'desc' }))).toEqual([2, 1, 3]);
    expect(ids(sortRanked(entries, { column: 'updatedAt', direction: 'asc' }))).toEqual([3, 1, 2]);
  });

  it('relègue les valeurs manquantes en fin de tri, quel que soit le sens', () => {
    const entries = [entry(1, 2, 1, null), entry(2, 2, 1, NOW), entry(3, 2, 1, new Date('2026-09-01T12:00:00Z'))];
    expect(ids(sortRanked(entries, { column: 'updatedAt', direction: 'asc' })).at(-1)).toBe(1);
    expect(ids(sortRanked(entries, { column: 'updatedAt', direction: 'desc' })).at(-1)).toBe(1);
  });

  it('départage par id pour un ordre total', () => {
    const entries = [entry(3, 2, 1), entry(1, 2, 1), entry(2, 2, 1)];
    expect(ids(sortRanked(entries, { column: 'price', direction: 'asc' }))).toEqual([1, 2, 3]);
    expect(ids(sortRanked(entries, { column: 'price', direction: 'desc' }))).toEqual([1, 2, 3]);
  });

  it('ne modifie pas le tableau reçu', () => {
    const entries = [entry(2, 2.1, 1), entry(1, 1.9, 1)];
    const copy = [...entries];
    sortRanked(entries, DEFAULT_SORT);
    expect(entries).toEqual(copy);
  });

  it('accepte une liste vide', () => {
    expect(sortRanked([], DEFAULT_SORT)).toEqual([]);
  });
});
