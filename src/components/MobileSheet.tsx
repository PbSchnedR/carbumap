import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Sheet } from 'react-modal-sheet';
import { nextSheetPosition, type SheetPosition } from '../domain/sheet';
import { useMediaQuery } from '../hooks/useMediaQuery';

/**
 * Hauteur visible panneau replié (px) : au plus 25 % de la zone, pour laisser ≥ 75 % à la carte
 * (FR-006) — y compris sur un écran court, téléphone en paysage par exemple.
 */
const COLLAPSED_MAX_PX = 132;
const COLLAPSED_MAX_RATIO = 0.25;
const HALF_RATIO = 0.5;

export function collapsedHeight(areaHeight: number): number {
  if (areaHeight <= 0) return COLLAPSED_MAX_PX;
  return Math.max(72, Math.min(COLLAPSED_MAX_PX, Math.round(areaHeight * COLLAPSED_MAX_RATIO)));
}
const INDEX_BY_POSITION: Record<SheetPosition, number> = { collapsed: 1, half: 2, full: 3 };
const POSITION_BY_INDEX: Partial<Record<number, SheetPosition>> = { 1: 'collapsed', 2: 'half', 3: 'full' };

/**
 * Hauteur du panneau visible au-dessus du bas de la zone, pour une position donnée.
 * Calculée à partir de la position cible (et non de l'animation) pour que la carte recadre
 * dans le même rendu que le changement de position.
 */
export function visibleSheetHeight(position: SheetPosition, areaHeight: number): number {
  if (position === 'collapsed') return collapsedHeight(areaHeight);
  if (position === 'half') return Math.round(areaHeight * HALF_RATIO);
  return areaHeight;
}

type SheetRef = { snapTo: (index: number) => void; currentSnap?: number };

type Props = {
  position: SheetPosition;
  onPositionChange: (position: SheetPosition) => void;
  /** Hauteur de la zone dans laquelle le panneau coulisse (écran moins la barre des filtres). */
  areaHeight: number;
  /** Décalage du haut de cette zone, en px (hauteur de la barre des filtres). */
  topOffset: number;
  summary: ReactNode;
  children: ReactNode;
};

/**
 * Panneau des stations sur mobile : replié, mi-hauteur, plein écran (FR-003 à FR-006).
 * Rendu dans un conteneur `transform` qui délimite la zone sous la barre des filtres : la racine de la
 * librairie est en `position: fixed` et se cale alors sur ce conteneur au lieu de l'écran.
 */
export function MobileSheet({
  position,
  onPositionChange,
  areaHeight,
  topOffset,
  summary,
  children,
}: Props) {
  const sheetRef = useRef<SheetRef>(null);
  const [mountPoint, setMountPoint] = useState<HTMLDivElement | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Index 0 (fermé) exigé par la librairie mais jamais utilisé (disableDismiss). Tableau recréé à
  // chaque changement de hauteur : la librairie modifie celui qu'elle reçoit s'il ne va pas de 0 à 1.
  const snapPoints = [0, collapsedHeight(areaHeight), HALF_RATIO, 1];

  // Position pilotée par le parent (poignée, sélection d'une station).
  useEffect(() => {
    const sheet = sheetRef.current;
    const index = INDEX_BY_POSITION[position];
    if (sheet && sheet.currentSnap !== undefined && sheet.currentSnap !== index) sheet.snapTo(index);
  }, [position]);

  return (
    <div
      ref={setMountPoint}
      style={{ top: topOffset }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1100] transform-gpu"
    >
      {mountPoint && (
        <Sheet
          ref={sheetRef}
          isOpen
          onClose={() => onPositionChange('collapsed')}
          mountPoint={mountPoint}
          detent="full"
          snapPoints={snapPoints}
          initialSnap={INDEX_BY_POSITION[position]}
          disableDismiss
          disableScrollLocking
          prefersReducedMotion={reducedMotion}
          onSnap={(index) => {
            const next = POSITION_BY_INDEX[index];
            if (next && next !== position) onPositionChange(next);
          }}
        >
          <Sheet.Container unstyled className="rounded-t-sheet border-t border-line bg-surface shadow-panel">
            <Sheet.Header unstyled>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onPositionChange(nextSheetPosition(position))}
                  aria-label="Changer la taille de la liste des stations"
                  className="motion flex h-11 w-24 items-center justify-center focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand"
                >
                  <span className="block h-1.5 w-10 rounded-pill bg-muted" aria-hidden="true" />
                </button>
              </div>
              {position === 'collapsed' ? (
                <button
                  type="button"
                  onClick={() => onPositionChange(nextSheetPosition(position))}
                  aria-label="Ouvrir la liste des stations"
                  className="block w-full text-left focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand"
                >
                  {summary}
                </button>
              ) : (
                summary
              )}
            </Sheet.Header>
            <Sheet.Content
              unstyled
              // En plein écran, un glissement vers le bas fait d'abord remonter la liste.
              disableDrag={({ scrollPosition }) => scrollPosition === 'middle' || scrollPosition === 'bottom'}
            >
              <div className="border-t border-line">{children}</div>
            </Sheet.Content>
          </Sheet.Container>
        </Sheet>
      )}
    </div>
  );
}
