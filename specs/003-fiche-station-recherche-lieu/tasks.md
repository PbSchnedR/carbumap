---

description: "Task list for feature 003-fiche-station-recherche-lieu"
---

# Tasks: Sélection depuis la carte, recherche de lieu et fiche station

**Input**: Design documents from `/specs/003-fiche-station-recherche-lieu/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Demandés pour la logique pure (constitution, principe III) : tests écrits d'abord pour
chaque nouvelle fonction de `src/domain/`. Pas de tests de composants (002 research R10) ;
l'interface est validée par [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Projet unique à la racine : `src/`, `tests/unit/` (plan.md, Project Structure).

Règles transverses :
- `src/domain/` n'importe ni `react`, ni `leaflet`, ni le DOM, ni `fetch`, ni `localStorage`, et
  n'appelle pas `new Date()` sans argument.
- Toute cible interactive ≥ 44 × 44 px ; aucune information portée par la couleur seule.
- Aucune nouvelle dépendance npm (principe II).
- Une tâche de code n'est terminée que si `npm run typecheck` et `npm test` passent.

---

## Phase 1: Setup

**Purpose**: Rien à installer ; on vérifie seulement le point de départ

- [X] T001 Run `npm run typecheck`, `npm test` and `npm run build` on the current code base to confirm a clean starting point before touching anything

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Point de recherche typé (`SearchOrigin`), requis par la recherche de lieu et par
l'affichage du lieu actif

**⚠️ CRITICAL**: US2 dépend de cette phase ; US1 et US3 peuvent démarrer sans elle

- [X] T002 [P] Write `tests/unit/searchOrigin.test.ts` per contracts/domain-functions.md: `originLabel(null)` → `''`; `{ kind: 'device' }` → `'Ma position'`; `{ kind: 'map' }` → `'Zone de la carte'`; `{ kind: 'place', label: 'Gennevilliers' }` → `'Gennevilliers'`
- [X] T003 Implement `src/domain/searchOrigin.ts`: `export type SearchOrigin = { kind: 'device'; position: LatLng } | { kind: 'map'; position: LatLng } | { kind: 'place'; position: LatLng; label: string }` and `originLabel`; make T002 pass
- [X] T004 Change `src/hooks/useStationSearch.ts` to expose `origin: SearchOrigin | null` (instead of `LatLng | null`), `search(position: LatLng, kind: 'device' | 'map' | 'place', label?: string)`, `locate()` (re-runs geolocation then the search, using the same request counter so the latest wins, keeping the 001 T041 rule) and `retry()`; update `src/App.tsx` and `src/components/MapView.tsx` call sites to use `origin.position`

---

## Phase 3: User Story 1 - Sélectionner une station depuis la carte (Priority: P1) 🎯 MVP

**Goal**: Toucher l'étiquette de prix d'une station la sélectionne, exactement comme la liste.

**Independent Test**: Résultats chargés à 360 px : toucher une étiquette sélectionne la station sur la
carte et dans la liste ; toucher une zone vide ne perd pas la sélection (quickstart.md §2).

### Implementation for User Story 1

- [X] T005 [US1] Make price markers clickable in `src/components/MapView.tsx`: `interactive: true`, `iconSize: [44, 44]`, `iconAnchor: [22, 44]` so the touch target is 44 × 44 px while the label keeps its size (FR-004); add a new prop `onSelectStation(id: number)` read through a `ref` inside the marker `click` handler so markers are not rebuilt on every render; do NOT add a `map.on('click')` handler, so tapping empty map keeps the selection (US1/AC4)
- [X] T006 [US1] Center the price label inside the 44 × 44 px icon in `src/index.css`: `.price-marker` becomes a 44 × 44 transparent box with the label centred at its bottom (`.price-marker__label` positioned as today relative to that box), keeping the pointer triangle aligned on the station position
- [X] T007 [US1] Wire `onSelectStation` to the existing `selectStation` of `src/App.tsx` (depends on T005) so a map selection behaves exactly like a list selection: same highlight, same `aria-current` row, sheet moved to half on mobile (FR-001, FR-002)
- [X] T008 [US1] Scroll the selected row into view in `src/components/StationList.tsx` when `selectedId` changes and the row is outside the visible area (`scrollIntoView({ block: 'nearest' })`), so a selection made on the map is visible in the list without searching (FR-003)
- [ ] T009 [US1] Validate quickstart.md §2, including 10 taps in a dense area (SC-002)

**Checkpoint**: La carte et la liste se sélectionnent mutuellement

---

## Phase 4: User Story 2 - Chercher un lieu (Priority: P1)

**Goal**: Champ de recherche de lieu toujours disponible ; le lieu choisi devient le point de recherche.

**Independent Test**: Localisation acceptée, saisir « Genn », choisir « Gennevilliers » : stations et
distances autour de ce lieu, lieu affiché, retour possible à sa position (quickstart.md §3).

### Tests for User Story 2 (write first, must fail)

- [X] T010 [P] [US2] Write `tests/unit/places.test.ts` per contracts/domain-functions.md: `shouldSearchPlaces` false for `''`, `'  '`, `'ab'`, `'  a '` and true for `'abc'`, `'  Gennevilliers  '`; `normalizePlace` maps a real BAN feature (fixture copied from contracts/external-apis.md) to `{ id, label, context, position: { lat: 48.93113, lon: 2.294231 } }`, returns `null` when `label`, `geometry` or numeric coordinates are missing, and sets `context: ''` when absent

### Implementation for User Story 2

- [X] T011 [US2] Implement `src/domain/places.ts` (`Place` type, `shouldSearchPlaces`, `normalizePlace`); make T010 pass
- [X] T012 [US2] Create `src/data/adresseApi.ts` (depends on T011): `fetchPlaces(query: string, signal: AbortSignal): Promise<Place[]>` calling `https://api-adresse.data.gouv.fr/search/?q=…&limit=5&autocomplete=1` with `URLSearchParams`, 8 s timeout, no key; throws a `PlaceSearchError` with a French message on network error, status ≠ 200, non-JSON body or missing `features`; maps with `normalizePlace` and drops `null`s
- [X] T013 [US2] Create `src/hooks/usePlaceSearch.ts` (depends on T012): holds `query`, debounces 300 ms, skips calls when `shouldSearchPlaces` is false, aborts the previous request, exposes `{ query, setQuery, places, status: 'idle' | 'loading' | 'empty' | 'error', reset() }`
- [X] T014 [P] [US2] Create `src/components/PlaceSearch.tsx` (depends on T013): accessible combobox — `<input role="combobox" aria-expanded aria-controls aria-autocomplete="list">` with a visible label or `aria-label` « Chercher un lieu », `role="listbox"` suggestions with `role="option"`, arrow-key navigation, Enter to choose, Escape to close, click outside to close; each option ≥ 44 px; French messages for `empty` (« Aucun lieu trouvé ») and `error` (« Recherche de lieu indisponible »)
- [X] T015 [P] [US2] Create `src/components/OriginBadge.tsx`: shows `originLabel(origin)` and, when the origin is not `device`, a « Ma position » button (≥ 44 px) calling `onLocate` (FR-008)
- [X] T016 [US2] Wire both into `src/App.tsx` (depends on T004, T014, T015): `PlaceSearch` in the filters bar on mobile and in the panel header on desktop; choosing a place calls `search(place.position, 'place', place.label)` and clears the suggestions; `OriginBadge` calls `locate()`; « Chercher ici » keeps calling `search(center, 'map')` (FR-009); keep the bar usable at 360 px without page horizontal scroll
- [ ] T017 [US2] Validate quickstart.md §3, including the Network tab check (one request after typing stops, not one per letter) and the keyboard-only pass

**Checkpoint**: Le point de recherche peut venir de la position, de la carte ou d'un lieu choisi

---

## Phase 5: User Story 3 - Fiche station avec photo et raccourcis (Priority: P2)

**Goal**: Une fiche par station : informations, autres carburants, photo libre si disponible, deux
raccourcis Google Maps.

**Independent Test**: Sélectionner une station, ouvrir « Détails » : fiche complète, photo ou mention
d'absence, liens ouvrant la bonne station (quickstart.md §4).

### Tests for User Story 3 (write first, must fail)

- [X] T018 [P] [US3] Write `tests/unit/googleMaps.test.ts`: `googleMapsPlaceUrl({ lat: 48.9327, lon: 2.3044 })` → `https://www.google.com/maps/search/?api=1&query=48.9327%2C2.3044`; `googleMapsDirectionsUrl` same position → `https://www.google.com/maps/dir/?api=1&destination=48.9327%2C2.3044`; coordinates inserted without rounding
- [X] T019 [P] [US3] Write `tests/unit/photos.test.ts` with a fixture copied from contracts/external-apis.md: `pickNearestPhoto([], position)` → `null`; with three photos, returns the nearest one with `{ id, thumbUrl, takenAt, author, license, position }`; ignores features without `assets.thumb.href`, without readable `datetimetz` or without coordinates; missing `geovisio:producer` / `license` → `''`; input array not mutated
- [X] T020 [P] [US3] Add `otherFuelPrices` tests to `tests/unit/stations.test.ts`: returns the other fuels that have a price, in `FUELS` order, each with `{ fuel, label, price, updatedAt, isStale }`; excludes the selected fuel; station with no other price → `[]`; `isStale` follows the 7-day rule

### Implementation for User Story 3

- [X] T021 [P] [US3] Implement `src/domain/googleMaps.ts`; make T018 pass
- [X] T022 [P] [US3] Implement `src/domain/photos.ts` (`PlacePhoto` type, `pickNearestPhoto` using `distanceKm`); make T019 pass
- [X] T023 [P] [US3] Implement `otherFuelPrices` in `src/domain/stations.ts`; make T020 pass
- [X] T024 [US3] Create `src/data/panoramaxApi.ts` (depends on T022): `fetchNearbyPhotos(position, signal)` calling `https://api.panoramax.xyz/api/search?place_position=<lon>,<lat>&place_distance=0-80&limit=10`, 8 s timeout, no key; any error or unexpected body resolves to `[]` (absence of photo is normal, FR-013)
- [X] T025 [US3] Create `src/hooks/useStationPhoto.ts` (depends on T024): loads the nearest photo for the open station, aborts on station change or unmount, exposes `{ photo: PlacePhoto | null, isLoading: boolean }`, never throws
- [X] T026 [US3] Create `src/components/StationCard.tsx` (depends on T021, T023, T025): header with the station address, city and a « Retour à la liste » button (≥ 44 px); distance; selected fuel price with `formatUpdatedAt` and the « ancien » badge when stale; other fuels from `otherFuelPrices`; photo area showing the `thumbUrl` image with `loading="lazy"`, `alt` describing the place, and under it the taken date, author and license (CC-BY-SA attribution, FR-012), or « Aucune photo disponible » when there is none or the image fails to load; two links `target="_blank" rel="noopener noreferrer"` « Voir dans Google Maps » and « Itinéraire » (FR-014)
- [X] T027 [US3] Add a « Détails » button next to the selected row in `src/components/StationList.tsx`: sibling button (never nested inside the row button), visible only for the selected station, ≥ 44 px, calling `onOpenCard(id)`; tapping an already-selected row also opens the card (FR-010, SC-005)
- [X] T028 [US3] Open the card from the map in `src/components/MapView.tsx`: clicking the marker of the already-selected station calls `onOpenCard(id)` instead of re-selecting (SC-005)
- [X] T029 [US3] Wire the card into `src/App.tsx` (depends on T026, T027, T028): `isCardOpen` state; the sheet/panel shows `StationCard` instead of `StationList` when open; opening on mobile moves the sheet to `full`, closing returns to `half` and keeps the selection (FR-017); the card closes and the selection resets when the station leaves the ranking (data-model.md)
- [ ] T030 [US3] Validate quickstart.md §4, including a station with a photo (192 Avenue Louis Roche, Gennevilliers), a station without, and the two Google Maps links (SC-006)

**Checkpoint**: Les trois stories fonctionnent

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T031 [P] Update `README.md`: place search and photos (sources without key), CC-BY-SA attribution of photos, Google Maps shortcuts, new `domain/` modules (principe VI)
- [X] T032 [P] Update the 002 documents made inaccurate: `specs/002-refonte-interface-carte/contracts/ui-components.md` (`MapView` now interactive with `onSelectStation` / `onOpenCard`, `StationList` with « Détails », `useStationSearch` returning `SearchOrigin`) and `specs/002-refonte-interface-carte/quickstart.md` §3 (a tap on a price label now selects a station)
- [X] T033 Run `npm run build` and record the compressed JS size in `specs/003-fiche-station-recherche-lieu/research.md` (alert above 250 KB)
- [X] T034 [P] Constitution checks (quickstart.md §5): `src/domain/` purity grep; `package.json` unchanged (no new dependency); no credentials in the repo
- [ ] T035 Run the whole quickstart.md (§1–§5) at 360 × 740 and on desktop, including the 002 non-regression pass (SC-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)**: first, confirms a clean base
- **Foundational (T002–T004)**: blocks US2; US1 and US3 do not need it
- **US1 (Phase 3)**: independent
- **US2 (Phase 4)**: needs Foundational
- **US3 (Phase 5)**: independent of US2; T028 builds on T005 (US1)
- **Polish (Phase 6)**: after the stories

### User Story Dependencies

- **US1 (P1)**: independent — delivers map selection alone
- **US2 (P1)**: needs `SearchOrigin` (T004) only
- **US3 (P2)**: card opening from the map (T028) needs US1; the rest is independent

### Within Each Phase

- New tests (T002, T010, T018–T020) are written before their implementation and must fail
- `src/App.tsx` is edited by T004, T007, T016, T029: sequential, in ID order
- `src/components/MapView.tsx` (T005, T028) and `src/components/StationList.tsx` (T008, T027): sequential

### Parallel Opportunities

- Phase 4: T014 and T015 after T013
- Phase 5: T018, T019, T020 (tests); then T021, T022, T023
- Phase 6: T031, T032, T034

---

## Parallel Example: User Story 3 tests

```bash
Task: "Write tests/unit/googleMaps.test.ts"
Task: "Write tests/unit/photos.test.ts"
Task: "Add otherFuelPrices tests to tests/unit/stations.test.ts"
```

---

## Implementation Strategy

### MVP First

1. T001 → Phase 3 (US1) : la carte devient cliquable, c'est le manque le plus visible
2. **STOP and VALIDATE** quickstart.md §2

### Incremental Delivery

1. US1 → sélection depuis la carte
2. Foundational + US2 → recherche de lieu
3. US3 → fiche station, photo et raccourcis
4. Polish → documentation, taille du build, constitution, quickstart complet

---

## Notes

- [P] tasks = different files, no dependencies
- Verify new tests fail before implementing
- Commit after each task or logical group
- Les tâches de validation (T009, T017, T030, T035) demandent un navigateur

## Phase 7: Convergence

- [X] T036 (traitée par 004 T005 : barre ramenée à deux rangées, lieu actif sur la rangée du rayon) Keep the mobile filters bar to two rows in `src/App.tsx`: move `OriginBadge` next to the radius chips (or render it as a floating pill over the map) instead of a third row, so the collapsed view keeps the map share required by 002 SC-002 / FR-006 while the place search stays always reachable per FR-005 (partial)
- [ ] T037 Make sure the place suggestions are not clipped on desktop: `DesktopPanel` uses `overflow-hidden` (`src/components/DesktopPanel.tsx`), so check the dropdown of `src/components/PlaceSearch.tsx` in a 1280×800 window and, if clipped, render the list outside the clipped container per US2/AC1 (partial)
- [ ] T038 Reset `isCardOpen` to `false` in `src/App.tsx` when the selected station leaves the ranking, so the card cannot reopen by itself if that station comes back per data-model.md (partial)
