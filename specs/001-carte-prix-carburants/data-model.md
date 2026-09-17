# Data Model: Carte des stations les moins chères autour de moi

Modèle interne à l'application, obtenu en normalisant les enregistrements de l'API
(voir [contracts/prix-carburants-api.md](./contracts/prix-carburants-api.md)). Aucune persistance
hormis les préférences.

## Carburant (`FuelCode`)

Énumération fermée : `gazole | sp95 | e10 | sp98 | e85 | gplc`.

| Code | Libellé affiché |
|------|-----------------|
| gazole | Gazole |
| sp95 | SP95 |
| e10 | E10 |
| sp98 | SP98 |
| e85 | E85 |
| gplc | GPL |

## Point (`LatLng`)

| Champ | Type | Règle |
|-------|------|-------|
| lat | number | -90 ≤ lat ≤ 90 |
| lon | number | -180 ≤ lon ≤ 180 |

Utilisé pour la position des stations et pour le **point de recherche** (position de l'utilisateur ou
centre de la carte après « chercher ici »).

## Prix (`FuelPrice`)

| Champ | Type | Règle |
|-------|------|-------|
| price | number | > 0, en €/L |
| updatedAt | Date | instant absolu, converti depuis l'heure de Paris (research R5) |

## Station

| Champ | Type | Règle |
|-------|------|-------|
| id | number | unique, issu de `id` |
| address | string | `adresse` ; chaîne vide si absent |
| postalCode | string | `cp` |
| city | string | `ville` |
| position | LatLng | issu de `geom` ; station écartée si absent |
| prices | `Partial<Record<FuelCode, FuelPrice>>` | une entrée **seulement** si `<x>_prix` est un nombre et `<x>_rupture_type` est null (research R6) |

## Résultat classé (`RankedStation`)

Produit par les fonctions pures pour un carburant, un rayon et un point de recherche donnés.

| Champ | Type | Règle |
|-------|------|-------|
| station | Station | |
| price | FuelPrice | le prix du carburant choisi |
| distanceKm | number | haversine depuis le point de recherche |
| isStale | boolean | `now - updatedAt > 7 jours` |

**Invariants du classement** (testés) :
- seules les stations ayant un prix pour le carburant choisi et `distanceKm ≤ rayon` sont présentes ;
- ordre : `price` croissant, puis `distanceKm` croissant, puis `id` croissant (ordre total,
  résultat stable et déterministe) ;
- `isStale` n'influence pas l'ordre.

## Préférences (`Preferences`)

| Champ | Type | Défaut |
|-------|------|--------|
| fuel | FuelCode | `gazole` |
| radiusKm | 5 \| 10 \| 20 | 10 |

Stockées sur l'appareil ; toute valeur invalide lue est remplacée par le défaut.

## État de l'écran

```text
            ┌───────────── réessayer ─────────────┐
            ▼                                     │
 locating ──ok──▶ loading ──ok──▶ ready ◀──(changement carburant/rayon, local)
    │                ▲  └──erreur──▶ error ────────┘
    └─refus/erreur─▶ no-position ──« chercher ici »──┘
                                (ready et error proposent aussi « chercher ici »)
```

- `ready` avec un classement vide affiche le message « aucune station » (FR-010).
- Une seule station peut être sélectionnée (`selectedStationId`) ; elle est remise à zéro si elle
  sort du classement.
