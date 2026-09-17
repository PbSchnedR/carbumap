<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Bump MINOR : ajout d'un principe (VI) et assouplissement du principe II. L'assouplissement reste
  compatible : tout ce qui respectait 1.0.0 respecte 1.1.0.
- Principes modifiés :
  - II. Dépendances minimales → II. Dépendances utiles, pas superflues (assoupli)
- Principes ajoutés :
  - VI. Documentation à jour
- Sections modifiées : Contraintes techniques (justification de dépendance allégée),
  Workflow et contrôles qualité (contrôles 2 et 6)
- Sections supprimées : aucune
- Artefacts à revoir (non modifiés par cette commande) :
  - specs/001-carte-prix-carburants/plan.md : Constitution Check cite encore « II. Dépendances
    minimales » et n'a pas de ligne pour VI
  - specs/001-carte-prix-carburants/quickstart.md §6 : impose « exactement » 3 dépendances
  - tasks.md T036 : même contrôle strict des dépendances
  - Aucun README n'existe encore, alors que le principe VI s'y applique
- TODO différés : aucun
-->

# Carbumap Constitution

## Core Principles

### I. Simplicité d'abord, pas de backend par défaut

Carbumap est un projet personnel : la solution la plus simple qui répond au besoin l'emporte.

- L'application MUST fonctionner entièrement côté client (site statique) tant qu'un backend
  n'est pas indispensable.
- Un backend n'est « indispensable » que si un besoin précis ne peut pas être satisfait côté
  client (ex. : secret à protéger, contournement CORS impossible, persistance partagée entre
  utilisateurs). Ce besoin MUST être écrit dans le plan de la fonctionnalité, avec les
  alternatives côté client écartées et pourquoi.
- Pas d'abstraction, de couche ou d'option de configuration « pour plus tard » (YAGNI).

Justification : chaque composant en plus est à héberger, maintenir et sécuriser, sur du temps libre.

### II. Dépendances utiles, pas superflues

- Une librairie est autorisée si elle est **reconnue** (largement utilisée) et **maintenue**
  (publication ou activité récente), et si elle **simplifie nettement le code** ou **améliore
  nettement l'interface**.
- Une dépendance MUST NOT être ajoutée si elle est **inutile** (quelques lignes de code ou une API
  native du navigateur suffisent) ou **redondante** (une dépendance déjà présente couvre le même
  besoin).
- Chaque ajout MUST être mentionné en une ligne dans le plan : ce qu'elle apporte.
- Une dépendance qui ne sert plus MUST être retirée dans le même changement.

Justification : une bonne librairie fait gagner du temps et de la qualité ; seules les
dépendances sans apport ou en double coûtent en mises à jour, failles et poids sur mobile.

### III. Logique métier pure et testée (NON NÉGOCIABLE)

- La logique métier — notamment le tri, le filtrage et le calcul de distance — MUST être
  implémentée dans des fonctions pures : sortie déterminée uniquement par les entrées, sans
  accès au DOM, au réseau, au stockage, à l'horloge ni à la géolocalisation.
- Les effets de bord (appels réseau, position de l'utilisateur, rendu) restent dans une fine
  couche d'interface qui appelle ces fonctions.
- Chaque fonction métier MUST avoir des tests automatisés couvrant le cas nominal et les cas
  limites pertinents (liste vide, valeurs manquantes, égalités de tri, distance nulle).
- Un changement de logique métier n'est terminé que si ses tests passent.

Justification : c'est là que les erreurs sont silencieuses (mauvais ordre, station manquante,
distance fausse) ; des fonctions pures se testent sans navigateur ni mock.

### IV. Utilisable sur mobile

- Chaque écran MUST être utilisable sur un écran de 360 px de large, sans défilement
  horizontal de la page.
- Les éléments interactifs MUST être utilisables au doigt (cible d'environ 44×44 px minimum)
  et ne pas dépendre du survol (hover).
- Une fonctionnalité d'interface n'est terminée qu'après vérification à largeur mobile
  (navigateur en mode responsive ou appareil réel).

Justification : l'usage principal attendu est sur téléphone, en déplacement.

### V. Aucun secret dans le code (NON NÉGOCIABLE)

- Aucune clé d'API, jeton, mot de passe ou autre secret MUST apparaître dans le code source,
  la configuration versionnée ou l'historique git.
- Tout ce qui est livré au navigateur est public : une valeur qui doit rester secrète ne peut
  donc pas être utilisée côté client. Les sources de données sans clé sont préférées ; si une
  clé secrète devient nécessaire, cela relève de l'exception backend du principe I.
- Les fichiers de secrets locaux (ex. : `.env`) MUST être ignorés par git.

Justification : un secret publié l'est définitivement, même après suppression.

### VI. Documentation à jour

- Toute modification du code MUST mettre à jour, **dans le même changement**, la documentation
  qu'elle rend inexacte ou incomplète.
- Documentation concernée :
  - le `README.md` (présentation, installation, commandes, fonctionnement) ;
  - les commentaires et JSDoc des fonctions modifiées ;
  - les artefacts de la fonctionnalité dans `specs/` (spec, plan, data-model, contracts,
    quickstart) quand le comportement, l'architecture, les dépendances ou les contrats changent.
- Un changement sans impact sur la documentation (ex. : correction interne sans effet visible)
  n'exige pas de mise à jour, mais la vérification MUST être faite.

Justification : une doc fausse est pire qu'une doc absente ; la mettre à jour au moment du
changement coûte quelques minutes, la reconstituer plus tard coûte bien plus.

## Contraintes techniques

- Livrable : application web statique, déployable sans serveur applicatif.
- Données : les appels aux sources externes sont isolés hors des fonctions métier (principe III),
  pour que ces dernières restent testables avec des données d'exemple.
- Un secret ou un backend ne sont introduits que via une justification écrite dans le plan
  (principes I et V) ; une nouvelle dépendance, via une mention d'une ligne (principe II).

## Workflow et contrôles qualité

Avant de considérer une fonctionnalité ou une modification terminée :

1. Les tests des fonctions métier passent (principe III).
2. Aucune dépendance inutile ou redondante ; chaque ajout est mentionné dans le plan (principe II).
3. Aucun secret dans le diff (principe V).
4. L'interface a été vérifiée à largeur mobile (principe IV).
5. Tout backend introduit est justifié dans le plan (principe I).
6. La documentation touchée par le changement est à jour (principe VI).

La section « Constitution Check » de chaque plan vérifie ces points.

## Governance

- Cette constitution prévaut sur les autres pratiques du projet. En cas de conflit, la
  constitution s'applique ou est amendée explicitement.
- Amendement : modifier ce fichier via `/speckit-constitution`, avec le rapport d'impact
  et la mise à jour de la version et de la date.
- Versionnage sémantique : MAJOR pour la suppression ou redéfinition incompatible d'un
  principe ; MINOR pour l'ajout d'un principe ou d'une section, ou un assouplissement
  compatible ; PATCH pour les clarifications.
- Toute dérogation à un principe MUST être consignée dans la section « Complexity Tracking »
  du plan concerné, avec sa justification.

**Version**: 1.1.0 | **Ratified**: 2026-09-17 | **Last Amended**: 2026-09-17
