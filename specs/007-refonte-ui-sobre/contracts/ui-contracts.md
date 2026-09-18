# Phase 1 — Contrats d'interface : interface sobre (007)

L'application n'expose ni API ni CLI. Les contrats qui comptent ici sont ceux **entre composants** :
ce sont eux qui, s'ils dérivent, cassent la disposition ou réintroduisent un pictogramme hors jeu.
Chaque contrat est vérifiable à la lecture du code, sans exécuter l'application.

---

## C1 — `icons.tsx` : source unique des pictogrammes

```ts
export type IconName =
  | 'mapPin' | 'search' | 'star'
  | 'arrowLeft' | 'arrowUp' | 'arrowDown' | 'crosshair' | 'locate';

/** Icône décorative : toujours aria-hidden, hérite de la couleur et de la taille du texte. */
export function Icon(props: { name: IconName; className?: string }): JSX.Element;

/** Même dessin, rendu en chaîne SVG — pour L.divIcon, qui n'accepte que du HTML. */
export function iconSvg(name: IconName): string;
```

**Règles** :

1. `Icon` et `iconSvg` MUST lire le **même** dictionnaire de chemins. Aucun chemin dupliqué.
2. Tout SVG produit porte `stroke="currentColor"`, `fill="none"`, `aria-hidden="true"`,
   `focusable="false"`, et `width`/`height` à `1em`. → FR-017, FR-018.
3. `Icon` MUST NOT accepter de prop de couleur ou de taille : la couleur vient du parent (FR-017), la
   taille du texte (data-model, `--icon-size`).
4. Aucun autre fichier de `src/` MUST contenir de balise `<svg>` d'interface ni de caractère
   pictogramme. → FR-015, FR-016.

**Vérification** : une recherche d'emojis et de `★ ✓ ← ↑ ↓ ⌖` sur `src/` ne renvoie que des
occurrences en commentaire (voir quickstart V3).

---

## C2 — `MapView` : signalement des déplacements utilisateur

```ts
type Props = {
  /* … props existantes, inchangées … */
  /** Appelé uniquement pour un déplacement ou un zoom provoqué par l'utilisateur. */
  onUserMove: () => void;
};
```

**Règles** :

1. `onUserMove` MUST NOT être appelé pour les déplacements internes de `MapView` — `fitBounds` après
   recherche, `panInside` à la sélection, `setView` initial. → FR-023, research R5.
2. `onUserMove` MUST être appelé pour un glissement, un zoom à la molette, un zoom aux boutons `+`/`−`
   et un zoom au double-clic.
3. `MapHandle.getCenter()` reste inchangé.
4. Les repères de prix MUST utiliser `iconSvg('star')` au lieu du caractère `★`. → C1, FR-016.

**Piège connu** : `moveend` se déclenche aussi pour les déplacements programmatiques. Le drapeau posé
autour de ces trois appels est ce qui rend la règle 1 vraie ; toute nouvelle commande de carte ajoutée
plus tard devra lever le même drapeau.

---

## C3 — Disposition sur ordinateur

```ts
// DesktopLayout.tsx
type Props = {
  controls: ReactNode;   // titre + carburant + rayon + lieu + « Ma position »
  table: ReactNode;      // StationTable
  card: ReactNode | null; // StationCard, ou null
  map: ReactNode;        // MapView, en position absolue dans son conteneur
  status: ReactNode;     // StatusMessage
  searchHere: ReactNode | null; // SearchHereButton, ou null
};
```

**Règles** :

1. Deux zones seulement, côte à côte : colonne gauche de largeur `--panel-width`, carte occupant le
   reste. Aucune zone pleine largeur au-dessus. → FR-002, FR-022.
2. La colonne gauche contient `controls`, puis `table` **et** `card`. Quand `card` n'est pas `null`,
   `card` se pose **par-dessus** `table` en position absolue, et `table` reçoit `inert`. `table` ne
   MUST jamais être démonté ni masqué par `display: none` : les deux font perdre `scrollTop`.
   → FR-007, SC-013, research R6.
7. Le bloc `controls` MUST former un contexte d'empilement **au-dessus** de la zone du tableau : la
   liste de suggestions de la recherche de lieu et l'en-tête collant du tableau portent le même
   `z-index`, et à égalité c'est l'ordre du DOM qui gagne — l'en-tête passerait donc par-dessus les
   suggestions.
3. `table` et la carte défilent indépendamment ; la page ne défile pas (`overflow: hidden` sur la
   racine). → FR-005.
4. `searchHere` est positionné **au-dessus de la carte**, jamais dans la colonne. → FR-022, FR-023.
5. `status` est posé sur la carte, en haut et centré. → FR-026 (même langage visuel que 004).
6. La carte MUST occuper 100 % de la hauteur de la zone de contenu. → FR-002, SC-001.

**Contrainte de non-régression** : `MapView` observe déjà son conteneur avec un `ResizeObserver` et
appelle `invalidateSize()`. Ouvrir ou fermer la fiche ne change pas la taille de la carte (règle 2),
donc aucun recadrage ne doit se produire. → SC-013.

---

## C4 — Niveaux de contrôles

Trois niveaux, et trois seulement (FR-020, research R7).

| Niveau | Composants | Signature visuelle |
|---|---|---|
| Principal | `SearchHereButton` | `bg-brand`, `text-brand-ink`, `shadow-float` |
| Secondaire | bouton « Ma position » d'`OriginBadge`, « Réessayer » de `StatusMessage`, retour de `StationCard` | `border-line`, `bg-surface`, **sans ombre** |
| Choix | `SegmentedControl` (carburant, rayon) | un seul bloc encadré ; option active en plein |

**Règles** :

1. `shadow-float` MUST être réservé à ce qui flotte au-dessus de la carte : le bouton principal, les
   messages d'état, les étiquettes de prix, le badge d'origine et **le bloc du contrôle segmenté**
   — sur mobile, la rangée de commandes est posée à même la carte, sans fond, donc chaque bloc a
   besoin de son élévation pour rester lisible. Les options **à l'intérieur** du bloc n'en portent
   pas : la hiérarchie vient du remplissage d'accent et du groupement, pas de l'ombre. → FR-020.
   *(Révisé le 2026-09-18, après retour sur maquette : la règle « aucune ombre au niveau 2 ou 3 »
   rendait les commandes illisibles sur la carte.)*
2. Tout contrôle MUST conserver `min-h-11` (44 px) et un focus visible. → FR-024, FR-025.
3. Aucun nouveau jeton de couleur, de rayon ou d'ombre MUST être introduit. → FR-026.

---

## C5 — `searchHere.ts` : fonction pure

```ts
export function shouldOfferSearchHere(input: {
  mapMoved: boolean;
  status: SearchStatus['status'];
}): boolean;
```

Contrat complet et table de vérité : voir [data-model.md](../data-model.md). Aucun accès au DOM, au
réseau, au stockage ni à l'horloge. → constitution III.
