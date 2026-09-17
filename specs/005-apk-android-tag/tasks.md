---

description: "Task list for feature 005-apk-android-tag"
---

# Tasks: APK Android produit à chaque tag `v*`

**Input**: Design documents from `/specs/005-apk-android-tag/`

**Prerequisites**: plan.md, spec.md

**Tests**: Une seule règle métier nouvelle (bouton « retour ») → test unitaire écrit d'abord. Le reste
se valide sur un téléphone et depuis l'interface GitHub (quickstart.md).

**Organization**: Tasks are grouped by user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (automatisation), US2 (application installable)

## Path Conventions

Racine du projet ; nouveaux dossiers `android/` et `.github/workflows/`.

---

## Phase 1: Setup

- [ ] T001 Create the first Git commit: add a `.gitignore` entry for Android build outputs (`android/.gradle/`, `android/app/build/`, `android/build/`, `android/local.properties`, `android/.idea/`, `*.apk`), then commit the whole project as it stands
- [ ] T002 **User action required**: create the **public** GitHub repository, add it as `origin` and push `master`; without it nothing in US1 can be verified (FR-001)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: L'enveloppe Android, dont dépendent les deux stories

- [X] T003 Add dependencies at exact versions: `@capacitor/core@8.5.2`, `@capacitor/android@8.5.2`, `@capacitor/app@8.x`, `@capacitor/geolocation@8.2.2` (runtime) and `@capacitor/cli@8.5.2` (dev) in `package.json`; add the scripts `"android:sync": "cap sync android"` and `"android:apk": "cd android && ./gradlew assembleDebug"`
- [X] T004 Create `capacitor.config.ts`: `appId: 'fr.carbumap.app'`, `appName: 'Carbumap'`, `webDir: 'dist'`, `android: { backgroundColor: '#0d1117' }`
- [X] T005 Generate the Android project with `npx cap add android` and commit it; if the generation needs a local Android SDK, note the failure in `specs/005-apk-android-tag/plan.md` R7 and let the workflow generate it instead
- [X] T006 Edit `android/app/build.gradle` so `versionName` and `versionCode` come from Gradle properties with fallbacks (`project.findProperty('versionName') ?: '0.0.0'`, `(project.findProperty('versionCode') ?: '1') as Integer`) per plan.md R2
- [X] T007 Edit `android/app/src/main/AndroidManifest.xml`: keep `INTERNET`, add `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION`, and set the app label to « Carbumap »
- [X] T008 Put the project icon into `android/app/src/main/res/` (adaptive icon from `public/icon.svg` colours) so the home screen shows the project identity (FR-010)

---

## Phase 3: User Story 1 - APK produit à chaque tag (Priority: P1) 🎯 MVP

**Goal**: Un tag `v*` produit un APK attaché à la release.

**Independent Test**: pousser `v0.0.1-test` et vérifier l'APK sur la release.

- [X] T009 [US1] Create `.github/workflows/android.yml`: trigger `push: tags: ['v*']`; job on `ubuntu-latest`; steps = checkout, `actions/setup-node` (Node 24 + npm cache), `actions/setup-java` (Temurin 21), `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npx cap sync android`, `./gradlew assembleDebug -PversionName=${TAG#v} -PversionCode=${{ github.run_number }}` (FR-002 to FR-005)
- [X] T010 [US1] In the same workflow, rename the APK to `carbumap-<version>.apk` and publish it with `softprops/action-gh-release` (creates the release if missing, keeps an existing one), with `permissions: contents: write` (FR-006)
- [X] T011 [US1] Document the release procedure in `README.md`: tag naming, where the APK lands, how to install it (unknown sources), minimum Android version, and how to build locally with `npm run android:apk` (FR-012, FR-013, FR-014)
- [ ] T012 [US1] **Needs the repository (T002)**: push a `v0.0.1-test` tag and check the run, the created release and the downloadable APK (SC-001, SC-002)

---

## Phase 4: User Story 2 - Application installable qui se comporte comme le site (Priority: P1)

**Goal**: L'APK se comporte comme le site, avec la localisation Android et le bouton « retour ».

**Independent Test**: installer l'APK, accepter la localisation, parcourir carte, liste et fiche.

### Tests for User Story 2 (write first, must fail)

- [X] T013 [P] [US2] Write `tests/unit/backAction.test.ts`: `backAction({ isCardOpen: true, sheetPosition: 'full' })` → `'close-card'`; `{ isCardOpen: false, sheetPosition: 'full' }` and `'half'` → `'collapse-sheet'`; `{ isCardOpen: false, sheetPosition: 'collapsed' }` → `'exit'`

### Implementation for User Story 2

- [X] T014 [US2] Implement `src/domain/backAction.ts` (`BackAction = 'close-card' | 'collapse-sheet' | 'exit'`); make T013 pass
- [X] T015 [US2] Create `src/hooks/useAndroidBackButton.ts`: registers `App.addListener('backButton')` only on a native platform (`Capacitor.isNativePlatform()`), applies `backAction` to the current state and calls `App.exitApp()` on `'exit'`; removes the listener on unmount
- [X] T016 [US2] Wire the hook in `src/App.tsx` with the current `isCardOpen` and `sheetPosition`, reusing `closeCard` and `setSheetPosition` (FR-015)
- [X] T017 [US2] Rewrite `src/lib/geolocation.ts` on top of `@capacitor/geolocation` (its web implementation delegates to `navigator.geolocation`), keeping the same resolved value and the same failure reasons; the Android runtime permission must be requested before the first position (FR-008, plan.md R4)
- [ ] T018 [US2] **Needs a phone**: install the APK and validate quickstart.md §3 (full screen, location, map, list, card, back button, offline message)

---

## Phase 5: Polish

- [X] T019 [P] Update `README.md` (stack, Android section) and note in `specs/002-refonte-interface-carte/contracts/ui-components.md` that `useStationSearch` now relies on the Capacitor geolocation wrapper (principe VI)
- [X] T020 Run `npm run typecheck`, `npm test`, `npm run build` after the native changes; check `package.json` matches the dependency table of plan.md and that no secret was added
- [ ] T021 **Needs the repository and a phone**: run the whole quickstart.md, including the non-regression pass of 001 to 004 inside the installed app (SC-006)

---

## Dependencies & Execution Order

- **T001 → T002** (commit then repository) ; T002 is a user action and blocks T012, T018, T021
- **Foundational (T003–T008)** blocks both stories
- **US1 (T009–T012)**: workflow, then a real tag
- **US2 (T013–T018)**: independent from US1 except that the APK comes from it
- **Polish (T019–T021)**: last
- `README.md` is edited by T011 and T019: sequential

### Parallel Opportunities

- T013 alongside T009/T010
- T019 alongside T020

---

## Implementation Strategy

1. Commit, then repository (T001, T002)
2. Capacitor wrapper (T003–T008)
3. Workflow (T009–T011) — nothing is provable before T002
4. Native behaviours (T013–T017)
5. Validation on a phone and on GitHub (T012, T018, T021)

## Notes

- T002, T012, T018 and T021 cannot be done from here: they need the GitHub account and a phone
- Les tests unitaires existants (66) doivent rester verts

## Phase 6: Convergence

- [ ] T022 **User action**: make the repository real — first commit, then create the public GitHub repository, add it as `origin` and push; nothing in US1 can run before this per FR-001 (missing)
- [ ] T023 Fix the launcher icon below Android 8 in `android/app/src/main/res/`: the adaptive icon (`mipmap-anydpi-v26`) uses the project vector, but the legacy PNGs (`mipmap-*dpi/ic_launcher*.png`) are still Capacitor defaults; either generate the project PNGs for the five densities or raise `minSdkVersion` to 26 in `android/variables.gradle` and drop the PNGs per FR-010 (partial)
- [ ] T024 Prove the Gradle build once the repository exists: push `v0.0.1-test`, check that `-PversionName`/`-PversionCode` reach the APK and that the release carries `carbumap-0.0.1-test.apk`; record the run duration in `specs/005-apk-android-tag/plan.md` per FR-004, SC-001 (partial)
- [ ] T025 Load `@capacitor/app` and `@capacitor/geolocation` only on a native platform (dynamic import in `src/hooks/useAndroidBackButton.ts` and `src/lib/geolocation.ts`), so the web bundle drops the ~3.8 KB they add, keeping `navigator.geolocation` as the web path (unrequested)
