import { describe, expect, it } from 'vitest';
import { backAction } from '../../src/domain/backAction';

describe('backAction', () => {
  it('ferme la fiche station en priorité', () => {
    expect(backAction({ isCardOpen: true, sheetPosition: 'full' })).toBe('close-card');
    expect(backAction({ isCardOpen: true, sheetPosition: 'half' })).toBe('close-card');
    expect(backAction({ isCardOpen: true, sheetPosition: 'collapsed' })).toBe('close-card');
  });

  it('replie ensuite le panneau des stations', () => {
    expect(backAction({ isCardOpen: false, sheetPosition: 'full' })).toBe('collapse-sheet');
    expect(backAction({ isCardOpen: false, sheetPosition: 'half' })).toBe('collapse-sheet');
  });

  it("quitte quand il n'y a plus rien à fermer", () => {
    expect(backAction({ isCardOpen: false, sheetPosition: 'collapsed' })).toBe('exit');
  });
});
