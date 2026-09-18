import { describe, expect, it } from 'vitest';
import { nextSheetPosition } from '../../src/domain/sheet';

describe('nextSheetPosition', () => {
  it('fait le cycle replié → mi-hauteur → plein écran → replié', () => {
    expect(nextSheetPosition('collapsed')).toBe('half');
    expect(nextSheetPosition('half')).toBe('full');
    expect(nextSheetPosition('full')).toBe('collapsed');
  });
});

