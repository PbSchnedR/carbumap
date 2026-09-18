import { describe, expect, it } from 'vitest';
import { formatRelativeDay } from '../../src/domain/relativeDate';

// Les jours sont comptés en jours calendaires de Paris, pas en tranches de 24 h.
const NOW = new Date('2026-09-17T12:00:00Z'); // 14 h à Paris

describe('formatRelativeDay', () => {
  it('reconnaît le jour même', () => {
    expect(formatRelativeDay(new Date('2026-09-17T05:00:00Z'), NOW)).toBe('aujourd’hui');
  });

  it('reconnaît la veille, même à moins de 24 h d’écart', () => {
    // 20 h plus tôt : encore la veille à Paris (18 h le 16 septembre).
    expect(formatRelativeDay(new Date('2026-09-16T16:00:00Z'), NOW)).toBe('hier');
    // Dernière minute de la veille à Paris : 21 h 59 UTC = 23 h 59 le 16 septembre.
    expect(formatRelativeDay(new Date('2026-09-16T21:59:00Z'), NOW)).toBe('hier');
  });

  it('compte les jours au-delà', () => {
    expect(formatRelativeDay(new Date('2026-09-14T12:00:00Z'), NOW)).toBe('il y a 3 j');
    expect(formatRelativeDay(new Date('2026-08-18T12:00:00Z'), NOW)).toBe('il y a 30 j');
  });

  it('bascule sur une date courte au-delà de 30 jours', () => {
    expect(formatRelativeDay(new Date('2026-08-17T12:00:00Z'), NOW)).toBe('17/08');
  });

  it('classe sur le jour de Paris, pas sur le jour UTC', () => {
    // 22 h 30 UTC le 16 = 00 h 30 le 17 à Paris : c'est donc « aujourd’hui ».
    expect(formatRelativeDay(new Date('2026-09-16T22:30:00Z'), new Date('2026-09-17T09:00:00Z'))).toBe(
      'aujourd’hui',
    );
  });

  it('renvoie une chaîne vide pour une date absente', () => {
    expect(formatRelativeDay(null, NOW)).toBe('');
  });
});
