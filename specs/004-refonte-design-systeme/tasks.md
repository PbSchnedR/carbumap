---

description: "Task list for feature 004-refonte-design-systeme"
---

# Tasks: Système de design « carte d'abord », thèmes clair et sombre

**Input**: Design documents from `/specs/004-refonte-design-systeme/`

**Prerequisites**: plan.md, spec.md, quickstart.md

**Tests**: Aucun nouveau test unitaire — aucune logique métier n'est touchée (constitution III). Les
tests existants doivent rester verts **sans être modifiés** : c'est la preuve de non-régression. Les
contrastes sont vérifiés par calcul, le reste par [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3
- Include exact file paths in descriptions

## Path Conventions

`index.html`, `public/`, `src/` à la racine. Règles transverses : aucune dépendance ajoutée, aucune
valeur de couleur/espacement/rayon/ombre écrite en dur dans un composant, cibles ≥ 44 px,
`npm run typecheck` et `npm test` verts à chaque tâche.

---

## Phase 1: Setup

- [X] T001 Run `npm run typecheck`, `npm test`, `npm run build` to record the starting point (tests count and CSS size)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Le jeu de tokens, dont dépend tout le reste

- [X] T002 Rewrite the `@theme` block of `src/index.css` with the token set of plan.md Phase 1: colours (`surface`, `surface-2`, `canvas`, `ink`, `muted`, `line`, `brand`, `brand-ink`, `cheap`, `cheap-ink`, `stale`, `stale-soft`, `danger`, `danger-soft`, `overlay`), radii (`--radius-pill`, `--radius-card`, `--radius-sheet`), shadows (`--shadow-float`, `--shadow-panel`), text sizes (`--text-label`, `--text-body`, `--text-price`, `--text-title`, all in `rem`), motion (`--ease-out`, `--duration-fast: 180ms`)
- [X] T003 Add the dark theme to `src/index.css`: `@media (prefers-color-scheme: dark) { :root { … } }` redefining every colour token (verified in plan.md R1: utilities reference `var(--color-…)`, so no `dark:` class is needed); set `color-scheme: light dark` on `:root` so native controls and scrollbars follow
- [X] T004 Check every token pair with a contrast script (scratchpad, not in the repo): text ≥ 4.5:1, icons/markers/borders ≥ 3:1, in **both** themes; adjust the token values until all pass and record the table in `specs/004-refonte-design-systeme/plan.md` (FR-007, SC-003)

---

## Phase 3: User Story 1 - Interface « carte d'abord » (Priority: P1) 🎯 MVP

**Goal**: Les commandes flottent sur la carte et occupent au plus 20 % de la hauteur sur mobile.

**Independent Test**: quickstart.md §2.

- [X] T005 [US1] Remove the opaque bar in `src/App.tsx`: the mobile header becomes a transparent overlay; row 1 = fuel chips, row 2 = radius + `OriginBadge` + search + « Chercher ici » (this also resolves 003 T036); keep `--map-controls-top` fed by the measured header height
- [X] T006 [P] [US1] Restyle `src/components/ChipGroup.tsx` as floating pills: `--radius-pill`, `--shadow-float`, active state = accent fill + check + bold, inactive = `surface` with border `line`; keep ≥ 44 px and horizontal scrolling without page scroll
- [X] T007 [P] [US1] Restyle `src/components/SearchHereButton.tsx` and `src/components/OriginBadge.tsx` as floating pills with the same tokens; the badge truncates long place names
- [X] T008 [P] [US1] Restyle `src/components/StatusMessage.tsx` as a floating card (`--radius-card`, `--shadow-float`, `surface`), error variant using `danger`/`danger-soft`
- [X] T009 [US1] Desktop layout in `src/App.tsx` and `src/components/DesktopPanel.tsx`: panel 400 px with `--shadow-panel`, map filling the rest (≥ 65 % at 1280 px), same pill vocabulary in the panel header
- [ ] T010 [US1] Validate quickstart.md §2 (surfaces measured at 360 × 740 and 1280 × 800)

---

## Phase 4: User Story 2 - Thèmes clair et sombre (Priority: P1)

**Goal**: L'application suit le thème du système, carte comprise.

**Independent Test**: quickstart.md §3.

- [X] T011 [US2] Dark map tiles in `src/index.css`: filter on `.leaflet-tile` only (not on controls, attribution or markers), tuned so the map is dimmed but still readable; verify the attribution keeps its contrast
- [X] T012 [P] [US2] Make the price markers theme-aware in `src/index.css`: `.price-marker__label`, `--cheapest`, `--selected` and `.origin-marker` use tokens only, so they switch with the theme and keep 3:1 against both map backgrounds
- [X] T013 [P] [US2] Replace every remaining hard-coded colour in `src/components/*.tsx` (e.g. `text-white`, `bg-canvas/80`, inline `rgb(...)` shadows) by tokens, so nothing stays light-only
- [X] T014 [US2] Declare the browser UI colours in `index.html`: `<meta name="theme-color">` for light and dark via `media`, plus `color-scheme`
- [ ] T015 [US2] Validate quickstart.md §3, including the live switch with an open card and the grayscale pass

---

## Phase 5: User Story 3 - Cohérence, typographie et mouvement (Priority: P2)

**Goal**: Une identité constante, des chiffres stables, des transitions courtes.

**Independent Test**: quickstart.md §4.

- [X] T016 [P] [US3] Apply the type scale in `src/components/StationList.tsx`, `CheapestSummary.tsx` and `StationCard.tsx`: title / price / secondary hierarchy from the `--text-*` tokens, `tabular-nums` on every number (FR-010, FR-011)
- [X] T017 [P] [US3] Apply `--radius-card`, `--radius-sheet` and the shadows consistently to `src/components/MobileSheet.tsx`, `DesktopPanel.tsx`, `StationCard.tsx` and `PlaceSearch.tsx` (suggestion list included)
- [X] T018 [P] [US3] Normalise motion in `src/index.css`: single duration/easing tokens, and a `@media (prefers-reduced-motion: reduce)` block disabling transitions and animations everywhere (FR-012)
- [X] T019 [P] [US3] Create `public/icon.svg` (simple drop + map pin, readable at 32 px, works on light and dark) and reference it in `index.html` along with the page title (FR-016)
- [X] T020 [US3] Make the layout survive a 200 % system font size: `rem` sizes, wrapping labels, no fixed heights that clip text, in `src/App.tsx` and the restyled components (FR-014)
- [ ] T021 [US3] Validate quickstart.md §4

---

## Phase 6: Polish

- [X] T022 [P] Update `README.md`: light/dark themes following the system, design direction, project icon (principe VI)
- [X] T023 [P] Update the 002/003 documents made inaccurate: `specs/002-refonte-interface-carte/quickstart.md` (no more opaque bar; measurement rule) and `specs/003-fiche-station-recherche-lieu/tasks.md` (note that T036 is resolved by 004 T005)
- [X] T024 Run `npm run typecheck`, `npm test`, `npm run build`; record the CSS size (target ≤ 15 KB compressed) in `specs/004-refonte-design-systeme/plan.md`
- [ ] T025 Run the whole quickstart.md (§1–§6), including the 002/003 non-regression passes

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T004)** blocks everything else
- **US1 (T005–T010)**: after tokens; T005 and T009 edit `src/App.tsx` sequentially
- **US2 (T011–T015)**: after tokens; independent from US1 except T013 touching the same components
- **US3 (T016–T021)**: after US1/US2 restyling
- **Polish (T022–T025)**: last
- `src/index.css` is edited by T002, T003, T011, T012, T018: sequential, in ID order
- `src/App.tsx` is edited by T005, T009, T020: sequential

### Parallel Opportunities

- T006, T007, T008 (different components)
- T012, T013 (after T011)
- T016, T017, T018, T019
- T022, T023

---

## Implementation Strategy

1. Tokens and contrasts (T002–T004) — everything else depends on them
2. US1: the map-first structure, the most visible change
3. US2: themes, including the map
4. US3: typography, radii, motion, identity
5. Polish: docs, sizes, full quickstart

## Notes

- Aucun test unitaire n'est ajouté ni modifié : leur constance prouve qu'aucune logique n'a bougé
- Les tâches de validation (T010, T015, T021, T025) demandent un navigateur
