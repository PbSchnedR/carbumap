# Contrat interne : fonctions pures (portage + ajouts)

## Portées de 001, contrat inchangé

Toutes les fonctions de [001 domain-functions](../../001-carte-prix-carburants/contracts/domain-functions.md)
(`distanceKm`, `parseParisDateTime`, `normalizeStation`, `rankStations`, `isStale`, `formatDistance`,
`formatPrice`, `formatUpdatedAt`, `readPreferences`, `serializePreferences`) sont portées en
TypeScript **sans changement de comportement**. Leurs tests sont portés avec des **assertions
identiques** ; seul l'ajout de types est permis.

## Ajouts

### `lowestPriceStationIds(ranked: RankedStation[]): Set<number>` — `src/domain/ranking.ts`

- `[]` → ensemble vide
- une seule station au minimum → ensemble de son id
- égalité au minimum (ex. 1,899 / 1,899 / 1,949) → les deux ids à 1,899
- ne dépend pas de l'ordre du tableau reçu ; ne le modifie pas

### `nextSheetPosition(position: SheetPosition): SheetPosition` — `src/domain/sheet.ts`

- `'collapsed'` → `'half'`
- `'half'` → `'full'`
- `'full'` → `'collapsed'`

### `positionAfterSelection(position: SheetPosition): SheetPosition` — `src/domain/sheet.ts`

- `'full'` → `'half'`
- `'half'` → `'half'`
- `'collapsed'` → `'half'`
