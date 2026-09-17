# Contrat interne : fonctions métier pures

Frontière testée par Vitest (constitution, principe III). Aucune de ces fonctions n'accède au DOM, au
réseau, au stockage, à l'horloge ni à la géolocalisation : « maintenant » et le point de recherche sont
toujours passés en paramètre. Types : voir [data-model.md](../data-model.md).

## `distanceKm(a: LatLng, b: LatLng): number`

Distance haversine, rayon 6 371 km.

- `distanceKm(p, p) === 0`
- symétrique : `distanceKm(a, b) === distanceKm(b, a)`
- cas de référence : Paris (48.8566, 2.3522) → Lyon (45.7640, 4.8357) ≈ 392 km (±1 %)

## `parseParisDateTime(value: string | null): Date | null`

Interprète `YYYY-MM-DDTHH:mm:ss` comme heure locale Europe/Paris, en ignorant tout suffixe de fuseau.

- `"2026-09-17T15:47:20+00:00"` → `2026-09-17T13:47:20Z` (heure d'été, UTC+2)
- `"2026-01-15T10:00:00+00:00"` → `2026-01-15T09:00:00Z` (heure d'hiver, UTC+1)
- `null`, chaîne vide ou mal formée → `null`

## `normalizeStation(record: object): Station | null`

Enregistrement API → `Station`.

- `geom` absent → `null`
- carburant avec `<x>_prix` null, non numérique ou ≤ 0 → absent de `prices`
- carburant avec `<x>_rupture_type` non null → absent de `prices`, même si un prix existe
- carburant avec `<x>_maj` illisible → absent de `prices` (on n'affiche pas un prix sans date)

## `rankStations(stations, { fuel, radiusKm, origin, now }): RankedStation[]`

- exclut les stations sans prix pour `fuel`
- exclut les stations avec `distanceKm > radiusKm` (une station à exactement `radiusKm` est incluse)
- trie par prix croissant, puis distance croissante, puis `id` croissant
- `isStale = now - updatedAt > 7 jours` (exactement 7 jours → non ancien)
- entrée vide → `[]` ; ne modifie pas le tableau reçu

## `formatDistance(km: number): string`

- `< 1` → mètres arrondis à la dizaine : `0.347` → `"350 m"`
- `≥ 1` → une décimale en km, virgule française : `3.26` → `"3,3 km"`

## `formatPrice(eurosPerLitre: number): string`

- trois décimales, virgule française : `2.449` → `"2,449 €/L"`

## `formatUpdatedAt(date: Date, now: Date): string`

- format lisible en français, en heure de Paris (ex. `"17/09 à 15:47"`) ; format exact figé par les tests
  à l'implémentation

## `readPreferences(raw: string | null): Preferences`

- JSON invalide, `fuel` inconnu ou `radiusKm` ∉ {5, 10, 20} → valeur par défaut pour le champ concerné
