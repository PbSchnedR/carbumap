# Implementation Plan: Sélection depuis la carte, recherche de lieu et fiche station

**Branch**: `003-fiche-station-recherche-lieu` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-fiche-station-recherche-lieu/spec.md`

## Summary

Trois ajouts à l'application existante, sans nouvelle dépendance : les étiquettes de prix de la carte
deviennent cliquables et sélectionnent la station ; une recherche de lieu (API Adresse, sans clé)
permet de choisir n'importe quelle ville ou adresse française comme point de recherche, même quand la
localisation fonctionne ; une fiche station affiche adresse, distance, prix de tous les carburants
proposés, une photo de rue libre quand il en existe une (Panoramax, sans clé) et deux raccourcis
Google Maps (liens sans clé).

## Technical Context

**Language/Version**: TypeScript 7.0.2 (`strict`), React 19.3 — inchangés.

**Primary Dependencies**: aucune nouvelle. React, Leaflet, react-modal-sheet, Tailwind, Vite, Vitest
comme en 002.

**Storage**: `localStorage` pour les préférences (inchangé) ; le lieu choisi n'est pas mémorisé.

**Testing**: Vitest, environnement `node`, fonctions pures de `src/domain/` ; `tsc --noEmit`.

**Target Platform**: navigateurs mobiles et de bureau récents, servi en HTTPS.

**Project Type**: application web statique (single project).

**Performance Goals**: propositions de lieux < 1 s après la frappe (SC-003) ; classement autour d'un
lieu < 10 s (SC-004) ; fiche affichée < 1 s hors photo (SC-005) ; JS compressé ≤ 250 Ko (seuil de 002,
171 Ko mesurés).

**Constraints**: aucun service avec clé (FR-016) ; aucun calcul d'itinéraire (FR-015) ; cibles
≥ 44 × 44 px, y compris les étiquettes de prix ; exigences de 001 et 002 conservées (SC-007).

**Scale/Scope**: 3 nouveaux appels externes (lieux, photos, aucun pour Google Maps), 5 nouveaux
modules purs, 4 nouveaux composants, 2 hooks.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* Constitution **1.1.0**.

| Principe | Vérification | Avant Phase 0 | Après Phase 1 |
|----------|--------------|---------------|---------------|
| I. Simplicité, pas de backend | Les trois services (adresses, photos, liens Google) s'appellent depuis le navigateur sans clé (**vérifié**, research R1–R3) ; aucun backend | ✅ | ✅ |
| II. Dépendances utiles | Aucune dépendance ajoutée : `<input>` + liste pour la recherche, `<img>` pour la photo, `fetch` natif (research R7) | ✅ | ✅ |
| III. Logique pure et testée | Normalisation des lieux, choix de la photo la plus proche, construction des URL Google, prix des autres carburants, libellé de l'origine : tous purs et testés | ✅ | ✅ |
| IV. Mobile | Zone touchable de 44 px sur les étiquettes (FR-004), champ et propositions au doigt, fiche dans le panneau ; vérifications à 360 px (quickstart §5) | ✅ | ✅ |
| V. Aucun secret | Aucune clé requise ; photos Google écartées pour cette raison | ✅ | ✅ |
| VI. Documentation à jour | README (nouveaux services et attribution des photos) et documents de 002 mis à jour avec le code | ✅ | ✅ |

**Dépendances** : inchangées par rapport au [plan de 002](../002-refonte-interface-carte/plan.md).
Aucune violation : la section Complexity Tracking est vide.

## Project Structure

### Documentation (this feature)

```text
specs/003-fiche-station-recherche-lieu/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── external-apis.md
│   └── domain-functions.md
├── checklists/
│   └── requirements.md
└── tasks.md             # créé par /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── domain/                     # PUR
│   ├── places.ts               # nouveau : shouldSearchPlaces, normalizePlace
│   ├── photos.ts               # nouveau : pickNearestPhoto
│   ├── googleMaps.ts           # nouveau : googleMapsPlaceUrl, googleMapsDirectionsUrl
│   ├── searchOrigin.ts         # nouveau : type SearchOrigin, originLabel
│   ├── stations.ts             # + otherFuelPrices
│   └── … (001/002 inchangés)
├── data/
│   ├── prixCarburantsApi.ts    # inchangé
│   ├── adresseApi.ts           # nouveau : recherche de lieux (annulable)
│   └── panoramaxApi.ts         # nouveau : photos proches (annulable)
├── hooks/
│   ├── useStationSearch.ts     # + SearchOrigin, locate()
│   ├── usePlaceSearch.ts       # nouveau : saisie, anti-rebond, annulation
│   └── useStationPhoto.ts      # nouveau : photo de la station ouverte
└── components/
    ├── PlaceSearch.tsx         # nouveau : combobox accessible
    ├── OriginBadge.tsx         # nouveau : lieu actif + « Ma position »
    ├── StationCard.tsx         # nouveau : fiche station
    ├── MapView.tsx             # repères interactifs, zone 44 px, clic → sélection
    ├── StationList.tsx         # bouton « Détails » sur la ligne sélectionnée
    └── App.tsx                 # état de la fiche, branchement recherche de lieu
tests/unit/
├── places.test.ts              # nouveau
├── photos.test.ts              # nouveau
├── googleMaps.test.ts          # nouveau
├── searchOrigin.test.ts        # nouveau
└── stations.test.ts            # + otherFuelPrices
```

**Structure Decision**: La séparation de 002 est conservée — `domain/` pur et testé, `data/` pour les
appels réseau (un module par service, comme pour les prix), `hooks/` pour l'état, `components/` pour la
présentation. Chaque nouveau service externe a son module de données et son contrat écrit, pour que la
normalisation reste testable avec des réponses d'exemple copiées d'appels réels.

## Complexity Tracking

Aucune violation de la constitution à justifier.
