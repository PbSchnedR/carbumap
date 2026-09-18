# Carbumap

Carte web des stations-service autour de vous, classées de la moins chère à la plus chère pour le
carburant choisi (Gazole, SP95, E10, SP98, E85, GPL).

- Localisation de l'appareil, ou recherche d'une ville ou d'une adresse pour voir les prix ailleurs.
- Rayon de 5, 10 ou 20 km.
- Prix, distance à vol d'oiseau et date de mise à jour ; prix de plus de 7 jours signalés « ancien ».
- Station(s) au prix le plus bas mises en avant dans la liste et sur la carte.
- Sur ordinateur : tableau comparatif triable (prix, distance, adresse, mise à jour) dans une colonne
  à gauche, la carte occupant toute la hauteur à droite. La fiche d'une station s'ouvre dans cette
  colonne, par-dessus le tableau, et le bouton de retour restitue le tri et le défilement.
- Sur mobile : carte plein écran, deux rangées de commandes posées dessus (les six carburants tous
  visibles, sans défilement horizontal), et la liste dans un panneau glissant (replié, mi-hauteur,
  plein écran) où le prix domine chaque ligne.
- Un seul toucher sur une ligne ou sur une étiquette de prix ouvre la fiche de la station.
- Zoom au pincement ou à la molette : pas de boutons + / − sur la carte.
- Fiche station : distance, prix de tous les carburants proposés, photo de rue quand il en existe une,
  et raccourcis « Voir dans Google Maps » et « Itinéraire ».

Projet personnel, sans backend ni clé d'API.

## Confidentialité

Aucun compte, aucune publicité, aucune mesure d'audience. Seuls le carburant et le rayon choisis
sont conservés localement. La position sert au classement et n'est jamais enregistrée. Détail des
services interrogés : [docs/confidentialite.html](docs/confidentialite.html).

## Données

Prix publiés par l'État, lus directement depuis le navigateur via l'API Explore v2.1 de
data.economie.gouv.fr, jeu `prix-des-carburants-en-france-flux-instantane-v2` (endpoint
`/exports/json`, sans clé).

**Particularité** : les dates de mise à jour sont suffixées `+00:00` alors qu'elles sont en heure de
Paris ; elles sont relues comme telles (`src/domain/dates.ts`, détails dans
`specs/001-carte-prix-carburants/research.md` R5).

Autres services, eux aussi sans clé :

- **Recherche de lieu** : API Adresse (BAN), `api-adresse.data.gouv.fr`, France uniquement.
- **Photos de rue** : [Panoramax](https://panoramax.fr), `api.panoramax.xyz`. Les photos sont sous
  licence libre (souvent CC-BY-SA) : la fiche affiche la date de prise de vue, l'auteur et la licence,
  comme la licence l'exige. La couverture est inégale et beaucoup de stations n'ont pas de photo.
- **Google Maps** : simples liens (`maps/search` et `maps/dir` avec `api=1`), sans clé ni compte.
  L'application ne calcule aucun itinéraire.

## Design

Direction « carte d'abord » sur mobile : la carte occupe l'écran et les commandes flottent dessus,
regroupées en contrôles segmentés — un bloc par choix, l'option active en plein, rien qui défile.
Sur ordinateur, deux zones : la colonne des stations à gauche, la carte pleine hauteur à droite.
Thèmes clair et sombre suivant le réglage du système (aucun bouton : `prefers-color-scheme`), fond de
carte atténué la nuit. Toutes les valeurs visuelles (couleurs, rayons, ombres, tailles de texte,
durée d'animation) sont des tokens déclarés une seule fois dans `src/index.css`, avec une valeur
claire et une valeur sombre ; les composants n'écrivent aucune couleur en dur. Contrastes vérifiés
dans les deux thèmes, animations coupées avec « réduire les animations ».

## Pile technique

React 19 · TypeScript 7 · Tailwind CSS 4 · Leaflet 1.9 (tuiles OpenStreetMap) ·
react-modal-sheet (panneau mobile) · IBM Plex Sans (police auto-hébergée, donc identique hors ligne) ·
Capacitor 8 (enveloppe Android) · Vite 8 · Vitest 5.

Les pictogrammes sont sept tracés SVG écrits dans `src/components/icons.tsx` : pas de librairie
d'icônes, et aucun emoji dans l'interface.

## Application Android (APK)

Le site est empaqueté avec Capacitor. À chaque tag `v*` poussé sur GitHub, une action construit un APK
et l'attache à la release correspondante (créée si besoin).

```bash
git tag v1.0.0 && git push origin v1.0.0   # publie la version 1.0.0
npm run android:sync                        # recopie dist/ dans le projet Android
npm run android:apk                         # construit l'APK de débogage en local
```

Chaque tag produit deux fichiers : un `.apk` pour l'installation directe et un `.aab` destiné au
Play Store. Le `versionCode` est dérivé du tag (`v1.2.3` → `10203`) et non du numéro d'exécution,
parce que Play exige un entier strictement croissant et refuse définitivement un numéro déjà employé.

La signature de publication vient de quatre secrets GitHub (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`,
`KEY_ALIAS`, `KEY_PASSWORD`) ; la clé n'est jamais dans le dépôt. Sans ces secrets, la construction
retombe sur la clé de débogage et reste fonctionnelle.

- **Installation** : télécharger l'APK depuis la release, puis autoriser les « sources inconnues ».
- **Android 8.0 (API 26) minimum** : l'icône du projet est vectorielle (icône adaptative).
- L'application demande l'autorisation de localisation ; le bouton « retour » ferme d'abord la fiche
  station, puis replie la liste, puis quitte.

## Commandes

Prérequis : Node `^22.12.0` ou `>= 24`.

```bash
npm install
npm run dev        # serveur de développement, http://localhost:5173
npm test           # tests unitaires (Vitest)
npm run typecheck  # vérification des types (tsc --noEmit)
npm run build      # site statique dans dist/
npm run preview    # sert dist/
```

La géolocalisation exige HTTPS hors `localhost`.

## Structure

```text
src/
├── domain/       # logique métier pure et testée : distance, dates, normalisation, classement,
│                 # formats, préférences, positions du panneau, lieux, photos, liens Google Maps
├── data/         # appels réseau : prix, recherche de lieu, photos
├── lib/          # géolocalisation du navigateur
├── hooks/        # état : recherche, préférences, media queries
├── components/   # interface React (carte, liste, panneaux, sélecteurs)
├── App.tsx       # assemblage, présentation mobile / ordinateur
└── index.css     # thème Tailwind et surcharges Leaflet
tests/unit/       # tests des fonctions de src/domain/
specs/            # spécifications, plans et tâches (Spec Kit)
```

Règles du projet : `.specify/memory/constitution.md` (pas de backend par défaut, dépendances utiles
seulement, logique métier pure et testée, mobile d'abord, aucun secret, documentation à jour).
