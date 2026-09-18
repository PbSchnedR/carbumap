# Feature Specification: Refonte de l'affichage des informations (tableau sur ordinateur, prix dominant sur mobile)

**Feature Branch**: `006-affichage-informations`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "il faut absolument faire une refonte complète de l'interface d'affichage des informations sur desktop et mobile qui est mal gérée dans les 2 cas et trop ai slop"

**Relation**: Remplace la façon dont 001, 002, 003 et 004 présentent les informations des stations.
Les capacités fonctionnelles de ces fonctionnalités restent en vigueur, **sauf** deux exigences de
présentation explicitement remplacées ici (002 FR-011 et 004 FR-004, voir FR-002).

## Clarifications

### Session 2026-09-17

- Q: Quelle présentation sur ordinateur ? → A: Un tableau comparatif dense et triable, une ligne par
  station ; la carte devient secondaire (bandeau ou panneau réduit).
- Q: Quelle présentation d'une ligne sur mobile ? → A: Le prix domine la ligne ; adresse et distance
  passent au second plan.
- Note : les données publiques ne contiennent **ni enseigne ni nom de station** (vérifié en 001) ; la
  colonne s'intitule donc « Adresse » et affiche l'adresse puis la ville.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comparer les stations dans un tableau sur ordinateur (Priority: P1)

Sur mon écran, je vois un tableau dense : une ligne par station, des colonnes alignées, et je compare
une vingtaine de stations sans faire défiler.

**Why this priority**: C'est le reproche principal — sur ordinateur, l'information est diluée dans un
panneau étroit alors que l'écran est large.

**Independent Test**: Sur une fenêtre de 1280 × 800 avec des résultats à 20 km autour de Paris, compter
les stations lisibles sans défiler et vérifier l'alignement des colonnes.

**Acceptance Scenarios**:

1. **Given** une fenêtre d'ordinateur et des résultats chargés, **When** la page s'affiche, **Then**
   les stations sont présentées en tableau : prix, distance, adresse (et ville), date de mise à jour,
   une ligne par station.
2. **Given** le tableau affiché, **When** je le regarde, **Then** au moins 10 stations sont lisibles
   sans défiler sur une fenêtre de 1280 × 800.
3. **Given** le tableau affiché, **When** je clique sur l'en-tête d'une colonne, **Then** le tableau est
   trié sur cette colonne, le sens du tri est indiqué, et un second clic inverse ce sens.
4. **Given** un tri modifié, **When** je change de carburant ou de rayon, **Then** le tri choisi est
   conservé.
5. **Given** le tableau affiché, **When** je sélectionne une ligne, **Then** la station correspondante
   est mise en évidence sur la carte ; et sélectionner une étiquette sur la carte met en évidence la
   ligne correspondante, ramenée dans la vue.
6. **Given** les chiffres de prix et de distance, **When** je parcours les lignes, **Then** ils sont
   alignés verticalement et comparables sans effort.

---

### User Story 2 - Lire le classement d'un coup d'œil sur mobile (Priority: P1)

Sur mon téléphone, chaque ligne met le prix en avant ; l'adresse et la distance sont là, mais
discrètes.

**Why this priority**: Même reproche côté mobile : tout se ressemble, rien ne ressort.

**Independent Test**: Sur 360 × 740, panneau à mi-hauteur, vérifier que le prix est l'élément le plus
visible de chaque ligne et que le classement se lit sans lire les adresses.

**Acceptance Scenarios**:

1. **Given** le panneau ouvert sur mobile, **When** je regarde une ligne, **Then** le prix est
   l'élément typographiquement dominant, l'adresse et la distance étant nettement secondaires.
2. **Given** le panneau à mi-hauteur, **When** je regarde l'écran, **Then** au moins 3 stations
   complètes sont visibles.
3. **Given** la station la moins chère, **When** elle s'affiche, **Then** elle porte une marque
   explicite reconnaissable sans la couleur.
4. **Given** un prix de plus de 7 jours, **When** la ligne s'affiche, **Then** le signalement « ancien »
   est visible sans masquer le prix.
5. **Given** une adresse longue, **When** la ligne s'affiche, **Then** elle est tronquée proprement
   sans casser l'alignement des prix.

---

### User Story 3 - Une fiche station qui présente vraiment les informations (Priority: P2)

Quand j'ouvre une station, l'information est organisée : le prix du carburant choisi d'abord, les
autres carburants dans un tableau lisible, puis le lieu.

**Why this priority**: La fiche souffre du même défaut, mais elle est consultée après la liste.

**Independent Test**: Ouvrir une fiche et vérifier l'ordre de lecture (prix choisi, autres carburants,
lieu et actions) et l'alignement des prix des autres carburants.

**Acceptance Scenarios**:

1. **Given** une fiche ouverte, **When** elle s'affiche, **Then** le prix du carburant choisi est
   l'élément dominant, avec sa date et son éventuel signalement « ancien ».
2. **Given** une fiche ouverte, **When** la station propose d'autres carburants, **Then** ils sont
   présentés en colonnes alignées (carburant, prix, date), pas en texte courant.
3. **Given** une fiche ouverte sur ordinateur, **When** elle s'affiche, **Then** elle occupe une zone
   dédiée sans masquer le tableau.
4. **Given** une fiche sans photo disponible, **When** elle s'affiche, **Then** l'absence de photo ne
   laisse pas un grand vide : la mise en page se resserre.

---

### Edge Cases

- **Pas de nom de station** : la colonne s'intitule « Adresse » et montre l'adresse puis la ville ; si
  l'adresse est absente, la ville seule. Aucune colonne ne promet une enseigne, absente des données.
- **Beaucoup de stations** (plus de 100) : le tableau défile à l'intérieur de sa zone, les en-têtes
  restent visibles.
- **Peu de stations** (1 ou 2) : le tableau reste lisible, sans grands vides.
- **Aucune station** : message unique, cohérent avec le reste, sans en-têtes de tableau vides.
- **Égalité de prix** : les stations à égalité restent groupées et toutes marquées comme les moins
  chères.
- **Fenêtre étroite sur ordinateur** (entre 768 et 1024 px) : le tableau abandonne les colonnes les
  moins utiles plutôt que de comprimer illisiblement.
- **Tri sur une colonne avec valeurs manquantes** : les lignes sans valeur sont reléguées en fin de
  tri, quel que soit le sens.
- **Clavier et lecteur d'écran** : le tableau est navigable au clavier, les en-têtes triables sont
  annoncés comme tels et l'ordre courant est annoncé.
- **Police système agrandie** : les colonnes s'adaptent sans chevauchement (004 FR-014).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Toutes les capacités de 001, 002, 003 et 005 MUST rester disponibles ; aucune donnée
  nouvelle n'est introduite.
- **FR-002**: ~~Cette fonctionnalité **remplace** 002 FR-011 (« la carte occupe la fenêtre et la liste
  est dans un panneau latéral ») et 004 FR-004 (« la carte occupe au moins 65 % de la largeur ») : sur
  ordinateur, le tableau devient l'élément principal et la carte l'élément secondaire.~~
  **Remplacée par 007 FR-002** (2026-09-18) : le tableau revient dans une colonne à gauche et la carte
  occupe toute la hauteur à droite ; aucun des deux n'est « secondaire ».
- **FR-003**: À partir de 768 px de large, les stations MUST être présentées dans un tableau :
  quatre colonnes (prix, distance, adresse et ville, date de mise à jour) à partir de ~~1024 px~~
  **1280 px** (007 FR-003 : le seuil suit désormais la largeur de la colonne, pas celle de la fenêtre),
  et trois colonnes en dessous (voir FR-014).
- **FR-004**: Le tableau MUST afficher au moins 10 stations sans défilement sur une fenêtre de
  1280 × 800.
- **FR-005**: Les en-têtes de colonnes MUST permettre de trier le tableau, avec indication visible du
  sens ; le tri par défaut reste prix croissant puis distance croissante (001 FR-004).
- **FR-006**: Le tri choisi MUST être conservé lors d'un changement de carburant, de rayon ou de point
  de recherche, tant que la session dure.
- **FR-007**: Les valeurs numériques MUST être alignées et comparables d'une ligne à l'autre.
- **FR-008**: La carte MUST rester visible sur ordinateur et rester synchronisée avec le tableau dans
  les deux sens (sélection et mise en évidence).
- **FR-009**: Sur mobile, chaque ligne MUST présenter le prix comme élément dominant, l'adresse et la
  distance étant secondaires.
- **FR-010**: Sur mobile, au moins 3 stations complètes MUST être visibles panneau à mi-hauteur sur un
  écran de 360 × 740.
- **FR-011**: La station la moins chère et les prix de plus de 7 jours MUST rester identifiables dans
  les deux présentations, sans recours à la seule couleur.
- **FR-012**: Les dates de mise à jour MUST être exprimées de façon compacte et relative
  (« aujourd'hui », « hier », « il y a 3 j »), la date complète restant accessible dans la fiche.
- **FR-013**: La fiche station MUST présenter le prix du carburant choisi comme élément dominant, puis
  les autres carburants en colonnes alignées, puis le lieu et les actions.
- **FR-014**: En dessous de ~~1024 px~~ **1280 px** (007 FR-003), la présentation MUST dégrader le tableau en supprimant des colonnes
  plutôt qu'en les comprimant.
- **FR-015**: Le tableau MUST être utilisable au clavier et annoncé correctement par un lecteur
  d'écran (en-têtes, état de tri).
- **FR-016**: Les règles de 004 MUST continuer de s'appliquer : tokens uniques, thèmes clair et sombre,
  contrastes, cibles ≥ 44 px, transitions < 250 ms.

### Key Entities *(include if feature involves data)*

Aucune donnée nouvelle. Une notion de présentation s'ajoute :

- **Tri du tableau** : colonne (prix, distance, date) et sens (croissant, décroissant) ; valeur par
  défaut prix croissant ; non persisté entre deux sessions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sur 1280 × 800, au moins 10 stations sont lisibles sans défiler.
- **SC-002**: Sur 360 × 740, panneau à mi-hauteur, au moins 3 stations complètes sont visibles.
- **SC-003**: Trier sur une colonne demande 1 clic, et le résultat s'affiche en moins de 1 seconde.
- **SC-004**: Sur 5 essais, désigner la station la moins chère prend moins de 3 secondes sur les deux
  présentations.
- **SC-005**: 100 % des scénarios d'acceptation de 001, 002, 003 et 005 passent encore, hors les deux
  exigences explicitement remplacées (FR-002).
- **SC-006**: À 200 % de taille de police système, aucun chevauchement ni texte tronqué involontaire
  dans le tableau.
- **SC-007**: Le tableau est parcourable entièrement au clavier, et l'état de tri est annoncé.
- **SC-008**: Aucun défilement horizontal de la page à 360 px, ni entre 768 et 1024 px.

## Assumptions

- **Colonne « Adresse »** : adresse puis ville, faute de nom ou d'enseigne dans les données publiques.
- **Survol sans effet** : passer la souris sur une ligne ne met rien en évidence sur la carte ; seule la
  sélection est partagée entre le tableau et la carte, pour éviter le scintillement.
- **Seuils** : mobile sous 768 px (lignes à prix dominant), intermédiaire de 768 à 1024 px (tableau
  réduit), tableau complet au-delà.
- **Carte sur ordinateur** : conservée en bandeau ou panneau réduit, toujours interactive ; sa taille
  exacte relève du plan.
- **Tri non mémorisé** entre deux sessions : c'est un choix de consultation, pas une préférence.
- **Dates relatives** calculées à l'affichage ; au-delà de 7 jours, le nombre de jours est affiché.
- **Hors périmètre** : nouvelles données (enseigne, horaires, services), filtres supplémentaires,
  export, comparaison de plusieurs carburants à la fois, thème choisi à la main.
