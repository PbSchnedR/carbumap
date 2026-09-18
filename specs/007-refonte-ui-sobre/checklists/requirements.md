# Specification Quality Checklist: Interface sobre — liste à gauche sur ordinateur, typographie et icônes propres

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-18
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

Deux écarts volontaires, assumés plutôt que corrigés :

1. **La section « Constat de départ » cite des fichiers source.** C'est délibéré : les deux passes
   visuelles précédentes (004, 006) sont parties d'un constat non vérifié. Ici, chaque reproche de la
   demande (« emojis », « police », « boutons », « pas à gauche ») est appuyé par l'endroit exact où il
   se vérifie dans le code actuel. Ce sont des **preuves de l'état présent**, pas des instructions
   d'implémentation ; aucune exigence (FR) ne nomme de fichier, de bibliothèque ni de framework.

2. **FR-010 nomme une typographie précise (IBM Plex Sans).** C'est le résultat d'une clarification du
   2026-09-18, et la clarification devait être intégrée à une exigence pour être opposable. Une famille
   de caractères est un choix de conception, pas un choix technique : elle se voit à l'écran et se
   vérifie sans lire une ligne de code. Le reste du domaine typographique (FR-011 à FR-014) n'exprime
   que des propriétés mesurables. Le **jeu d'icônes**, lui, reste non nommé dans les exigences :
   FR-015 à FR-019 n'imposent que l'unicité, la cohérence, l'héritage de couleur et l'accessibilité ;
   Lucide et Phosphor ne sont cités que dans les hypothèses, et le choix revient au plan.

## Statut après clarification (2026-09-18)

Cinq questions posées et intégrées. Les deux décisions qui étaient signalées comme « par défaut » sont
désormais tranchées par l'utilisateur :

- colonne gauche = **tableau à colonnes**, largeur bornée 440–520 px (une liste de cartes est écartée) ;
- typographie = **IBM Plex Sans**, famille unique (Inter et Geist écartées volontairement).

Trois ambiguïtés supplémentaires, non détectées à la rédaction, ont été levées : l'emplacement de la
fiche sur ordinateur (FR-007), le maintien de la structure mobile (FR-009) et la répartition des
contrôles (FR-022, FR-023).

Aucune exigence ne reste ambiguë. Aucun point en attente avant `/speckit-plan`.
