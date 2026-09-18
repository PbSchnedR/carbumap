# Implementation Plan: Refonte de l'affichage des informations

**Branch**: `006-affichage-informations` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-affichage-informations/spec.md`

## Summary

Deux présentations distinctes remplacent la liste unique actuelle : sur ordinateur un tableau
comparatif dense et triable, avec la carte en bandeau au-dessus ; sur mobile des lignes où le prix
domine. Le tri et le format des dates relatives sont des fonctions pures testées ; aucune dépendance
n'est ajoutée (un `<table>` natif suffit pour quatre colonnes).

## Technical Context

**Language/Version**: TypeScript 7, React 19 — inchangés.

**Primary Dependencies**: aucune nouvelle. Tailwind 4, Leaflet, react-modal-sheet, Capacitor.

**Storage**: inchangé ; le tri n'est pas persisté (spec).

**Testing**: Vitest sur `src/domain/` (tri, dates relatives) ; interface validée par le quickstart.

**Target Platform**: navigateurs mobiles et de bureau récents, plus l'APK Android (005).

**Performance Goals**: tri affiché en < 1 s (SC-003) avec jusqu'à ~400 lignes ; pas d'augmentation
notable du poids (JS ~178 Ko compressés, CSS ~12 Ko).

**Constraints**: règles de 004 conservées (tokens, thèmes, contrastes, 44 px, < 250 ms) ; accessible
au clavier et au lecteur d'écran (FR-015) ; aucune donnée nouvelle.

**Scale/Scope**: 2 composants nouveaux, 3 composants réécrits, 2 modules purs nouveaux, 0 dépendance.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* Constitution **1.1.0**.

| Principe | Vérification | Avant | Après |
|----------|--------------|-------|-------|
| I. Simplicité | `<table>` natif, pas de bibliothèque de grille ; le tri est une comparaison de trois champs | ✅ | ✅ |
| II. Dépendances utiles | Aucune ajoutée ; une bibliothèque de tableau (TanStack) serait disproportionnée pour 4 colonnes | ✅ | ✅ |
| III. Logique pure et testée | `sortRanked` et `formatRelativeDay` purs et testés ; les composants n'ordonnent rien eux-mêmes | ✅ | ✅ |
| IV. Mobile | Lignes à prix dominant conçues pour 360 px ; cibles ≥ 44 px ; densité vérifiée | ✅ | ✅ |
| V. Aucun secret | Aucun service | ✅ | ✅ |
| VI. Documentation à jour | 002 FR-011 et 004 FR-004 annotées comme remplacées ; README et quickstarts mis à jour | ✅ | ✅ |

Aucune violation : la section Complexity Tracking est vide.

## Phase 0 — Décisions (research)

**R1. Tableau natif** — `<table>` avec `<th scope="col">`, en-têtes cliquables portant `aria-sort`
(`ascending` / `descending` / `none`) et un `<caption>` en lecture d'écran. En-tête collant
(`position: sticky`), corps défilant dans sa zone. Aucune virtualisation : ~400 lignes de texte
restent fluides, et la mesure fait partie du quickstart.

**R2. Tri** — Fonction pure `sortRanked(ranked, { column, direction })` :
`price | distance | updatedAt`, valeurs manquantes toujours reléguées en fin quel que soit le sens,
départage constant par `id` pour un ordre total. Le tri par défaut (`price` croissant) reproduit
exactement l'ordre de 001 : prix, puis distance, puis id.

**R3. Dates relatives** — `formatRelativeDay(date, now)` : « aujourd'hui », « hier », « il y a N j »
jusqu'à 30 jours, puis date courte (`17/09`). Calcul sur les **jours calendaires en heure de Paris**,
pas sur des écarts de 24 h, pour que « hier » corresponde à la veille ; réutilise la conversion de
fuseau déjà testée (001 R5). La date complète reste dans la fiche (`formatUpdatedAt`).

**R4. Dispositions** — Trois paliers :
- `< 768 px` : carte plein écran + panneau (002/004) avec lignes à prix dominant ;
- `768–1023 px` : carte en bandeau + tableau réduit (colonne « mise à jour » retirée, FR-014) ;
- `≥ 1024 px` : carte en bandeau + tableau complet.
La hauteur du bandeau est **mesurée, pas estimée** : sur 1280 × 800, dix lignes de ~44 px plus
l'en-tête occupent déjà ~480 px, donc le bandeau part de 32 % de la fenêtre (min 200 px) et se règle
au besoin pour tenir SC-001. Le tableau défile dans sa propre zone ; la page, elle, ne défile jamais.
La carte reste montée en permanence : un seul composant `MapView`, jamais démonté, pour ne pas perdre
l'état Leaflet au changement de palier.

**R5. Synchronisation tableau ↔ carte** — La ligne sélectionnée est mise en évidence et ramenée dans
la vue (`scrollIntoView({ block: 'nearest' })`, déjà en place) ; le clic sur une étiquette de prix
sélectionne la ligne. Le survol d'une ligne n'agit pas sur la carte (évite le scintillement) ; seul
l'état sélectionné est partagé.

**R6. Ce qui disparaît** — `DesktopPanel` (panneau latéral) est remplacé par le tableau ;
`CheapestSummary` reste utilisé uniquement sur mobile (résumé du panneau replié). La fiche station
devient une zone à droite du tableau sur ordinateur, et garde son comportement mobile.

## Phase 1 — Conception

### Modules purs (nouveaux)

| Module | Fonction |
|--------|----------|
| `src/domain/sorting.ts` | `SortColumn`, `SortDirection`, `DEFAULT_SORT`, `sortRanked` |
| `src/domain/relativeDate.ts` | `formatRelativeDay(date, now)` |

### Composants

| Composant | Rôle |
|-----------|------|
| `StationTable.tsx` (nouveau) | Tableau ordinateur : en-têtes triables, lignes, mise en évidence, en-tête collant |
| `StationRows.tsx` (nouveau) | Lignes mobiles à prix dominant (remplace le rendu de `StationList`) |
| `StationCard.tsx` (réécrit) | Prix dominant, autres carburants en colonnes alignées |
| `App.tsx` (réécrit en partie) | Trois paliers, état de tri, carte toujours montée |
| `DesktopPanel.tsx` (supprimé) | Remplacé par le tableau |

### Fichiers

```text
src/domain/sorting.ts            # nouveau
src/domain/relativeDate.ts       # nouveau
src/components/StationTable.tsx  # nouveau
src/components/StationRows.tsx   # nouveau
src/components/StationCard.tsx   # réécrit
src/components/StationList.tsx   # supprimé (remplacé par StationTable + StationRows)
src/components/DesktopPanel.tsx  # supprimé
src/App.tsx                      # paliers, tri, sélection
tests/unit/sorting.test.ts       # nouveau
tests/unit/relativeDate.test.ts  # nouveau
```

**Structure Decision**: la séparation de 002 est conservée. Les deux présentations partagent les mêmes
fonctions pures et le même état ; seule la mise en forme diffère, pour qu'une correction de règle
(ordre, date) profite aux deux.

## Relevé d'implémentation (2026-09-17)

- Tests : **83** (69 + 7 pour le tri + 7 pour les dates relatives, moins les doublons de fichiers).
  Les 69 tests antérieurs sont inchangés.
- Build : JS **179,0 Ko compressés** (contre 178,2), CSS **11,7 Ko**. Aucune dépendance ajoutée.
- `StationList.tsx` et `DesktopPanel.tsx` supprimés ; badges et helpers partagés extraits dans
  `src/components/badges.tsx`.
- Bandeau de carte fixé à `32vh` (min 200 px) comme point de départ ; **la vérification des 10 lignes
  visibles à 1280 × 800 reste à faire dans le navigateur** (SC-001, tâche T010).
- Piège rencontré : un de mes propres tests de dates relatives se contredisait (22 h 30 UTC est déjà
  le lendemain à Paris). Le code était juste, le test faux — corrigé.

## Complexity Tracking

Aucune violation de la constitution à justifier.
