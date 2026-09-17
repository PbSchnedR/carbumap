# Implementation Plan: Refonte de l'interface de la carte

**Branch**: `002-refonte-interface-carte` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-refonte-interface-carte/spec.md`

## Summary

Refonte de la présentation de Carbumap sans nouvelle fonctionnalité : carte plein écran, panneau des
stations à 3 positions glissant depuis le bas sur mobile, panneau latéral sur ordinateur, sélecteur de
carburant en un toucher, prix sur chaque repère et mise en avant du prix le plus bas. Le code de 001
sert de base : la logique métier et l'accès aux données sont portés en TypeScript avec leurs tests
inchangés ; l'interface est réécrite en React, stylée avec Tailwind CSS 4, en gardant Leaflet piloté
directement et un panneau glissant fourni par `react-modal-sheet`.

## Technical Context

**Language/Version**: TypeScript 7.0.2 (`strict`), React 19.3 ; repli sur TypeScript 6.x si la
version 7 bloque (research.md R1).

**Primary Dependencies**: react, react-dom 19.3.0 ; leaflet 1.9.4 ; react-modal-sheet 5.6.0 + motion
13.4.0 ; Tailwind CSS 4.3.3 via @tailwindcss/vite ; Vite 8.3.0 + @vitejs/plugin-react 6.1.1.
Versions vérifiées sur npm le 2026-09-17.

**Storage**: `localStorage` pour les préférences (inchangé).

**Testing**: Vitest 5.0.1, environnement `node`, fonctions pures de `src/domain/` uniquement
(research.md R10) ; vérification des types par `tsc --noEmit`.

**Target Platform**: Navigateurs mobiles et de bureau récents, servi en HTTPS.

**Project Type**: Application web statique (single project).

**Performance Goals**: Changement de carburant < 1 s (001 SC-002) avec ~414 étiquettes de prix ;
changement de position du panneau lisible en < 1 s (SC-003) ; JS compressé ≤ 250 Ko (seuil d'alerte,
research.md R11).

**Constraints**: Aucune nouvelle fonctionnalité ; toutes les exigences de 001 conservées ; carte
utilisable derrière le panneau ; 360 px sans défilement horizontal ; cibles ≥ 44 px ; contrastes
4,5:1 / 3:1 ; animations désactivées si demandé.

**Scale/Scope**: 1 écran, 2 présentations (mobile < 768 px, ordinateur ≥ 768 px), ~12 composants et
hooks, 9 modules métier portés.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* Constitution **1.1.0**.

| Principe | Vérification | Avant Phase 0 | Après Phase 1 |
|----------|--------------|---------------|---------------|
| I. Simplicité, pas de backend | Toujours un site statique, API appelée depuis le navigateur ; pas d'abstraction « pour plus tard » (pas de routeur, pas de gestionnaire d'état global : l'état tient dans `App` et 3 hooks) | ✅ | ✅ |
| II. Dépendances utiles, pas superflues | Chaque dépendance mentionnée ci-dessous ; `react-leaflet` écarté comme redondant, `vaul` écarté car non maintenu, pas de pile de tests DOM sans exigence (R2, R4, R10) | ✅ | ✅ |
| III. Logique pure et testée | Logique portée à l'identique avec tests aux assertions inchangées ; nouvelles règles (`lowestPriceStationIds`, `nextSheetPosition`, `positionAfterSelection`) pures et testées ; composants sans logique métier | ✅ | ✅ |
| IV. Mobile | Conception mobile d'abord ; cibles 44 px y compris zoom Leaflet (corrige 001 T040) ; vérifications à 360 px dans le quickstart §3 et §5 | ✅ | ✅ |
| V. Aucun secret | Aucune nouvelle source de données ; aucune clé | ✅ | ✅ |
| VI. Documentation à jour | Tâches prévues : créer `README.md`, mettre à jour les documents de 001 rendus inexacts (structure, dépendances, quickstart §5–§6) | ✅ | ✅ |

**Dépendances (principe II : ce qu'elles apportent)**

| Dépendance | Type | Apport |
|------------|------|--------|
| `react`, `react-dom` | runtime | Choix de l'utilisateur ; composition de l'interface et état partagé entre carte, liste et panneau |
| `leaflet` | runtime | Carte (conservée de 001) |
| `react-modal-sheet` | runtime | Panneau à 3 positions : glissement avec inertie, cohabitation défilement/glissement, animations réduites (R4) |
| `motion` | runtime | Requis par `react-modal-sheet` (dépendance pair) ; pas utilisé directement |
| `tailwindcss`, `@tailwindcss/vite` | dev | Choix de l'utilisateur ; styles utilitaires et thème |
| `typescript`, `@types/react`, `@types/react-dom`, `@types/leaflet` | dev | Choix de l'utilisateur ; vérification des types |
| `vite`, `@vitejs/plugin-react` | dev | Build et serveur de dev avec JSX/React |
| `vitest` | dev | Tests des fonctions pures (principe III) |

**Retirées ou évitées** : aucune dépendance de 001 n'est retirée ; `react-leaflet` (redondant avec
Leaflet), `vaul` (non maintenu), `jsdom` / `@testing-library/react` (sans exigence).

Aucune violation : la section Complexity Tracking est vide.

## Project Structure

### Documentation (this feature)

```text
specs/002-refonte-interface-carte/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── domain-functions.md
│   └── ui-components.md
├── checklists/
│   └── requirements.md
└── tasks.md             # créé par /speckit-tasks
```

### Source Code (repository root)

```text
index.html                    # racine #root, charge src/main.tsx
package.json                  # + scripts typecheck ; dépendances du tableau ci-dessus
tsconfig.json                 # strict, bundler, react-jsx, noEmit
vite.config.ts                # plugins react + tailwindcss ; test.environment node
README.md                     # nouveau (principe VI)
src/
├── main.tsx                  # montage React
├── App.tsx                   # état, classement, choix mobile / ordinateur
├── index.css                 # @import tailwindcss, @theme, leaflet.css, surcharges Leaflet
├── domain/                   # PUR — portage .js → .ts
│   ├── fuels.ts
│   ├── distance.ts
│   ├── dates.ts
│   ├── stations.ts
│   ├── ranking.ts            # + lowestPriceStationIds
│   ├── format.ts
│   ├── preferences.ts
│   └── sheet.ts              # nouveau : nextSheetPosition, positionAfterSelection
├── data/
│   └── prixCarburantsApi.ts  # portage
├── lib/
│   └── geolocation.ts        # portage de src/ui/geolocation.js
├── hooks/
│   ├── usePreferences.ts
│   ├── useStationSearch.ts   # portage de l'état de src/main.js + correction 001 T041
│   ├── useMediaQuery.ts
│   └── useElementHeight.ts   # hauteur de la zone carte (marge du panneau mobile)
└── components/
    ├── ChipGroup.tsx         # boutons radio en pastilles, partagés par les deux sélecteurs
    ├── FuelPicker.tsx
    ├── RadiusPicker.tsx
    ├── SearchHereButton.tsx
    ├── StatusMessage.tsx
    ├── StationList.tsx
    ├── CheapestSummary.tsx
    ├── MobileSheet.tsx
    ├── DesktopPanel.tsx
    └── MapView.tsx           # portage de src/ui/map.js + étiquettes de prix
tests/
└── unit/                     # .test.js → .test.ts, assertions inchangées
    ├── fixtures/records.ts
    ├── distance.test.ts
    ├── dates.test.ts
    ├── stations.test.ts
    ├── ranking.test.ts       # + lowestPriceStationIds
    ├── format.test.ts
    ├── preferences.test.ts
    └── sheet.test.ts         # nouveau
```

Supprimés après portage : `src/main.js`, `src/style.css`, `src/ui/*.js`, `src/domain/*.js`,
`src/data/*.js`, `tests/unit/**/*.js`, `vite.config.js`.

**Structure Decision**: Projet unique conservé. La séparation `domain/` (pur, testé) · `data/` ·
`lib/` (effets de bord navigateur) · `hooks/` (état) · `components/` (présentation) prolonge celle de
001 et le principe III : seules les couches `domain/` sont testées unitairement, le reste est validé
par le [quickstart](./quickstart.md). Le portage se fait **module par module avec ses tests** avant
la réécriture de l'interface, pour qu'une régression métier soit détectée avant tout travail visuel.

## Complexity Tracking

Aucune violation de la constitution à justifier.
