import { describe, expect, it } from 'vitest';
import { parseParisDateTime } from '../../src/domain/dates';

// L'API renvoie des dates suffixées « +00:00 » alors qu'elles sont en heure locale de Paris
// (vérifié le 2026-09-17, voir specs/001-carte-prix-carburants/research.md R5).
// Si l'éditeur corrige un jour le suffixe, ces tests décrivent l'hypothèse à revoir.
describe('parseParisDateTime', () => {
  it("interprète l'heure d'été comme UTC+2 en ignorant le suffixe", () => {
    expect(parseParisDateTime('2026-09-17T15:47:20+00:00')).toEqual(new Date('2026-09-17T13:47:20Z'));
  });

  it("interprète l'heure d'hiver comme UTC+1", () => {
    expect(parseParisDateTime('2026-01-15T10:00:00+00:00')).toEqual(new Date('2026-01-15T09:00:00Z'));
  });

  it('accepte un espace à la place du T et une valeur sans suffixe', () => {
    expect(parseParisDateTime('2026-09-17 09:26:09')).toEqual(new Date('2026-09-17T07:26:09Z'));
  });

  it("gère les deux côtés du passage à l'heure d'hiver du 2026-10-25", () => {
    expect(parseParisDateTime('2026-10-25T01:30:00')).toEqual(new Date('2026-10-24T23:30:00Z'));
    expect(parseParisDateTime('2026-10-25T04:00:00')).toEqual(new Date('2026-10-25T03:00:00Z'));
  });

  it('renvoie null pour une valeur absente ou illisible', () => {
    expect(parseParisDateTime(null)).toBeNull();
    expect(parseParisDateTime(undefined)).toBeNull();
    expect(parseParisDateTime('')).toBeNull();
    expect(parseParisDateTime('not a date')).toBeNull();
    expect(parseParisDateTime('2026-13-40T25:61:00')).toBeNull();
  });
});
