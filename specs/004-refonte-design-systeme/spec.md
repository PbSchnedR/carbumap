# Feature Specification: Système de design « carte d'abord », thèmes clair et sombre

**Feature Branch**: `004-refonte-design-systeme`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "désormais il faut mettre un accent sur le design desktop et mobile, actuellement c'est un design typique AI slop, il faut utiliser des skills claude comme ui ux pro max ou impeccable et pourquoi pas s'inspirer de sites de designs."

**Relation**: Refonte de la présentation de [001](../001-carte-prix-carburants/spec.md),
[002](../002-refonte-interface-carte/spec.md) et [003](../003-fiche-station-recherche-lieu/spec.md).
Toutes leurs exigences fonctionnelles restent en vigueur ; seule l'apparence change.

## Clarifications

### Session 2026-09-17

- Q: Quelle direction visuelle ? → A: « Carte d'abord, sobre », inspiration Apple Plans / Citymapper :
  carte dominante, interface réduite à des éléments flottants, une seule couleur d'accent.
- Q: Thème sombre ? → A: Oui, thèmes clair et sombre choisis automatiquement selon le réglage du
  système (pas de bouton de bascule).
- Note : aucun « skill » de design n'est disponible dans l'environnement ; la qualité visuelle est
  donc encadrée par des règles vérifiables (échelles, contrastes, cohérence) plutôt que par un outil.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Une interface qui s'efface devant la carte (Priority: P1)

Quand j'ouvre l'application, je vois d'abord la carte et les prix ; les commandes sont discrètes,
flottantes, et ne mangent pas l'écran.

**Why this priority**: C'est le cœur de la direction choisie et ce qui différencie l'application d'un
rendu générique.

**Independent Test**: À 360 × 740, mesurer la surface occupée par les commandes : la carte et le
panneau replié doivent dominer, chaque élément d'interface étant posé sur la carte plutôt que dans un
bandeau plein.

**Acceptance Scenarios**:

1. **Given** un téléphone, **When** l'application s'affiche avec des résultats, **Then** les commandes
   (carburant, rayon, recherche, position) sont des éléments flottants posés sur la carte, sans
   bandeau opaque pleine largeur.
2. **Given** un téléphone, **When** je compte les surfaces, **Then** les commandes occupent au plus
   20 % de la hauteur de l'écran, panneau replié inclus hors panneau.
3. **Given** un écran d'ordinateur, **When** l'application s'affiche, **Then** la carte occupe au moins
   65 % de la largeur de la fenêtre et le panneau latéral adopte le même langage visuel que sur mobile.
4. **Given** n'importe quel écran, **When** je parcours l'interface, **Then** une seule couleur d'accent
   est utilisée pour les actions, la couleur de mise en avant du prix le plus bas restant distincte.

---

### User Story 2 - Thème sombre automatique (Priority: P1)

Le soir, l'application passe en sombre comme le reste de mon téléphone, sans que j'aie à régler quoi
que ce soit.

**Why this priority**: Demandé explicitement ; c'est aussi ce qui rend l'application utilisable en
voiture la nuit.

**Independent Test**: Basculer le réglage du système en sombre puis en clair : l'application suit, et
tous les écrans (carte, liste, panneau, fiche, messages, recherche) restent lisibles.

**Acceptance Scenarios**:

1. **Given** le système en thème sombre, **When** j'ouvre l'application, **Then** elle s'affiche en
   sombre, y compris les repères de prix et les fonds de carte.
2. **Given** l'application ouverte, **When** je change le réglage du système, **Then** l'apparence suit
   sans rechargement.
3. **Given** l'un ou l'autre thème, **When** je regarde n'importe quel écran, **Then** les contrastes
   respectent les seuils d'accessibilité et aucune information n'est portée par la seule couleur.
4. **Given** le thème sombre, **When** je regarde la carte, **Then** le fond de carte n'éblouit pas :
   il est visuellement atténué par rapport au thème clair.

---

### User Story 3 - Une identité cohérente et soignée (Priority: P2)

L'application a l'air conçue : mêmes rayons, mêmes ombres, même typographie, mêmes espacements
partout, et des animations discrètes.

**Why this priority**: C'est ce qui sépare un rendu « générique » d'un produit fini, mais cela
s'applique après la structure (US1) et les thèmes (US2).

**Independent Test**: Parcourir tous les écrans et vérifier que chaque valeur visuelle (espacement,
rayon, ombre, taille de texte, couleur) provient d'une échelle documentée, sans valeur isolée.

**Acceptance Scenarios**:

1. **Given** l'ensemble des écrans, **When** j'inspecte les éléments, **Then** espacements, rayons,
   ombres et tailles de texte proviennent d'une échelle définie une seule fois.
2. **Given** un titre, un libellé et un texte secondaire, **When** je les compare, **Then** la
   hiérarchie typographique est visible (taille, graisse ou couleur) et constante d'un écran à l'autre.
3. **Given** les chiffres de prix et de distance, **When** ils changent, **Then** ils restent alignés
   (chiffres de largeur fixe) et ne font pas sautiller la mise en page.
4. **Given** une transition (ouverture du panneau, ouverture de la fiche, apparition d'un message),
   **When** elle se joue, **Then** elle dure moins de 250 ms et disparaît si le système demande de
   réduire les animations.
5. **Given** un état vide, un chargement ou une erreur, **When** il s'affiche, **Then** il suit le même
   langage visuel que le reste (même carte flottante, même typographie, message utile).

---

### Edge Cases

- **Lisibilité en plein soleil** : en thème clair, les textes principaux et les étiquettes de prix
  restent lisibles à luminosité élevée (contrastes renforcés plutôt que gris clairs).
- **Étiquettes de prix nombreuses** : le style des repères reste lisible quand des dizaines se
  chevauchent, dans les deux thèmes.
- **Texte long** : adresses longues, noms de ville composés et libellés de lieux ne cassent pas la mise
  en page et ne débordent pas.
- **Réglage système modifié pendant l'usage** : bascule immédiate, sans perdre le carburant, le rayon,
  les résultats, la sélection ni la fiche ouverte.
- **Taille de police du système augmentée** : l'interface reste utilisable et sans chevauchement.
- **Écran court en paysage** : les éléments flottants ne recouvrent pas la moitié de la carte.
- **Animations réduites** : aucune transition, aucun mouvement automatique.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Toutes les exigences fonctionnelles de 001, 002 et 003 MUST rester satisfaites ; aucune
  fonctionnalité MUST être ajoutée ou retirée.
- **FR-002**: L'interface MUST suivre la direction « carte d'abord » : commandes posées sur la carte
  sous forme d'éléments flottants, sans bandeau opaque pleine largeur sur mobile.
- **FR-003**: Sur mobile, les commandes visibles hors panneau MUST occuper au plus 20 % de la hauteur
  de l'écran.
- **FR-004**: ~~Sur ordinateur (≥ 768 px), la carte MUST occuper au moins 65 % de la largeur de la
  fenêtre.~~ **Remplacée par 006 FR-002** (2026-09-17) : la carte devient un bandeau au-dessus du
  tableau comparatif.
- **FR-005**: L'application MUST proposer un thème clair et un thème sombre, choisis automatiquement
  d'après le réglage du système, et MUST suivre un changement de ce réglage sans rechargement.
- **FR-006**: Le thème sombre MUST s'appliquer à tous les éléments, y compris les repères de prix, les
  panneaux, les messages et le fond de carte, qui MUST être atténué.
- **FR-007**: Dans les deux thèmes, les contrastes MUST atteindre au moins 4,5:1 pour le texte courant
  et 3:1 pour les grands textes, icônes, repères et bordures porteuses de sens.
- **FR-008**: Une seule couleur d'accent MUST être utilisée pour les actions ; la mise en avant du prix
  le plus bas MUST rester distincte de cette couleur d'accent et reconnaissable sans la couleur.
- **FR-009**: Espacements, rayons, ombres, tailles et graisses de texte MUST provenir d'échelles
  définies une seule fois et réutilisées partout.
- **FR-010**: La hiérarchie typographique MUST être appliquée de façon constante : titre, information
  principale (prix), information secondaire (adresse, distance, date).
- **FR-011**: Les valeurs chiffrées (prix, distances) MUST utiliser des chiffres de largeur fixe pour
  éviter les sautillements.
- **FR-012**: Les transitions MUST durer moins de 250 ms et MUST être supprimées lorsque le système
  demande de réduire les animations.
- **FR-013**: Les états de chargement, vides et d'erreur MUST suivre le même langage visuel que les
  écrans normaux.
- **FR-014**: L'interface MUST rester utilisable lorsque la taille de police du système est augmentée
  (jusqu'à 200 % de la taille par défaut) : pas de texte tronqué ni de chevauchement.
- **FR-015**: Toutes les cibles interactives MUST conserver au moins 44 × 44 px (constitution,
  principe IV).
- **FR-016**: L'application MUST porter une identité visuelle propre : nom et icône cohérents,
  reconnaissables sur l'onglet du navigateur et sur l'écran d'accueil.

### Key Entities *(include if feature involves data)*

Aucune nouvelle donnée. Une notion de présentation s'ajoute :

- **Thème** : clair ou sombre, déduit du réglage du système ; non stocké, non modifiable par
  l'utilisateur dans cette version.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sur un écran de 360 × 740, les commandes hors panneau occupent au plus 20 % de la hauteur.
- **SC-002**: ~~Sur une fenêtre de 1280 × 800, la carte occupe au moins 65 % de la largeur.~~
  **Remplacé par 006 SC-001** : au moins 10 stations lisibles sans défiler sur cette même fenêtre.
- **SC-003**: 100 % des couples couleur texte / fond utilisés atteignent 4,5:1 (texte courant) ou 3:1
  (grands textes, icônes, repères), dans les deux thèmes.
- **SC-004**: Le changement de thème système est répercuté en moins d'une seconde, sans rechargement et
  sans perte d'état.
- **SC-005**: 100 % des valeurs d'espacement, de rayon, d'ombre et de taille de texte employées
  appartiennent aux échelles documentées (aucune valeur isolée).
- **SC-006**: À 200 % de taille de police système, aucun texte tronqué ni chevauchement sur les écrans
  principaux.
- **SC-007**: 100 % des scénarios d'acceptation de 001, 002 et 003 passent encore.
- **SC-008**: Toutes les transitions durent moins de 250 ms et disparaissent avec « réduire les
  animations ».

## Assumptions

- **Références visuelles** : Apple Plans et Citymapper pour la structure (carte dominante, éléments
  flottants, panneau bas) ; l'inspiration porte sur les principes, aucun élément graphique n'est copié.
- **Pas de bouton de thème** : le réglage suit le système, conformément à la réponse donnée ; un
  sélecteur manuel serait une fonctionnalité en plus.
- **Fond de carte** : le thème sombre atténue le fond via un traitement du rendu de la carte plutôt que
  par un service de tuiles payant ou nécessitant une clé (constitution, principes I, II et V).
- **Typographie** : polices système, pour éviter une dépendance et un téléchargement de police ; la
  hiérarchie repose sur les tailles, graisses et couleurs.
- **Icône et nom** : « Carbumap », icône simple dessinée dans le projet (pas d'achat ni de service
  externe).
- **Pas de nouvelle donnée ni de nouvel écran** : les écrans existants sont redessinés.
- **Hors périmètre** : thème choisi à la main, personnalisation par l'utilisateur, illustrations ou
  animations complexes, changement de bibliothèque de carte, refonte des textes.
