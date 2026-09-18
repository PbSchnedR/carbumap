---

description: "Task list for 007 — Interface sobre : liste à gauche sur ordinateur, typographie et icônes propres"
---

# Tasks: Interface sobre — liste à gauche sur ordinateur, typographie et icônes propres

**Input**: Design documents from `/specs/007-refonte-ui-sobre/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contracts.md](./contracts/ui-contracts.md), [quickstart.md](./quickstart.md)

**Tests**: La spec ne demande pas de TDD. Une seule tâche de test figure ici, **T033**, et elle est
obligatoire : la constitution (principe III) impose des tests pour toute fonction métier pure, et
`shouldOfferSearchHere()` en est une. Tout le reste de 007 est présentationnel et se vérifie par le
quickstart.

**Organization**: Tâches groupées par user story. Les quatre stories sont livrables séparément, mais
elles se partagent des fichiers : voir « Conflits de fichiers entre stories » avant de paralléliser.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallélisable — fichier différent, aucune dépendance sur une tâche inachevée
- **[Story]**: US1 à US4, selon spec.md
- Chaque tâche porte son chemin de fichier exact

## Path Conventions

Projet unique : `src/` et `tests/` à la racine du dépôt.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: entrée et sortie de dépendances, base de référence verte

- [X] T001 Ajouter `@fontsource-variable/ibm-plex-sans` en version `5.3.0` aux `dependencies` de `package.json`, puis lancer `npm install` (licence OFL-1.1, publiée le 2026-07-19 — vérifié au registre npm, research R1)
- [X] T002 Retirer `motion` (`13.4.0`) des `dependencies` de `package.json` et relancer `npm install` — dépendance morte, vérifié : aucun `import` de `motion` dans `src/` (constitution II, plan)
- [X] T003 Établir la base de référence en lançant `npm run typecheck` puis `npm test` ; les deux doivent passer avant toute modification

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: jetons visuels et module d'icônes dont dépendent US2, US3 et US4

**⚠️ CRITICAL**: aucune user story ne peut commencer avant la fin de cette phase

- [X] T004 Importer la police dans `src/index.css` (`@import '@fontsource-variable/ibm-plex-sans'`) en conservant le `font-display: swap` fourni par Fontsource, et préférer le sous-ensemble latin si le paquet l'expose (research R1, R2)
- [X] T005 Ajouter les jetons dans le bloc `@theme` de `src/index.css` : `--font-sans: 'IBM Plex Sans Variable', <pile système actuelle conservée comme repli>`, `--icon-stroke: 1.75`, `--icon-size: 1em`, `--panel-width: clamp(380px, 36vw, 520px)` (data-model, research R4)
- [X] T006 Faire pointer `:root { font-family }` de `src/index.css` sur `var(--font-sans)` en remplacement de la pile système écrite en dur
- [X] T007 [P] Créer `src/components/icons.tsx` : dictionnaire des chemins des 9 icônes (`mapPin`, `search`, `star`, `check`, `arrowLeft`, `arrowUp`, `arrowDown`, `crosshair`, `locate`), composant `Icon({ name, className })` et fonction `iconSvg(name): string` lisant **le même** dictionnaire — contrat C1 ; chaque SVG porte `stroke="currentColor"`, `fill="none"`, `aria-hidden="true"`, `focusable="false"`, `width`/`height` à `1em`, et `stroke-width` issu de `--icon-stroke`
- [X] T008 [P] Ajouter la mention de licence ISC de Lucide en commentaire d'en-tête de `src/components/icons.tsx` si ses tracés ont servi de référence de dessin (research R3)

**Checkpoint**: la police est chargée et le jeu d'icônes est disponible ; les stories peuvent commencer

---

## Phase 3: User Story 1 - La liste des stations à gauche, la carte à droite (Priority: P1) 🎯 MVP

**Goal**: sur ordinateur, tableau en colonne gauche bornée et carte pleine hauteur à droite ; la fiche
remplace le tableau dans la colonne sans perdre l'état de celui-ci.

**Independent Test**: `specs/007-refonte-ui-sobre/quickstart.md` section V1 et V2 — sur 1280 × 800, la colonne mesure 440–520 px, 10 stations
sont lisibles sans défiler, la carte occupe toute la hauteur, et l'aller-retour vers une fiche restitue
tri, défilement et sélection.

### Implementation for User Story 1

- [X] T009 [US1] Créer `src/components/DesktopLayout.tsx` selon le contrat C3 : props `controls`, `table`, `card`, `map`, `status`, `searchHere` ; deux zones côte à côte, colonne gauche à `var(--panel-width)`, carte occupant le reste sur 100 % de la hauteur, **aucune zone pleine largeur au-dessus**
- [X] T010 [US1] Dans `src/components/DesktopLayout.tsx`, rendre `table` **et** `card` dans la colonne gauche, le tableau recevant l'attribut `hidden` quand `card` n'est pas `null` — le tableau ne doit jamais être démonté, faute de quoi la position de défilement est perdue (research R6, SC-013)
- [X] T011 [US1] Dans `src/components/DesktopLayout.tsx`, poser `status` sur la carte (en haut, centré) et `searchHere` au-dessus de la carte, jamais dans la colonne (contrat C3, règles 4 et 5)
- [X] T012 [US1] Remplacer la branche `if (isTable)` de `src/App.tsx` par un appel à `DesktopLayout`, en supprimant le bandeau de carte `h-[32vh]` et l'`aside` de 380 px de la fiche ; `overflow: hidden` reste sur la racine pour que la page ne défile pas (FR-002, FR-005)
- [X] T013 [US1] Dans `src/App.tsx`, déplacer le titre « Carbumap » et la ligne de sous-titre dans les `controls` de la colonne gauche, en supprimant le `<header>` pleine largeur (FR-002, FR-022)
- [X] T014 [US1] Adapter `src/components/StationTable.tsx` à la colonne étroite : conserver la suppression de la colonne « Mise à jour » sous 1024 px (prop `compact` existante) et vérifier que les colonnes Prix et Distance restent alignées à 380 px de large sans défilement horizontal (FR-008, SC-011)
- [ ] T015 [US1] Vérifier la story avec `specs/007-refonte-ui-sobre/quickstart.md` section V1 (six observations à 1280 × 800, puis 1600 × 900 pour SC-003, puis 900 × 800 pour FR-008) et V2 (aller-retour vers la fiche)

**Checkpoint**: la disposition demandée est livrée et vérifiable seule — c'est le MVP

---

## Phase 4: User Story 2 - Une typographie qui donne une voix à l'application (Priority: P1)

**Goal**: rendu typographique identique partout, chiffres alignés, quatre niveaux de hiérarchie.

**Independent Test**: `specs/007-refonte-ui-sobre/quickstart.md` section V4 — la police n'est plus la police système, `1.899` et `2.111` ont la
même largeur, aucun texte invisible au chargement, et la hiérarchie se lit sans lire le contenu.

### Implementation for User Story 2

- [X] T016 [US2] **Contrôle bloquant** : afficher `1.899` et `2.111` l'un sous l'autre dans le tableau et comparer les largeurs à l'inspecteur — la présence de `tnum` dans le fichier variable n'a pas pu être confirmée sur pièce (research R1). Si les largeurs diffèrent, appliquer dans `src/index.css` le repli `font-feature-settings: 'tnum' 1`, et en dernier recours basculer sur `@fontsource/ibm-plex-sans` (version statique)
- [X] T017 [US2] Vérifier dans `src/index.css` que les quatre niveaux `--text-label`, `--text-body`, `--text-price`, `--text-title` restent cohérents avec les métriques d'IBM Plex Sans, et ajuster les graisses employées (500/600/700/800 aujourd'hui) vers les valeurs offertes par l'axe `wght` 100–700 (FR-014)
- [X] T018 [P] [US2] Appliquer la hiérarchie à quatre niveaux dans `src/components/StationRows.tsx` : prix dominant, adresse en texte courant, distance et date en secondaire (FR-014)
- [X] T019 [P] [US2] Appliquer la hiérarchie à quatre niveaux dans `src/components/CheapestSummary.tsx` (FR-014)
- [X] T020 [P] [US2] Appliquer la hiérarchie à quatre niveaux dans `src/components/StationCard.tsx` : prix du carburant choisi dominant, puis le reste (FR-014, 006 FR-013)
- [X] T021 [P] [US2] Appliquer la hiérarchie à quatre niveaux dans `src/components/StatusMessage.tsx` (FR-014, FR-026)
- [ ] T022 [US2] Vérifier la story avec `specs/007-refonte-ui-sobre/quickstart.md` section V4, points 1 à 5, en incluant le chargement sous throttling « lent 3G » (FR-013, SC-006)

**Checkpoint**: l'application a sa propre voix typographique, indépendamment de la disposition

---

## Phase 5: User Story 3 - Des icônes dessinées, zéro emoji (Priority: P1)

**Goal**: plus aucun emoji ni caractère-pictogramme ; les 9 icônes viennent toutes de `icons.tsx`.

**Independent Test**: `specs/007-refonte-ui-sobre/quickstart.md` section V3 — la recherche d'emojis dans `src/` ne renvoie que des commentaires,
`<svg` n'apparaît que dans `icons.tsx`, et chaque icône suit la couleur de son texte dans les deux thèmes.

### Implementation for User Story 3

- [X] T023 [P] [US3] Remplacer l'emoji 📍 par `<Icon name="mapPin" />` dans `src/components/OriginBadge.tsx` (ligne 12) et ajouter `<Icon name="locate" />` au bouton « Ma position », aujourd'hui sans icône (FR-015, FR-016)
- [X] T024 [P] [US3] Remplacer l'emoji 🔍 par `<Icon name="search" />` dans `src/components/PlaceSearch.tsx` (ligne 122) (FR-015)
- [X] T025 [P] [US3] Remplacer le caractère `★` par `<Icon name="star" />` dans `src/components/badges.tsx` (ligne 7), le texte « Le moins cher » restant présent (FR-016, FR-019)
- [X] T026 [P] [US3] Remplacer le caractère `✓` par `<Icon name="check" />` dans `src/components/ChipGroup.tsx` (ligne 48) (FR-016)
- [X] T027 [P] [US3] Remplacer le caractère `←` par `<Icon name="arrowLeft" />` dans `src/components/StationCard.tsx` (ligne 33) (FR-016)
- [X] T028 [P] [US3] Remplacer les caractères `↑`/`↓` par `<Icon name="arrowUp" />` / `<Icon name="arrowDown" />` dans `src/components/StationTable.tsx` (ligne 57) (FR-016)
- [X] T029 [P] [US3] Remplacer le caractère `⌖` par `<Icon name="crosshair" />` dans `src/components/SearchHereButton.tsx` (ligne 12) (FR-016)
- [X] T030 [US3] Remplacer le `★` injecté en chaîne HTML par `iconSvg('star')` dans `priceIcon()` de `src/components/MapView.tsx` (ligne 37) — c'est le cas qui impose `iconSvg`, `L.divIcon` n'acceptant que du HTML (contrat C2 règle 4, research R3)
- [X] T031 [US3] Adapter le style de `.price-marker__label` dans `src/index.css` pour que l'étoile SVG s'aligne sur le prix (alignement vertical et espacement), la taille suivant `--icon-size`
- [ ] T032 [US3] Vérifier la story avec `specs/007-refonte-ui-sobre/quickstart.md` section V3 : les deux commandes `grep` et le contrôle visuel des deux thèmes, plus l'annonce au lecteur d'écran (FR-018, SC-004)

**Checkpoint**: aucun emoji dans l'interface ; un seul jeu d'icônes, une seule source

---

## Phase 6: User Story 4 - Des contrôles hiérarchisés plutôt qu'un tapis de pastilles (Priority: P2)

**Goal**: trois niveaux visuels de contrôles, et « Chercher ici » flottant sur la carte, révélé
seulement après un déplacement utilisateur.

**Independent Test**: `specs/007-refonte-ui-sobre/quickstart.md` section V5 — trois niveaux au plus, et la séquence en six étapes du bouton
« Chercher ici », dont le cas piège : sélectionner une station recentre la carte **sans** faire
apparaître le bouton.

### Tests for User Story 4 (obligatoire — constitution III)

- [X] T033 [P] [US4] Créer `tests/unit/searchHere.test.ts` couvrant les 7 cas de la table de vérité de data-model.md : `(false,'ready')→false`, `(true,'ready')→true`, `(true,'loading')→false`, `(true,'locating')→false`, `(true,'error')→true`, `(true,'no-position')→true`, `(false,'loading')→false`

### Implementation for User Story 4

- [X] T034 [US4] Créer `src/domain/searchHere.ts` exportant la fonction pure `shouldOfferSearchHere({ mapMoved, status })` : renvoie `true` si et seulement si `mapMoved` est `true` **et** `status` n'est ni `'locating'` ni `'loading'` ; aucun accès au DOM, au réseau, au stockage ni à l'horloge (contrat C5, constitution III)
- [X] T035 [US4] Ajouter la prop `onUserMove: () => void` à `src/components/MapView.tsx` et un `programmaticMoveRef` levé juste avant les trois déplacements internes — `fitBounds` (recadrage après recherche), `panInside` (sélection) et `setView` (vue initiale) ; le gestionnaire `moveend` baisse le drapeau sans rien signaler s'il est levé, et appelle `onUserMove()` sinon (contrat C2, research R5)
- [X] T036 [US4] Ajouter l'état `mapMovedSinceSearch` dans `src/App.tsx` : passe à `true` sur `onUserMove`, revient à `false` dès qu'une recherche aboutit, valeur initiale `false` (data-model)
- [X] T037 [US4] Dans `src/App.tsx`, ne rendre `SearchHereButton` que si `shouldOfferSearchHere({ mapMoved: mapMovedSinceSearch, status: status.status })` renvoie `true`, dans les deux dispositions (FR-023, FR-009)
- [X] T038 [US4] Passer `src/components/SearchHereButton.tsx` au niveau « action principale » du contrat C4 : `bg-brand`, `text-brand-ink`, `shadow-float`, et positionnement flottant sur la carte
- [X] T039 [P] [US4] Passer le bouton « Ma position » de `src/components/OriginBadge.tsx` au niveau « action secondaire » : `border-line`, `bg-surface`, **retirer `shadow-float`** (contrat C4)
- [X] T040 [P] [US4] Retirer `shadow-float` des pastilles de `src/components/ChipGroup.tsx` — niveau « choix » (contrat C4 règle 1)
- [X] T041 [P] [US4] Passer le bouton « Réessayer » de `src/components/StatusMessage.tsx` au niveau « action secondaire » (contrat C4)
- [X] T042 [US4] Regrouper les contrôles mobiles de `src/App.tsx` sur **une seule rangée** au lieu des deux à trois rangées actuelles, en restant sous 20 % de la hauteur à 360 × 740 (FR-021, SC-007)
- [ ] T043 [US4] Vérifier la story avec `specs/007-refonte-ui-sobre/quickstart.md` section V5 (hiérarchie + les six étapes de la séquence « Chercher ici ») et V6 (les cinq points mobiles à 360 px)

**Checkpoint**: les quatre user stories sont livrées

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T044 Mettre à jour `README.md` : décrire la disposition à deux colonnes sur ordinateur et **lever la contradiction déjà présente** entre « liste dans un panneau latéral » et « tableau comparatif sous un bandeau de carte » (constitution VI, `specs/007-refonte-ui-sobre/quickstart.md` section V8-6)
- [X] T045 [P] Mettre à jour `specs/006-affichage-informations/spec.md` en marquant FR-002 et FR-008 comme remplacées par 007 FR-002, comme 006 l'avait fait pour 002 FR-011 et 004 FR-004 (constitution VI)
- [ ] T046 Vérifier les contrastes dans les deux thèmes : ≥ 4,5:1 pour le texte courant, ≥ 3:1 pour grands textes, icônes et bordures porteuses de sens (`specs/007-refonte-ui-sobre/quickstart.md` section V7, SC-009)
- [ ] T047 Parcourir toute l'interface au clavier et vérifier que l'indicateur de focus est visible partout, dans les deux thèmes (`specs/007-refonte-ui-sobre/quickstart.md` section V7, SC-008)
- [ ] T048 Vérifier l'interface à 200 % de taille de police système sur les deux dispositions : aucun chevauchement, aucun texte tronqué involontaire (`specs/007-refonte-ui-sobre/quickstart.md` section V7, SC-011)
- [ ] T049 Vérifier qu'aucune transition ne se joue avec « réduire les animations » activé (`specs/007-refonte-ui-sobre/quickstart.md` section V7, FR-026)
- [ ] T050 Vérifier la bascule 767 ↔ 768 px : carburant, rayon, résultats, tri, sélection et fiche ouverte sont conservés (`specs/007-refonte-ui-sobre/quickstart.md` section V7, SC-012)
- [ ] T051 Dérouler les scénarios d'acceptation de 001, 002, 003, 005 et 006, hors les exigences de disposition remplacées par FR-002 (`specs/007-refonte-ui-sobre/quickstart.md` section V7, SC-010)
- [ ] T052 Construire et installer l'APK (`npm run build && npm run android:sync && npm run android:apk`), puis l'ouvrir **réseau coupé** : la typographie doit être identique à la version en ligne (`specs/007-refonte-ui-sobre/quickstart.md` section V4, FR-012, SC-005)
- [ ] T053 Dérouler `specs/007-refonte-ui-sobre/quickstart.md` section V8 : `npm test` vert, `@fontsource-variable/ibm-plex-sans` présente, `motion` absente, aucune librairie d'icônes, aucun secret dans le diff, interface vérifiée à 360 px

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance
- **Foundational (Phase 2)** : dépend de Setup — **bloque les quatre stories**
- **US1 (Phase 3)** : après Foundational. Ne dépend d'aucune autre story
- **US2 (Phase 4)** : après Foundational. Indépendante d'US1
- **US3 (Phase 5)** : après Foundational, et en particulier après T007 (`icons.tsx`)
- **US4 (Phase 6)** : après Foundational. Voir les conflits ci-dessous
- **Polish (Phase 7)** : après les stories souhaitées

### Conflits de fichiers entre stories ⚠️

Les stories sont indépendantes **fonctionnellement**, pas **textuellement**. Trois fichiers sont touchés
par plusieurs stories et ne doivent pas être édités en parallèle :

| Fichier | Stories | Ordre imposé |
|---|---|---|
| `src/App.tsx` | US1 (T012, T013), US4 (T036, T037, T042) | US1 avant US4 |
| `src/components/MapView.tsx` | US3 (T030), US4 (T035) | US3 avant US4 |
| `src/components/StationTable.tsx` | US1 (T014), US3 (T028) | US1 avant US3 |
| `src/components/StationCard.tsx` | US2 (T020), US3 (T027) | US2 avant US3 |
| `src/components/StatusMessage.tsx` | US2 (T021), US4 (T041) | US2 avant US4 |
| `src/index.css` | Foundational (T004–T006), US2 (T016, T017), US3 (T031) | dans l'ordre des phases |

**Conséquence** : l'ordre de phases US1 → US2 → US3 → US4 satisfait toutes ces contraintes. C'est
l'ordre retenu, et il coïncide avec l'ordre de priorité de la spec.

### Within Each User Story

- T033 (test) peut être écrit avant T034 (implémentation) ; c'est la seule paire test/implémentation
- Les jetons avant les composants qui les emploient
- Vérification quickstart en dernier dans chaque phase

### Parallel Opportunities

- **Phase 2** : T007 et T008 touchent le même fichier — T008 suit T007. T004–T006 sont séquentiels (même fichier `index.css`)
- **Phase 4 (US2)** : T018, T019, T020, T021 → quatre fichiers distincts, parallélisables
- **Phase 5 (US3)** : T023 à T029 → sept fichiers distincts, parallélisables. T030 et T031 suivent
- **Phase 6 (US4)** : T039, T040, T041 → trois fichiers distincts, parallélisables
- **Phase 7** : T045 est parallélisable ; les autres sont des vérifications manuelles séquentielles

---

## Parallel Example: User Story 3

```bash
# Les sept remplacements de pictogrammes touchent sept fichiers différents :
Task: "T023 OriginBadge.tsx — 📍 → Icon mapPin, + Icon locate sur « Ma position »"
Task: "T024 PlaceSearch.tsx — 🔍 → Icon search"
Task: "T025 badges.tsx — ★ → Icon star"
Task: "T026 ChipGroup.tsx — ✓ → Icon check"
Task: "T027 StationCard.tsx — ← → Icon arrowLeft"
Task: "T028 StationTable.tsx — ↑↓ → Icon arrowUp / arrowDown"
Task: "T029 SearchHereButton.tsx — ⌖ → Icon crosshair"

# Puis, séquentiellement, le cas Leaflet et son style :
# T030 MapView.tsx — iconSvg('star') ; T031 index.css — alignement de l'étoile
```

---

## Implementation Strategy

### MVP First (User Story 1 seule)

1. Phase 1 : Setup — la police entre, `motion` sort
2. Phase 2 : Foundational — jetons et `icons.tsx`
3. Phase 3 : US1 — la disposition demandée
4. **STOP et VALIDER** : `specs/007-refonte-ui-sobre/quickstart.md` section V1 et V2
5. C'est le cœur de la demande : la liste est à gauche, la carte est enfin pleine hauteur

### Incremental Delivery

1. Setup + Foundational → socle prêt
2. + US1 → disposition ordinateur corrigée → **MVP démontrable**
3. + US2 → l'application a sa voix typographique
4. + US3 → plus aucun emoji
5. + US4 → contrôles hiérarchisés et « Chercher ici » discret
6. Phase 7 → documentation et vérifications transverses

Chaque étape est démontrable seule et ne casse pas la précédente.

### Note sur le travail à plusieurs

Le tableau des conflits de fichiers ci-dessus rend la parallélisation entre stories risquée :
`App.tsx`, `MapView.tsx` et `StationTable.tsx` sont chacun touchés par deux stories. À plusieurs, mieux
vaut paralléliser **à l'intérieur** d'une phase (US3 offre sept tâches simultanées) que entre phases.

---

## Notes

- `[P]` = fichiers différents, aucune dépendance
- Les numéros de ligne cités (OriginBadge.tsx:12, PlaceSearch.tsx:122, badges.tsx:7, ChipGroup.tsx:48, StationCard.tsx:33, StationTable.tsx:57, SearchHereButton.tsx:12, MapView.tsx:37) proviennent d'un relevé sur le code au 2026-09-18 ; les revérifier s'ils ont bougé
- T016 est un **contrôle**, pas une certitude : c'est le seul point du plan qui n'a pas pu être vérifié sur pièce
- Le `×` de `src/index.css:177` est un caractère de commentaire (« 44 × 44 px »), pas un pictogramme : il reste
- Commiter après chaque tâche ou groupe logique

---

## État au 2026-09-18

**41 / 53 tâches faites.** Les 12 restantes sont **toutes des vérifications visuelles** à mener dans un
navigateur (T015, T022, T032, T043, T046 à T053). Aucune n'est une tâche de code : le code des quatre
user stories est écrit, `npm run typecheck` passe, `npm test` passe (91 tests, dont 8 nouveaux), et
`npm run build` produit un bundle complet avec la police embarquée.

Ces douze-là ne peuvent pas être cochées sans ouvrir l'application : mesurer une colonne, compter des
stations visibles, comparer des contrastes, tester au clavier, installer l'APK hors ligne.

### Écarts par rapport au plan, assumés

1. **T010 — la fiche se superpose au tableau, elle ne le masque pas par `hidden`.** `display: none`
   remet `scrollTop` à zéro dans les navigateurs, ce qui aurait cassé SC-013 — l'exigence même que la
   tâche servait. Le tableau reste dans le flux, la fiche est posée par-dessus en `absolute`, et
   `inert` met le tableau hors d'atteinte du clavier pendant ce temps.
2. **T014 — le seuil du tableau compact passe de 1024 px à 1280 px.** `--panel-width` vaut
   `clamp(380px, 36vw, 520px)` : à 1024 px de fenêtre la colonne ne fait que 380 px, bien trop peu
   pour quatre colonnes. Le seuil suit désormais la largeur de la colonne. 006 FR-003 et FR-014 ont
   été mis à jour en conséquence (T045).
3. **T016 — résolu par inspection du fichier de police, pas au navigateur.** `tnum` est absent du
   fichier variable, mais les dix chiffres ont déjà la même chasse (600 unités) : FR-011 est satisfaite
   par défaut. Effet de bord découvert au passage : l'axe s'arrête à 700, donc les trois
   `font-extrabold` (800) du code ne produisaient aucune différence visible. Corrigés en 700.
4. **007 FR-002 corrigée** : elle annonçait remplacer 006 FR-008, ce qui était faux — cette exigence
   (carte visible et synchronisée dans les deux sens) reste en vigueur et est reprise par 007 FR-006.
