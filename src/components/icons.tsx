/**
 * Source unique des pictogrammes de l'application (007 FR-015 à FR-019).
 *
 * Aucune librairie d'icônes : neuf tracés suffisent, et surtout les repères de prix de Leaflet
 * sont construits comme une chaîne HTML (`L.divIcon`), où un composant React ne peut pas servir.
 * `Icon` et `iconSvg` lisent donc le même dictionnaire `PATHS` — un seul dessin, deux rendus.
 *
 * Tracés redessinés d'après Lucide (https://lucide.dev), licence ISC, copyright (c) 2024 Lucide
 * Contributors — grille de 24, tracé arrondi.
 */

export type IconName =
  | 'mapPin'
  | 'search'
  | 'star'
  | 'arrowLeft'
  | 'arrowUp'
  | 'arrowDown'
  | 'crosshair'
  | 'locate';

/** Contenu de chaque icône dans une boîte de 24 × 24. */
const PATHS: Record<IconName, string> = {
  mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  star: '<path d="m12 3 2.9 5.8 6.1.9-4.5 4.3 1.1 6L12 17.8 6.4 20l1.1-6L3 9.7l6.1-.9Z"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrowUp: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
  arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  crosshair:
    '<circle cx="12" cy="12" r="8"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/>',
  locate:
    '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3"/><path d="M12 20v3"/><path d="M1 12h3"/><path d="M20 12h3"/>',
};

/** Attributs communs : la couleur vient du texte parent, la taille du texte courant (FR-017). */
const ATTRS = [
  'viewBox="0 0 24 24"',
  'width="1em"',
  'height="1em"',
  'fill="none"',
  'stroke="currentColor"',
  'stroke-width="var(--icon-stroke)"',
  'stroke-linecap="round"',
  'stroke-linejoin="round"',
  'aria-hidden="true"',
  'focusable="false"',
].join(' ');

/**
 * Icône décorative. Elle n'accepte ni couleur ni taille : elle hérite de son parent, ce qui la rend
 * juste dans les deux thèmes sans effort (FR-017). Un contrôle réduit à une icône doit porter
 * lui-même un intitulé accessible (FR-018).
 */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="var(--icon-stroke)"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
    />
  );
}

/**
 * Même dessin, rendu en chaîne — pour `L.divIcon`, qui n'accepte que du HTML.
 * Le contenu vient exclusivement de `PATHS` : aucune donnée extérieure n'est injectée.
 */
export function iconSvg(name: IconName): string {
  return `<svg ${ATTRS}>${PATHS[name]}</svg>`;
}
