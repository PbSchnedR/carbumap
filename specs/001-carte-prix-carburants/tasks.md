---

description: "Task list for feature 001-carte-prix-carburants"
---

# Tasks: Carte des stations les moins chères autour de moi

**Input**: Design documents from `/specs/001-carte-prix-carburants/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Demandés — constitution, principe III (« Chaque fonction métier MUST avoir des tests
automatisés ») et plan (Vitest sur tri, filtrage, distance). Les tests portent sur `src/domain/`
uniquement ; ils sont écrits d'abord et doivent échouer avant l'implémentation. Les couches `data/` et
`ui/` sont validées par [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Projet unique à la racine du dépôt : `index.html`, `src/`, `tests/unit/` (voir plan.md, Project Structure).

Règle transverse pour toute tâche touchant `src/domain/` : aucun import de `leaflet`, aucun accès à
`document`, `window`, `fetch`, `localStorage`, `navigator` ni `Date.now()` / `new Date()` sans
argument ; « maintenant » et le point de recherche sont toujours passés en paramètre.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create `package.json` at repo root: `"type": "module"`, `"private": true`, scripts `"dev": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`, `"test": "vitest run"`; dependency `leaflet` `1.9.4`; devDependencies `vite` `8.3.0` and `vitest` `5.0.1` (no other dependency — constitution principle II); `"engines": { "node": "^22.12.0 || >=24" }`; then run `npm install`
- [X] T002 [P] Create `vite.config.js` at repo root exporting `defineConfig({ test: { environment: 'node', include: ['tests/unit/**/*.test.js'] } })`
- [X] T003 [P] Create `.gitignore` at repo root with `node_modules/`, `dist/`, `.env`, `.env.*` (constitution principle V)
- [X] T004 [P] Create `index.html` at repo root: `<html lang="fr">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, title « Carbumap », and empty landmark containers with ids `controls`, `status` (with `role="status"` and `aria-live="polite"`), `station-list`, `map`; load `/src/main.js` as `type="module"`
- [X] T005 [P] Create `src/style.css` with mobile-first base styles: `box-sizing: border-box`, `body { margin: 0 }`, readable font size ≥ 16px, `overflow-x: hidden` forbidden as a fix (layout must not overflow instead), interactive elements `min-height: 44px` (constitution principle IV)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modèle de station normalisé et accès aux données, requis par toutes les user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests (write first, must fail)

- [X] T006 [P] Write `tests/unit/distance.test.js` for `distanceKm(a, b)` per contracts/domain-functions.md: `distanceKm(p, p) === 0`; symmetry `distanceKm(a, b) === distanceKm(b, a)`; Paris `{lat: 48.8566, lon: 2.3522}` → Lyon `{lat: 45.7640, lon: 4.8357}` within 1 % of 391.5 km
- [X] T007 [P] Write `tests/unit/dates.test.js` for `parseParisDateTime(value)`: `"2026-09-17T15:47:20+00:00"` → `2026-09-17T13:47:20Z` (summer, UTC+2); `"2026-01-15T10:00:00+00:00"` → `2026-01-15T09:00:00Z` (winter, UTC+1); the `+00:00` suffix is ignored (add a comment citing research.md R5: the API suffix is wrong, values are Europe/Paris local time); `null`, `""`, `"not a date"` → `null`; also one case on each side of the 2026-10-25 DST change (e.g. `"2026-10-25T01:30:00"` → `2026-10-24T23:30:00Z`, `"2026-10-25T04:00:00"` → `2026-10-25T03:00:00Z`)
- [X] T008 [P] Write `tests/unit/stations.test.js` for `normalizeStation(record)` with fixtures in `tests/unit/fixtures/records.js` copied from the real API shape in contracts/prix-carburants-api.md: full record → `Station` with `id`, `address`, `postalCode`, `city`, `position {lat, lon}`; `adresse`/`cp`/`ville` null → `""`; `geom` null → returns `null`; `<x>_prix` null, non-numeric or ≤ 0 → fuel absent from `prices`; `gazole_prix: 2.359` with `gazole_rupture_type: "temporaire"` → `gazole` absent from `prices`; `<x>_rupture_type: "definitive"` → absent; unreadable `<x>_maj` → absent; `gplc_*` fields map to fuel code `gplc`; `prices.gazole.updatedAt` is the `Date` from `parseParisDateTime`

### Implementation

- [X] T009 [P] Create `src/domain/fuels.js` exporting `FUELS`, an ordered array `[{code: 'gazole', label: 'Gazole'}, {code: 'sp95', label: 'SP95'}, {code: 'e10', label: 'E10'}, {code: 'sp98', label: 'SP98'}, {code: 'e85', label: 'E85'}, {code: 'gplc', label: 'GPL'}]`, plus `FUEL_CODES` and `isFuelCode(value)`
- [X] T010 [P] Implement `distanceKm(a, b)` in `src/domain/distance.js`: haversine, Earth radius 6 371 km, inputs `{lat, lon}` in degrees; make T006 pass
- [X] T011 [P] Implement `parseParisDateTime(value)` in `src/domain/dates.js`: extract `YYYY-MM-DDTHH:mm:ss` (accept a space instead of `T`), ignore any trailing zone suffix, interpret as Europe/Paris wall-clock time and return the absolute `Date`; compute the Paris offset with native `Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', ... })` (no date library — principle II); malformed → `null`; make T007 pass
- [X] T012 Implement `normalizeStation(record)` in `src/domain/stations.js` (depends on T009, T011): returns `null` if `geom` is missing; `prices` gets an entry for a fuel « seulement si `<x>_prix` est un nombre et `<x>_rupture_type` est null » (data-model.md), with `price > 0` and a readable `updatedAt`; entry shape `{ price, updatedAt }`; make T008 pass
- [X] T013 Implement `fetchStationsAround(origin, { signal })` in `src/data/prixCarburantsApi.js` (depends on T009, T012): `GET https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/exports/json` built with `URLSearchParams`; `where=within_distance(geom, geom'POINT(<lon> <lat>)', 20km)` (longitude first); `select=id,adresse,cp,ville,geom` plus `<x>_prix,<x>_maj,<x>_rupture_type` for every code in `FUELS`; no auth header, no key; abort after 15 s via `AbortController`; throw a single `StationsFetchError` (with a French user-facing `message`) when fetch rejects, status ≠ 200, body is not JSON, or body is not an array; otherwise return `records.map(normalizeStation).filter(Boolean)`. Do NOT use `/records` (limit ≤ 100, research.md R2)
- [X] T014 Run `npm test` and confirm all foundational tests in `tests/unit/` pass

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Trouver la station la moins chère autour de moi (Priority: P1) 🎯 MVP

**Goal**: Localisation → liste classée par prix croissant pour le carburant et le rayon choisis, avec
prix, distance, date de mise à jour et badge « ancien ».

**Independent Test**: Position simulée Paris (48.8566, 2.3522), carburant Gazole, 10 km : la liste
affiche les stations triées par prix croissant avec prix, distance et date ; passer à E85 ou 20 km met
la liste à jour sans nouvel appel réseau (quickstart.md §2, étapes 1–6 hors carte).

### Tests for User Story 1 (write first, must fail)

- [X] T015 [P] [US1] Write `tests/unit/ranking.test.js` for `rankStations(stations, { fuel, radiusKm, origin, now })`: excludes stations without a price for `fuel`; excludes `distanceKm > radiusKm` and includes a station at exactly `radiusKm` (build it with a known offset and assert using `distanceKm`); order price asc, then distance asc, then `id` asc; `isStale` true when `now - updatedAt > 7 jours`, false at exactly 7 days, and stale entries are NOT moved in the order; empty input → `[]`; input array is not mutated; each result is `{ station, price, distanceKm, isStale }`
- [X] T016 [P] [US1] Write `tests/unit/format.test.js`: `formatDistance(0.347)` → `"350 m"`; `formatDistance(0.004)` → `"0 m"`; `formatDistance(1)` → `"1,0 km"`; `formatDistance(3.26)` → `"3,3 km"`; `formatPrice(2.449)` → `"2,449 €/L"`; `formatPrice(2)` → `"2,000 €/L"`; `formatUpdatedAt(date, now)` in Paris time → `"17/09 à 15:47"` for `2026-09-17T13:47:00Z` when `now` is in 2026, and `"17/09/2025 à 15:47"` when the year differs from `now`'s year
- [X] T017 [P] [US1] Write `tests/unit/preferences.test.js` for `readPreferences(raw)` and `serializePreferences(prefs)`: `null`, invalid JSON → `{ fuel: 'gazole', radiusKm: 10 }`; unknown `fuel` → `fuel` defaults, valid `radiusKm` kept; `radiusKm` ∉ {5, 10, 20} (e.g. `15`, `"10"`) → `radiusKm` defaults, valid `fuel` kept; round-trip `readPreferences(serializePreferences(p))` equals `p`

### Implementation for User Story 1

- [X] T018 [US1] Implement `rankStations` and `isStale(updatedAt, now)` in `src/domain/ranking.js` (depends on T010, T012): uses `distanceKm`; stale threshold constant `STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000`, strictly greater than; returns a new sorted array; make T015 pass
- [X] T019 [P] [US1] Implement `formatDistance`, `formatPrice`, `formatUpdatedAt` in `src/domain/format.js` (French decimal comma, Paris time via `Intl.DateTimeFormat` with `timeZone: 'Europe/Paris'`); make T016 pass
- [X] T020 [P] [US1] Implement `readPreferences`, `serializePreferences` and `DEFAULT_PREFERENCES = { fuel: 'gazole', radiusKm: 10 }` in `src/domain/preferences.js` (uses `isFuelCode` from T009; allowed radii `[5, 10, 20]`); pure, no `localStorage` access; make T017 pass
- [X] T021 [P] [US1] Create `src/ui/geolocation.js` exporting `getCurrentPosition()` returning a Promise of `{lat, lon}` wrapping `navigator.geolocation.getCurrentPosition` with `{ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }`; rejects with a reason `'unsupported' | 'denied' | 'unavailable' | 'timeout'`
- [X] T022 [P] [US1] Create `src/ui/controls.js` exporting `renderControls(container, { fuel, radiusKm }, { onFuelChange, onRadiusChange })`: a labelled `<select>` of the six fuels from `FUELS` (labels « Gazole, SP95, E10, SP98, E85, GPL ») and a labelled `<select>` for radius with options 5 km / 10 km / 20 km; both at least 44px tall
- [X] T023 [P] [US1] Create `src/ui/list.js` exporting `renderStationList(container, rankedStations, { now })` and `renderStatus(container, state)`: each row shows `station.address` (or `postalCode city` if address empty) and `postalCode city`, `formatPrice`, `formatDistance`, « Mis à jour le » + `formatUpdatedAt`, and a visible « ancien » badge with explanatory text when `isStale` (FR-014); rows use `<ol>` to express rank; `renderStatus` renders French messages for `locating` (« Localisation en cours… »), `loading` (« Chargement des prix… »), `empty` (« Aucune station ne propose ce carburant dans ce rayon. »), `no-position` (« Position indisponible. » + reason), `error` (the `StationsFetchError` message) with a « Réessayer » button callback
- [X] T024 [US1] Implement `src/main.js` (depends on T013, T018–T023): import `./style.css`; load preferences with `readPreferences` from `localStorage.getItem('carbumap:prefs')` inside `try/catch`; state `{ status: 'locating'|'loading'|'ready'|'error'|'no-position', origin, stations, prefs }`; on start call `getCurrentPosition` → `fetchStationsAround(origin)` → store stations → `rankStations(stations, { ...prefs, origin, now: new Date() })` → render list or `empty` status; fuel/radius change: save prefs (try/catch), re-rank from stored stations with NO new fetch (research.md R3); fetch error → `error` status with retry that re-runs the fetch for the same origin, and the previous list is cleared so stale results are never shown as current; geolocation failure → `no-position` status (the « chercher ici » fallback is added in US2)
- [ ] T025 [US1] Run `npm test`, then validate quickstart.md §2 steps 1–6 for the list only (DevTools location Paris; Network tab shows one API call, none on fuel/radius change; reload keeps fuel and radius)

**Checkpoint**: User Story 1 fully functional and testable independently (MVP)

---

## Phase 4: User Story 2 - Voir les stations sur une carte (Priority: P2)

**Goal**: Carte Leaflet/OSM montrant le point de recherche et un repère par station du classement
courant ; repli « chercher ici » quand la position est indisponible (FR-013).

**Independent Test**: Avec la liste affichée (Paris, Gazole, 10 km), la carte montre la position et
exactement un repère par station de la liste ; changer de carburant met les repères à jour ;
localisation bloquée → carte France + « chercher ici » produit une liste et des repères
(quickstart.md §2 et §4 lignes 1–3).

### Implementation for User Story 2

- [X] T026 [P] [US2] Create `src/ui/map.js` exporting `createMap(container)` returning `{ setOrigin(latLng), setStations(rankedStations), getCenter(), fitToResults() }`: import `leaflet` and `leaflet/dist/leaflet.css`; initial view France `[46.6, 2.4]`, zoom 6; tile layer `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with `maxZoom: 19` and attribution `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`; stations drawn as `L.circleMarker` (no image icons — research.md R10) in a single `L.layerGroup` cleared and rebuilt on each `setStations`; origin drawn as a distinct `L.circleMarker`; each station marker stores its `station.id`; `fitToResults()` fits bounds of origin + markers, or centers on origin at zoom 13 when there are no markers
- [X] T027 [P] [US2] Extend `src/style.css` for the two-pane layout: below 768px width, controls, then map (`height: 45vh`, min 240px), then list, stacked in one column; from 768px, list and map side by side (list ~ 380px wide scrollable, map fills the rest at full viewport height); `#map` always has an explicit height (Leaflet requirement); no horizontal page scroll at 360px
- [X] T028 [US2] Add a « Chercher ici » button to `src/ui/controls.js` (`onSearchHere` callback, ≥ 44px, always visible when the map is shown)
- [X] T029 [US2] Wire the map into `src/main.js` (depends on T026, T028): create the map on start; after every ranking (initial load, fuel change, radius change) call `map.setStations(ranked)`; after each fetch call `map.setOrigin(origin)` and `map.fitToResults()`; « Chercher ici » sets `origin = map.getCenter()`, sets status `loading` and re-runs `fetchStationsAround` + ranking (FR-013); on geolocation failure keep the France view and show `no-position` with a hint to move the map and tap « Chercher ici »
- [ ] T030 [US2] Validate quickstart.md §2 (map part) and §4 rows « Localisation refusée », « Zone vide », « Hors ligne »; check the map shows exactly the listed stations after switching to GPL

**Checkpoint**: User Stories 1 AND 2 both work

---

## Phase 5: User Story 3 - Repérer sur la carte une station de la liste (Priority: P3)

**Goal**: Toucher une station dans la liste la met en évidence sur la carte et la rend visible.

**Independent Test**: Toucher la 3ᵉ station : son repère est distingué et visible ; en toucher une
autre : seule la nouvelle est mise en évidence ; à 360px, la carte est ramenée à l'écran
(quickstart.md §3).

### Implementation for User Story 3

- [X] T031 [P] [US3] Add `highlightStation(id | null)` to `src/ui/map.js`: resets the previous highlighted marker to the default style, applies a highlighted style (larger radius, contrasting fill, `bringToFront()`) to the marker with that id, and pans to it only if it is outside current map bounds (`map.getBounds().contains`)
- [X] T032 [P] [US3] Make rows selectable in `src/ui/list.js`: each row content is a `<button type="button">` (keyboard and touch accessible, ≥ 44px) calling `onSelect(station.id)`; `renderStationList` accepts `selectedStationId` and marks that row with `aria-current="true"` and a visible selected style
- [X] T033 [US3] Wire selection in `src/main.js` (depends on T031, T032): state `selectedStationId`; on select, re-render the list with the selection and call `map.highlightStation(id)`; when the map container is not in the viewport (stacked mobile layout), call `mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })`; after any re-ranking, if `selectedStationId` is no longer in the ranked list, reset it to `null` and clear the highlight (data-model.md, État de l'écran)
- [ ] T034 [US3] Validate quickstart.md §3 on desktop and in responsive mode at 360px

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Vérifications de la constitution et de bout en bout

- [X] T035 [P] Verify domain purity: search `src/domain/` for `leaflet`, `document`, `window`, `fetch`, `localStorage`, `navigator`, `Date.now`, and `new Date()` without argument; fix any hit (constitution principle III)
- [X] T036 [P] Verify no secrets and dependencies (quickstart.md §6): `package.json` lists exactly `leaflet` in `dependencies` and `vite`, `vitest` in `devDependencies`; search the repo (excluding `node_modules/`) for `key`, `token`, `secret`, `apikey`, `password` and confirm no credential is present (constitution principles II and V)
- [X] T037 [P] Read the OpenStreetMap tile usage policy (https://operations.osmfoundation.org/policies/tiles/) and confirm `src/ui/map.js` meets it (visible attribution, no bulk/prefetch); record any required change as a code change in `src/ui/map.js` (research.md R10 was from recall)
- [ ] T038 Mobile pass at 360px (quickstart.md §5): no horizontal page scroll, all controls usable by touch, no hover-only interaction; fix issues in `src/style.css`
- [ ] T039 Run `npm test` and `npm run build` then `npm run preview`, and execute the whole quickstart.md (§1–§6), including the « Prix ancien » and « Rural » rows of §4

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 first (installs packages), T002–T005 in parallel after it
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on Foundational; wires into `src/main.js` created by US1 (T024)
- **US3 (Phase 5)**: Depends on US1 (list) and US2 (map)
- **Polish (Phase 6)**: Depends on all stories

### User Story Dependencies

- **US1 (P1)**: Independent — delivers the ranked list alone
- **US2 (P2)**: Needs the ranking and `src/main.js` from US1; testable on its own by checking markers vs. list
- **US3 (P3)**: Needs both the list (US1) and the map (US2) by definition

### Within Each Phase

- Tests (T006–T008, T015–T017) are written first and must fail before their implementation
- `fuels.js` (T009) and `dates.js` (T011) before `stations.js` (T012), before the API module (T013)
- Domain modules before `src/main.js` wiring
- Several US tasks edit the same files (`src/main.js`, `src/ui/map.js`, `src/ui/list.js`, `src/ui/controls.js`, `src/style.css`) across phases: do them sequentially in ID order

### Parallel Opportunities

- Phase 1: T002, T003, T004, T005
- Phase 2: T006, T007, T008 (tests); then T009, T010, T011
- Phase 3: T015, T016, T017 (tests); then T019, T020, T021, T022, T023 (T018 after T010 and T012)
- Phase 4: T026, T027
- Phase 5: T031, T032
- Phase 6: T035, T036, T037

---

## Parallel Example: User Story 1

```bash
# Tests first, together:
Task: "Write tests/unit/ranking.test.js for rankStations"
Task: "Write tests/unit/format.test.js for formatDistance, formatPrice, formatUpdatedAt"
Task: "Write tests/unit/preferences.test.js for readPreferences and serializePreferences"

# Then independent modules, together:
Task: "Implement formatters in src/domain/format.js"
Task: "Implement preferences in src/domain/preferences.js"
Task: "Create src/ui/geolocation.js"
Task: "Create src/ui/controls.js"
Task: "Create src/ui/list.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (normalisation, dates, distance, API)
3. Phase 3: US1 — liste classée
4. **STOP and VALIDATE**: `npm test` + quickstart.md §2 (liste seule)
5. Sans carte, la localisation refusée n'a pas encore de repli : c'est attendu jusqu'à US2

### Incremental Delivery

1. Setup + Foundational → modèle et API prêts, testés
2. US1 → liste classée utilisable (MVP)
3. US2 → carte + « chercher ici »
4. US3 → mise en évidence depuis la liste
5. Polish → constitution, mobile, quickstart complet

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

## Phase 7: Convergence

- [ ] T040 CRITICAL: Enlarge the Leaflet zoom controls to at least 44×44px in `src/style.css` (override `.leaflet-touch .leaflet-bar a` and `.leaflet-bar a` width, height and line-height to 44px), currently 30×30px from `leaflet/dist/leaflet.css` per Constitution IV (contradicts)
- [ ] T041 Ignore a late geolocation result in `src/main.js` once the user has started a search with « Chercher ici »: if `searchId > 0` when `getCurrentPosition()` settles, do not call `search` on success and do not set the `no-position` status on failure, so a manual search is neither replaced nor hidden per FR-013 (partial)
- [ ] T042 Remove the unused `invalidateSize()` method from `src/ui/map.js` (Leaflet already tracks window resizes) per plan: src/ui/map.js (unrequested)

> **Note (2026-09-17, refonte 002)** : T040 est traitée par 002 T004 (boutons de zoom 44 px dans
> `src/index.css`) et T041 par 002 T023 (`src/hooks/useStationSearch.ts`) ; T042 est sans objet
> (`src/ui/map.js` supprimé). Laissées non cochées ici : leur validation navigateur reste à faire.
