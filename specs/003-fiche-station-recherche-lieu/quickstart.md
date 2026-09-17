# Quickstart : valider la sélection carte, la recherche de lieu et la fiche station

## Prérequis

- Node `^22.12.0` ou `>= 24`
- Chrome ou Edge avec DevTools ; aucune clé, aucun `.env`

## 1. Types, tests, build

```bash
npm install
npm run typecheck
npm test            # + places, photos, googleMaps, otherFuelPrices, searchOrigin
npm run build       # noter la taille JS compressée (seuil d'alerte : 250 Ko)
npm run dev
```

## 2. Sélection depuis la carte (US1)

| Étape | Attendu |
|-------|---------|
| DevTools 360 × 740, position Paris, résultats chargés | étiquettes de prix visibles |
| Toucher une étiquette | la station est sélectionnée : étiquette mise en évidence, ligne marquée dans la liste, panneau à mi-hauteur |
| Ouvrir la liste | la ligne sélectionnée est visible sans la chercher |
| Toucher une autre étiquette | seule la nouvelle station est sélectionnée |
| Toucher une zone vide de la carte | la sélection est conservée |
| Zone dense (Paris, 20 km) | 10 touchers sur 10 sélectionnent bien la station visée (SC-002) |

## 3. Recherche de lieu (US2)

| Étape | Attendu |
|-------|---------|
| Localisation acceptée, saisir « Genn » | propositions en moins de 1 s (SC-003) ; onglet *Network* : une requête après la fin de la frappe, pas une par lettre |
| Choisir « Gennevilliers » | carte recentrée, stations rechargées, distances comptées depuis ce lieu, lieu affiché (SC-004) |
| Bouton « Ma position » | retour à la position de l'appareil en un geste |
| « Chercher ici » | toujours disponible |
| Saisir « zzzzzz » | « Aucun lieu trouvé » |
| DevTools → *Offline*, saisir | « Recherche de lieu indisponible », application toujours utilisable |
| Clavier seul | Tab jusqu'au champ, flèches pour parcourir les propositions, Entrée pour choisir, Échap pour fermer |

## 4. Fiche station (US3)

| Étape | Attendu |
|-------|---------|
| Ligne sélectionnée → « Détails » | fiche ouverte (2 touchers depuis l'écran principal, SC-005) |
| Deuxième toucher sur le repère sélectionné | fiche ouverte également |
| Contenu | adresse, ville, distance, prix du carburant choisi + date (+ « ancien » le cas échéant), prix des autres carburants |
| Photo disponible (essayer Gennevilliers, 192 Avenue Louis Roche) | photo affichée avec date de prise de vue, auteur et licence |
| Station sans photo | « Aucune photo disponible », fiche complète, pas d'attente visible |
| « Voir dans Google Maps » / « Itinéraire » | nouvel onglet Google Maps sur la bonne station (5 essais sur 5, SC-006) |
| « Retour à la liste » | retour à la liste, station toujours sélectionnée |
| Changer de carburant fiche ouverte, station absente du nouveau classement | fiche fermée, sélection remise à zéro |
| DevTools → *Offline*, ouvrir une fiche | informations déjà connues affichées, pas de photo, pas de blocage |

## 5. Qualité transverse

| Contrôle | Attendu |
|----------|---------|
| 360 px | aucun défilement horizontal ; champ de recherche, propositions, étiquettes, boutons de la fiche ≥ 44 × 44 px (SC-008) |
| Clavier virtuel ouvert | champ et propositions restent visibles |
| Non-régression | rejouer [002 quickstart](../002-refonte-interface-carte/quickstart.md) §2 à §5 (SC-007) |
| Constitution | `src/domain/` sans React/Leaflet/DOM/`fetch` ; aucune nouvelle dépendance dans `package.json` ; aucun secret ; README et documents de 002 à jour |
