import type { SheetPosition } from './sheet';

/** Ce que doit faire le bouton « retour » d'Android (005 FR-015). */
export type BackAction = 'close-card' | 'collapse-sheet' | 'exit';

export function backAction({
  isCardOpen,
  sheetPosition,
}: {
  isCardOpen: boolean;
  sheetPosition: SheetPosition;
}): BackAction {
  if (isCardOpen) return 'close-card';
  if (sheetPosition !== 'collapsed') return 'collapse-sheet';
  return 'exit';
}
