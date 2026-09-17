import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';
import { backAction } from '../domain/backAction';
import type { SheetPosition } from '../domain/sheet';

type Handlers = {
  isCardOpen: boolean;
  sheetPosition: SheetPosition;
  onCloseCard: () => void;
  onCollapseSheet: () => void;
};

/**
 * Bouton « retour » d'Android : ferme la fiche, puis replie le panneau, puis quitte (005 FR-015).
 * Le plugin n'est chargé que dans l'application installée ; sur le web, ce hook ne fait rien.
 */
export function useAndroidBackButton(handlers: Handlers): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let remove: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      const { App } = await import('@capacitor/app');
      const handle = await App.addListener('backButton', () => {
        const { isCardOpen, sheetPosition, onCloseCard, onCollapseSheet } = handlersRef.current;
        switch (backAction({ isCardOpen, sheetPosition })) {
          case 'close-card':
            onCloseCard();
            break;
          case 'collapse-sheet':
            onCollapseSheet();
            break;
          case 'exit':
            void App.exitApp();
            break;
        }
      });
      if (cancelled) void handle.remove();
      else remove = () => void handle.remove();
    })();

    return () => {
      cancelled = true;
      remove?.();
    };
  }, []);
}
