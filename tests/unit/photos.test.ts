import { describe, expect, it } from 'vitest';
import { pickNearestPhoto } from '../../src/domain/photos';

// Réponses réelles de Panoramax (2026-09-17), voir contracts/external-apis.md.
const STATION = { lat: 48.9327, lon: 2.3044 };

const photo = (id: string, coordinates: [number, number], overrides: Record<string, unknown> = {}) => ({
  id,
  geometry: { type: 'Point', coordinates },
  assets: { thumb: { href: `https://panoramax.openstreetmap.fr/derivates/${id}/thumb.jpg` } },
  properties: {
    datetimetz: '2025-05-29T17:28:47+02:00',
    license: 'CC-BY-SA-4.0',
    'geovisio:producer': 'NilsGdm',
  },
  ...overrides,
});

describe('pickNearestPhoto', () => {
  it('renvoie null sans photo', () => {
    expect(pickNearestPhoto([], STATION)).toBeNull();
  });

  it('retient la photo la plus proche de la station', () => {
    const near = photo('near', [2.304281, 48.933020]);
    const far = photo('far', [2.3055, 48.9345]);
    expect(pickNearestPhoto([far, near], STATION)?.id).toBe('near');
  });

  it('renvoie tous les champs utiles à l’affichage', () => {
    expect(pickNearestPhoto([photo('a', [2.3043706, 48.9333719])], STATION)).toEqual({
      id: 'a',
      thumbUrl: 'https://panoramax.openstreetmap.fr/derivates/a/thumb.jpg',
      takenAt: new Date('2025-05-29T17:28:47+02:00'),
      author: 'NilsGdm',
      license: 'CC-BY-SA-4.0',
      position: { lat: 48.9333719, lon: 2.3043706 },
    });
  });

  it('ignore les photos inexploitables', () => {
    const noThumb = { ...photo('no-thumb', [2.3044, 48.93271]), assets: {} };
    const badDate = photo('bad-date', [2.3044, 48.93272], {
      properties: { datetimetz: 'hier', license: 'CC-BY-SA-4.0', 'geovisio:producer': 'x' },
    });
    const noGeom = { ...photo('no-geom', [2.3044, 48.93273]), geometry: undefined };
    const good = photo('good', [2.3050, 48.9340]);
    expect(pickNearestPhoto([noThumb, badDate, noGeom, good], STATION)?.id).toBe('good');
    expect(pickNearestPhoto([noThumb, badDate, noGeom], STATION)).toBeNull();
  });

  it('remplace auteur et licence absents par une chaîne vide', () => {
    const anonymous = photo('anon', [2.3044, 48.9328], { properties: { datetimetz: '2025-05-29T17:28:47+02:00' } });
    const result = pickNearestPhoto([anonymous], STATION);
    expect(result?.author).toBe('');
    expect(result?.license).toBe('');
  });

  it('ne modifie pas le tableau reçu', () => {
    const input = [photo('a', [2.3050, 48.9340]), photo('b', [2.3044, 48.93275])];
    const copy = [...input];
    pickNearestPhoto(input, STATION);
    expect(input).toEqual(copy);
  });
});
