# Implementation Plan: Interface sobre — liste à gauche sur ordinateur, typographie et icônes propres

**Branch**: `007-refonte-ui-sobre` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-refonte-ui-sobre/spec.md`

## Summary

Troisième passe visuelle. Trois chantiers indépendants :

1. **Disposition sur ordinateur** — la carte cesse d'être un bandeau de 32 vh. `App.tsx` passe à deux
   colonnes : tableau à gauche (largeur bornée), carte pleine hauteur à droite. La fiche station
   remplace le tableau dans la colonne gauche, le tableau restant monté pour conserver son défilement.
2. **Typographie** — une seule dépendance ajoutée, `@fontsource-variable/ibm-plex-sans`, auto-hébergée
   et donc disponible hors ligne dans l'APK.
3. **Icônes et contrôles** — module SVG local (aucune dépendance), suppression des deux emojis et des
   six caractères-pictogrammes, et hiérarchisation des boutons en trois niveaux.

Une seule dépendance entre, une dépendance morte sort (`motion`, jamais importée). La seule logique
nouvelle réellement testable — faut-il proposer « Chercher ici » ? — est isolée dans une fonction pure.

## Technical Context

**Language/Version**: TypeScript 7.0.2, React 19.3.0

**Primary Dependencies**: Leaflet 1.9.4 (carte), react-modal-sheet 5.6.0 (panneau mobile),
Tailwind CSS 4.3.3 (`@theme` dans `src/index.css`), Capacitor 8.5.2 (APK Android).
**Ajoutée** : `@fontsource-variable/ibm-plex-sans` 5.3.0 (OFL-1.1, publiée le 2026-07-19) — police
auto-hébergée, seule façon de satisfaire FR-010 et FR-012 sans service externe.
**Retirée** : `motion` 13.4.0 — vérifié : aucun `import` dans `src/`. Constitution II impose de la
sortir dans le même changement.

**Storage**: N/A (préférences déjà en `localStorage`, inchangé)

**Testing**: Vitest 5.0.1, tests unitaires des fonctions pures dans `tests/unit/`

**Target Platform**: navigateurs à jour (site statique) + APK Android via Capacitor, **hors ligne pour
les ressources embarquées**

**Project Type**: application web monopage, sans backend

**Performance Goals**: transitions < 250 ms (004 FR-012) ; aucun texte invisible au chargement de la
police ; pas de décalage de mise en page perceptible

**Constraints**: aucun secret, aucun appel réseau pour la police ni les icônes ; utilisable à 360 px et
à 200 % de taille de police système ; cibles ≥ 44 × 44 px

**Scale/Scope**: 4 écrans (carte + liste, fiche, états vides/erreur, recherche de lieu), 2 dispositions,
~14 composants existants dont 9 touchés

## Constitution Check

*GATE : passé avant Phase 0, re-vérifié après Phase 1.*

| Principe | Statut | Justification |
|---|---|---|
| **I. Simplicité, pas de backend** | ✅ | Aucun backend. La police est un fichier servi avec l'application ; les icônes sont du SVG écrit dans le dépôt. |
| **II. Dépendances utiles** | ✅ | **+1** : `@fontsource-variable/ibm-plex-sans` — police auto-hébergée, reconnue, maintenue (2026-07-19), impossible à remplacer par « quelques lignes » sans recopier manuellement les woff2 et écrire les `@font-face`. **−1** : `motion`, inutilisée, retirée. **Refusée** : toute librairie d'icônes (voir research R3) — 9 icônes inline suffisent, et une librairie React ne fonctionnerait pas dans les repères Leaflet. |
| **III. Logique métier pure et testée** | ✅ | Nouvelle logique isolée dans `src/domain/searchHere.ts` (fonction pure) avec `tests/unit/searchHere.test.ts`. Le reste est présentationnel : pas de logique métier déplacée, pas de test existant invalidé. |
| **IV. Utilisable sur mobile** | ✅ | La disposition mobile ne change pas de structure. FR-021 resserre les contrôles sur une rangée ; vérification à 360 px inscrite au quickstart. |
| **V. Aucun secret** | ✅ | Aucun secret introduit ; la police et les icônes sont locales, sans appel à un CDN. |
| **VI. Documentation à jour** | ⚠️ à faire | Le `README.md` est **déjà contradictoire** : il annonce à la fois « liste dans un panneau latéral » et « tableau sous un bandeau de carte ». À reprendre dans ce changement. |

Aucune dérogation. La section Complexity Tracking reste vide.

## Project Structure

### Documentation (this feature)

```text
specs/007-refonte-ui-sobre/
├── plan.md              # Ce fichier
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── ui-contracts.md  # Phase 1
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # /speckit-tasks — non créé ici
```

### Source Code (repository root)

```text
src/
├── App.tsx                      # MODIFIÉ — deux colonnes sur ordinateur, fiche dans la colonne
├── index.css                    # MODIFIÉ — import de la police, --font-*, repères de carte
├── main.tsx                     # inchangé
├── components/
│   ├── icons.tsx                # NOUVEAU — 9 icônes SVG + rendu en chaîne pour Leaflet
│   ├── DesktopLayout.tsx        # NOUVEAU — colonne gauche + carte, extrait de App.tsx
│   ├── MapView.tsx              # MODIFIÉ — étoile en SVG, signalement des déplacements utilisateur
│   ├── SearchHereButton.tsx     # MODIFIÉ — icône, flottant sur la carte, affichage conditionnel
│   ├── OriginBadge.tsx          # MODIFIÉ — 📍 → icône
│   ├── PlaceSearch.tsx          # MODIFIÉ — 🔍 → icône
│   ├── badges.tsx               # MODIFIÉ — ★ → icône
│   ├── ChipGroup.tsx            # MODIFIÉ — ✓ → icône, niveaux visuels
│   ├── StationCard.tsx          # MODIFIÉ — ← → icône, retour vers le tableau
│   ├── StationTable.tsx         # MODIFIÉ — ↑↓ → icônes, densité en colonne étroite
│   ├── StationRows.tsx          # MODIFIÉ — typographie
│   ├── CheapestSummary.tsx      # MODIFIÉ — typographie
│   ├── StatusMessage.tsx        # MODIFIÉ — typographie, placement sur ordinateur
│   ├── MobileSheet.tsx          # inchangé
│   ├── FuelPicker.tsx           # inchangé (hérite de ChipGroup)
│   └── RadiusPicker.tsx         # inchangé (hérite de ChipGroup)
├── domain/
│   └── searchHere.ts            # NOUVEAU — fonction pure : proposer « Chercher ici » ?
└── hooks/
    └── useMediaQuery.ts         # inchangé

tests/unit/
└── searchHere.test.ts           # NOUVEAU
```

**Structure Decision**: structure existante conservée — `domain/` pour les fonctions pures testées,
`components/` pour le rendu, `hooks/` pour l'état. Un seul composant est extrait (`DesktopLayout.tsx`) :
`App.tsx` porte déjà deux branches de rendu complètes et dépasserait 250 lignes sinon.

## Constitution Check — re-évaluation après Phase 1

Le design des phases 0 et 1 n'a introduit aucune violation nouvelle, et en a évité une.

| Principe | Statut après design | Ce que la conception a changé |
|---|---|---|
| **I. Simplicité** | ✅ | Aucun backend, aucune abstraction spéculative. Un seul composant extrait, et seulement parce que `App.tsx` porte déjà deux branches de rendu complètes. |
| **II. Dépendances** | ✅ **amélioré** | Le bilan net est **nul** : +1 police, −1 `motion`. La recherche R3 a évité une seconde dépendance : un module de 9 icônes écrit sur place couvre le besoin, et il est de toute façon obligatoire pour les repères Leaflet, qui n'acceptent qu'une chaîne HTML. |
| **III. Logique pure et testée** | ✅ | Toute la nouvelle logique décidable tient dans `shouldOfferSearchHere()`, pure, avec une table de vérité de 7 cas fixée dans data-model.md. Le reste du changement est du rendu. |
| **IV. Mobile** | ✅ | La structure mobile est gelée par FR-009. V6 du quickstart vérifie les 5 points à 360 px. |
| **V. Secrets** | ✅ | Police et icônes embarquées ; aucun appel à un CDN, donc aucune clé ni aucun tiers. |
| **VI. Documentation** | ⚠️ **tâche obligatoire** | Le `README.md` se contredit **déjà** (« liste dans un panneau latéral » et « tableau sous un bandeau de carte » coexistent). 007 le rend faux une troisième fois. Inscrit au quickstart V8-6. |

**Aucun `NEEDS CLARIFICATION` ne subsiste** : les cinq questions ouvertes de la spec ont été tranchées
en clarification, et la sixième — le jeu d'icônes, explicitement laissée au plan — est résolue par R3.

**Une seule inconnue reste, et elle est assumée** : la présence de la fonctionnalité OpenType `tnum`
dans le fichier variable d'IBM Plex Sans n'a pas pu être confirmée sur pièce. Le contrat annonce donc
un **contrôle** (quickstart V4-2) plutôt qu'un fait, avec deux replis décrits en R1. C'est la seule
affirmation du plan qui ne repose pas sur une vérification directe.

## Complexity Tracking

Aucune violation à justifier.
