# Research: Refonte de l'interface de la carte

**Date**: 2026-09-17 · **Plan**: [plan.md](./plan.md)

Légende : **Vérifié** = commande, lecture de source ou appel réel le 2026-09-17 ;
**Déduit** = conséquence de faits vérifiés ; **Rappel** = connaissance non revérifiée.

Choix imposés par l'utilisateur : React + TypeScript, Tailwind CSS, Leaflet, Vitest, en gardant le
code existant comme base. Cette recherche porte sur leur mise en œuvre et sur ce qui reste à choisir.

## R1. Versions retenues

| Paquet | Version | Vérification |
|--------|---------|--------------|
| react, react-dom | 19.3.0 | npm, publiée le 2026-09-16 |
| typescript | 7.0.2 | npm `latest` |
| @types/react, @types/react-dom | 19.3.0 | npm |
| @types/leaflet | 1.9.22 | npm, pour leaflet 1.9.4 conservé |
| @vitejs/plugin-react | 6.1.1 | npm ; pair `vite ^8.0.0` ; les autres pairs sont optionnels (**vérifié** via `peerDependenciesMeta`) |
| tailwindcss, @tailwindcss/vite | 4.3.3 | npm ; pair `vite ^5.2.0‖^6‖^7‖^8` |
| vite / vitest / leaflet | 8.3.0 / 5.0.1 / 1.9.4 | inchangés depuis 001 ; vitest 5 accepte vite 8 |

- **TypeScript 7** : c'est la ligne de version `latest` (**vérifié**). Le `tsconfig` de R6 est accepté :
  `tsc --noEmit` (7.0.2) sort en code 0 sur le squelette (**vérifié** le 2026-09-17, tâche T005).
  Pas de repli sur la version 6.

## R2. Carte : Leaflet directement, sans react-leaflet

- **Decision**: Garder Leaflet piloté directement depuis un composant React (`useRef` + `useEffect`),
  en portant `src/ui/map.js` de 001 ; ne pas ajouter `react-leaflet`.
- **Rationale**: « Garder le code existant comme base » : `map.js` fait déjà tout sauf les étiquettes
  de prix. `react-leaflet` (5.0.0, 2,7 M téléchargements/semaine, **vérifié**) n'a pas publié depuis
  2024-12-14 (**vérifié**) et doublerait l'API de Leaflet pour un seul composant de carte : dépendance
  **redondante** au sens du principe II.
- **Alternatives considered**: react-leaflet (déclaratif, mais couche en plus et peu active).

## R3. Étiquettes de prix sur les repères (FR-010)

- **Decision**: `L.marker` avec `L.divIcon` dont le HTML contient le prix formaté par `formatPrice`
  (fonction pure existante). Mise au premier plan par `zIndexOffset` (option de `L.Marker`,
  **vérifié** dans `leaflet-src.js`) : valeur élevée pour le prix le plus bas, plus élevée pour la
  station sélectionnée.
- **Rationale**: Natif Leaflet, stylable avec Tailwind via `className`. Le HTML de l'étiquette ne
  contient qu'un prix numérique formaté et une classe : aucune donnée texte de l'API n'y est injectée
  (pas de risque d'injection HTML).
- **Déduit**: ~414 `divIcon` au pire cas (Paris, 20 km) — même ordre que les 414 `circleMarker` de 001 ;
  performance à mesurer dans le quickstart, pas de regroupement (clustering) prévu (non demandé).
- **Correction héritée de 001 (T040)**: les boutons de zoom Leaflet font 30 × 30 px
  (`leaflet.css:324`, **vérifié** en 001) ; ils sont agrandis à 44 × 44 px.

## R4. Panneau mobile à 3 positions : react-modal-sheet

- **Decision**: `react-modal-sheet@5.6.0` (pair requis : `motion@13.4.0`), utilisé **sans backdrop**,
  avec `disableScrollLocking` et `disableDismiss`, et des points d'arrêt
  `[0, replié, mi-hauteur, plein écran]` où l'index 0 (fermé) n'est jamais utilisé.
- **Rationale**:
  - Gère ce qui est difficile à écrire soi-même : glissement avec inertie, points d'arrêt, et
    interaction entre défilement de la liste et glissement du panneau (`disableDrag` peut dépendre de
    `scrollPosition`) — l'edge case « défiler d'abord, puis redescendre le panneau » de la spec.
  - Option `prefersReducedMotion` (FR-014) et `snapTo(index)` pour passer à mi-hauteur à la
    sélection (US1 scénario 5).
  - Maintenu : publication 2026-03-27 (**vérifié**) ; 117 k téléchargements/semaine (**vérifié**) ;
    `motion` : 15,4 M/semaine, publié le 2026-09-16 (**vérifié**).
- **Carte utilisable derrière le panneau (US1 scénario 6)** — **vérifié dans la source**
  (`dist/index.mjs`) : le conteneur plein écran du panneau a `pointerEvents: "none"` et seul le panneau
  lui-même a `pointerEvents: "auto"`. **Déduit** : la carte reçoit les gestes hors du panneau.
  Non vérifié à l'exécution → premier point du quickstart.
- **Pièges vérifiés dans la source** :
  - `usePreventScroll` bloque le défilement de `body` tant que le panneau est ouvert, sauf si
    `disableScrollLocking` est vrai → à activer, sinon risque de gêner les gestes sur la carte
    (**Déduit**).
  - L'« effet modal » (`modalEffectRootId`) modifie le style de la racine de l'app : ne pas l'utiliser.
  - `snapPoints` doit être croissant et inclure 0 (fermé) et 1 (ouvert) (README, **vérifié**).
  - Pas d'accessibilité intégrée (README) : poignée = vrai `<button>` avec libellé, et navigation
    clavier assurée par nos composants.
- **Alternatives considered**:
  - **vaul** (25 M/semaine) : README « This repo is unmaintained » (**vérifié**) → exclu (principe II).
  - **Panneau maison** (pointer events + `transform`) : zéro dépendance, mais il faudrait réécrire
    l'inertie et la cohabitation défilement/glissement ; le principe II (1.1.0) autorise une librairie
    maintenue qui simplifie nettement ce code.

## R5. Tailwind CSS 4

- **Decision**: Plugin `@tailwindcss/vite`, configuration dans le CSS (`@import "tailwindcss";` +
  `@theme` pour les couleurs, rayons et ombres du projet) — pas de `tailwind.config.js`.
- **Vérifié au build** : les classes issues de `@theme` (`bg-cheap`, `shadow-float`,
  `rounded-t-sheet`…) sont générées, et `@import "leaflet/dist/leaflet.css"` est bien résolu et inclus
  dans le CSS final (finding A1 de l'analyse levé).
- **Rationale**: Un seul fichier CSS d'entrée (`src/index.css`) qui importe aussi `leaflet.css` et
  contient les rares surcharges Leaflet (boutons de zoom, étiquettes `divIcon`).
- **Contrastes (FR-015)** — **vérifié par calcul** (formule WCAG 2.x, script hors dépôt, 2026-09-17) :

  | Paire | Ratio | Minimum |
  |-------|-------|---------|
  | texte `ink` #0f172a / `surface` #ffffff | 17,85:1 | 4,5 |
  | texte `muted` #475569 / `surface` | 7,58:1 | 4,5 |
  | texte `muted` / `canvas` #f1f5f9 | 6,92:1 | 4,5 |
  | texte `muted` / `cheap-soft` #ecfdf5 | 7,19:1 | 4,5 |
  | blanc / `brand` #4338ca | 7,90:1 | 4,5 |
  | blanc / `ink` (rayon actif) | 17,85:1 | 4,5 |
  | blanc / `cheap` #047857 | 5,48:1 | 4,5 |
  | `cheap` / `cheap-soft` | 5,21:1 | 4,5 |
  | `stale` #92400e / `stale-soft` #fef3c7 | 6,37:1 | 4,5 |
  | `danger` #b91c1c / `danger-soft` #fef2f2 | 5,91:1 | 4,5 |
  | étiquette `cheap` / fond de carte | 4,78:1 | 3 |
  | contour sélection `brand` / fond de carte | 6,89:1 | 3 |
  | bordure étiquette `muted` / fond de carte | 6,60:1 | 3 |

  Fond de carte pris à #f2efe9, couleur des terres du style OSM par défaut (**Rappel**, non mesuré) ;
  sur les zones plus sombres des tuiles (forêts, eau), le contraste réel peut différer.

## R5bis. Disposition mobile et contrôles de la carte (convergence)

- **Decision**: Sur mobile, la carte occupe tout l'écran ; la barre des filtres et les messages d'état
  flottent au-dessus, et le panneau coulisse entre la barre et le bas de l'écran.
- **Decision**: Attribution OSM et boutons de zoom en haut à droite, décalés sous la barre par la
  variable CSS `--map-controls-top`.
- **Rationale**: Placés en bas, ils seraient masqués par le panneau (z-index 1100 contre 1000 pour les
  contrôles Leaflet, **vérifié**) ; en haut à gauche, le message d'état les recouvrirait. L'attribution
  doit rester visible en permanence (politique des tuiles OSM, 001 research R10).
- **Mesure de SC-002**: le panneau replié couvre au plus 25 % de la zone (132 px au maximum, et 25 %
  de la zone sur un écran court) ; la barre flottante n'est pas décomptée de la carte.

## R6. TypeScript

- **Decision**: `strict: true`, `noEmit: true`, `target`/`lib` ES2022 + DOM, `module: "ESNext"`,
  `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `types: ["vite/client"]`, `skipLibCheck: true`.
  Script `typecheck` : `tsc --noEmit`. Vite transpile sans vérifier les types (**Rappel**) : la
  vérification des types est donc une étape séparée, lancée avant de considérer une tâche terminée.
- **Rationale**: Configuration courante pour Vite + React ; limite les options susceptibles d'avoir
  changé en TypeScript 7 (R1).

## R7. Portage du code existant

- **Decision**:
  - `src/domain/*.js` → `*.ts` : même logique, types explicites remplaçant le JSDoc ; tests
    `tests/unit/*.test.js` → `*.test.ts`, **assertions inchangées** (garantie de non-régression, SC-005).
  - `src/data/prixCarburantsApi.js` → `.ts`, inchangé fonctionnellement.
  - `src/ui/geolocation.js` → `src/lib/geolocation.ts`.
  - `src/main.js` (état de l'écran) → hook `useStationSearch` ; `src/ui/list.js`, `controls.js`,
    `map.js` → composants React ; `src/style.css` → `src/index.css` (Tailwind).
  - Les anciens fichiers `.js` et `style.css` sont supprimés une fois portés.
- **Correction héritée de 001 (T041)** : dans `useStationSearch`, une réponse tardive de la
  géolocalisation est ignorée si l'utilisateur a déjà lancé « Chercher ici ».
- **Tâche 001 T042** (méthode `invalidateSize` inutilisée) : devient sans objet, `map.js` étant réécrit.

## R8. Nouvelles fonctions pures

- **Decision**: `lowestPriceStationIds(ranked)` (FR-009, égalités incluses) dans
  `src/domain/ranking.ts` ; `nextSheetPosition(position)` (cycle du toucher sur la poignée, FR-005)
  dans `src/domain/sheet.ts`. Toutes deux testées (principe III).
- **Rationale**: Ce sont des règles de présentation dont l'erreur serait silencieuse (mauvaise station
  mise en avant, cycle incohérent).

## R9. Présentation mobile / ordinateur

- **Decision**: Seuil 768 px lu par un hook `useMediaQuery('(min-width: 768px)')` (API native
  `matchMedia`). Mobile : `MobileSheet` ; ordinateur : `DesktopPanel` à gauche. L'état (carburant,
  rayon, résultats, sélection) vit au-dessus des deux dans `App` → conservé au changement (FR-012).
- **Carte sous le panneau**: sur mobile, les appels `fitBounds` / `panInside` passent un
  `paddingBottomRight` égal à la hauteur visible du panneau (options **vérifiées** dans
  `leaflet-src.js`), pour que la station sélectionnée apparaisse dans la partie visible de la carte.

## R10. Tests des composants

- **Decision**: Pas de tests de composants (pas de `jsdom` ni `@testing-library/react`).
- **Rationale**: Le principe III exige des tests pour la logique métier, qui reste dans `src/domain/`.
  Les comportements d'interface sont validés par le quickstart. Ajouter une pile de tests DOM serait
  une dépendance sans exigence correspondante.
- **Risque accepté**: les régressions purement visuelles ne sont détectées qu'à la validation manuelle.

## R11. Poids pour le mobile

- **Vérifié au build (2026-09-17)** : JS **170,81 Ko compressés** (547,86 Ko minifiés), CSS 11,08 Ko
  compressés, contre 48 Ko de JS en 001 — soit ×3,5, sous le seuil d'alerte de 250 Ko. Vite signale un
  fichier JS de plus de 500 Ko minifiés ; pas de découpage prévu (un seul écran).
