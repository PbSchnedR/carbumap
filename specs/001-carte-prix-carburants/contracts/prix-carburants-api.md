# Contrat consommé : API Explore v2.1 — prix des carburants

Seule interface externe de données. Tout ce qui est marqué **vérifié** a été observé par appel réel
le 2026-09-17.

## Requête

```http
GET https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/exports/json
    ?where=within_distance(geom, geom'POINT(<lon> <lat>)', 20km)
    &select=id,adresse,cp,ville,geom,
            gazole_prix,gazole_maj,gazole_rupture_type,
            sp95_prix,sp95_maj,sp95_rupture_type,
            e10_prix,e10_maj,e10_rupture_type,
            sp98_prix,sp98_maj,sp98_rupture_type,
            e85_prix,e85_maj,e85_rupture_type,
            gplc_prix,gplc_maj,gplc_rupture_type
```

- Paramètres encodés via `URLSearchParams` ; **longitude avant latitude** dans `POINT`.
- Aucun en-tête d'authentification, aucune clé (**vérifié**).
- CORS : `Access-Control-Allow-Origin: *` (**vérifié**).
- Quota : `X-RateLimit-Limit: 50000` par jour (**vérifié** ; portée exacte — IP ou globale — non
  vérifiée).
- `/records` est plafonné à `limit ≤ 100` (**vérifié**) : ne pas l'utiliser pour cette requête.

## Réponse (200)

Tableau JSON d'objets (**vérifié**) :

```json
[
  {
    "id": 92230008,
    "adresse": "192 Avenue Louis Roche",
    "cp": "92230",
    "ville": "Gennevilliers",
    "geom": { "lon": 2.3044, "lat": 48.9327 },
    "gazole_prix": 2.449,
    "gazole_maj": "2026-09-15T14:37:27+00:00",
    "gazole_rupture_type": null,
    "gplc_prix": null,
    "gplc_maj": null,
    "gplc_rupture_type": null
  }
]
```

| Champ | Type observé | Traitement |
|-------|--------------|-----------|
| `id` | entier | identifiant de station |
| `adresse`, `cp`, `ville` | chaîne ou null | null → `""` |
| `geom` | `{lon, lat}` ou null | null → station écartée |
| `<x>_prix` | nombre ou null | null → pas de prix pour ce carburant |
| `<x>_maj` | chaîne ISO **dont le suffixe `+00:00` est faux** : heure locale Europe/Paris | voir research R5 |
| `<x>_rupture_type` | `"temporaire"`, `"definitive"` ou null | non null → pas de prix retenu |

## Erreurs à gérer

| Cas | Comportement attendu |
|-----|----------------------|
| Réseau indisponible / `fetch` rejeté | état `error`, message + « réessayer » |
| Statut HTTP ≠ 200 (ex. 400, 429, 5xx) | idem ; le corps `{"error_code", "message"}` n'est pas affiché tel quel |
| Corps non JSON ou pas un tableau | idem |
| Tableau vide | état `ready`, message « aucune station » |
| Délai > 15 s | requête annulée (`AbortController`), état `error` |

## Frontière de test

L'appel réseau est isolé dans un module d'accès aux données ; la normalisation
(`normalizeStation`, voir [domain-functions.md](./domain-functions.md)) est une fonction pure testée
avec des enregistrements d'exemple copiés de réponses réelles.

Note : le filtre 20 km de l'API et la distance haversine locale peuvent différer de quelques mètres en
limite de rayon ; le filtre local fait foi.
