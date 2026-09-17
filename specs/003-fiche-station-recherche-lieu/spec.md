# Feature Specification: Sélection depuis la carte, recherche de lieu et fiche station

**Feature Branch**: `003-fiche-station-recherche-lieu`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Améliorations de l'interface utilisateur : si je click sur le prix d'une station, faut que ça me sélectionne la station, malgré la localisation active par défaut, quand même activer la recherche de lieu, pouvoir avoir un visuel à la google maps pour les lieux (photo, si possible aussi ajouter des raccourcis google maps si possible)"

**Relation**: S'ajoute à [001](../001-carte-prix-carburants/spec.md) (classement, carte, distances) et
[002](../002-refonte-interface-carte/spec.md) (carte plein écran, panneau, prix le plus bas). Toutes
leurs exigences restent en vigueur.

## Clarifications

### Session 2026-09-17

- Q: Quelle source pour la photo d'une station ? → A: Photos de rue libres et sans clé (type
  Panoramax), en acceptant une couverture inégale et des photos parfois anciennes.
- Q: Quels raccourcis Google Maps ? → A: « Voir dans Google Maps » et « Itinéraire », sans Street View.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sélectionner une station depuis la carte (Priority: P1)

Je touche l'étiquette de prix d'une station sur la carte : la station est sélectionnée, comme si je
l'avais touchée dans la liste.

**Why this priority**: Manque le plus visible aujourd'hui — les prix sont affichés sur la carte mais
ne réagissent pas ; c'est aussi le plus simple à livrer.

**Independent Test**: Avec des résultats chargés, toucher une étiquette de prix sur la carte : elle
est mise en évidence et la ligne correspondante est marquée comme sélectionnée dans la liste.

**Acceptance Scenarios**:

1. **Given** des résultats affichés, **When** l'utilisateur touche l'étiquette de prix d'une station,
   **Then** cette station devient la station sélectionnée, sur la carte et dans la liste.
2. **Given** une station sélectionnée depuis la carte, **When** l'utilisateur ouvre la liste,
   **Then** la ligne de cette station y est marquée comme sélectionnée et visible sans la chercher.
3. **Given** une station sélectionnée, **When** l'utilisateur touche l'étiquette d'une autre station,
   **Then** seule la nouvelle station est sélectionnée.
4. **Given** une station sélectionnée depuis la carte, **When** l'utilisateur touche une zone vide de
   la carte, **Then** la sélection est conservée (elle ne se perd pas par accident).

---

### User Story 2 - Chercher un lieu même quand la localisation fonctionne (Priority: P1)

Je saisis une ville ou une adresse pour voir les prix là-bas, sans avoir à refuser la localisation ni
à déplacer la carte à la main.

**Why this priority**: Demandé explicitement ; c'est le seul moyen simple de préparer un trajet ou de
comparer une autre ville.

**Independent Test**: Localisation acceptée ; saisir « Gennevilliers », choisir la proposition : la
recherche se relance autour de ce lieu et les distances sont comptées depuis ce lieu.

**Acceptance Scenarios**:

1. **Given** l'application localisée sur ma position, **When** j'ouvre la recherche de lieu et saisis
   au moins 3 caractères, **Then** des propositions de lieux apparaissent pendant la saisie.
2. **Given** des propositions affichées, **When** j'en choisis une, **Then** la carte se recentre sur ce
   lieu, la recherche de stations est relancée autour de lui et les distances sont comptées depuis lui.
3. **Given** une recherche par lieu active, **When** je veux revenir à ma position, **Then** une action
   visible me le permet en un geste.
4. **Given** une saisie sans résultat ou un service de recherche indisponible, **When** j'attends les
   propositions, **Then** un message clair l'indique et l'application reste utilisable.
5. **Given** la recherche de lieu, **When** je regarde l'écran, **Then** « Chercher ici » (002) reste
   disponible : les deux façons de choisir un point coexistent.

---

### User Story 3 - Voir une fiche station avec photo et raccourcis (Priority: P2)

Quand une station est sélectionnée, j'ouvre une fiche qui montre une photo du lieu, ses informations
et des raccourcis vers Google Maps.

**Why this priority**: Apporte le « visuel à la Google Maps » demandé, mais suppose la sélection
(US1) et n'est pas indispensable pour comparer les prix.

**Independent Test**: Sélectionner une station, ouvrir sa fiche : adresse, prix du carburant choisi
avec sa date, distance, photo du lieu quand il en existe une, et deux raccourcis Google Maps qui
ouvrent la bonne station.

**Acceptance Scenarios**:

1. **Given** une station sélectionnée, **When** j'ouvre sa fiche, **Then** j'y vois son adresse, sa
   ville, la distance, le prix du carburant choisi et sa date de mise à jour.
2. **Given** une fiche ouverte pour une station ayant une photo disponible à proximité, **When** la
   fiche s'affiche, **Then** une photo du lieu est visible, avec la mention de son auteur et de sa
   licence, et sa date de prise de vue.
3. **Given** une station sans photo disponible, **When** la fiche s'affiche, **Then** un espace neutre
   explique qu'aucune photo n'est disponible, sans erreur ni attente visible.
4. **Given** une fiche ouverte, **When** je touche « Voir dans Google Maps » ou « Itinéraire »,
   **Then** Google Maps s'ouvre dans un nouvel onglet sur cette station.
5. **Given** une fiche ouverte, **When** je la ferme, **Then** je reviens à la liste et à la carte, la
   station restant sélectionnée.
6. **Given** une fiche ouverte, **When** la station propose d'autres carburants, **Then** leurs prix et
   dates sont également affichés.

---

### Edge Cases

- **Étiquettes de prix superposées** (Paris, 20 km) : le toucher sélectionne la station dont
  l'étiquette est au premier plan ; la station la moins chère et la station sélectionnée restent
  au-dessus des autres (002, FR-010).
- **Étiquette touchée au doigt** : la zone touchable de l'étiquette respecte la taille minimale, sans
  agrandir visuellement l'étiquette au point de masquer les voisines.
- **Recherche de lieu hors de France** : le service ne couvre que la France ; l'application l'indique
  plutôt que de laisser croire à une panne.
- **Lieu choisi sans aucune station dans le rayon** : le message « aucune station » de 001 s'affiche,
  et le lieu reste le point de recherche.
- **Photo lente à charger** : la fiche reste utilisable, la photo apparaît quand elle est prête, et un
  échec de chargement est traité comme une absence de photo.
- **Photo ancienne** : la date de prise de vue est affichée pour éviter de croire qu'elle est récente.
- **Sans connexion** : la fiche affiche les informations déjà connues ; la photo et les raccourcis
  restent sans effet ou indisponibles, sans bloquer l'écran.
- **Clavier virtuel ouvert pendant la recherche de lieu** : le champ et les propositions restent
  visibles sur mobile.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Toucher l'étiquette de prix d'une station sur la carte MUST sélectionner cette station,
  avec le même effet qu'une sélection depuis la liste (mise en évidence, marquage dans la liste,
  panneau amené à mi-hauteur sur mobile).
- **FR-002**: La sélection MUST rester unique : sélectionner une station en désélectionne une autre.
- **FR-003**: La sélection depuis la carte MUST rendre la ligne correspondante visible dans la liste
  sans que l'utilisateur ait à la chercher.
- **FR-004**: Les étiquettes de prix MUST offrir une zone touchable d'au moins 44 × 44 px.
- **FR-005**: L'application MUST proposer une recherche de lieu (ville ou adresse) accessible en
  permanence, que la localisation soit disponible ou non.
- **FR-006**: À partir de 3 caractères saisis, le système MUST proposer des lieux correspondants et
  limiter les appels au service de recherche pendant la frappe.
- **FR-007**: Choisir un lieu MUST en faire le point de recherche : la carte s'y recentre, les stations
  y sont rechargées et les distances sont comptées depuis ce lieu.
- **FR-008**: Le lieu actif MUST être affiché, avec une action visible pour revenir à la position de
  l'appareil.
- **FR-009**: « Chercher ici » (002, FR-013) MUST rester disponible.
- **FR-010**: Une fiche station MUST être ouvrable pour la station sélectionnée, depuis la liste comme
  depuis la carte.
- **FR-011**: La fiche MUST afficher : adresse, ville, distance, prix du carburant choisi avec sa date
  de mise à jour et son éventuel signalement « ancien », et les prix des autres carburants proposés.
- **FR-012**: La fiche MUST afficher une photo du lieu lorsqu'une photo libre est disponible à
  proximité de la station, avec sa date de prise de vue, l'auteur et la licence.
- **FR-013**: En l'absence de photo, d'erreur ou de lenteur du service de photos, la fiche MUST rester
  complète et utilisable, en indiquant simplement l'absence de photo.
- **FR-014**: La fiche MUST proposer deux raccourcis ouvrant Google Maps dans un nouvel onglet sur la
  station : « Voir dans Google Maps » et « Itinéraire ».
- **FR-015**: Le système MUST NOT calculer d'itinéraire lui-même : le raccourci délègue à Google Maps
  (les itinéraires restent hors périmètre, 001).
- **FR-016**: Aucun service utilisé MUST exiger une clé ou un secret côté navigateur (constitution,
  principes I et V).
- **FR-017**: La fermeture de la fiche MUST ramener à la liste et à la carte, la station restant
  sélectionnée.

### Key Entities *(include if feature involves data)*

- **Lieu** (nouveau) : résultat de recherche ; libellé affichable, type (ville, adresse) et position
  géographique. Devient le point de recherche de 001 quand il est choisi.
- **Photo de lieu** (nouveau) : image associée à une position ; adresse de l'image, date de prise de
  vue, auteur, licence. Absente pour de nombreuses stations.
- **Station**, **Prix**, **Carburant**, **Point de recherche** : inchangés (001).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sélectionner une station depuis la carte demande 1 toucher.
- **SC-002**: Sur 10 touchers d'étiquettes à 360 px de large, 10 sélectionnent la station visée.
- **SC-003**: Les propositions de lieux apparaissent en moins de 1 seconde après la fin de la frappe,
  sur une connexion mobile 4G.
- **SC-004**: Choisir un lieu affiche le classement autour de ce lieu en moins de 10 secondes (même
  objectif que 001, SC-001).
- **SC-005**: Ouvrir la fiche d'une station demande au plus 2 touchers depuis l'écran principal
  (sélection puis ouverture), et la fiche s'affiche en moins de 1 seconde hors photo.
- **SC-006**: Les raccourcis ouvrent Google Maps sur la bonne station dans 5 essais sur 5.
- **SC-007**: 100 % des scénarios d'acceptation de 001 et 002 passent encore.
- **SC-008**: Aucun défilement horizontal à 360 px et cibles ≥ 44 × 44 px, y compris les étiquettes de
  prix, le champ de recherche, les propositions et la fiche.

## Assumptions

- **Photos** : source publique de photos de rue libres, sans clé, couvrant la France de façon inégale
  (type Panoramax). Vérifié le 2026-09-17 : l'API répond sans clé et une photo existe près d'une
  station test. La photo montre la rue à proximité, pas nécessairement la station elle-même, et peut
  dater de plusieurs années — d'où l'affichage de la date.
- **Recherche de lieu** : service public d'adresses françaises, sans clé (vérifié le 2026-09-17 :
  réponse et en-tête CORS ouverts). Couverture France uniquement.
- **Raccourcis Google Maps** : liens web ordinaires construits à partir des coordonnées de la station,
  sans clé ni compte. Ouverts dans un nouvel onglet ; sur mobile, le système peut ouvrir l'application
  Google Maps si elle est installée.
- **Fiche station** : présentée dans le panneau sur mobile et dans le panneau latéral sur ordinateur,
  plutôt que dans une fenêtre superposée.
- **Ouverture de la fiche** : la sélection ne l'ouvre pas automatiquement ; une action explicite
  (toucher la ligne sélectionnée ou un bouton « Détails ») l'ouvre, pour ne pas gêner la comparaison
  des prix.
- **Photos Google écartées** : elles exigeraient une clé d'API et donc un backend (principes I et V).
- **Hors périmètre** : comptes, alertes, historique des prix, itinéraires calculés par l'application,
  avis et horaires des stations, thème sombre, photos déposées par les utilisateurs.
