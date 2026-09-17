# Research: Sélection depuis la carte, recherche de lieu et fiche station

**Date**: 2026-09-17 · **Plan**: [plan.md](./plan.md)

Légende : **Vérifié** = appel réel, lecture de source ou commande le 2026-09-17 ;
**Déduit** = conséquence de faits vérifiés ; **Rappel** = connaissance non revérifiée.

## R1. Recherche de lieu : API Adresse (BAN), sans clé

- **Decision**: `GET https://api-adresse.data.gouv.fr/search/?q=<texte>&limit=5&autocomplete=1`.
- **Vérifié**: réponse `200` avec `access-control-allow-origin: *` ; `"gennevilliers"` renvoie un
  `Feature` GeoJSON avec `properties.label`, `type` (`municipality`, `street`, `housenumber`…),
  `city`, `postcode`, `context` (département, région) et `geometry.coordinates` `[lon, lat]`.
- **Rationale**: service public, sans clé (principes I et V), couverture France, format identique à
  celui déjà manipulé pour les stations (GeoJSON, longitude d'abord).
- **Alternatives considered**: `https://data.geopf.fr/geocodage/search` (Géoplateforme) — **vérifié**
  `200` + CORS ouvert, même famille d'API ; retenu comme repli si la BAN ferme. Nominatim (OSM)
  écarté : politique d'usage plus stricte et couverture mondiale inutile ici.
- **Pièges**: `limit=5` et `autocomplete=1` pour des propositions courtes ; anti-rebond nécessaire
  pendant la frappe (FR-006) ; longitude avant latitude dans `coordinates`.

## R2. Photos de lieu : Panoramax, sans clé

- **Decision**: `GET https://api.panoramax.xyz/api/search?place_position=<lon>,<lat>&place_distance=0-80&limit=10`,
  puis choix de la photo la plus proche de la station et affichage de son `assets.thumb.href`.
- **Vérifié** (station de Gennevilliers, 2,3044 / 48,9327) : `200`, en-tête
  `access-control-allow-origin: http://localhost:5173` (l'origine est renvoyée telle quelle), aucune
  clé, 3 photos retournées. Chaque `feature` porte `properties.datetimetz` (ex. `2020-06-05T16:18:27+02:00`
  et `2025-05-29T17:28:47+02:00`), `properties.license` (`CC-BY-SA-4.0`), `properties.geovisio:producer`
  (auteur) et `assets.thumb.href` (image de 500 px de large), plus `geometry.coordinates`.
- **Rationale**: photos libres, sans clé, API STAC lisible ; répond au « visuel à la Google Maps »
  dans les limites acceptées par l'utilisateur.
- **Limites (déduit des données ci-dessus)**: couverture inégale — beaucoup de stations n'auront
  aucune photo ; les photos montrent la rue, pas forcément la station ; elles peuvent dater de
  plusieurs années, d'où l'affichage de `datetimetz` (FR-012).
- **Ordre des résultats**: non garanti par distance (**non vérifié**) → tri côté application par
  distance à la station, avec la fonction pure `distanceKm` déjà testée.
- **Attribution**: `CC-BY-SA-4.0` impose de citer l'auteur et la licence sous la photo (FR-012).
- **Pièges**: `place_position` attend `lon,lat` ; `place_distance` est une plage en mètres
  (`0-80`) ; prévoir un délai d'expiration et traiter toute erreur comme « pas de photo » (FR-013).

## R3. Raccourcis Google Maps, sans clé

- **Decision**: deux liens `target="_blank" rel="noopener noreferrer"` :
  - voir : `https://www.google.com/maps/search/?api=1&query=<lat>%2C<lon>`
  - itinéraire : `https://www.google.com/maps/dir/?api=1&destination=<lat>%2C<lon>`
- **Vérifié** (documentation Google Maps URLs) : « You don't need a Google API key to use Maps URLs » ;
  le paramètre `api=1` est obligatoire ; limite de 2 048 caractères par URL.
- **Rationale**: aucune clé (principe V), aucun calcul d'itinéraire dans l'application (FR-015) ; sur
  mobile, le système peut ouvrir l'application Google Maps (**Rappel**).
- **Alternatives considered**: lien Street View (`map_action=pano`) — écarté par l'utilisateur.

## R4. Sélection depuis la carte

- **Decision**: rendre les repères interactifs (`interactive: true`, aujourd'hui `false`) et écouter
  leur clic ; le gestionnaire appelle la même fonction de sélection que la liste. La fonction courante
  est lue via une `ref` pour éviter de reconstruire tous les repères à chaque rendu.
- **Zone touchable (FR-004)**: l'icône `divIcon` passe à `iconSize: [44, 44]`, `iconAnchor: [22, 44]`,
  avec l'étiquette de prix centrée et visuellement inchangée ; seule la zone transparente de 44 × 44 px
  devient cliquable. Le pointeur reste sous l'étiquette (`::after`).
- **Superposition (edge case)**: l'ordre d'empilement est déjà `sélectionnée > moins chère > autres`
  (002 FR-010) ; le clic atteint donc l'étiquette du dessus.
- **Pas de clic sur le fond de carte**: aucun `map.on('click')` n'est ajouté, la sélection ne se perd
  donc pas par accident (spec US1 scénario 4).

## R5. Ouverture de la fiche station

- **Decision**: la fiche remplace la liste dans le panneau (mobile) ou dans le panneau latéral
  (ordinateur), avec un bouton « Retour à la liste ».
- **Ouverture en 2 touchers maximum (SC-005)**:
  - depuis la liste : la ligne sélectionnée affiche un bouton « Détails » à côté d'elle ;
  - depuis la carte : toucher une deuxième fois le repère déjà sélectionné ouvre la fiche ;
  - toucher à nouveau une ligne déjà sélectionnée ouvre aussi la fiche.
- **Rationale**: pas d'ouverture automatique à la sélection (hypothèse de la spec : ne pas gêner la
  comparaison des prix) ; deux boutons frères plutôt qu'un bouton dans un bouton (HTML invalide).
- **Mobile**: à l'ouverture, le panneau passe en position plein écran pour que la fiche soit lisible.

## R6. Retour à la position de l'appareil (FR-008)

- **Decision**: ajouter une action `locate()` au hook de recherche : elle relance la géolocalisation
  puis la recherche, et remplace le lieu actif.
- **Piège**: la règle de 001 T041 (une réponse de géolocalisation tardive ne doit pas écraser une
  recherche lancée depuis) reste valable ; `locate()` est un nouveau départ explicite et doit donc
  utiliser le même compteur de recherche pour rester la plus récente.

## R6bis. Vérifications faites à l'implémentation

- **`place_distance` est bien en mètres** (**vérifié** 2026-09-17) : pour `0-80`, les 7 photos
  renvoyées sont à 37 à 79 m du point demandé (ambiguïté A1 de l'analyse levée).
- **Taille du build après 003** : JS **174,31 Ko compressés** (560 Ko minifiés), CSS 11,35 Ko — contre
  171 Ko en 002, sous le seuil d'alerte de 250 Ko. Aucune dépendance ajoutée.

## R7. Aucune nouvelle dépendance

- **Decision**: tout est fait avec ce qui est déjà là (React, Leaflet, `fetch`, `Intl`).
- **Rationale**: principe II — une librairie de combobox ou de carrousel de photos n'apporterait rien
  ici : un `<input>` avec une liste de propositions et une `<img>` suffisent.
- **Accessibilité de la recherche**: motif `combobox` construit à la main (`role="combobox"`,
  `aria-expanded`, `aria-controls`, `role="listbox"`/`option`, navigation flèches + Échap), à vérifier
  au clavier dans le quickstart.
