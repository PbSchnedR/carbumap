# Data Model: Sélection depuis la carte, recherche de lieu et fiche station

Les entités de 001 et 002 (Station, Prix, Carburant, Point de recherche, Prix le plus bas, Position du
panneau) sont inchangées. Deux entités s'ajoutent, plus l'état d'écran de la fiche.

## Lieu (`Place`)

Résultat de la recherche de lieu (API Adresse, research R1).

| Champ | Type | Règle |
|-------|------|-------|
| id | string | identifiant du résultat ; à défaut, `label` + coordonnées |
| label | string | libellé affiché (ex. « Gennevilliers », « 12 Rue de Paris 92230 Gennevilliers ») |
| context | string | complément (ex. « 92, Hauts-de-Seine, Île-de-France »), vide si absent |
| position | LatLng | `geometry.coordinates` = `[lon, lat]`, inversé à la normalisation |

Un résultat sans position exploitable est écarté. Le lieu choisi devient le **point de recherche**
(001) ; l'application retient son `label` pour l'afficher (FR-008).

## Photo de lieu (`PlacePhoto`)

Photo libre proche d'une station (Panoramax, research R2).

| Champ | Type | Règle |
|-------|------|-------|
| id | string | identifiant de la photo |
| thumbUrl | string | `assets.thumb.href` (image ~500 px) |
| takenAt | Date | `properties.datetimetz` ; photo écartée si illisible |
| author | string | `properties.geovisio:producer`, vide si absent |
| license | string | `properties.license` (ex. `CC-BY-SA-4.0`) |
| position | LatLng | position de la prise de vue, pour choisir la plus proche |

Aucune photo pour beaucoup de stations : l'absence est un cas normal, pas une erreur (FR-013).

## Origine du point de recherche (`SearchOrigin`)

Remplace le simple `LatLng` de 001 pour pouvoir afficher le lieu actif :

```ts
type SearchOrigin =
  | { kind: 'device'; position: LatLng }      // position de l'appareil
  | { kind: 'map'; position: LatLng }         // « Chercher ici » (002)
  | { kind: 'place'; position: LatLng; label: string }; // lieu choisi (003)
```

`label` n'est affiché que pour `kind: 'place'` ; les distances utilisent toujours `position`.

## État de la fiche station

| Champ | Type | Règle |
|-------|------|-------|
| selectedStationId | number \| null | inchangé (002) ; remis à zéro si la station sort du classement |
| isCardOpen | boolean | vrai quand la fiche de la station sélectionnée est ouverte |

- La fiche ne peut être ouverte que si une station est sélectionnée.
- Si la station sélectionnée disparaît du classement (changement de carburant, de rayon ou de point de
  recherche), la fiche se ferme et la sélection est remise à zéro.
- Sur mobile, ouvrir la fiche met le panneau en position `full` ; la fermer revient à `half`.

## Prix des autres carburants (fiche, FR-011)

Dérivé de `Station.prices` : les carburants autres que celui choisi, dans l'ordre d'affichage de
`FUELS`, avec prix, date et signalement « ancien » calculés comme dans le classement.
