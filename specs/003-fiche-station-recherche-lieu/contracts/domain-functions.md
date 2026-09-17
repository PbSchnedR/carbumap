# Contrat interne : nouvelles fonctions pures et composants

Les fonctions de 001 et 002 sont inchangées. Tout ce qui suit est pur (aucun DOM, réseau, horloge ni
stockage) et testé avec Vitest (constitution, principe III).

## `src/domain/places.ts`

### `shouldSearchPlaces(query: string): boolean`

- `false` pour `''`, `'  '`, `'ab'`, `'  a '` (moins de 3 caractères une fois espaces retirés)
- `true` pour `'abc'`, `'  Gennevilliers  '`

### `normalizePlace(feature: unknown): Place | null`

- `Feature` complet → `{ id, label, context, position: { lat, lon } }` (coordonnées `[lon, lat]` inversées)
- `label` absent, `geometry` absente ou coordonnées non numériques → `null`
- `context` absent → `''`

## `src/domain/photos.ts`

### `pickNearestPhoto(features: unknown[], position: LatLng): PlacePhoto | null`

- `[]` → `null`
- retient la photo la plus proche de `position` (distance haversine)
- ignore les photos sans `assets.thumb.href`, sans `datetimetz` lisible ou sans coordonnées
- `geovisio:producer` absent → `author: ''` ; `license` absent → `license: ''`
- ne modifie pas le tableau reçu

## `src/domain/googleMaps.ts`

### `googleMapsPlaceUrl(position: LatLng): string`

- `{ lat: 48.9327, lon: 2.3044 }` → `https://www.google.com/maps/search/?api=1&query=48.9327%2C2.3044`

### `googleMapsDirectionsUrl(position: LatLng): string`

- même position → `https://www.google.com/maps/dir/?api=1&destination=48.9327%2C2.3044`
- coordonnées insérées telles quelles, séparées par `%2C`, sans arrondi

## `src/domain/stations.ts` (ajout)

### `otherFuelPrices(station: Station, selected: FuelCode, now: Date): FuelPriceLine[]`

- renvoie les carburants **autres** que `selected` ayant un prix, dans l'ordre de `FUELS`
- chaque ligne : `{ fuel, label, price, updatedAt, isStale }`, `isStale` selon la règle des 7 jours
- station sans autre prix → `[]`

## `src/domain/searchOrigin.ts`

### `originLabel(origin: SearchOrigin | null): string`

- `null` → `''`
- `{ kind: 'device' }` → `'Ma position'`
- `{ kind: 'map' }` → `'Zone de la carte'`
- `{ kind: 'place', label }` → `label`

## Hooks et composants (non testés unitairement, validés par le quickstart)

| Élément | Rôle |
|---------|------|
| `usePlaceSearch()` | texte saisi, anti-rebond 300 ms, appel annulable, `places`, `status` (`idle`/`loading`/`empty`/`error`) |
| `useStationPhoto(station)` | charge la photo la plus proche quand la fiche est ouverte ; `null` en cas d'absence ou d'erreur |
| `useStationSearch()` (modifié) | `origin: SearchOrigin \| null`, actions `search(position, kind, label?)`, `locate()`, `retry()` ; une réponse de géolocalisation tardive ne remplace jamais une recherche plus récente (001 T041) |
| `PlaceSearch` | `combobox` accessible : `role="combobox"`, `aria-expanded`, liste `role="listbox"`, flèches et Échap, cibles ≥ 44 px |
| `OriginBadge` | lieu actif + bouton « Ma position » (FR-008) |
| `StationCard` | fiche : adresse, ville, distance, prix du carburant choisi + date + « ancien », autres carburants, photo (date, auteur, licence), 2 liens Google Maps, bouton « Retour à la liste » |
| `MapView` (modifié) | repères interactifs, zone touchable 44 × 44 px, clic → sélection ; deuxième clic sur le repère sélectionné → ouverture de la fiche |
| `StationList` (modifié) | la ligne sélectionnée affiche un bouton « Détails » voisin (bouton frère, pas imbriqué) |
