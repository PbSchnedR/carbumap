# Quickstart : valider la fonctionnalité

> **Mis à jour pour la refonte 002** : l'interface est désormais en React + TypeScript + Tailwind
> (voir [002 plan](../002-refonte-interface-carte/plan.md)). Les parcours ci-dessous restent valables ;
> la validation de la nouvelle présentation est dans [002 quickstart](../002-refonte-interface-carte/quickstart.md).

## Prérequis

- Node `^22.12.0` ou `>= 24` (moteurs requis par Vite 8 et Vitest 5 ; vérifié avec `v24.13.0`)
- Un navigateur de bureau avec outils de développement ; idéalement un téléphone sur le même réseau
- Aucune clé, aucun fichier `.env` nécessaire

## Installation et lancement

```bash
npm install
npm run typecheck # tsc --noEmit
npm test          # vitest run : tests des fonctions pures
npm run dev       # serveur Vite, http://localhost:5173
npm run build     # build statique dans dist/
npm run preview   # sert dist/ pour vérifier le build
```

## 1. Tests unitaires (principe III)

`npm test` passe. Il couvre au minimum les cas listés dans
[contracts/domain-functions.md](./contracts/domain-functions.md), dont :
- l'ordre prix → distance → id à prix égal ;
- l'exclusion des stations en rupture ayant un prix ;
- le rayon inclusif ;
- le décalage Europe/Paris été/hiver ;
- le seuil « ancien » à exactement 7 jours.

## 2. Parcours principal (US1, US2)

1. `npm run dev`, ouvrir `http://localhost:5173`, accepter la localisation.
   - Pour une position connue : DevTools → *Sensors* → *Location* → Paris (48.8566, 2.3522).
2. **Attendu** : une liste classée par prix croissant (Gazole, 10 km) et une carte avec un repère par
   station de la liste et la position de recherche.
3. Contrôle croisé du tri : les prix de la liste sont croissants du haut vers le bas.
4. Passer à **E85**, puis **20 km** : la liste et la carte changent sans nouvelle requête réseau
   (onglet *Network* : aucun appel supplémentaire).
5. Passer à **GPL** : seules des stations proposant du GPL apparaissent.
6. Recharger : le dernier carburant et le dernier rayon choisis sont conservés.

## 3. Sélection (US3)

1. Toucher la 3ᵉ station de la liste : son repère est mis en évidence et visible. Sur mobile, le
   panneau des stations passe à mi-hauteur pour laisser voir la carte (002, US1).
2. En toucher une autre : seule la nouvelle est mise en évidence.

## 4. Cas limites

| Scénario | Comment | Attendu |
|----------|---------|---------|
| Localisation refusée | Bloquer la permission du site | Message + carte France + « chercher ici » fonctionnel |
| Zone vide | Déplacer la carte en mer, « chercher ici » | Message « aucune station » |
| Hors ligne | DevTools → *Network* → *Offline*, « chercher ici » | Message d'erreur + « réessayer » ; aucune ancienne liste présentée comme à jour |
| Prix ancien | Paris 20 km, E85 ou GPL | Au moins une ligne marquée « ancien » (probable, dépend des données du jour) |
| Rural | Mende (44.5181, 3.4989), 5 km puis 20 km | Peu de stations à 5 km, davantage à 20 km (4 à 10 km et 14 à 20 km le 2026-09-17) |

## 5. Mobile (principe IV, SC-005)

1. DevTools → mode responsive, largeur **360 px** : aucun défilement horizontal de la page ; carte plein
   écran, liste dans le panneau glissant depuis le bas (détails : 002 quickstart §2–§3).
2. Sur téléphone : `npm run dev -- --host`. **Attention** : la géolocalisation exige HTTPS hors
   `localhost` ; tester le repli « chercher ici », ou utiliser `npm run build` puis un hébergement HTTPS.

## 6. Constitution

- `package.json` : uniquement les dépendances listées et justifiées dans le
  [plan de 002](../002-refonte-interface-carte/plan.md) (constitution 1.1.0, principe II).
- Recherche de secrets dans le dépôt : aucune clé, aucun jeton.
- Les fonctions de `src/domain/` n'importent ni `react`, ni `leaflet`, ni le DOM, ni `fetch`.
