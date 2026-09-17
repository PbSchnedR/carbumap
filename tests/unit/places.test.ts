import { describe, expect, it } from 'vitest';
import { normalizePlace, shouldSearchPlaces } from '../../src/domain/places';

// Réponse réelle de l'API Adresse (2026-09-17), voir contracts/external-apis.md.
const feature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [2.294231, 48.93113] },
  properties: {
    id: '92036',
    label: 'Gennevilliers',
    type: 'municipality',
    city: 'Gennevilliers',
    postcode: '92230',
    context: '92, Hauts-de-Seine, Île-de-France',
  },
};

describe('shouldSearchPlaces', () => {
  it('ignore les saisies de moins de 3 caractères utiles', () => {
    expect(shouldSearchPlaces('')).toBe(false);
    expect(shouldSearchPlaces('  ')).toBe(false);
    expect(shouldSearchPlaces('ab')).toBe(false);
    expect(shouldSearchPlaces('  a ')).toBe(false);
  });

  it('accepte à partir de 3 caractères', () => {
    expect(shouldSearchPlaces('abc')).toBe(true);
    expect(shouldSearchPlaces('  Gennevilliers  ')).toBe(true);
  });
});

describe('normalizePlace', () => {
  it('convertit un résultat complet, longitude et latitude inversées', () => {
    expect(normalizePlace(feature)).toEqual({
      id: '92036',
      label: 'Gennevilliers',
      context: '92, Hauts-de-Seine, Île-de-France',
      position: { lat: 48.93113, lon: 2.294231 },
    });
  });

  it('remplace un contexte absent par une chaîne vide', () => {
    const withoutContext = { ...feature, properties: { ...feature.properties, context: undefined } };
    expect(normalizePlace(withoutContext)?.context).toBe('');
  });

  it('se rabat sur le libellé et la position quand il n’y a pas d’identifiant', () => {
    const withoutId = { ...feature, properties: { ...feature.properties, id: undefined } };
    expect(normalizePlace(withoutId)?.id).toBe('Gennevilliers:2.294231,48.93113');
  });

  it('écarte un résultat inexploitable', () => {
    expect(normalizePlace(null)).toBeNull();
    expect(normalizePlace({})).toBeNull();
    expect(normalizePlace({ ...feature, properties: { ...feature.properties, label: undefined } })).toBeNull();
    expect(normalizePlace({ ...feature, geometry: undefined })).toBeNull();
    expect(normalizePlace({ ...feature, geometry: { coordinates: ['a', 48] } })).toBeNull();
    expect(normalizePlace({ ...feature, geometry: { coordinates: [2.29] } })).toBeNull();
  });
});
