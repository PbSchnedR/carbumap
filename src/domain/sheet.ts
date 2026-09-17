/** Positions du panneau des stations sur mobile. */
export type SheetPosition = 'collapsed' | 'half' | 'full';

const CYCLE: Record<SheetPosition, SheetPosition> = { collapsed: 'half', half: 'full', full: 'collapsed' };

/** Position suivante quand on touche la poignée : replié → mi-hauteur → plein écran → replié. */
export function nextSheetPosition(position: SheetPosition): SheetPosition {
  return CYCLE[position];
}

/** Après la sélection d'une station, le panneau passe à mi-hauteur pour laisser voir la carte. */
export function positionAfterSelection(_position: SheetPosition): SheetPosition {
  return 'half';
}
