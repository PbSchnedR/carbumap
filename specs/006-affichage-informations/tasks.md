---

description: "Task list for feature 006-affichage-informations"
---

# Tasks: Refonte de l'affichage des informations

**Input**: Design documents from `/specs/006-affichage-informations/`

**Prerequisites**: plan.md, spec.md, quickstart.md

**Tests**: Deux règles nouvelles (tri, dates relatives) → tests écrits d'abord. Les 69 tests existants
doivent rester verts sans modification. L'interface est validée par [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (tableau ordinateur), US2 (lignes mobiles), US3 (fiche)

## Path Conventions

`src/` et `tests/unit/` à la racine. Règles transverses : aucune dépendance ajoutée, tokens de 004
uniquement, cibles ≥ 44 px, `npm run typecheck` et `npm test` verts à chaque tâche.

---

## Phase 1: Setup

- [X] T001 Run `npm run typecheck`, `npm test`, `npm run build` to record the starting point (69 tests, JS ~178 KB gzip)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Les deux règles pures partagées par les deux présentations

### Tests (write first, must fail)

- [X] T002 [P] Write `tests/unit/sorting.test.ts`: `DEFAULT_SORT` is `{ column: 'price', direction: 'asc' }`; `sortRanked` with the default reproduces 001's order (price, then distance, then id); sorting by `distance` and `updatedAt` in both directions; entries without `updatedAt` always last in both directions; input array not mutated; ties broken by `id` so the order is total
- [X] T003 [P] Write `tests/unit/relativeDate.test.ts` for `formatRelativeDay(date, now)` using Paris calendar days (plan.md R3): same day → `'aujourd’hui'`; previous calendar day → `'hier'` (including a case 20 hours earlier that crosses midnight); 3 days → `'il y a 3 j'`; 30 days → `'il y a 30 j'`; 31 days → short date `'17/09'`; a date whose UTC day differs from the Paris day is classified on the Paris day

### Implementation

- [X] T004 Implement `src/domain/sorting.ts` (`SortColumn = 'price' | 'distance' | 'updatedAt'`, `SortDirection`, `DEFAULT_SORT`, `sortRanked`); make T002 pass
- [X] T005 Implement `src/domain/relativeDate.ts` reusing the Paris conversion of `src/domain/dates.ts`; make T003 pass

---

## Phase 3: User Story 1 - Tableau comparatif sur ordinateur (Priority: P1) 🎯 MVP

**Goal**: Un tableau dense, triable, synchronisé avec la carte.

**Independent Test**: quickstart.md §2.

- [X] T006 [US1] Create `src/components/StationTable.tsx`: `<table>` with `<caption class="sr-only">`, `<th scope="col">` headers as buttons carrying `aria-sort` (`ascending`/`descending`/`none`), sticky header, body scrolling in its own area; columns price, distance, station (address + city, truncated), updated (`formatRelativeDay`); rows are keyboard focusable, selected row marked with `aria-current` and cheapest rows marked with the badge; numbers `tabular-nums` and right-aligned (FR-003, FR-007, FR-015)
- [X] T007 [US1] Add the sort state to `src/App.tsx`: `sort` initialised to `DEFAULT_SORT`, passed to `StationTable`, applied through `sortRanked` after `rankStations`; kept across fuel, radius and origin changes (FR-005, FR-006)
- [X] T008 [US1] Rework the desktop layout in `src/App.tsx`: map as a top banner always mounted, table below filling the rest **with its own scroll area** (the page itself never scrolls, so the sticky header of T006 has something to stick to), station card in a right-hand area when open; measure the banner height so at least 10 rows remain visible at 1280 × 800 (start at 32 % of the window, min 200px, and adjust) ; delete `src/components/DesktopPanel.tsx` (FR-002, FR-004, FR-008, plan.md R4, R6)
- [X] T009 [US1] Handle the 768–1023 px tier in `src/components/StationTable.tsx` / `src/App.tsx`: drop the « mise à jour » column instead of compressing (FR-014)
- [ ] T010 [US1] Validate quickstart.md §2, including the ~400-row sort timing and the keyboard pass

---

## Phase 4: User Story 2 - Lignes à prix dominant sur mobile (Priority: P1)

**Goal**: Sur mobile, le prix domine et trois stations tiennent à l'écran.

**Independent Test**: quickstart.md §3.

- [X] T011 [US2] Create `src/components/StationRows.tsx` from the current `StationList` rendering: price as the dominant element (`--text-price` or larger, `tabular-nums`), address and city secondary and truncated, distance right-aligned, « Le moins cher » badge, « ancien » badge, « Détails » button on the selected row, `aria-current` on selection, rows ≥ 44 px (FR-009, FR-011)
- [X] T012 [US2] Replace `StationList` by `StationRows` in the mobile branch of `src/App.tsx` and delete `src/components/StationList.tsx`, moving its shared helpers (`CheapestBadge`, `StaleBadge`, `locality`) to `src/components/badges.tsx` so `StationTable`, `StationRows` and `StationCard` share them
- [X] T013 [US2] Tune the mobile density so at least 3 complete stations are visible at 360 × 740 with the sheet at half height, adjusting row padding only through the 004 tokens (FR-010, SC-002)
- [ ] T014 [US2] Validate quickstart.md §3

---

## Phase 5: User Story 3 - Fiche station lisible (Priority: P2)

**Goal**: Une fiche hiérarchisée, autres carburants en colonnes.

**Independent Test**: quickstart.md §4.

- [X] T015 [US3] Rewrite `src/components/StationCard.tsx`: selected fuel price dominant with its date and « ancien » badge, other fuels as a small aligned table (fuel, price, date via `formatRelativeDay`), then location and actions; tighten the layout when there is no photo (FR-013)
- [X] T016 [US3] Place the card on desktop in `src/App.tsx` so it does not hide the table (plan.md R6), keeping the mobile behaviour of 003 (sheet at full height)
- [ ] T017 [US3] Validate quickstart.md §4

---

## Phase 6: Polish

- [X] T018 [P] Annotate the superseded requirements (principe VI): add a note under 002 FR-011 in `specs/002-refonte-interface-carte/spec.md` and under 004 FR-004 in `specs/004-refonte-design-systeme/spec.md` stating they are replaced by 006 FR-002, and update the related quickstart rows
- [X] T019 [P] Update `README.md`: desktop comparative table, mobile price-first rows, sortable columns
- [X] T020 Run `npm run typecheck`, `npm test`, `npm run build`; record the JS/CSS sizes in `specs/006-affichage-informations/plan.md` and confirm no dependency was added
- [ ] T021 Run the whole quickstart.md (§1–§5), including the 002/003 non-regression passes and 5 timed trials on each presentation to check that the cheapest station is identified in under 3 seconds (SC-004)

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T005)** blocks both presentations
- **US1 (T006–T010)**: after the pure modules; T007, T008, T009 edit `src/App.tsx` sequentially
- **US2 (T011–T014)**: T012 also edits `src/App.tsx` — run after US1's edits
- **US3 (T015–T017)**: after US2 (shared badges module)
- **Polish (T018–T021)**: last

### Parallel Opportunities

- T002 and T003 (tests)
- T018 and T019 (docs)

---

## Implementation Strategy

1. Pure rules first (sort, relative dates) — both presentations depend on them
2. US1 desktop table — the main complaint
3. US2 mobile rows
4. US3 card
5. Polish: superseded requirements, README, sizes, full quickstart

## Notes

- Les validations (T010, T014, T017, T021) demandent un navigateur
- `StationList.tsx` et `DesktopPanel.tsx` disparaissent : vérifier qu'aucun import ne subsiste
