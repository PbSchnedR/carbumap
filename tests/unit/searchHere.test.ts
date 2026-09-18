import { describe, expect, it } from 'vitest';
import { shouldOfferSearchHere, type SearchStatusKind } from '../../src/domain/searchHere';

describe('shouldOfferSearchHere', () => {
  it('ne propose rien tant que la carte n’a pas bougé', () => {
    expect(shouldOfferSearchHere({ mapMoved: false, status: 'ready' })).toBe(false);
  });

  it('propose la recherche après un déplacement de la carte', () => {
    expect(shouldOfferSearchHere({ mapMoved: true, status: 'ready' })).toBe(true);
  });

  it('ne propose rien pendant un chargement, même si la carte a bougé', () => {
    expect(shouldOfferSearchHere({ mapMoved: true, status: 'loading' })).toBe(false);
  });

  it('ne propose rien pendant une localisation, même si la carte a bougé', () => {
    expect(shouldOfferSearchHere({ mapMoved: true, status: 'locating' })).toBe(false);
  });

  it('propose la recherche après une erreur : la relancer est justement l’issue utile', () => {
    expect(shouldOfferSearchHere({ mapMoved: true, status: 'error' })).toBe(true);
  });

  it('propose la recherche sans position : c’est le seul moyen de chercher', () => {
    expect(shouldOfferSearchHere({ mapMoved: true, status: 'no-position' })).toBe(true);
  });

  it('ne propose rien si la carte n’a pas bougé et qu’une recherche tourne', () => {
    expect(shouldOfferSearchHere({ mapMoved: false, status: 'loading' })).toBe(false);
  });

  it('exige les deux conditions : aucun état seul ne suffit', () => {
    const states: SearchStatusKind[] = ['locating', 'loading', 'ready', 'error', 'no-position'];
    for (const status of states) {
      expect(shouldOfferSearchHere({ mapMoved: false, status })).toBe(false);
    }
  });
});
