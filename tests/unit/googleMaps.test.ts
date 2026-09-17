import { describe, expect, it } from 'vitest';
import { googleMapsDirectionsUrl, googleMapsPlaceUrl } from '../../src/domain/googleMaps';

const STATION = { lat: 48.9327, lon: 2.3044 };

describe('googleMapsPlaceUrl', () => {
  it('ouvre la fiche du lieu, sans clé, avec api=1', () => {
    expect(googleMapsPlaceUrl(STATION)).toBe('https://www.google.com/maps/search/?api=1&query=48.9327%2C2.3044');
  });
});

describe('googleMapsDirectionsUrl', () => {
  it('ouvre un itinéraire vers la station', () => {
    expect(googleMapsDirectionsUrl(STATION)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=48.9327%2C2.3044',
    );
  });
});

describe('coordonnées', () => {
  it('insère les coordonnées sans arrondi', () => {
    expect(googleMapsPlaceUrl({ lat: 48.933020821, lon: 2.304281187 })).toContain('48.933020821%2C2.304281187');
  });
});
