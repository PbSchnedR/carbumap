# Data Model: Refonte de l'interface de la carte

Aucune nouvelle donnée métier : les entités de
[001 data-model](../001-carte-prix-carburants/data-model.md) (Carburant, Point de recherche, Prix,
Station, Résultat classé, Préférences) sont reprises à l'identique, exprimées en types TypeScript
dans `src/domain/`.

## Types portés (TypeScript)

```ts
type FuelCode = 'gazole' | 'sp95' | 'e10' | 'sp98' | 'e85' | 'gplc';
type LatLng = { lat: number; lon: number };
type FuelPrice = { price: number; updatedAt: Date };
type Station = {
  id: number; address: string; postalCode: string; city: string;
  position: LatLng; prices: Partial<Record<FuelCode, FuelPrice>>;
};
type RankedStation = { station: Station; price: FuelPrice; distanceKm: number; isStale: boolean };
type RadiusKm = 5 | 10 | 20;
type Preferences = { fuel: FuelCode; radiusKm: RadiusKm };
```

Règles de validation et invariants inchangés (voir 001).

## Notions d'affichage ajoutées

### Prix le plus bas (`lowestPriceStationIds`)

| Entrée | Sortie | Règle |
|--------|--------|-------|
| `RankedStation[]` | `Set<number>` | ids des stations dont `price.price` égale le minimum du classement ; ensemble vide si le classement est vide |

Comparaison exacte des prix (les prix de l'API ont 3 décimales ; pas d'arrondi supplémentaire).

### Position du panneau (`SheetPosition`)

`'collapsed' | 'half' | 'full'` — mobile uniquement.

| Transition | Déclencheur |
|------------|-------------|
| collapsed → half → full → collapsed | toucher la poignée (`nextSheetPosition`) |
| vers la position la plus proche dans le sens du geste | glissement (géré par le panneau) |
| any → half | sélection d'une station depuis la liste quand le panneau est `full` ; reste `half` s'il y est déjà ; si `collapsed`, la sélection est impossible (liste non visible) |

Position initiale : `collapsed`. Non persistée.

### Présentation (`isDesktop`)

`boolean` issu de `matchMedia('(min-width: 768px)')`. Changer de présentation ne réinitialise ni
`Preferences`, ni les résultats, ni `selectedStationId` (FR-012).

## État de l'écran

Machine d'états de 001 inchangée (`locating`, `loading`, `ready`, `error`, `no-position`, `empty`
dérivé), portée dans le hook `useStationSearch`, avec une correction :

- une recherche lancée par « Chercher ici » rend **caduque** la réponse de géolocalisation encore en
  attente (réussite ignorée, échec ignoré) — correction de 001 T041.
