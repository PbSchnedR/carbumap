# Feature Specification: Carte des stations les moins chères autour de moi

**Feature Branch**: `001-carte-prix-carburants`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Je veux une carte web qui affiche les stations-service autour de moi et les classe de la moins chère à la plus chère pour le carburant que je choisis (Gazole, SP95, E10, SP98, E85, GPL). Je vois les stations sur la carte et une liste classée à côté, avec le prix, la distance et la date de mise à jour du prix. Cliquer sur une station dans la liste la met en évidence sur la carte. Hors périmètre pour l'instant : comptes utilisateurs, alertes, historique des prix, itinéraires."

## Clarifications

### Session 2026-09-17

- Q: Que propose l'application quand la localisation est refusée ou indisponible ? → A: L'utilisateur
  déplace la carte puis lance « chercher ici » ; les distances sont calculées depuis le centre de la carte.
- Q: Quel rayon de recherche autour de la position ? → A: Au choix parmi 5, 10 et 20 km, 10 km par défaut.
- Q: Que faire d'un prix non mis à jour depuis plusieurs jours ? → A: Classé normalement, mais signalé
  comme ancien s'il date de plus de 7 jours.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trouver la station la moins chère autour de moi (Priority: P1)

J'ouvre l'application, elle me localise, je choisis mon carburant et je vois immédiatement la liste
des stations proches classées de la moins chère à la plus chère, avec pour chacune le prix, la
distance et la date de mise à jour du prix.

**Why this priority**: C'est la raison d'être de l'application : savoir où faire le plein au meilleur
prix. Sans carte, cette liste répond déjà au besoin.

**Independent Test**: Ouvrir l'application depuis une position connue, choisir « Gazole » et vérifier
que la liste affichée contient les stations proches, triées par prix croissant, avec prix, distance
et date de mise à jour.

**Acceptance Scenarios**:

1. **Given** l'utilisateur a autorisé sa localisation, **When** il choisit « SP95 », **Then** la liste
   n'affiche que les stations proches proposant du SP95, triées du prix le plus bas au plus haut.
2. **Given** la liste est affichée pour « Gazole », **When** l'utilisateur choisit « E85 », **Then** la
   liste est recalculée pour l'E85 sans qu'il ait à recharger la page.
3. **Given** deux stations ont le même prix, **When** la liste est affichée, **Then** la plus proche
   apparaît en premier.
4. **Given** une station de la liste, **When** l'utilisateur la regarde, **Then** il voit son nom ou son
   adresse, le prix du carburant choisi, la distance depuis sa position et la date de mise à jour
   de ce prix.

---

### User Story 2 - Voir les stations sur une carte (Priority: P2)

En plus de la liste, je vois une carte centrée sur ma position où chaque station de la liste est
placée, pour repérer d'un coup d'œil celles qui sont sur mon chemin.

**Why this priority**: La carte donne le contexte géographique que la distance seule ne donne pas,
mais la liste classée apporte déjà l'essentiel de la valeur.

**Independent Test**: Avec une liste affichée, vérifier que la carte montre la position de
l'utilisateur et un repère pour chaque station de la liste, et uniquement celles-là.

**Acceptance Scenarios**:

1. **Given** la liste est affichée pour un carburant, **When** l'utilisateur regarde la carte, **Then**
   chaque station de la liste y a un repère et sa propre position y est indiquée.
2. **Given** l'utilisateur change de carburant, **When** la liste est mise à jour, **Then** les repères
   de la carte correspondent à la nouvelle liste.
3. **Given** l'utilisateur est sur un téléphone, **When** il utilise l'application, **Then** il peut
   consulter la carte et la liste sans défilement horizontal de la page.

---

### User Story 3 - Repérer sur la carte une station de la liste (Priority: P3)

Quand je touche une station dans la liste, elle est mise en évidence sur la carte pour que je voie
exactement où elle se trouve.

**Why this priority**: Fait le lien entre les deux vues ; utile mais dépend des deux précédentes.

**Independent Test**: Toucher la troisième station de la liste et vérifier que son repère est
visuellement distingué des autres et visible à l'écran.

**Acceptance Scenarios**:

1. **Given** la liste et la carte sont affichées, **When** l'utilisateur sélectionne une station dans
   la liste, **Then** son repère est mis en évidence et la carte se déplace si nécessaire pour qu'il
   soit visible.
2. **Given** une station est mise en évidence, **When** l'utilisateur en sélectionne une autre, **Then**
   seule la nouvelle station est mise en évidence.
3. **Given** l'utilisateur est sur un téléphone où la carte n'est pas visible en même temps que la
   liste, **When** il sélectionne une station, **Then** la carte lui est montrée avec la station mise
   en évidence.

---

### Edge Cases

- L'utilisateur refuse la localisation, ou elle est indisponible : un message l'indique, la carte
  s'affiche sur une vue par défaut, et l'utilisateur peut la déplacer puis lancer « chercher ici »
  (FR-013).
- Aucune station ne propose le carburant choisi dans la zone : un message l'indique clairement au lieu
  d'une liste vide muette.
- Une station proche ne propose pas le carburant choisi : elle n'apparaît ni dans la liste ni sur la
  carte pour ce carburant.
- Un prix a plus de 7 jours : il reste classé selon son montant, mais il est signalé comme ancien
  (FR-014).
- Une station est en rupture (temporaire ou définitive) du carburant choisi, même si un dernier prix
  connu existe : elle est traitée comme ne proposant pas ce carburant (FR-005).
- Les données de prix ne peuvent pas être récupérées (hors ligne, source indisponible) : un message
  explique le problème et permet de réessayer ; aucune liste fausse ou périmée n'est présentée comme
  à jour.
- La position de l'utilisateur est approximative : la distance affichée reste calculée depuis la
  position fournie par l'appareil.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système MUST déterminer la position de l'utilisateur avec son accord.
- **FR-002**: Le système MUST afficher les stations situées dans un rayon choisi par l'utilisateur
  parmi 5, 10 et 20 km (10 km par défaut) autour du point de recherche ; changer de rayon met à jour
  la liste et la carte.
- **FR-003**: Users MUST be able to choisir un carburant parmi exactement : Gazole, SP95, E10, SP98,
  E85, GPL.
- **FR-004**: Le système MUST classer les stations proposant le carburant choisi par prix croissant ;
  à prix égal, par distance croissante.
- **FR-005**: Le système MUST exclure du classement et de la carte les stations qui ne proposent pas le
  carburant choisi : sans prix pour ce carburant, ou en rupture (temporaire ou définitive) de ce
  carburant.
- **FR-006**: Pour chaque station listée, le système MUST afficher son nom ou à défaut son adresse, le
  prix du carburant choisi, la distance depuis l'utilisateur et la date de mise à jour de ce prix.
- **FR-007**: Le système MUST afficher une carte montrant la position de l'utilisateur et un repère pour
  chaque station du classement courant.
- **FR-008**: Lorsque l'utilisateur sélectionne une station dans la liste, le système MUST mettre en
  évidence son repère sur la carte, s'assurer qu'il est visible, et retirer la mise en évidence de la
  station précédemment sélectionnée.
- **FR-009**: Le changement de carburant MUST mettre à jour la liste et la carte sans rechargement de
  la page.
- **FR-010**: Le système MUST informer l'utilisateur, par un message explicite, quand aucune station ne
  correspond, quand la localisation est impossible, ou quand les prix ne peuvent pas être récupérés.
- **FR-011**: L'interface MUST être utilisable sur un écran de téléphone de 360 px de large sans
  défilement horizontal de la page (constitution, principe IV).
- **FR-012**: Les distances MUST être affichées en kilomètres (ou en mètres sous 1 km) et les prix en
  euros par litre avec trois décimales.
- **FR-013**: Quand la position de l'utilisateur n'est pas disponible, le système MUST permettre de
  déplacer la carte puis de lancer une recherche « chercher ici » ; le centre de la carte devient alors
  le point de recherche et le point de départ des distances.
- **FR-014**: Le système MUST signaler visuellement comme « ancien » tout prix dont la date de mise à
  jour a plus de 7 jours ; ce signalement ne modifie pas le classement.

### Key Entities *(include if feature involves data)*

- **Station**: point de vente de carburant ; nom ou adresse, ville, position géographique, et les
  prix des carburants qu'elle propose.
- **Prix**: prix d'un carburant dans une station ; type de carburant, montant en euros par litre,
  date de mise à jour.
- **Carburant**: l'un des six types sélectionnables (Gazole, SP95, E10, SP98, E85, GPL).
- **Point de recherche**: point géographique depuis lequel les stations sont cherchées et les distances
  calculées ; la position de l'utilisateur, ou le centre de la carte après « chercher ici ».

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Depuis l'ouverture de l'application et l'acceptation de la localisation, l'utilisateur
  voit la station la moins chère pour son carburant en moins de 10 secondes sur une connexion mobile
  4G.
- **SC-002**: Le changement de carburant met à jour la liste en moins d'une seconde.
- **SC-003**: Sur un jeu de stations de référence, 100 % des classements respectent l'ordre prix
  croissant puis distance croissante, et 100 % des stations sans le carburant choisi en sont absentes.
- **SC-004**: Les distances affichées s'écartent de moins de 1 % des distances à vol d'oiseau de
  référence pour ce jeu de stations.
- **SC-005**: Toutes les tâches (choisir un carburant, lire le classement, repérer une station sur la
  carte) sont réalisables au doigt sur un téléphone de 360 px de large, sans défilement horizontal.

## Assumptions

- **Territoire** : la France ; les six carburants listés sont ceux des données publiques officielles
  des prix des carburants en France.
- **Source de données** : une source publique consultable sans clé secrète est disponible et fournit,
  par station, sa position, ses prix par carburant et leur date de mise à jour (constitution,
  principes I et V). À confirmer lors du plan.
- **Distance** : distance à vol d'oiseau ; le calcul de trajet routier relève des itinéraires, hors
  périmètre.
- **Carburant par défaut** : Gazole à la première ouverture ; le dernier carburant choisi est retenu
  sur l'appareil pour les visites suivantes.
- **Mise en page mobile** : sur petit écran, la liste et la carte ne sont pas côte à côte mais empilées
  ou accessibles par bascule ; « à côté » s'applique aux écrans larges.
- **Sélection depuis la carte** : toucher un repère sur la carte pour mettre en évidence la station
  dans la liste n'est pas demandé et n'est pas inclus.
- **Rafraîchissement** : les prix sont récupérés à l'ouverture et sur demande (réessai) ; pas de mise à
  jour automatique en continu.
- **Hors périmètre** : comptes utilisateurs, alertes, historique des prix, itinéraires.
