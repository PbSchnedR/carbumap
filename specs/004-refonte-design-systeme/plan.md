# Implementation Plan: Système de design « carte d'abord », thèmes clair et sombre

**Branch**: `004-refonte-design-systeme` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-refonte-design-systeme/spec.md`

## Summary

Refonte visuelle sans changement fonctionnel : un jeu de tokens unique (couleurs, espacements, rayons,
ombres, typographie, durées) déclaré une seule fois dans le CSS, décliné en thème clair et sombre
d'après le réglage système, et appliqué à tous les composants existants. La structure passe en
« carte d'abord » : plus de bandeau opaque, des commandes flottantes posées sur la carte, un panneau
et une fiche au même langage visuel.

## Technical Context

**Language/Version**: TypeScript 7, React 19 — inchangés.

**Primary Dependencies**: aucune nouvelle. Tailwind CSS 4 (tokens `@theme`), Leaflet, react-modal-sheet.

**Storage**: inchangé ; le thème n'est pas stocké (il suit le système).

**Testing**: Vitest sur `src/domain/` (inchangé) ; contrastes vérifiés par calcul ; le reste par le
quickstart.

**Target Platform**: navigateurs mobiles et de bureau récents.

**Project Type**: application web statique.

**Performance Goals**: transitions < 250 ms (SC-008) ; pas d'augmentation notable du poids : CSS
compressé ≤ 15 Ko, JS inchangé (~174 Ko).

**Constraints**: aucune nouvelle fonctionnalité ; contrastes 4,5:1 / 3:1 dans les deux thèmes ;
commandes ≤ 20 % de la hauteur sur mobile ; carte ≥ 65 % de la largeur sur ordinateur ; cibles
≥ 44 px ; utilisable à 200 % de taille de police.

**Scale/Scope**: 11 composants existants restylés, 1 fichier de tokens, 0 nouvel écran.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* Constitution **1.1.0**.

| Principe | Vérification | Avant | Après |
|----------|--------------|-------|-------|
| I. Simplicité, pas de backend | Aucun service ajouté ; thème sombre par media query native, pas de gestionnaire de thème | ✅ | ✅ |
| II. Dépendances utiles | Aucune dépendance ajoutée : tokens Tailwind, polices système, icône SVG écrite à la main | ✅ | ✅ |
| III. Logique pure et testée | Aucune logique métier touchée ; les tests existants doivent rester verts sans modification | ✅ | ✅ |
| IV. Mobile | Cœur de la refonte : surfaces mesurées, cibles 44 px, lisibilité en plein soleil, police système à 200 % | ✅ | ✅ |
| V. Aucun secret | Aucun service, aucune clé | ✅ | ✅ |
| VI. Documentation à jour | README (identité, thèmes) et documents de 002/003 rendus inexacts mis à jour dans le même changement | ✅ | ✅ |

Aucune violation : la section Complexity Tracking est vide.

## Phase 0 — Décisions (research)

**R1. Thème sombre sans classe ni état** — **Vérifié** par un build Tailwind 4 local le 2026-09-17 :
les utilitaires compilent en `var(--color-…)`, et redéfinir ces variables dans
`@media (prefers-color-scheme: dark) { :root { … } }` suffit à basculer toute l'interface. La variante
`dark:` de Tailwind 4 est elle aussi basée sur `prefers-color-scheme` par défaut. Donc : aucun état
React, aucun stockage, bascule immédiate au changement système (FR-005, SC-004).

**R2. Fond de carte atténué la nuit** — Filtre CSS sur les tuiles uniquement
(`.leaflet-tile { filter: … }`), pas sur l'attribution ni sur les repères. Aucun service de tuiles
sombres (qui demanderait une clé — principes I et V). À régler pour rester lisible sans virer au noir.

**R3. Typographie** — Polices système (`ui-sans-serif`…), échelle de 5 tailles en `rem` (pour suivre la
taille de police du système, FR-014), graisses 400/600/800, `font-variant-numeric: tabular-nums` sur
tous les chiffres (FR-011).

**R4. Structure « carte d'abord »** — La barre de filtres perd son fond opaque : chaque commande
devient une pastille flottante avec ombre. Le lieu actif rejoint la rangée du rayon (corrige aussi
003 T036). Cible : ≤ 20 % de 740 px, soit ≤ 148 px pour l'ensemble des commandes.

**R5. Mouvement** — Une durée unique (180 ms) et une courbe unique, en tokens ; tout est coupé sous
`prefers-reduced-motion: reduce`, y compris l'animation du panneau (déjà géré par `prefersReducedMotion`).

**R6. Identité** — Nom « Carbumap », icône SVG inline (goutte + repère) servie en favicon, et couleurs
de thème déclarées pour la barre du navigateur mobile.

## Phase 1 — Conception

### Tokens (source unique, `src/index.css`)

| Famille | Tokens |
|---------|--------|
| Couleurs | `surface`, `surface-2`, `canvas`, `ink`, `muted`, `line`, `brand`, `brand-ink`, `cheap`, `cheap-ink`, `stale`, `stale-soft`, `danger`, `danger-soft`, `overlay` |
| Espacements | échelle Tailwind par défaut, utilisée telle quelle (pas de valeur arbitraire) |
| Rayons | `--radius-pill`, `--radius-card`, `--radius-sheet` |
| Ombres | `--shadow-float`, `--shadow-panel` |
| Typo | `--text-label`, `--text-body`, `--text-price`, `--text-title` |
| Mouvement | `--ease-out`, `--duration-fast` (180 ms) |

Chaque couleur a une valeur claire et une valeur sombre ; aucune autre couleur n'est utilisée dans les
composants (FR-009, SC-005).

### Écrans

- **Mobile** : carte plein écran ; rangée 1 = pastilles carburant ; rangée 2 = rayon + lieu actif +
  loupe + « Chercher ici » ; messages flottants sous les commandes ; panneau arrondi avec poignée.
- **Ordinateur** : panneau latéral 400 px (carte ≥ 65 % sur 1280 px), même vocabulaire visuel.
- **Fiche station** : même carte flottante, photo en haut, prix mis en avant, actions en bas.

### Artefacts

```text
specs/004-refonte-design-systeme/
├── plan.md
├── quickstart.md
└── checklists/requirements.md
```

`data-model.md` et `contracts/` ne sont pas nécessaires : aucune donnée ni interface nouvelle. Le
tableau de tokens ci-dessus tient lieu de contrat de présentation.

### Source Code (repository root)

```text
index.html                 # thème de la barre navigateur, favicon SVG, titre
public/icon.svg            # icône du projet (nouveau)
src/index.css              # tokens clairs + sombres, surcharges Leaflet, filtre tuiles sombres
src/components/*.tsx       # application des tokens, structure flottante
src/App.tsx                # disposition « carte d'abord », lieu actif dans la rangée du rayon
```

**Structure Decision**: Aucun fichier nouveau hors l'icône ; tout le style reste dans `index.css` et
les classes utilitaires des composants, pour qu'un token change au même endroit pour les deux thèmes.

## Mesures relevées à l'implémentation (2026-09-17)

**Contrastes** (calcul WCAG, script hors dépôt) — 25 couples vérifiés dans chaque thème :

| Couple | Clair | Sombre | Minimum |
|--------|-------|--------|---------|
| `ink` / `surface` | 18,32 | 15,39 | 4,5 |
| `ink` / `canvas` | 15,58 | 16,83 | 4,5 |
| `muted` / `surface` | 7,33 | 7,62 | 4,5 |
| `muted` / `cheap-soft` | 6,47 | 5,89 | 4,5 |
| `brand-ink` / `brand` | 6,70 | 8,49 | 4,5 |
| `brand` / `surface` | 6,70 | 8,02 | 4,5 |
| `cheap-ink` / `cheap` | 6,58 | 9,51 | 4,5 |
| `cheap` / `cheap-soft` | 5,81 | 7,80 | 4,5 |
| `stale` / `stale-soft` | 6,05 | 7,73 | 4,5 |
| `danger` / `danger-soft` | 5,72 | 7,73 | 4,5 |
| bordure d'étiquette `muted` / fond de carte | 6,38 | 7,45 | 3 |
| étiquette `cheap` / fond de carte | 5,73 | 9,86 | 3 |
| contour de sélection `brand` / fond de carte | 5,84 | 7,84 | 3 |

Deux couples restent volontairement sous 3:1 : les traits de séparation (`line` sur `surface`, 1,3) et
le fond blanc d'une étiquette neutre sur la carte. Ce sont des éléments décoratifs : l'information est
portée par le texte (18,3 et 15,4) et par la bordure `muted`, qui, elle, atteint 6,4 et 7,5. La
bordure a d'ailleurs été renforcée de `line` à `muted` pour cette raison.

Fond de carte en thème sombre estimé à #1a1d21 après le filtre CSS ; valeur déduite, non mesurée à
l'écran.

**Taille du build** : CSS **11,75 Ko compressés** (37,2 Ko bruts), sous la cible de 15 Ko ; JS
inchangé à 174,4 Ko compressés. Tests : 66, inchangés et non modifiés.

## Complexity Tracking

Aucune violation de la constitution à justifier.
