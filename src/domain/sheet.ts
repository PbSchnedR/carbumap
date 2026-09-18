/** Positions du panneau des stations sur mobile. */
export type SheetPosition = 'collapsed' | 'half' | 'full';

const CYCLE: Record<SheetPosition, SheetPosition> = { collapsed: 'half', half: 'full', full: 'collapsed' };

/** Position suivante quand on touche la poignée : replié → mi-hauteur → plein écran → replié. */
export function nextSheetPosition(position: SheetPosition): SheetPosition {
  return CYCLE[position];
}
