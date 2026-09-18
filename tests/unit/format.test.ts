import { describe, expect, it } from 'vitest';
import { formatDistance, formatPrice, formatPriceValue, formatUpdatedAt } from '../../src/domain/format';

describe('formatDistance', () => {
  it('affiche les distances sous 1 km en mètres arrondis à la dizaine', () => {
    expect(formatDistance(0.347)).toBe('350 m');
    expect(formatDistance(0.004)).toBe('0 m');
  });

  it('affiche les distances à partir de 1 km avec une décimale et une virgule', () => {
    expect(formatDistance(1)).toBe('1,0 km');
    expect(formatDistance(3.26)).toBe('3,3 km');
    expect(formatDistance(19.96)).toBe('20,0 km');
  });

  it("n'affiche pas « 1000 m » juste sous 1 km", () => {
    expect(formatDistance(0.998)).toBe('1,0 km');
  });
});

describe('formatPriceValue', () => {
  it('donne la valeur seule, sans unité, toujours à trois décimales', () => {
    expect(formatPriceValue(2.449)).toBe('2,449');
    expect(formatPriceValue(2)).toBe('2,000');
    expect(formatPriceValue(1.7)).toBe('1,700');
  });
});

describe('formatPrice', () => {
  it('affiche trois décimales avec une virgule', () => {
    expect(formatPrice(2.449)).toBe('2,449 €/L');
    expect(formatPrice(2)).toBe('2,000 €/L');
  });
});

describe('formatUpdatedAt', () => {
  const updatedAt = new Date('2026-09-17T13:47:00Z');

  it("affiche jour, mois et heure de Paris quand l'année est la même", () => {
    expect(formatUpdatedAt(updatedAt, new Date('2026-12-01T00:00:00Z'))).toBe('17/09 à 15:47');
  });

  it("ajoute l'année quand elle diffère de maintenant", () => {
    expect(formatUpdatedAt(new Date('2025-09-17T13:47:00Z'), new Date('2026-01-02T00:00:00Z'))).toBe(
      '17/09/2025 à 15:47',
    );
  });
});
