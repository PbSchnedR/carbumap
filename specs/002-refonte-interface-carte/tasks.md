---

description: "Task list for feature 002-refonte-interface-carte"
---

# Tasks: Refonte de l'interface de la carte

**Input**: Design documents from `/specs/002-refonte-interface-carte/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Demandés pour la logique pure (constitution, principe III ; plan : Vitest). Les tests de
001 sont **portés avec des assertions inchangées** ; les nouvelles fonctions pures ont leurs tests
écrits d'abord. Pas de tests de composants (research.md R10) : l'interface est validée par
[quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Projet unique à la racine : `index.html`, `src/`, `tests/unit/` (plan.md, Project Structure).

Règles transverses :
- `src/domain/` n'importe ni `react`, ni `leaflet`, ni le DOM, ni `fetch`, ni `localStorage`, et
  n'appelle pas `new Date()` sans argument.
- Toute cible interactive ≥ 44 × 44 px ; aucune information portée par la couleur seule.
- Aucune donnée texte de l'API insérée comme HTML.
- Une tâche de code n'est terminée que si `npm run typecheck` et `npm test` passent.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Passage à React + TypeScript + Tailwind sans toucher encore au code applicatif

- [X] T001 Update `package.json`: add `"typecheck": "tsc --noEmit"` to scripts; add dependencies `react@19.3.0`, `react-dom@19.3.0`, `react-modal-sheet@5.6.0`, `motion@13.4.0` (keep `leaflet@1.9.4`); add devDependencies `typescript@7.0.2`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`, `@types/leaflet@1.9.22`, `@vitejs/plugin-react@6.1.1`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3` (keep `vite@8.3.0`, `vitest@5.0.1`); exact versions, nothing else (plan.md dependency table); run `npm install`
- [X] T002 [P] Create `tsconfig.json`: `strict: true`, `noEmit: true`, `target: "ES2022"`, `lib: ["ES2022", "DOM", "DOM.Iterable"]`, `module: "ESNext"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `types: ["vite/client"]`, `skipLibCheck: true`, `isolatedModules: true`, `include: ["src", "tests", "vite.config.ts"]` (research.md R6)
- [X] T003 [P] Replace `vite.config.js` by `vite.config.ts`: plugins `react()` from `@vitejs/plugin-react` and `tailwindcss()` from `@tailwindcss/vite`; `test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] }`; delete `vite.config.js`
- [X] T004 [P] Create `src/index.css`: `@import "tailwindcss";`, `@import "leaflet/dist/leaflet.css";`, an `@theme` block defining the project palette (surface, text, muted text, accent, accent-strong, cheapest highlight, stale warning, error), radii and shadows; plus Leaflet overrides: `.leaflet-bar a` and `.leaflet-touch .leaflet-bar a` to `width: 44px; height: 44px; line-height: 44px` (fixes 001 T040)
- [X] T005 Run `npm run typecheck` on the setup (empty `src/main.tsx` exporting nothing is enough): if TypeScript 7.0.2 fails on valid config, install the latest `typescript@6` instead and record the decision and error in `specs/002-refonte-interface-carte/research.md` R1

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Portage de la logique, des données et de l'état en TypeScript, et application React de
base reproduisant 001 (liste + carte), sur laquelle les stories apportent la nouvelle présentation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Port des tests (assertions inchangées)

- [X] T006 [P] Port `tests/unit/fixtures/records.js` to `tests/unit/fixtures/records.ts` (typed `record(overrides?: Partial<ApiRecord>)`); delete the `.js`
- [X] T007 [P] Port `tests/unit/distance.test.js` to `tests/unit/distance.test.ts` with identical assertions; delete the `.js`
- [X] T008 [P] Port `tests/unit/dates.test.js` to `tests/unit/dates.test.ts` with identical assertions; delete the `.js`
- [X] T009 [P] Port `tests/unit/stations.test.js` to `tests/unit/stations.test.ts` with identical assertions (a `// @ts-expect-error` is allowed only where a test deliberately passes a wrong type, e.g. `gazole_prix: '2.449'`); delete the `.js`
- [X] T010 [P] Port `tests/unit/ranking.test.js` to `tests/unit/ranking.test.ts` with identical assertions; delete the `.js`
- [X] T011 [P] Port `tests/unit/format.test.js` and `tests/unit/preferences.test.js` to `tests/unit/format.test.ts` and `tests/unit/preferences.test.ts` with identical assertions; delete the `.js`

### Port de la logique et des données

- [X] T012 [P] Port `src/domain/fuels.js` to `src/domain/fuels.ts` (`FuelCode` union type, `FUELS` readonly, `isFuelCode(value: unknown): value is FuelCode`); delete the `.js`
- [X] T013 [P] Port `src/domain/distance.js` to `src/domain/distance.ts` (export type `LatLng`); delete the `.js`
- [X] T014 [P] Port `src/domain/dates.js` to `src/domain/dates.ts`, same behaviour and comment citing 001 research R5; delete the `.js`
- [X] T015 Port `src/domain/stations.js` to `src/domain/stations.ts` (export types `FuelPrice`, `Station`, `ApiRecord`; depends on T012, T014); delete the `.js`
- [X] T016 Port `src/domain/ranking.js` to `src/domain/ranking.ts` (export `RankedStation`, `STALE_AFTER_MS`, `isStale`, `rankStations`; depends on T013, T015); delete the `.js`
- [X] T017 [P] Port `src/domain/format.js` and `src/domain/preferences.js` to `src/domain/format.ts` and `src/domain/preferences.ts` (types `RadiusKm = 5 | 10 | 20`, `Preferences`); delete the `.js`
- [X] T018 Port `src/data/prixCarburantsApi.js` to `src/data/prixCarburantsApi.ts`, same request, timeout and `StationsFetchError` (depends on T012, T015); delete the `.js`
- [X] T019 Run `npm run typecheck` and `npm test`: all ported tests pass with unchanged assertions (SC-005 for the domain)

### État et interface de base

- [X] T020 [P] Port `src/ui/geolocation.js` to `src/lib/geolocation.ts` (typed failure `'unsupported' | 'denied' | 'unavailable' | 'timeout'`); delete the `.js`
- [X] T021 [P] Create `src/hooks/usePreferences.ts` per contracts/ui-components.md: `localStorage` key `carbumap:prefs`, `readPreferences` / `serializePreferences`, reads and writes in `try/catch`
- [X] T022 [P] Create `src/hooks/useMediaQuery.ts`: synchronous initial value from `window.matchMedia(query).matches`, subscribe to `change`, cleanup on unmount
- [X] T023 Create `src/hooks/useStationSearch.ts` (depends on T018, T020) porting the state logic of `src/main.js`: geolocation on mount → `search(origin)`; failure → `{ status: 'no-position', reason }`; `search` increments a request id so the latest search wins, sets `loading`, clears `stations`, then `ready` or `{ status: 'error', error }` with `stations` cleared; `retry()` re-runs for the current origin; **a geolocation result arriving after any `search` call is ignored, both success and failure** (fixes 001 T041)
- [X] T024 Create `src/components/MapView.tsx` porting `src/ui/map.js` (depends on T016): Leaflet map created once in `useEffect` on a `ref`'d `div`; France view `[46.6, 2.4]` zoom 6; OSM tiles `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, `maxZoom: 19`, attribution `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`; props `origin`, `ranked`, `selectedId`, `bottomPadding`; origin marker; one marker per ranked station (circle style for now); selected marker highlighted; after a new search fit bounds with `paddingBottomRight: [0, bottomPadding]`; on selection `panInside(latLng, { paddingBottomRight: [0, bottomPadding] })`; expose `getCenter(): LatLng` through `forwardRef`/`useImperativeHandle`; remove the map on unmount
- [X] T025 [P] Create `src/components/StationList.tsx` porting `src/ui/list.js` rows: `<ol>`, each row a `<button type="button">` ≥ 44px showing rank, address (or `postalCode city`), locality, `formatPrice`, `formatDistance`, « Mis à jour le » + `formatUpdatedAt`, visible « ancien » badge when `isStale`; `aria-current="true"` on `selectedId`; props `ranked`, `selectedId`, `onSelect`, `now`
- [X] T026 [P] Create `src/components/StatusMessage.tsx` with the French messages of 001 (`locating`, `loading`, `empty`, `no-position` + reason + hint « Déplacez la carte puis touchez « Chercher ici ». », `error` + « Réessayer » button); renders nothing when `ready` with results
- [X] T027 [P] Create `src/components/SearchHereButton.tsx` (« Chercher ici », `<button type="button">`, ≥ 44px)
- [X] T028 Create `src/App.tsx` and `src/main.tsx` (depends on T021–T027): `App` holds `usePreferences`, `useStationSearch`, `selectedStationId`; computes `rankStations(stations, { ...prefs, origin, now: new Date() })` only when `ready`; resets `selectedStationId` when absent from the ranking; simple interim layout (map above list); `main.tsx` imports `./index.css` and renders `<App />` into `#root` with `StrictMode`; update `index.html` to a single `<div id="root">` and `<script type="module" src="/src/main.tsx">`, keeping `lang="fr"`, viewport meta, title and description
- [X] T029 Delete the remaining 001 UI files now replaced: `src/main.js`, `src/style.css`, `src/ui/controls.js`, `src/ui/list.js`, `src/ui/map.js` (and the empty `src/ui/` folder)
- [X] T030 Run `npm run typecheck`, `npm test` and `npm run build`; all pass

**Checkpoint**: The React app reproduces 001 (list, map, selection, search here, messages) with the
saved fuel and radius; interactive fuel choice arrives in US2

---

## Phase 3: User Story 1 - Carte plein écran et panneau depuis le bas sur mobile (Priority: P1) 🎯 MVP

**Goal**: Sous 768 px, carte plein écran et liste dans un panneau à 3 positions.

**Independent Test**: 360 × 740, position Paris : carte plein écran, panneau replié ; poignée
replié → mi-hauteur → plein écran → replié ; la carte reste manipulable au-dessus du panneau ;
sélectionner une station en plein écran fait passer à mi-hauteur avec la station visible
(quickstart.md §2 et §3).

### Tests for User Story 1 (write first, must fail)

- [X] T031 [US1] Write `tests/unit/sheet.test.ts` per contracts/domain-functions.md: `nextSheetPosition` `'collapsed'`→`'half'`, `'half'`→`'full'`, `'full'`→`'collapsed'`; `positionAfterSelection` `'full'`→`'half'`, `'half'`→`'half'`, `'collapsed'`→`'half'`

### Implementation for User Story 1

- [X] T032 [US1] Implement `src/domain/sheet.ts`: `export type SheetPosition = 'collapsed' | 'half' | 'full'`, `nextSheetPosition`, `positionAfterSelection`; make T031 pass
- [X] T033 [P] [US1] Create `src/components/CheapestSummary.tsx`: shows « N stations » and the first ranked station (address or locality) with `formatPrice`; nothing when the ranking is empty; must fit in the collapsed sheet height
- [X] T034 [US1] Create `src/components/MobileSheet.tsx` (depends on T032) with `react-modal-sheet`: always `isOpen`, `snapPoints` ascending with index 0 = closed (never used), collapsed ≈ header of the sheet with `CheapestSummary` (leaves ≥ 75 % of screen height to the map; ≥ 50 % below 600px height), half ≈ 50 % of screen, full = up to below the fuel/radius header; **no `Sheet.Backdrop`**; `disableScrollLocking`; `disableDismiss`; do NOT use `modalEffectRootId`; `prefersReducedMotion` from `useMediaQuery('(prefers-reduced-motion: reduce)')`; controlled `position` mapped to snap indices with `snapTo` and `onSnap` → `onPositionChange`; drag disabled while the list is scrolled away from its top (`disableDrag` receiving `scrollPosition`) so a downward swipe first scrolls the list; handle is a `<button type="button" aria-label="Changer la taille de la liste">` ≥ 44px applying `nextSheetPosition`; reports its visible height through `onVisibleHeightChange` for the map padding (research.md R4, R9)
- [X] T035 [US1] Build the mobile layout in `src/App.tsx` (depends on T024, T033, T034): map fills the viewport (`fixed inset-0`); top overlay bar holding (for now) `SearchHereButton` and the status; `StatusMessage` visible without opening the sheet; `MobileSheet` containing `StationList`; `sheetPosition` state starting `'collapsed'`; on station select set `positionAfterSelection(sheetPosition)` then highlight; pass the sheet visible height as `MapView` `bottomPadding`; no horizontal page scroll at 360px
- [ ] T036 [US1] Validate quickstart.md §2 (map usable behind the sheet — stop and revisit research.md R4 if it fails) and §3 rows « Ouverture », « Mesure », « Toucher la poignée », « Glissements », « Plein écran, liste défilée », « Sélection en plein écran »

**Checkpoint**: Mobile layout with 3-position sheet works

---

## Phase 4: User Story 2 - Choisir son carburant en un geste (Priority: P1)

**Goal**: Les 6 carburants toujours visibles, 1 toucher pour changer.

**Independent Test**: Toucher « E85 » depuis l'écran principal : liste, carte et résumé passent à
l'E85 sans autre action (quickstart.md §3 « Toucher E85 »).

### Implementation for User Story 2

- [X] T037 [P] [US2] Create `src/components/FuelPicker.tsx`: `role="radiogroup"` with an accessible label « Carburant », built from `FUELS` with native `<input type="radio">` visually styled as chips (keyboard arrows for free); each chip ≥ 44px tall; active chip distinguished by a check icon **and** bold text **and** colour (FR-008); single row that scrolls horizontally inside its own container at 360px (`overflow-x-auto`, no page scroll); `value`, `onChange(fuel: FuelCode)`
- [X] T038 [P] [US2] Create `src/components/RadiusPicker.tsx` with the same radio-chip pattern for 5 / 10 / 20 km, visually secondary (smaller, neutral), label « Rayon »; `value: RadiusKm`, `onChange`
- [X] T039 [US2] Wire `FuelPicker`, `RadiusPicker` and `SearchHereButton` into the top overlay bar of `src/App.tsx` (depends on T035, T037, T038): changes call `usePreferences` setter, ranking recomputed locally with no new fetch; the bar stays visible in every sheet position (full sheet stops below it)
- [ ] T040 [US2] Validate SC-001 and US2 scenarios: 1 tap per fuel change on mobile; active fuel recognisable in grayscale (quickstart.md §5 « Couleur seule »); no page horizontal scroll at 360px

**Checkpoint**: US1 + US2 = complete mobile redesign without price highlighting

---

## Phase 5: User Story 3 - Repérer immédiatement le prix le plus bas (Priority: P2)

**Goal**: Prix sur chaque repère ; station(s) au prix le plus bas mises en avant dans la liste, le
résumé et la carte.

**Independent Test**: Résultats chargés : le moins cher est distinct dans la liste, le résumé replié
et sur la carte ; les égalités sont toutes mises en avant ; la mise en avant suit le changement de
carburant (quickstart.md §3 « Carte », « Égalité », « Sélection de la moins chère », 5 essais).

### Tests for User Story 3 (write first, must fail)

- [X] T041 [US3] Add `lowestPriceStationIds` tests to `tests/unit/ranking.test.ts` per contracts/domain-functions.md: empty → empty set; single minimum → its id; tie 1.899 / 1.899 / 1.949 → both 1.899 ids; independent of input order; input not mutated

### Implementation for User Story 3

- [X] T042 [US3] Implement `lowestPriceStationIds(ranked: RankedStation[]): Set<number>` in `src/domain/ranking.ts` (exact price comparison); make T041 pass
- [X] T043 [US3] Compute `lowestIds = lowestPriceStationIds(ranked)` in `src/App.tsx` and pass it to `MapView`, `StationList` and `CheapestSummary` (depends on T042)
- [X] T044 [P] [US3] Replace circle markers by price labels in `src/components/MapView.tsx`: `L.marker` + `L.divIcon` whose HTML is only `formatPrice(price.price)` inside a span with a CSS class (no API text); styles in `src/index.css`: default label, cheapest label (distinct colour + star/icon + bold, FR-009), selected label (outline/ring, distinguishable from cheapest when both apply); `zIndexOffset`: selected 2000, cheapest 1000, others 0 (FR-010); icon anchor at the pointed bottom of the label
- [X] T045 [P] [US3] Highlight cheapest rows in `src/components/StationList.tsx`: visible badge « Le moins cher » with icon **plus** row styling for every id in `lowestIds`; selection styling remains distinguishable on a cheapest row; « ancien » badge still shown
- [X] T046 [P] [US3] Highlight in `src/components/CheapestSummary.tsx`: same « Le moins cher » badge; when several stations tie, show « N stations au même prix » under the first
- [ ] T047 [US3] Validate US3 scenarios and SC-004 (5 timed trials < 3 s without opening the sheet) per quickstart.md §3

**Checkpoint**: Mobile redesign complete

---

## Phase 6: User Story 4 - Rendu soigné sur ordinateur (Priority: P3)

**Goal**: À partir de 768 px, carte plein fenêtre et liste dans un panneau latéral.

**Independent Test**: 1280 × 800 : carte et liste visibles ensemble ; passer sous 768 px et revenir
conserve carburant, rayon, résultats et sélection (quickstart.md §4).

### Implementation for User Story 4

- [X] T048 [P] [US4] Create `src/components/DesktopPanel.tsx`: left panel, fixed width (~400px), full height, internal scroll, same visual style as the sheet (surface, radius, shadow); contains the summary, status and `StationList`
- [X] T049 [US4] Switch presentation in `src/App.tsx` with `useMediaQuery('(min-width: 768px)')` (depends on T048): desktop renders `DesktopPanel` beside the map with `bottomPadding = 0` and the pickers above the list; mobile keeps `MobileSheet`; all state (`prefs`, search, `selectedStationId`) stays in `App` so switching loses nothing (FR-012); the Leaflet map instance is not recreated on switch (call `invalidateSize()` after the layout change)
- [ ] T050 [US4] Validate quickstart.md §4

**Checkpoint**: All user stories functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation (principe VI), contrôles de la constitution et validation complète

- [X] T051 [P] Create `README.md`: what Carbumap does, data source (API Explore v2.1, no key) and its date quirk (001 research R5), stack (React, TypeScript, Tailwind, Leaflet, react-modal-sheet), commands (`dev`, `build`, `preview`, `test`, `typecheck`), project structure (domain / data / lib / hooks / components), link to `specs/`
- [X] T052 [P] Update 001 documents made inaccurate by the redesign: `specs/001-carte-prix-carburants/quickstart.md` (§1 commands with `typecheck`, §3 selection now opens the sheet at half height, §5 mobile layout, §6 dependency list → refer to 002 plan), `specs/001-carte-prix-carburants/plan.md` (note at top: source structure and UI stack superseded by 002 plan), and append a note under Phase 7 of `specs/001-carte-prix-carburants/tasks.md` stating that T040 and T041 are addressed by 002 T004 and T023 and T042 is obsolete (do not tick them)
- [X] T053 [P] Write a small contrast check script in the scratchpad (not in the repo) computing WCAG contrast ratios for the `@theme` colour pairs used in `src/index.css`; adjust colours until text ≥ 4.5:1 and icons, markers, large text ≥ 3:1 (FR-015, SC-007); record the checked pairs in `specs/002-refonte-interface-carte/research.md` R5
- [X] T054 Run `npm run build`, record the compressed JS size in `specs/002-refonte-interface-carte/research.md` R11 and flag it if above 250 KB
- [X] T055 [P] Constitution checks (quickstart.md §7): search `src/domain/` for `react`, `leaflet`, `document`, `window`, `fetch`, `localStorage`, `navigator`, `Date.now`, `new Date()` without argument; compare `package.json` with the plan dependency table; search the repo (excluding `node_modules/`, `dist/`) for credentials
- [ ] T056 Run the full quickstart.md (§1–§7) on desktop and in responsive mode at 360 × 740, including reduced motion, grayscale, late geolocation and the 001 non-regression pass (§6)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 first; T002–T004 in parallel; T005 last
- **Foundational (Phase 2)**: depends on Setup — BLOCKS all stories. Test ports (T006–T011) and domain ports run largely in parallel; T019 gates the UI part; T028 needs T021–T027
- **US1 (Phase 3)**: depends on Foundational
- **US2 (Phase 4)**: depends on Foundational; T039 wires into the layout from T035, so run after US1
- **US3 (Phase 5)**: depends on Foundational; T046 edits `CheapestSummary` from US1 (T033)
- **US4 (Phase 6)**: depends on Foundational; reuses components of US1–US3
- **Polish (Phase 7)**: after all stories

### User Story Dependencies

- **US1 (P1)**: independent after Foundational
- **US2 (P1)**: components independent; placement uses US1's overlay bar
- **US3 (P2)**: domain + list/map parts independent; summary part needs US1
- **US4 (P3)**: independent layout; best done last to reuse final components

### Within Each Phase

- Ported tests keep assertions unchanged; new tests (T031, T041) written before their implementation
- `src/App.tsx` is edited by T028, T035, T039, T043, T049: sequential, in ID order
- `src/components/MapView.tsx` (T024, T044) and `src/components/StationList.tsx` (T025, T045): sequential

### Parallel Opportunities

- Phase 1: T002, T003, T004
- Phase 2: T006–T011; T012, T013, T014, T017; T020, T021, T022, T025, T026, T027
- Phase 3: T033 alongside T031/T032
- Phase 4: T037, T038
- Phase 5: T044, T045, T046 (after T043)
- Phase 7: T051, T052, T053, T055

---

## Parallel Example: Foundational ports

```bash
Task: "Port tests/unit/distance.test.js to tests/unit/distance.test.ts"
Task: "Port tests/unit/dates.test.js to tests/unit/dates.test.ts"
Task: "Port src/domain/distance.js to src/domain/distance.ts"
Task: "Port src/domain/dates.js to src/domain/dates.ts"
Task: "Port src/domain/format.js and preferences.js to .ts"
```

---

## Implementation Strategy

### MVP First

1. Phase 1 Setup → Phase 2 Foundational: React app equivalent to 001, tests green
2. Phase 3 US1: mobile full-screen map + sheet — **validate the map-behind-sheet risk first**
3. **STOP and VALIDATE** quickstart.md §2–§3

### Incremental Delivery

1. Foundation (portage) → non-regression of the domain proven by unchanged tests
2. US1 → US2 → complete mobile redesign
3. US3 → price highlighting
4. US4 → desktop
5. Polish → docs, contrast, bundle size, full quickstart

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify new tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

## Phase 8: Convergence

- [X] T057 Make the mobile map fill the whole screen in `src/App.tsx`: render `MapView` in an `absolute inset-0` layer covering the full viewport, overlay the filters bar on top of it (transparent background, chips keep their own shadows), measure the bar height with `useElementHeight`, position the `MobileSheet` mount area from below the bar to the bottom so the full position stops under the bar, and compute `bottomPadding` from the mount area height; target ≥ 75 % of a 360×740 screen showing map with the sheet collapsed per US1/AC1, FR-003, SC-002 (contradicts)
- [X] T058 Keep the OpenStreetMap attribution visible on mobile in `src/components/MapView.tsx` / `src/App.tsx`: when not on desktop, move the Leaflet attribution control to `topright` below the filters bar (or offset it above the collapsed sheet) so it is never covered by the sheet per plan: OSM attribution (001 research R10, OSM tile policy) (partial)
- [X] T059 Make tapping the sheet header summary open the sheet in `src/components/MobileSheet.tsx`: wrap `summary` in a `<button type="button">` (≥ 44px, accessible label) that applies `nextSheetPosition` when collapsed, without breaking header drag per FR-004, US1/AC2 (partial)
- [X] T060 Cap the collapsed sheet height on short screens in `src/components/MobileSheet.tsx`: collapsed height = `min(132, 50 % of screen height − filters bar height)` (keep `visibleSheetHeight` and `SNAP_POINTS` consistent), so the map keeps ≥ 50 % of the screen below 600px height per spec Edge Cases (landscape / short screens), FR-006 (partial)
- [X] T061 Move the Leaflet zoom control out from under the status message and filters bar on mobile in `src/components/MapView.tsx` / `src/index.css` (e.g. `topright` with a top offset equal to the filters bar height), keeping 44×44px targets per Constitution IV, US1/AC6 (partial)
