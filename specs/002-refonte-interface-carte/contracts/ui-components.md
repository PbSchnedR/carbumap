# Contrat interne : composants et hooks React

Frontière entre l'état (hooks) et la présentation (composants). Les composants ne contiennent pas de
logique métier : ils appellent les fonctions de `src/domain/`.

## Hooks

### `usePreferences(): [Preferences, (changes: Partial<Preferences>) => void]`

- lit `localStorage['carbumap:prefs']` via `readPreferences`, écrit via `serializePreferences` ;
  lectures et écritures dans `try/catch` (comportement de 001).

### `useStationSearch(): StationSearch`

```ts
type SearchStatus =
  | { status: 'locating' }
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: string }
  | { status: 'no-position'; reason: 'unsupported' | 'denied' | 'unavailable' | 'timeout' };

type StationSearch = {
  status: SearchStatus;
  origin: SearchOrigin | null;  // point de recherche typé depuis 003 (appareil, carte, lieu)
  stations: Station[];          // 20 km, non filtrés
  search: (position: LatLng, kind: 'device' | 'map' | 'place', label?: string) => void;
  locate: () => void;           // 003 : retour à la position de l'appareil
  retry: () => void;            // relance pour le même origin
};
```

- géolocalisation au montage ; échec → `no-position`
- depuis 005, `src/lib/geolocation.ts` passe par `@capacitor/geolocation` (délégué à `navigator.geolocation`
  sur le web) pour obtenir l'autorisation Android dans l'application installée
- `search` annule logiquement toute recherche précédente (la plus récente gagne) et rend caduque la
  géolocalisation en attente (001 T041)
- erreur → `stations` vidé : aucune liste périmée affichée comme à jour

### `useElementHeight(element: HTMLElement | null): number`

- hauteur suivie par `ResizeObserver` ; sert à calculer la marge basse de la carte sous le panneau

### `useMediaQuery(query: string): boolean`

- valeur initiale synchrone via `matchMedia`, mise à jour à l'événement `change`

## Composants

| Composant | Props principales | Responsabilité |
|-----------|-------------------|----------------|
| `App` | — | Assemble hooks, `rankStations`, `lowestPriceStationIds`, `selectedStationId` ; choisit `MobileSheet` ou `DesktopPanel` ; sur mobile, carte en plein écran avec barre des filtres et messages superposés, hauteurs mesurées par `useElementHeight` |
| `FuelPicker` | `value: FuelCode`, `onChange` | 6 boutons radio natifs groupés dans un `fieldset` légendé « Carburant », 1 toucher = changement ; actif marqué par coche + graisse + couleur (FR-008) ; rangée défilable horizontalement dans sa zone à 360 px |
| `RadiusPicker` | `value: RadiusKm`, `onChange` | 3 options 5/10/20 km, même style, secondaire |
| `SearchHereButton` | `onClick` | « Chercher ici », hors du panneau |
| `StatusMessage` | `status`, `isEmpty`, `onRetry` | Messages de 001 (FR-010) ; visible sans ouvrir le panneau sur mobile |
| `StationList` | `ranked`, `lowestIds`, `selectedId`, `onSelect`, `onOpenCard` (003), `now` | Liste ordonnée ; lignes = `<button>` ≥ 44 px ; mise en avant du prix le plus bas (badge « Le moins cher » + style, FR-009) ; sélection `aria-current` ; badge « ancien » |
| `CheapestSummary` | `ranked`, `lowestIds` | Contenu visible panneau replié : nombre de stations + station la moins chère et son prix (FR-006) |
| `ChipGroup` | `label`, `options`, `value`, `onChange`, `variant` | Boutons radio natifs présentés en pastilles, partagés par `FuelPicker` et `RadiusPicker` |
| `MobileSheet` | `position`, `onPositionChange`, `areaHeight`, `topOffset`, `summary`, `children` ; exporte `visibleSheetHeight(position, areaHeight)` et `collapsedHeight(areaHeight)` (≤ 25 % de la zone, 132 px max, 72 px min) ; en position repliée, le résumé est un `<button>` qui ouvre le panneau | `react-modal-sheet` sans backdrop, `disableScrollLocking`, `disableDismiss`, `prefersReducedMotion` depuis `matchMedia('(prefers-reduced-motion: reduce)')` ; poignée = `<button aria-label>` qui applique `nextSheetPosition` |
| `DesktopPanel` | `header`, `children` | Panneau latéral gauche, largeur fixe, défilement interne |
| `MapView` | `origin`, `ranked`, `lowestIds`, `selectedId`, `bottomPadding`, `onSelectStation`, `onOpenCard` (003) | Leaflet impératif (portage de `map.js`) ; `divIcon` avec `formatPrice` ; `zIndexOffset` : sélectionnée > moins chère > autres ; `fitBounds`/`panInside` avec `paddingBottomRight: [0, bottomPadding]`, `bottomPadding` calculé par `visibleSheetHeight` à partir de la position cible (pas de l'animation), pour recadrer dans le même rendu que la sélection ; attribution OSM et boutons de zoom placés en haut à droite, décalés sous la barre des filtres par la variable CSS `--map-controls-top` (jamais masqués par le panneau ni par le message d'état) ; boutons de zoom 44 × 44 px ; expose `getCenter()` via `ref` |

## Règles transverses

- Aucune couleur seule ne porte une information (FR-008, FR-009).
- Toute cible interactive ≥ 44 × 44 px (constitution IV).
- Aucune donnée texte de l'API insérée comme HTML (étiquettes Leaflet : prix formaté uniquement).
