# Research: Carte des stations les moins chères autour de moi

**Date**: 2026-09-17 · **Plan**: [plan.md](./plan.md)

Légende des sources : **Vérifié** = appel réel à l'API ou commande exécutée le 2026-09-17 ;
**Rappel** = connaissance non revérifiée, à confirmer à l'implémentation.

## R1. Appel de l'API depuis le navigateur, sans clé

- **Decision**: Appeler directement
  `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2`
  depuis le navigateur, sans clé ni backend.
- **Rationale**: **Vérifié** : réponse `200` avec `Access-Control-Allow-Origin: *` pour une origine
  `http://localhost:5173` ; aucune authentification requise. En-têtes `X-RateLimit-Limit: 50000`
  (réinitialisé à minuit UTC) — largement suffisant pour un usage perso. Respecte les principes I et V.
- **Alternatives considered**: Proxy/backend (inutile : CORS ouvert, pas de secret) ; fichier
  national quotidien téléchargé et pré-traité (plus lourd, prix moins frais).

## R2. Endpoint : `/exports/json` plutôt que `/records`

- **Decision**: Utiliser `GET …/exports/json` avec un filtre géographique `where` et un `select`
  restreint.
- **Rationale**: **Vérifié** : `/records` refuse `limit > 100`
  (`InvalidRESTParameterError: -1 <= limit <= 100`), or Paris compte 141 stations à 10 km et 414 à
  20 km. `/exports/json` a renvoyé les 414 stations en un appel (0,34 s, 38 Ko compressés,
  254 Ko décompressés, pour les 6 carburants).
- **Alternatives considered**: Paginer `/records` par pas de 100 (5 appels à Paris, plus de code).

## R3. Une seule requête à 20 km, rayon et carburant filtrés localement

- **Decision**: Pour chaque point de recherche, charger une fois toutes les stations à 20 km (rayon
  maximal) avec les prix des 6 carburants. Le choix du rayon (5/10/20 km) et du carburant est ensuite
  appliqué par les fonctions pures, sans nouvel appel réseau.
- **Rationale**: Changer de carburant ou de rayon devient instantané (SC-002 < 1 s) et le filtrage par
  distance est entièrement testable (principe III). Le volume mesuré au pire cas (Paris) reste léger.
- **Alternatives considered**: Un appel par changement de carburant/rayon (latence réseau à chaque
  clic, logique de filtrage cachée dans une requête non testée).
- **Requête** (filtre géographique **vérifié**) :
  `where=within_distance(geom, geom'POINT(<lon> <lat>)', 20km)` — attention à l'ordre **lon puis lat**.

## R4. Correspondance des carburants

- **Decision**: Libellés affichés → préfixes de champs : Gazole→`gazole`, SP95→`sp95`, E10→`e10`,
  SP98→`sp98`, E85→`e85`, **GPL→`gplc`**.
- **Rationale**: **Vérifié** dans le schéma du jeu : le GPL s'appelle `GPLc` / `gplc_*`. Chaque
  carburant a `<x>_prix` (double), `<x>_maj` (datetime), `<x>_rupture_type` (`temporaire`,
  `definitive` ou null).

## R5. Fuseau horaire des dates de mise à jour (piège)

- **Decision**: Ignorer le suffixe `+00:00` des champs `*_maj` : interpréter date et heure comme heure
  locale **Europe/Paris**, conversion faite dans une fonction pure testée (changement d'heure compris),
  en utilisant `Intl` (natif, sans dépendance).
- **Rationale**: **Vérifié par deux routes** :
  1. à 14:05 UTC, le plus récent `gazole_maj` valait `2026-09-17T15:47:20+00:00`, soit 1 h 40 dans le
     futur s'il était vraiment en UTC ;
  2. `data_processed` du jeu valait `2026-09-17T13:47:41Z`, ce qui correspond à 15:47 heure de Paris
     (UTC+2 en septembre).
  Le champ brut `prix` contient la même heure sans fuseau (`"@maj": "2026-09-17 09:26:09"`).
  Sans correction, les dates seraient décalées de 1 à 2 h et le seuil « ancien » (7 j) légèrement faux.
- **Alternatives considered**: Faire confiance au suffixe (faux, cf. ci-dessus) ; bibliothèque de
  dates (dépendance inutile, principe II).
- **Risque**: si l'éditeur corrige un jour le suffixe, les dates seront décalées dans l'autre sens.
  Un test documente l'hypothèse ; à revérifier si les dates paraissent incohérentes.

## R6. Ruptures, prix manquants, qualité des données

- **Decision**: Une station est retenue pour un carburant si et seulement si `<x>_prix` est un nombre
  **et** `<x>_rupture_type` est null.
- **Rationale**: **Vérifié** : une station avec `gazole_rupture_type = 'temporaire'` peut garder un
  dernier prix (`gazole_prix = 2.359`) — cas rare (1 station pour le gazole au moment du test) mais
  réel ; FR-005 l'exclut. Aucune station sans `geom` au moment du test ; le code l'exclut quand même
  (coût nul, défaillance silencieuse sinon).
- **Hypothèse (non vérifiée)**: `<x>_rupture_type` non null signifie une rupture **en cours** ; le jeu
  aplati n'expose pas de date de fin.

## R7. Prix anciens : volume réel

- **Decision**: Seuil de 7 jours (clarification du 2026-09-17), calculé dans une fonction pure qui
  reçoit « maintenant » en paramètre.
- **Rationale**: **Vérifié** pour le gazole : ~600 stations sur 9 075 ont un prix de plus de 7 jours,
  141 de plus de 30 jours ; exemple observé d'un E85 à 0,859 €/L daté de 23 jours, qui serait en tête
  du classement. Le signalement est donc utile.

## R8. Nom des stations

- **Decision**: Afficher l'adresse et la ville (`adresse`, `cp`, `ville`).
- **Rationale**: **Vérifié** : le schéma du jeu ne contient **aucun champ de nom ou d'enseigne**.
  FR-006 (« nom ou à défaut adresse ») est satisfait par l'adresse.

## R9. Distance

- **Decision**: Formule de haversine (rayon terrestre moyen 6 371 km), fonction pure.
- **Rationale**: Distance à vol d'oiseau (spec) ; précision largement sous 1 % à ces échelles
  (SC-004). Évite de dépendre du tri côté API.

## R10. Carte : Leaflet + tuiles OpenStreetMap

- **Decision**: Leaflet `1.9.4` (**vérifié** : dernière version npm) ; repères en `L.circleMarker`
  (pas d'images).
- **Rationale**: Les `circleMarker` évitent le problème connu des icônes de marqueur par défaut dont
  les chemins d'images cassent avec un bundler (**Rappel**), et se mettent en évidence facilement
  (couleur/rayon). Les tuiles OSM ne demandent pas de clé ; la politique d'usage des tuiles OSM exige
  l'attribution « © OpenStreetMap contributors » et un usage modéré (**Rappel** — à relire sur
  operations.osmfoundation.org avant publication).
- **Alternatives considered**: MapLibre (plus lourd, tuiles vectorielles souvent à clé).

## R11. Outillage

- **Decision**: Vite `8.3.0`, Vitest `5.0.1` (**vérifié** : dernières versions npm). Node local
  `v24.13.0`, compatible avec les `engines` des deux (**vérifié**).
- **Rationale**: Choix de l'utilisateur ; 3 dépendances au total (1 runtime, 2 de dev), chacune
  justifiée dans le plan (principe II).

## R12. Géolocalisation et repli « chercher ici »

- **Decision**: `navigator.geolocation.getCurrentPosition` (natif) ; en cas de refus, d'erreur ou de
  délai dépassé, la carte s'ouvre sur une vue France et un bouton « chercher ici » utilise le centre de
  la carte. Le bouton reste disponible aussi après une géolocalisation réussie.
- **Rationale**: Clarification du 2026-09-17 ; aucune dépendance. La géolocalisation exige un contexte
  sécurisé (HTTPS ou localhost) (**Rappel**), à prendre en compte pour les tests sur téléphone.

## R13. Mémorisation du carburant

- **Decision**: `localStorage` pour le dernier carburant (et rayon), lecture/écriture protégées par
  `try/catch`, repli sur Gazole / 10 km.
- **Rationale**: Hypothèse de la spec ; natif, aucun secret stocké.
