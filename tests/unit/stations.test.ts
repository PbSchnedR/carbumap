import { describe, expect, it } from 'vitest';
import { normalizeStation, otherFuelPrices } from '../../src/domain/stations';
import { record } from './fixtures/records';

describe('normalizeStation', () => {
  it('normalise un enregistrement complet', () => {
    const station = normalizeStation(record());
    expect(station).toEqual({
      id: 89100001,
      address: '84 ROUTE DE MAILLOT',
      postalCode: '89100',
      city: 'Sens',
      position: { lat: 48.183, lon: 3.309 },
      prices: {
        gazole: { price: 2.449, updatedAt: new Date('2026-09-15T08:15:46Z') },
        e85: { price: 0.859, updatedAt: new Date('2026-08-25T08:02:31Z') },
        e10: { price: 2.259, updatedAt: new Date('2026-09-16T07:40:12Z') },
        sp98: { price: 2.299, updatedAt: new Date('2026-09-17T07:26:09Z') },
      },
    });
  });

  it('remplace adresse, code postal et ville absents par une chaîne vide', () => {
    const station = normalizeStation(record({ adresse: null, cp: null, ville: null }));
    expect(station!.address).toBe('');
    expect(station!.postalCode).toBe('');
    expect(station!.city).toBe('');
  });

  it('écarte une station sans position', () => {
    expect(normalizeStation(record({ geom: null }))).toBeNull();
    expect(normalizeStation(record({ geom: { lon: null, lat: 48 } }))).toBeNull();
  });

  it('ignore un prix absent, non numérique ou ≤ 0', () => {
    expect(normalizeStation(record({ gazole_prix: null }))!.prices.gazole).toBeUndefined();
    // @ts-expect-error prix volontairement non numérique
    expect(normalizeStation(record({ gazole_prix: '2.449' }))!.prices.gazole).toBeUndefined();
    expect(normalizeStation(record({ gazole_prix: Number.NaN }))!.prices.gazole).toBeUndefined();
    expect(normalizeStation(record({ gazole_prix: 0 }))!.prices.gazole).toBeUndefined();
    expect(normalizeStation(record({ gazole_prix: -1 }))!.prices.gazole).toBeUndefined();
  });

  it('ignore un carburant en rupture temporaire même avec un dernier prix connu', () => {
    const station = normalizeStation(
      record({ gazole_prix: 2.359, gazole_maj: '2026-09-14T08:43:00+00:00', gazole_rupture_type: 'temporaire' }),
    );
    expect(station!.prices.gazole).toBeUndefined();
  });

  it('ignore un carburant en rupture définitive', () => {
    const station = normalizeStation(record({ e10_rupture_type: 'definitive' }));
    expect(station!.prices.e10).toBeUndefined();
  });

  it('ignore un prix dont la date est illisible', () => {
    expect(normalizeStation(record({ gazole_maj: null }))!.prices.gazole).toBeUndefined();
    expect(normalizeStation(record({ gazole_maj: 'hier' }))!.prices.gazole).toBeUndefined();
  });

  it('associe les champs gplc_* au carburant gplc', () => {
    const station = normalizeStation(
      record({ gplc_prix: 1.049, gplc_maj: '2026-09-10T12:00:00+00:00', gplc_rupture_type: null }),
    );
    expect(station!.prices.gplc).toEqual({ price: 1.049, updatedAt: new Date('2026-09-10T10:00:00Z') });
  });
});

describe('otherFuelPrices', () => {
  const NOW = new Date('2026-09-17T12:00:00Z');

  it('renvoie les autres carburants avec un prix, dans l’ordre d’affichage', () => {
    const station = normalizeStation(record())!;
    expect(otherFuelPrices(station, 'gazole', NOW).map((line) => line.fuel)).toEqual(['e10', 'sp98', 'e85']);
  });

  it('donne libellé, prix, date et signalement « ancien »', () => {
    const station = normalizeStation(record())!;
    const [first] = otherFuelPrices(station, 'gazole', NOW);
    expect(first).toEqual({
      fuel: 'e10',
      label: 'E10',
      price: 2.259,
      updatedAt: new Date('2026-09-16T07:40:12Z'),
      isStale: false,
    });
    const e85 = otherFuelPrices(station, 'gazole', NOW).find((line) => line.fuel === 'e85');
    expect(e85?.isStale).toBe(true);
  });

  it('exclut le carburant choisi', () => {
    const station = normalizeStation(record())!;
    expect(otherFuelPrices(station, 'e10', NOW).map((line) => line.fuel)).not.toContain('e10');
  });

  it('renvoie une liste vide sans autre prix', () => {
    const station = normalizeStation(record({ e10_prix: null, sp98_prix: null, e85_prix: null }))!;
    expect(otherFuelPrices(station, 'gazole', NOW)).toEqual([]);
  });
});
