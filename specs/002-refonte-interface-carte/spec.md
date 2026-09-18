# Feature Specification: Refonte de l'interface de la carte

**Feature Branch**: `002-refonte-interface-carte`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Refonte de l'interface de la carte. Rendu moderne et soigné, agréable sur mobile comme sur ordinateur. Sur mobile, la carte occupe l'écran et la liste des stations s'ouvre depuis le bas. Le prix le plus bas est mis en avant visuellement. Le choix du carburant se fait en un geste. Aucune nouvelle fonctionnalité."

**Relation**: Refonte visuelle et ergonomique de la fonctionnalité
[001-carte-prix-carburants](../001-carte-prix-carburants/spec.md). Toutes ses exigences
fonctionnelles (FR-001 à FR-014) restent en vigueur et inchangées ; seule la présentation change.

## Clarifications

### Session 2026-09-17

- Q: Combien de positions pour le panneau des stations sur mobile ? → A: Trois : replié, mi-hauteur,
  plein écran.
- Q: Faut-il afficher les prix sur les repères de la carte ? → A: Oui, sur tous les repères, celui du
  prix le plus bas étant mis en avant.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Carte plein écran et liste qui s'ouvre depuis le bas sur mobile (Priority: P1)

Sur mon téléphone, la carte occupe tout l'écran. La liste des stations est rangée dans un panneau en
bas de l'écran, que je fais monter pour consulter le classement et redescendre pour revoir la carte.

**Why this priority**: C'est le changement de structure demandé ; les autres améliorations
s'appuient sur cette mise en page.

**Independent Test**: Sur un écran de 360 × 740 px, ouvrir l'application avec une position simulée :
la carte occupe l'écran, le panneau replié laisse voir la carte ; le faire monter affiche la liste
classée ; le faire redescendre rend la carte visible.

**Acceptance Scenarios**:

1. **Given** un écran de téléphone et des résultats chargés, **When** l'application s'affiche,
   **Then** la carte occupe toute la largeur et toute la hauteur de l'écran, et le panneau des
   stations est replié en bas.
2. **Given** le panneau replié, **When** l'utilisateur le touche ou le fait glisser vers le haut,
   **Then** le panneau passe à mi-hauteur : les premières stations du classement et une partie de la
   carte sont visibles en même temps.
3. **Given** le panneau à mi-hauteur, **When** l'utilisateur le fait glisser vers le haut, **Then** il
   passe en plein écran et la liste complète défile dans le panneau.
4. **Given** le panneau à mi-hauteur ou en plein écran, **When** l'utilisateur le fait glisser vers le
   bas, **Then** il redescend d'une position (plein écran → mi-hauteur → replié), et un glissement
   rapide peut le replier directement.
5. **Given** le panneau à mi-hauteur ou en plein écran, **When** l'utilisateur sélectionne une station
   de la liste, **Then** le panneau passe à mi-hauteur (ou y reste) et la carte montre la station mise
   en évidence dans sa partie visible (remplace le défilement vers la carte de 001, US3 scénario 3).
6. **Given** le panneau replié ou à mi-hauteur, **When** l'utilisateur déplace ou zoome la partie
   visible de la carte, **Then** le panneau ne gêne pas ces gestes.

---

### User Story 2 - Choisir son carburant en un geste (Priority: P1)

Les six carburants sont visibles en permanence ; un seul toucher sur l'un d'eux met à jour le
classement et la carte.

**Why this priority**: Explicitement demandé ; c'est l'action la plus fréquente.

**Independent Test**: Depuis l'écran principal, toucher « E85 » : la liste et la carte passent à
l'E85 sans autre action (pas de menu à ouvrir ni de confirmation).

**Acceptance Scenarios**:

1. **Given** l'écran principal (mobile ou ordinateur), **When** l'utilisateur regarde l'interface,
   **Then** les six carburants (Gazole, SP95, E10, SP98, E85, GPL) sont visibles et le carburant
   actif est clairement distingué.
2. **Given** « Gazole » actif, **When** l'utilisateur touche « SP98 » une seule fois, **Then** la
   liste et la carte affichent le classement SP98.
3. **Given** un écran de 360 px de large, **When** les six carburants sont affichés, **Then** chacun
   reste touchable au doigt, quitte à ce que la rangée défile horizontalement à l'intérieur de sa zone
   sans faire défiler la page.

---

### User Story 3 - Repérer immédiatement le prix le plus bas (Priority: P2)

La station la moins chère se remarque au premier coup d'œil, dans la liste comme sur la carte.

**Why this priority**: Rend visible la réponse principale de l'application ; purement visuel, il
s'ajoute aux deux stories précédentes.

**Independent Test**: Avec des résultats chargés, vérifier que la ou les stations au prix le plus bas
sont visuellement distinguées des autres, dans la liste et sur la carte, et que la distinction suit
le changement de carburant.

**Acceptance Scenarios**:

1. **Given** un classement chargé, **When** l'utilisateur regarde la liste, **Then** la station au
   prix le plus bas est présentée de façon nettement distincte des autres (mise en avant visuelle en
   plus de sa première position).
2. **Given** un classement chargé, **When** l'utilisateur regarde la carte, **Then** chaque repère
   affiche le prix de sa station, et le repère de la station au prix le plus bas se distingue des
   autres et reste au premier plan.
3. **Given** plusieurs stations à égalité au prix le plus bas, **When** le classement s'affiche,
   **Then** toutes ces stations bénéficient de la mise en avant.
4. **Given** le panneau replié sur mobile, **When** des résultats sont chargés, **Then** le prix le
   plus bas et la station correspondante sont lisibles dans la partie visible du panneau.
5. **Given** le carburant ou le rayon change, **When** le classement est recalculé, **Then** la mise
   en avant passe à la nouvelle station la moins chère.

---

### User Story 4 - Rendu moderne et soigné sur ordinateur (Priority: P3)

Sur un grand écran, la carte occupe la fenêtre et la liste est affichée dans un panneau latéral au
même style soigné que sur mobile.

**Why this priority**: L'usage principal est mobile ; l'ordinateur doit rester agréable.

**Independent Test**: Sur une fenêtre de 1280 × 800 px, la carte et la liste sont visibles en même
temps, sans panneau à ouvrir, avec le même sélecteur de carburant et la même mise en avant du prix le
plus bas.

**Acceptance Scenarios**:

1. **Given** une fenêtre d'au moins 768 px de large, **When** l'application s'affiche, **Then** la
   carte et la liste des stations sont visibles simultanément, la carte occupant la plus grande
   partie de la fenêtre.
2. **Given** une fenêtre d'ordinateur, **When** l'utilisateur agrandit ou rétrécit la fenêtre en
   passant sous 768 px, **Then** l'interface bascule vers la présentation mobile sans perdre le
   carburant, le rayon, les résultats ni la station sélectionnée.

---

### Edge Cases

- **États sans résultats** (localisation en cours, chargement, localisation refusée, aucune station,
  erreur réseau) : les messages de 001 (FR-010) restent visibles sans avoir à ouvrir le panneau sur
  mobile, et le bouton « Réessayer » reste accessible.
- **« Chercher ici »** (001, FR-013) : reste accessible sur mobile sans ouvrir le panneau, et ne masque
  pas le centre de la carte, qui sert de point de recherche.
- **Liste longue** (plus de 100 stations) : la liste défile à l'intérieur du panneau ; la page
  elle-même ne défile pas.
- **Beaucoup de repères proches** (ex. : Paris, 20 km, ~400 stations) : les étiquettes de prix se
  chevauchent au zoom éloigné. Le repère du prix le plus bas et celui de la station sélectionnée
  restent au premier plan et lisibles ; les autres peuvent être partiellement recouverts.
- **Défilement dans le panneau en plein écran** : un glissement vers le bas fait d'abord remonter la
  liste ; il ne fait redescendre le panneau que lorsque la liste est déjà en haut.
- **Prix le plus bas signalé « ancien »** : la mise en avant reste, et le badge « ancien » (001,
  FR-014) reste visible à côté.
- **Station sélectionnée qui est aussi la moins chère** : les deux distinctions (sélection et prix le
  plus bas) restent reconnaissables simultanément.
- **Clavier virtuel, rotation paysage sur téléphone, petits écrans en hauteur (< 600 px)** : le panneau
  replié laisse au moins la moitié de l'écran à la carte.
- **Préférence « réduire les animations »** activée sur l'appareil : ouverture et fermeture du panneau
  sans animation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Toutes les exigences FR-001 à FR-014 de 001-carte-prix-carburants MUST rester
  satisfaites après la refonte.
- **FR-002**: Aucune nouvelle capacité fonctionnelle MUST être ajoutée : pas de nouvelle donnée
  (afficher sur la carte les prix déjà présents dans la liste n'en est pas une), pas de nouveau filtre
  ni de nouvelle action.
- **FR-003**: Sous 768 px de large, la carte MUST occuper toute la zone d'affichage, avec la liste des
  stations dans un panneau ancré en bas de l'écran.
- **FR-004**: Le panneau MUST pouvoir être ouvert et replié à la fois par un toucher (sur sa poignée
  ou son en-tête) et par un glissement vertical.
- **FR-005**: Le panneau MUST proposer trois positions : **replié**, **mi-hauteur** (liste et carte
  visibles en même temps, la carte gardant environ la moitié supérieure de l'écran) et **plein écran**
  (le sélecteur de carburant restant visible). Un toucher sur la poignée passe à la position suivante
  (replié → mi-hauteur → plein écran → replié) ; un glissement choisit la position la plus proche du
  point de relâchement, dans le sens du geste.
- **FR-006**: Replié, le panneau MUST afficher au minimum le nombre de stations trouvées et la station
  au prix le plus bas avec son prix, tout en laissant au moins 75 % de la hauteur de l'écran à la carte
  (au moins 50 % sur les écrans de moins de 600 px de haut).
- **FR-007**: Les six carburants MUST être affichés en permanence sous forme d'options directement
  touchables ; un seul toucher MUST activer un carburant, sans menu ni confirmation.
- **FR-008**: Le carburant actif MUST être distingué autrement que par la seule couleur (ex. : forme,
  graisse, icône de coche).
- **FR-009**: La ou les stations au prix le plus bas du classement courant MUST être mises en avant
  dans la liste et sur la carte, autrement que par la seule couleur.
- **FR-010**: Sur la carte, chaque repère de station MUST afficher le prix du carburant choisi, au même
  format que la liste. Le repère du prix le plus bas MUST être distingué (FR-009) et, avec celui de la
  station sélectionnée, affiché au-dessus des autres repères.
- **FR-011**: ~~À partir de 768 px de large, la carte MUST occuper la fenêtre et la liste MUST être
  visible en permanence dans un panneau latéral.~~ **Remplacée par 006 FR-002** (2026-09-17) : sur
  ordinateur, le tableau comparatif devient l'élément principal et la carte passe en bandeau.
- **FR-012**: Le passage d'une présentation à l'autre (redimensionnement, rotation) MUST conserver le
  carburant, le rayon, les résultats et la station sélectionnée.
- **FR-013**: Le choix du rayon (5/10/20 km) et « Chercher ici » MUST rester accessibles sans ouvrir le
  panneau sur mobile.
- **FR-014**: Les animations d'ouverture et de fermeture du panneau MUST être désactivées lorsque
  l'appareil demande de réduire les animations.
- **FR-015**: Le texte et les éléments porteurs d'information MUST respecter un contraste d'au moins
  4,5:1 (texte normal) et 3:1 (grands textes, icônes et repères).

### Key Entities *(include if feature involves data)*

Aucune nouvelle donnée. Les entités de 001 (Station, Prix, Carburant, Point de recherche) sont
réutilisées ; seule s'ajoute une notion dérivée d'affichage :

- **Prix le plus bas**: le plus petit prix du classement courant pour le carburant et le rayon
  choisis ; toutes les stations à ce prix sont concernées.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Changer de carburant demande exactement 1 toucher depuis l'écran principal, sur mobile
  comme sur ordinateur.
- **SC-002**: Sur un écran de 360 × 740 px, panneau replié, la carte occupe au moins 75 % de la
  hauteur de l'écran et toute sa largeur.
- **SC-003**: Passer d'une position du panneau à la position voisine demande 1 geste (toucher ou
  glissement) et le contenu est lisible en moins de 1 seconde.
- **SC-004**: Dans 5 essais sur 5 à partir d'un écran chargé, l'utilisateur désigne la station la
  moins chère en moins de 3 secondes, sans ouvrir le panneau.
- **SC-005**: 100 % des scénarios d'acceptation de 001-carte-prix-carburants passent encore, en
  tenant compte du remplacement de 001/US3 scénario 3 par US1 scénario 4 ci-dessus.
- **SC-006**: Aucun défilement horizontal de la page à 360 px ; toutes les cibles interactives
  mesurent au moins 44 × 44 px (constitution, principe IV).
- **SC-007**: Les contrastes de FR-015 sont respectés sur tous les éléments de l'interface.

## Assumptions

- **Seuil mobile / ordinateur** : 768 px de large, comme dans 001.
- **Sélecteur de carburant** : une rangée d'options touchables toujours visible, en haut de l'écran
  (au-dessus de la carte sur mobile).
- **Rayon** : reste un choix entre 5, 10 et 20 km ; il peut adopter le même style d'options touchables
  mais reste secondaire par rapport au carburant.
- **Sur ordinateur** : panneau latéral à gauche, d'une largeur fixe raisonnable, la carte occupant le
  reste de la fenêtre.
- **Thème** : clair uniquement ; un thème sombre serait une nouvelle fonctionnalité, hors périmètre.
- **Interaction carte → liste** : toucher un repère ne sélectionne toujours pas de station (non demandé
  dans 001, et exclu ici par « aucune nouvelle fonctionnalité »).
- **Documentation** : le README et les documents de 001 concernés par la présentation (quickstart
  notamment) sont mis à jour avec la refonte (constitution, principe VI).
- **Travail en attente de 001** : les tâches T040 à T042 (taille des boutons de zoom, réponse tardive
  de la localisation, méthode inutilisée) et les validations navigateur non faites de 001 restent à
  traiter ; la refonte ne doit pas les réintroduire.
- **Hors périmètre** : comptes, alertes, historique des prix, itinéraires (comme 001), thème sombre,
  nouvelles données, sélection depuis la carte.
