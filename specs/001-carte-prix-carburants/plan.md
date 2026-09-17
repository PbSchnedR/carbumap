# Implementation Plan: Carte des stations les moins chères autour de moi

**Branch**: `001-carte-prix-carburants` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

> **Remplacé en partie par [002 plan](../002-refonte-interface-carte/plan.md)** : la pile d'interface
> (JavaScript sans framework), la liste des dépendances et l'arborescence `src/` ci-dessous décrivent
> l'état livré en 001. Depuis 002, le code est en TypeScript + React + Tailwind ; la logique métier et
> l'accès aux données décrits ici sont inchangés.

**Input**: Feature specification from `/specs/001-carte-prix-carburants/spec.md`

## Summary

Site statique qui localise l'utilisateur (ou utilise le centre de la carte via « chercher ici »),
charge en un appel navigateur toutes les stations à 20 km depuis l'API Explore v2.1 de
data.economie.gouv.fr, puis filtre par carburant et rayon (5/10/20 km), classe par prix puis distance
et signale les prix de plus de 7 jours — le tout dans des fonctions pures testées avec Vitest.
L'interface affiche une liste classée et une carte Leaflet (tuiles OpenStreetMap) ; toucher une
station de la liste la met en évidence sur la carte. Aucun backend, aucune clé.

## Technical Context

**Language/Version**: JavaScript (ES2022, modules ES), sans TypeScript ; types documentés en JSDoc.

**Primary Dependencies**: `leaflet@1.9.4` (runtime) ; `vite@8.3.0`, `vitest@5.0.1` (dev). Versions
vérifiées sur npm le 2026-09-17.

**Storage**: `localStorage` pour les préférences (carburant, rayon) uniquement.

**Testing**: Vitest, environnement `node` (les fonctions testées n'ont pas besoin du DOM).

**Target Platform**: Navigateurs mobiles et de bureau récents ; servi en HTTPS (géolocalisation).

**Project Type**: Application web statique (single project).

**Performance Goals**: Première liste < 10 s en 4G (SC-001) ; changement de carburant ou de rayon
< 1 s, sans appel réseau (SC-002). Mesuré : requête 20 km à Paris en 0,34 s, 38 Ko compressés.

**Constraints**: Pas de backend ; pas de secret ; 360 px de large sans défilement horizontal ; dates
de l'API en heure de Paris malgré le suffixe `+00:00` (research R5).

**Scale/Scope**: 1 écran ; jusqu'à ~414 stations par recherche (Paris, 20 km) ; ~9 800 stations en
France ; usage personnel, quota API 50 000 appels/jour.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | Avant Phase 0 | Après Phase 1 |
|----------|--------------|---------------|---------------|
| I. Simplicité, pas de backend | API appelée depuis le navigateur ; CORS ouvert et aucune clé (vérifié, R1) ; pas de couche d'abstraction superflue | ✅ | ✅ |
| II. Dépendances minimales | 3 dépendances, justifiées ci-dessous ; dates, distance, stockage, géolocalisation et requêtes en natif (`Intl`, `fetch`, `localStorage`) | ✅ | ✅ |
| III. Logique pure et testée | Tri, filtrage, distance, normalisation, dates, formatage et préférences dans `src/domain/`, sans DOM/réseau/horloge ; contrat de tests dans [contracts/domain-functions.md](./contracts/domain-functions.md) | ✅ | ✅ |
| IV. Mobile | Mise en page à une colonne sous ~768 px, cibles ≥ 44 px, pas de survol requis ; vérification à 360 px dans le quickstart | ✅ | ✅ |
| V. Aucun secret | Aucune clé requise par l'API ni par les tuiles OSM ; pas de `.env` ; `.gitignore` créé avec `node_modules/`, `dist/`, `.env*` | ✅ | ✅ |

**Justification des dépendances (principe II)**

| Dépendance | Type | Pourquoi le natif ne suffit pas |
|------------|------|----------------------------------|
| `leaflet` | runtime | Carte glissante/zoomable avec tuiles, repères et attribution : des milliers de lignes à réécrire soi-même |
| `vite` | dev | Serveur de dev et build qui intègre le CSS et le module npm de Leaflet ; choix de l'utilisateur |
| `vitest` | dev | Lanceur de tests requis par le principe III ; s'intègre à Vite sans configuration |

Aucune violation : la section Complexity Tracking est vide.

## Project Structure

### Documentation (this feature)

```text
specs/001-carte-prix-carburants/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── prix-carburants-api.md
│   └── domain-functions.md
├── checklists/
│   └── requirements.md
└── tasks.md             # créé par /speckit-tasks
```

### Source Code (repository root)

```text
index.html                  # squelette de page : contrôles, liste, carte
package.json                # scripts dev / build / preview / test
vite.config.js              # config Vite + Vitest (environnement node)
.gitignore
src/
├── main.js                 # point d'entrée : état de l'écran, branchement UI ↔ domaine
├── style.css               # mise en page mobile d'abord
├── domain/                 # PUR : aucun import de leaflet, DOM, fetch, localStorage, Date.now
│   ├── fuels.js            # codes et libellés des carburants
│   ├── distance.js         # distanceKm (haversine)
│   ├── dates.js            # parseParisDateTime, isStale
│   ├── stations.js         # normalizeStation
│   ├── ranking.js          # rankStations
│   ├── format.js           # formatDistance, formatPrice, formatUpdatedAt
│   └── preferences.js      # readPreferences (parsing/validation)
├── data/
│   └── prixCarburantsApi.js # fetchStationsAround(origin) : requête, délai, erreurs
└── ui/
    ├── map.js              # carte Leaflet, repères circleMarker, mise en évidence
    ├── list.js             # rendu de la liste classée, badge « ancien », sélection
    ├── controls.js         # carburant, rayon, « chercher ici », réessayer
    └── geolocation.js      # enveloppe Promise de navigator.geolocation
tests/
└── unit/
    ├── distance.test.js
    ├── dates.test.js
    ├── stations.test.js
    ├── ranking.test.js
    ├── format.test.js
    └── preferences.test.js
```

**Structure Decision**: Projet unique à la racine. La séparation `domain/` (pur, testé) · `data/`
(réseau) · `ui/` (DOM, Leaflet) matérialise le principe III : seuls les modules de `domain/` sont
testés unitairement, les couches `data/` et `ui/` restent fines et sont validées par le
[quickstart](./quickstart.md). Pas de framework UI : quelques fonctions de rendu suffisent pour un
écran.

## Complexity Tracking

Aucune violation de la constitution à justifier.
