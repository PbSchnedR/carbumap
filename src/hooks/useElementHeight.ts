import { useEffect, useState } from 'react';

/** Hauteur (px) d'un élément, mise à jour à chaque redimensionnement. */
export function useElementHeight(element: HTMLElement | null): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return height;
}
