# Contrats consommés : recherche de lieu, photos, liens Google Maps

Tout ce qui est marqué **vérifié** a été observé par appel réel le 2026-09-17. Aucune de ces
interfaces ne demande de clé (constitution, principes I et V).

## 1. API Adresse (BAN) — recherche de lieu

```http
GET https://api-adresse.data.gouv.fr/search/?q=<texte>&limit=5&autocomplete=1
```

- CORS : `access-control-allow-origin: *` (**vérifié**).
- Réponse : `FeatureCollection` GeoJSON.

```json
{ "features": [ { "geometry": { "coordinates": [2.294231, 48.93113] },
  "properties": { "id": "92036", "label": "Gennevilliers", "type": "municipality",
                  "city": "Gennevilliers", "postcode": "92230",
                  "context": "92, Hauts-de-Seine, Île-de-France" } } ] }
```

| Cas | Comportement attendu |
|-----|----------------------|
| moins de 3 caractères | aucune requête (FR-006) |
| frappe rapide | une requête au plus toutes les 300 ms, la précédente étant annulée (`AbortController`) |
| `features` vide | message « Aucun lieu trouvé » |
| statut ≠ 200, corps illisible, réseau coupé | message « Recherche de lieu indisponible », l'application reste utilisable |
| délai > 8 s | requête annulée, même message |

## 2. Panoramax — photo de lieu

```http
GET https://api.panoramax.xyz/api/search?place_position=<lon>,<lat>&place_distance=0-80&limit=10
```

- CORS : l'origine appelante est renvoyée dans `access-control-allow-origin` (**vérifié** avec
  `http://localhost:5173`).
- Réponse : `FeatureCollection` STAC. Champs utilisés (**vérifiés**) :

```json
{ "features": [ { "id": "83a97c0c-…", "geometry": { "coordinates": [2.304281, 48.933020] },
  "assets": { "thumb": { "href": "https://panoramax.openstreetmap.fr/derivates/…/thumb.jpg" } },
  "properties": { "datetimetz": "2020-06-05T16:18:27+02:00", "license": "CC-BY-SA-4.0",
                  "geovisio:producer": "motocultrice" } } ] }
```

| Cas | Comportement attendu |
|-----|----------------------|
| `features` vide | « Aucune photo disponible » (cas normal et fréquent) |
| photo sans `thumb`, sans date lisible | ignorée ; la suivante est essayée |
| plusieurs photos | la plus proche de la station est retenue (tri par `distanceKm`) |
| erreur, délai > 8 s, image qui ne charge pas | traité comme « aucune photo » (FR-013) |

Affichage obligatoire sous la photo : date de prise de vue, auteur (`geovisio:producer`) et licence
(`license`), la licence CC-BY-SA imposant l'attribution.

## 3. Google Maps URLs — raccourcis

| Action | URL |
|--------|-----|
| Voir dans Google Maps | `https://www.google.com/maps/search/?api=1&query=<lat>%2C<lon>` |
| Itinéraire | `https://www.google.com/maps/dir/?api=1&destination=<lat>%2C<lon>` |

- **Vérifié** (documentation Google Maps URLs) : aucune clé nécessaire, `api=1` obligatoire, URL
  limitée à 2 048 caractères.
- Liens ouverts avec `target="_blank"` et `rel="noopener noreferrer"`.
- L'application ne calcule aucun itinéraire (FR-015).
