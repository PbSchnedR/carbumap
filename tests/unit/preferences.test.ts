import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  readPreferences,
  serializePreferences,
  type Preferences,
} from '../../src/domain/preferences';

describe('readPreferences', () => {
  it('renvoie les valeurs par défaut sans donnée ou avec un JSON invalide', () => {
    expect(DEFAULT_PREFERENCES).toEqual({ fuel: 'gazole', radiusKm: 10 });
    expect(readPreferences(null)).toEqual({ fuel: 'gazole', radiusKm: 10 });
    expect(readPreferences('{oops')).toEqual({ fuel: 'gazole', radiusKm: 10 });
    expect(readPreferences('"e10"')).toEqual({ fuel: 'gazole', radiusKm: 10 });
    expect(readPreferences('null')).toEqual({ fuel: 'gazole', radiusKm: 10 });
  });

  it('remplace seulement un carburant inconnu', () => {
    expect(readPreferences('{"fuel":"kerosene","radiusKm":20}')).toEqual({ fuel: 'gazole', radiusKm: 20 });
  });

  it('remplace seulement un rayon non autorisé', () => {
    expect(readPreferences('{"fuel":"e85","radiusKm":15}')).toEqual({ fuel: 'e85', radiusKm: 10 });
    expect(readPreferences('{"fuel":"e85","radiusKm":"10"}')).toEqual({ fuel: 'e85', radiusKm: 10 });
  });

  it('relit ce qui a été sérialisé', () => {
    const prefs: Preferences = { fuel: 'gplc', radiusKm: 5 };
    expect(readPreferences(serializePreferences(prefs))).toEqual(prefs);
  });
});
