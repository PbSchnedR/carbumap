# Feature Specification: APK Android produit à chaque tag `v*`

**Feature Branch**: `005-apk-android-tag`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "il faut faire un github actions pour générer un apk à la création de tag v*"

**Relation**: N'ajoute aucune fonctionnalité à l'application ; il s'agit de la distribuer sous forme
d'application Android installable, à partir du site existant (001 à 004).

## Clarifications

### Session 2026-09-17

- Q: Comment produire l'APK ? → A: Empaqueter le site web dans une application Android (approche
  Capacitor), plutôt qu'une coquille pointant vers un site hébergé ou une simple PWA installable.
- Q: Que faire si aucune release GitHub n'existe pour le tag ? → A: L'automatisation crée la release
  pour ce tag, puis y attache l'APK.
- Q: Que fait le bouton « retour » d'Android ? → A: Il ferme d'abord la fiche station, puis replie le
  panneau, et ne quitte l'application qu'ensuite.
- Q: Dépôt GitHub public ou privé ? → A: Public — Actions gratuites et APK téléchargeable sans compte.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un APK produit automatiquement à chaque version (Priority: P1)

Je pose un tag `v1.0.0` sur le dépôt : quelques minutes plus tard, un APK correspondant à cette
version est disponible au téléchargement, sans aucune manipulation de ma part.

**Why this priority**: C'est la demande ; sans automatisation, il faut une machine avec l'outillage
Android installé.

**Independent Test**: Créer un tag `v0.0.1-test` sur le dépôt et vérifier qu'un APK apparaît,
téléchargeable, et que son numéro de version correspond au tag.

**Acceptance Scenarios**:

1. **Given** le dépôt hébergé sur GitHub, **When** un tag de la forme `v*` est poussé, **Then** une
   exécution automatique démarre et produit un APK.
2. **Given** une exécution réussie et aucune release préexistante pour ce tag, **When** l'exécution se
   termine, **Then** la release du tag a été créée et l'APK y est attaché et téléchargeable.
3. **Given** une release déjà créée à la main pour ce tag, **When** l'exécution se termine, **Then**
   l'APK y est attaché sans que la release soit remplacée.
4. **Given** un tag `v1.2.3`, **When** j'inspecte l'application installée, **Then** sa version affichée
   correspond à `1.2.3`.
5. **Given** un push sur une branche ordinaire (sans tag), **When** rien d'autre n'est fait, **Then**
   aucun APK n'est produit.
6. **Given** une erreur pendant la construction (tests, types ou compilation Android), **When**
   l'exécution se termine, **Then** elle échoue visiblement et aucun APK incomplet n'est publié.

---

### User Story 2 - Une application installable qui fonctionne comme le site (Priority: P1)

J'installe l'APK sur mon téléphone : l'application s'ouvre en plein écran, me localise et affiche les
prix, exactement comme le site.

**Why this priority**: Un APK qui ne fonctionne pas sur le terrain n'a aucun intérêt ; c'est le seul
moyen de vérifier que l'emballage est correct.

**Independent Test**: Installer l'APK produit sur un téléphone Android, accepter la localisation et
vérifier qu'une liste de stations classées s'affiche.

**Acceptance Scenarios**:

1. **Given** l'APK installé, **When** j'ouvre l'application, **Then** elle s'affiche en plein écran,
   sans barre d'adresse ni élément de navigateur visible.
2. **Given** l'application ouverte pour la première fois, **When** elle demande la localisation,
   **Then** l'autorisation Android est demandée et, une fois accordée, les stations proches
   s'affichent.
3. **Given** l'application ouverte, **When** j'utilise la carte, la recherche de lieu et la fiche
   station, **Then** tout fonctionne comme sur le site (001 à 004).
4. **Given** l'application installée, **When** je regarde l'écran d'accueil, **Then** son nom et son
   icône sont ceux du projet.
5. **Given** aucune connexion réseau, **When** j'ouvre l'application, **Then** le message d'erreur
   prévu s'affiche, sans écran blanc ni plantage.
6. **Given** une fiche station ouverte, **When** j'appuie sur le bouton « retour » d'Android, **Then**
   la fiche se ferme et je reviens à la liste, sans quitter l'application.
7. **Given** le panneau des stations ouvert ou à mi-hauteur et aucune fiche ouverte, **When** j'appuie
   sur « retour », **Then** le panneau se replie sans quitter l'application.
8. **Given** le panneau replié et aucune fiche ouverte, **When** j'appuie sur « retour », **Then**
   l'application se ferme.

---

### Edge Cases

- **Tag malformé** (`v`, `version-1`) : soit l'exécution ne démarre pas, soit elle échoue clairement,
  sans publier d'APK.
- **Tag reposé ou exécution relancée** : la publication remplace ou complète proprement la release,
  sans erreur bloquante.
- **Tests ou types en échec** : la construction s'arrête avant de produire un APK.
- **Autorisation de localisation refusée sur le téléphone** : l'application reste utilisable via
  « Chercher ici » et la recherche de lieu (comportement de 001 et 003).
- **Ancienne version d'Android** : la version minimale acceptée est annoncée ; en dessous,
  l'installation est simplement impossible.
- **Bouton « retour » sur un écran sans rien à fermer** (chargement, message d'erreur, aucune position) :
  l'application se ferme, comme n'importe quelle application Android.
- **APK non signé pour une distribution publique** : l'utilisateur est informé que l'installation
  demande d'autoriser les « sources inconnues ».

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le projet MUST être un dépôt Git hébergé sur GitHub, en **dépôt public** ; c'est un
  prérequis à toute automatisation (aujourd'hui, le dossier n'est pas un dépôt).
- **FR-002**: Une automatisation MUST se déclencher uniquement lorsqu'un tag de la forme `v*` est
  poussé.
- **FR-003**: L'automatisation MUST vérifier les types et exécuter les tests avant toute construction ;
  un échec MUST interrompre l'exécution sans produire d'APK.
- **FR-004**: L'automatisation MUST construire le site puis produire un APK contenant cette version du
  site.
- **FR-005**: La version de l'application MUST être dérivée du tag (`v1.2.3` → version `1.2.3`).
- **FR-006**: L'APK MUST être attaché à la release GitHub correspondant au tag, sous un nom contenant
  le nom du projet et la version. Si cette release n'existe pas, l'automatisation MUST la créer.
- **FR-016**: L'APK publié MUST être téléchargeable depuis un téléphone sans compte GitHub ni
  authentification.
- **FR-007**: L'application installée MUST s'ouvrir en plein écran, sans élément de navigateur visible.
- **FR-008**: L'application installée MUST pouvoir demander et utiliser la localisation de l'appareil.
- **FR-009**: L'application installée MUST offrir les mêmes fonctions que le site (001 à 004), sans
  ajout ni retrait.
- **FR-010**: L'application MUST porter le nom et l'icône du projet sur l'écran d'accueil.
- **FR-011**: Aucun secret MUST figurer dans le dépôt ; si une signature d'application est mise en
  place, la clé MUST rester un secret du dépôt GitHub, jamais un fichier versionné (constitution,
  principe V).
- **FR-012**: La version minimale d'Android supportée MUST être documentée dans le README.
- **FR-013**: La procédure de publication (poser un tag, récupérer l'APK, installer) MUST être
  documentée dans le README (constitution, principe VI).
- **FR-014**: La construction locale de l'APK MUST rester possible sans l'automatisation, pour pouvoir
  diagnostiquer un échec.

- **FR-015**: Dans l'application installée, le bouton « retour » d'Android MUST fermer d'abord la fiche
  station si elle est ouverte, puis replier le panneau des stations s'il est ouvert, et ne quitter
  l'application que lorsqu'il n'y a plus rien à fermer.

### Key Entities *(include if feature involves data)*

- **Version** : identifiant issu du tag (`v1.2.3`), porté par l'APK et par la release.
- **Artefact APK** : fichier produit par l'automatisation, attaché à la release, nommé avec le projet
  et la version.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Après avoir poussé un tag `v*`, un APK téléchargeable est disponible en moins de
  20 minutes, sans intervention manuelle.
- **SC-002**: 100 % des exécutions déclenchées par un tag valide produisent soit un APK publié, soit un
  échec explicite ; aucune ne publie d'APK incomplet.
- **SC-003**: L'APK s'installe sur un téléphone Android à jour et l'application s'ouvre en moins de
  5 secondes.
- **SC-004**: Depuis l'application installée, l'utilisateur voit la station la moins chère autour de
  lui en moins de 15 secondes, localisation acceptée.
- **SC-005**: La version affichée dans les informations de l'application correspond au tag dans 100 %
  des cas.
- **SC-006**: 100 % des scénarios d'acceptation de 001 à 004 se comportent dans l'application comme sur
  le site.
- **SC-007**: Aucun secret ni clé n'est présent dans le dépôt après la mise en place.
- **SC-008**: Depuis une fiche station ouverte, il faut exactement 2 appuis sur « retour » pour revenir
  à la carte avec le panneau replié, et 3 pour quitter l'application.

## Assumptions

- **Prérequis non satisfait aujourd'hui** : le projet n'est ni un dépôt Git ni hébergé sur GitHub. La
  création du dépôt public et son envoi sur GitHub font partie de cette fonctionnalité (FR-001), et
  supposent un compte GitHub. Le dépôt étant public, le code, les specs et l'historique seront
  visibles de tous : il ne doit contenir ni secret ni donnée personnelle (constitution, principe V).
- **Emballage** : l'application web est empaquetée dans une application Android qui l'embarque
  (approche retenue lors des clarifications) ; l'application reste dépendante du réseau pour les prix,
  les photos et les tuiles de carte.
- **Signature** : APK signé avec une clé de débogage par défaut, donc installable en autorisant les
  « sources inconnues ». Une signature de publication (clé stockée en secret GitHub) reste possible
  plus tard sans changer le reste.
- **Distribution** : par la release GitHub uniquement ; aucune publication sur le Play Store, qui
  demanderait un compte développeur payant et une signature de publication.
- **iOS** : hors périmètre.
- **Version minimale d'Android** : celle par défaut de l'outil d'emballage retenu, à documenter.
- **Hors périmètre** : mise à jour automatique de l'application installée, notifications, mode hors
  ligne, fonctionnalités natives supplémentaires.
