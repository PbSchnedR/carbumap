import { describe, expect, it } from 'vitest';
import { originLabel } from '../../src/domain/searchOrigin';

const POSITION = { lat: 48.8566, lon: 2.3522 };

describe('originLabel', () => {
  it("n'affiche rien sans point de recherche", () => {
    expect(originLabel(null)).toBe('');
  });

  it('nomme la position de l’appareil', () => {
    expect(originLabel({ kind: 'device', position: POSITION })).toBe('Ma position');
  });

  it('nomme le centre de la carte', () => {
    expect(originLabel({ kind: 'map', position: POSITION })).toBe('Zone de la carte');
  });

  it('affiche le libellé du lieu choisi', () => {
    expect(originLabel({ kind: 'place', position: POSITION, label: 'Gennevilliers' })).toBe('Gennevilliers');
  });
});
