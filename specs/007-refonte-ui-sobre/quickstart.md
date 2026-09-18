# Phase 1 — Validation : interface sobre (007)

Guide de vérification, à dérouler avant de considérer 007 terminée. Chaque section indique **ce qu'on
observe**, pas comment le coder.

## Prérequis

```bash
npm install          # installe @fontsource-variable/ibm-plex-sans
npm run typecheck
npm test
npm run dev          # http://localhost:5173
```

Les trois commandes doivent passer avant toute vérification visuelle. `npm test` couvre notamment le
nouveau `tests/unit/searchHere.test.ts`.

---

## V1 — Disposition sur ordinateur (US1)

Fenêtre **1280 × 800**, résultats chargés autour d'une grande ville (rayon 10 km).

| # | Observation attendue | Exigence |
|---|---|---|
| 1 | Le tableau est dans une colonne à gauche ; la carte occupe tout le reste, du haut au bas de la fenêtre | FR-002, SC-001 |
| 2 | Aucun bandeau ne traverse la page au-dessus des deux colonnes | FR-002, SC-014 |
| 3 | Au moins **10 stations** lisibles sans défiler dans la colonne | FR-004, SC-002 |
| 4 | La colonne mesure entre 440 et 520 px (inspecteur) | FR-003 |
| 5 | Défiler le tableau ne déplace pas la carte, et la page elle-même ne défile pas | FR-005 |
| 6 | Cliquer une ligne met le repère en évidence ; cliquer un repère ramène la ligne dans la vue | FR-006 |

Puis **1600 × 900** : la colonne est plafonnée à 520 px et la part de largeur de la carte a augmenté
par rapport à 1280 px → **SC-003**.

Puis **900 × 800** : la colonne se réduit, la colonne « Mise à jour » disparaît, aucun défilement
horizontal de la page → **FR-008, SC-011**.

---

## V2 — Fiche station sur ordinateur (US1)

1. Sélectionner une station, trier par distance, faire défiler le tableau vers le bas, puis ouvrir la
   fiche d'une station visible.
2. **Attendu** : la fiche occupe la colonne gauche ; la carte **n'a ni bougé ni changé de taille** ; la
   station reste en évidence sur la carte. → FR-007
3. Revenir au tableau.
4. **Attendu** : le tri par distance, la position de défilement **et** la ligne sélectionnée sont
   exactement ceux d'avant l'ouverture. → SC-013

C'est le point le plus facile à rater : si la position de défilement saute en haut, le tableau a été
démonté (voir research R6).

---

## V3 — Aucun emoji, un seul jeu d'icônes (US3)

```bash
# Doit ne renvoyer QUE des lignes de commentaire (le « × » de « 44 × 44 px »).
grep -rnP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2190}-\x{21FF}\x{FE0F}]' src/

# Doit ne renvoyer que src/components/icons.tsx.
grep -rln '<svg' src/
```

Puis, à l'œil : les icônes de position, recherche, moins cher, retour, tri et « Chercher ici »
partagent la même graisse de trait et la même taille. Basculer le thème système : chaque icône suit la
couleur de son texte. → FR-015 à FR-017, SC-004

**Lecteur d'écran** : les icônes accompagnées de texte ne sont pas annoncées ; un bouton réduit à une
icône annonce son intitulé. → FR-018

---

## V4 — Typographie (US2)

| # | Observation attendue | Exigence |
|---|---|---|
| 1 | Les textes sont rendus en IBM Plex Sans, pas en police système (inspecteur → onglet Rendu) | FR-010, SC-005 |
| 2 | **Contrôle des chiffres** : dans la colonne des prix, `1.899` et `2.111` ont exactement la même largeur | FR-011 |
| 3 | Au chargement (throttling réseau « lent 3G »), aucun texte n'est invisible | FR-013, SC-006 |
| 4 | Au basculement du repli vers IBM Plex Sans, aucun saut de mise en page perceptible | FR-013, SC-006 |
| 5 | Prix, adresse et information secondaire se distinguent sans lire | FR-014 |

Le point 2 est le contrôle annoncé en research R1 : si les largeurs diffèrent, `tnum` n'est pas actif
dans la fonte variable et il faut appliquer le repli décrit là-bas.

**Hors ligne (FR-012, SC-005)** :

```bash
npm run build && npm run android:sync && npm run android:apk
```

Installer l'APK, couper le réseau, ouvrir l'application : la typographie est identique.

---

## V5 — Contrôles et « Chercher ici » (US4)

**Hiérarchie** — sur les deux dispositions, trois niveaux visuels au plus ; seul « Chercher ici » porte
l'accent plein et une ombre. → FR-020, C4

**Affichage conditionnel** — la séquence complète :

1. Charger des résultats sans toucher à la carte → « Chercher ici » **absent**.
2. Faire glisser la carte → le bouton **apparaît**.
3. Le presser → la recherche se relance, le bouton **disparaît**.
4. Zoomer à la molette, puis aux boutons `+`/`−` → il réapparaît dans les deux cas.
5. Sélectionner une station dans le tableau (la carte se recentre toute seule) → le bouton **reste
   absent**. C'est le cas piège de research R5.
6. Pendant un chargement, déplacer la carte → le bouton reste absent jusqu'à la fin.

→ FR-023, SC-014

---

## V6 — Mobile (US4, non-régression)

Écran **360 × 740**, en conditions tactiles.

| # | Observation attendue | Exigence |
|---|---|---|
| 1 | Carte plein écran et panneau glissant à trois positions, comme avant | FR-009 |
| 2 | Les six carburants sont tous visibles et touchables **sans aucun défilement horizontal** ; les contrôles tiennent sur **au plus deux rangées** | FR-021, SC-007, 002 FR-007 |
| 3 | Ces contrôles occupent au plus 25 % de la hauteur | FR-021, SC-007 |
| 4 | Aucun défilement horizontal | SC-011 |
| 5 | Toutes les cibles font au moins 44 × 44 px | FR-024, SC-008 |

---

## V7 — Thèmes, accessibilité, non-régression

- **Contrastes** : en clair et en sombre, texte courant ≥ 4,5:1, grands textes / icônes / bordures
  porteuses de sens ≥ 3:1. → FR-026, SC-009
- **Focus clavier** : parcourir toute l'interface à la touche Tab ; l'indicateur est visible partout,
  dans les deux thèmes. → FR-025, SC-008
- **Police système à 200 %** : aucun chevauchement, aucun texte tronqué involontaire, sur les deux
  dispositions. → SC-011
- **Animations réduites** : aucune transition ne se joue. → FR-026
- **Bascule 767 ↔ 768 px** : carburant, rayon, résultats, tri, sélection et fiche ouverte sont
  conservés. → SC-012
- **Scénarios antérieurs** : dérouler les scénarios d'acceptation de 001, 002, 003, 005 et 006, hors
  les exigences de disposition remplacées par FR-002. → SC-010

---

## V8 — Contrôles de constitution

| # | Contrôle | Principe |
|---|---|---|
| 1 | `npm test` passe, y compris `searchHere.test.ts` | III |
| 2 | `package.json` : `@fontsource-variable/ibm-plex-sans` ajoutée, **`motion` retirée** | II |
| 3 | Aucune librairie d'icônes n'a été ajoutée | II |
| 4 | Aucun secret dans le diff | V |
| 5 | Interface vérifiée à 360 px (V6) | IV |
| 6 | `README.md` à jour : la contradiction « panneau latéral » / « bandeau de carte » est levée, la disposition à deux colonnes est décrite | VI |

Le point 2 est facile à oublier : `motion` n'est importée nulle part aujourd'hui (vérifié), et la
constitution impose de retirer une dépendance qui ne sert plus dans le même changement.
