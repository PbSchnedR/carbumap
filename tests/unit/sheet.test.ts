import { describe, expect, it } from 'vitest';
import { nextSheetPosition, positionAfterSelection } from '../../src/domain/sheet';

describe('nextSheetPosition', () => {
  it('fait le cycle replié → mi-hauteur → plein écran → replié', () => {
    expect(nextSheetPosition('collapsed')).toBe('half');
    expect(nextSheetPosition('half')).toBe('full');
    expect(nextSheetPosition('full')).toBe('collapsed');
  });
});

describe('positionAfterSelection', () => {
  it('amène le panneau à mi-hauteur pour laisser voir la station sur la carte', () => {
    expect(positionAfterSelection('full')).toBe('half');
    expect(positionAfterSelection('half')).toBe('half');
    expect(positionAfterSelection('collapsed')).toBe('half');
  });
});
