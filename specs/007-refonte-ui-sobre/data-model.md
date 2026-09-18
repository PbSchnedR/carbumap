# Phase 1 — Modèle : interface sobre (007)

**Aucune donnée métier nouvelle.** Les stations, prix, carburants, rayons et origines de recherche sont
inchangés (voir [001](../001-carte-prix-carburants/data-model.md)). Ce document ne décrit que les
notions de présentation introduites ou modifiées par 007.

---

## Notions d'état

### `mapMovedSinceSearch` — booléen, état de `App`

Indique si l'utilisateur a déplacé ou zoomé la carte depuis la dernière recherche aboutie.

| Transition | Déclencheur |
|---|---|
| `false` → `true` | `MapView` signale un déplacement **d'origine utilisateur** (voir research R5) |
| `true` → `false` | Une recherche aboutit (`search()` ou `locate()` produit un nouveau jeu de stations) |
| valeur initiale | `false` |

Un déplacement programmatique (`fitBounds`, `panInside`, `setView`) ne provoque **aucune** transition.

### `isCardOpen` — booléen, existant, portée élargie

Déjà présent dans `App`. Sur ordinateur, il commande désormais quelle vue occupe la colonne gauche :
`false` → tableau seul ; `true` → fiche posée par-dessus le tableau, qui reste monté et visible
dans le flux mais devient `inert` (research R6).
Inchangé sur mobile.

---

## Fonction pure

### `shouldOfferSearchHere(state): boolean` — `src/domain/searchHere.ts`

Seule logique nouvelle testable. Aucun accès au DOM, au réseau ni à l'horloge (constitution III).

**Entrée** :

| Champ | Type | Sens |
|---|---|---|
| `mapMoved` | `boolean` | La carte a bougé du fait de l'utilisateur depuis la dernière recherche |
| `status` | `SearchStatus['status']` | État de la recherche en cours |

**Règle** : renvoie `true` si et seulement si `mapMoved` est `true` **et** `status` n'est ni
`'locating'` ni `'loading'`.

**Rationale de la seconde condition** : proposer de relancer une recherche pendant qu'une recherche
tourne produit des résultats qui se doublent. Ce n'est pas exigé mot pour mot par FR-023, mais c'est
la lecture raisonnable de « il disparaît une fois la recherche relancée ».

**Cas à couvrir par les tests** :

| `mapMoved` | `status` | Attendu |
|---|---|---|
| `false` | `'ready'` | `false` — état initial, rien à proposer |
| `true` | `'ready'` | `true` — cas nominal |
| `true` | `'loading'` | `false` — recherche déjà en cours |
| `true` | `'locating'` | `false` — localisation en cours |
| `true` | `'error'` | `true` — relancer est justement l'issue utile |
| `true` | `'no-position'` | `true` — seul moyen de chercher sans position |
| `false` | `'loading'` | `false` |

---

## Jetons visuels ajoutés à `src/index.css`

Aucun jeton n'est supprimé. Les valeurs existantes de 004 restent la source unique.

| Jeton | Valeur | Motif |
|---|---|---|
| `--font-sans` | `'IBM Plex Sans Variable', <pile système existante>` | FR-010 ; le repli reste lisible pendant le `swap` (R2) |
| `--icon-stroke` | `1.75` | FR-016 : une seule graisse de tracé pour les 8 icônes |
| `--icon-size` | `1em` | Les icônes suivent la taille du texte qui les accompagne |
| `--panel-width` | `clamp(380px, 36vw, 520px)` | FR-004 et FR-008 ; bornes justifiées en research R4 |

**Contrainte** : `--icon-stroke` et `--icon-size` sont les **seules** valeurs que les icônes ont le
droit d'employer (004 FR-009, repris par 007 FR-026). Aucune icône ne fixe sa taille en dur.

---

## Inventaire des pictogrammes à remplacer

Relevé sur le code actuel, pas de mémoire. Chaque ligne est une vérification de FR-015 et FR-016.

| Actuel | Emplacement | Icône | Remarque |
|---|---|---|---|
| 📍 | `OriginBadge.tsx:12` | `mapPin` | **Emoji** — FR-015 |
| 🔍 | `PlaceSearch.tsx:122` | `search` | **Emoji** — FR-015 |
| `★` | `badges.tsx:7` | `star` | Composant React |
| `★` | `MapView.tsx:37` | `star` | **Chaîne HTML** pour `L.divIcon` — impose `iconSvg()` (R3) |
| `✓` | `ChipGroup.tsx:48` | — | Supprimée avec les pastilles à coche : le contrôle segmenté signale l'option active par le remplissage et la graisse |
| `←` | `StationCard.tsx:33` | `arrowLeft` | Sert aussi au retour vers le tableau (FR-007) |
| `↑` / `↓` | `StationTable.tsx:57` | `arrowUp` / `arrowDown` | |
| `⌖` | `SearchHereButton.tsx:12` | `crosshair` | |
| — | « Ma position », `OriginBadge.tsx` | `locate` | Bouton aujourd'hui sans icône |

Le `×` de `index.css:177` est un caractère de **commentaire** (« 44 × 44 px »), pas un pictogramme
d'interface : il reste.
