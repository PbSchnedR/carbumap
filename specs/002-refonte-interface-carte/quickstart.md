# Quickstart : valider la refonte

## Prérequis

- Node `^22.12.0` ou `>= 24` (vérifié avec `v24.13.0`)
- Chrome ou Edge avec DevTools ; idéalement un téléphone réel
- Aucune clé, aucun `.env`

## 1. Installation, types, tests, build

```bash
npm install
npm run typecheck   # tsc --noEmit : aucune erreur
npm test            # vitest run : tous les tests passent
npm run build       # build statique dans dist/
npm run preview
```

**Attendu** :
- les tests portés de 001 passent avec des assertions inchangées, plus les tests de
  `lowestPriceStationIds`, `nextSheetPosition` et `positionAfterSelection` ;
- noter la taille JS compressée affichée par `vite build` dans research.md R11 ; alerte au-delà de
  250 Ko.

## 2. Carte utilisable derrière le panneau (risque principal, à faire en premier)

1. DevTools → mode responsive 360 × 740, *Sensors* → Paris (48.8566, 2.3522).
2. Panneau **replié** : faire glisser et zoomer la carte au-dessus du panneau → la carte réagit.
3. Panneau **à mi-hauteur** : même test sur la moitié haute → la carte réagit.
4. Si la carte ne réagit pas : arrêter et revoir research.md R4 (options `disableScrollLocking`,
   conteneur du panneau).

## 3. Mobile (US1, US2, US3)

| Étape | Attendu |
|-------|---------|
| Ouverture | Carte plein écran ; depuis 004, la barre n'a plus de fond opaque : les commandes sont des pastilles flottantes ; rangée des 6 carburants, rayon et « Chercher ici » accessibles ; panneau replié montrant le nombre de stations et la moins chère avec son prix |
| Mesure | Panneau replié : la carte s'étend sur toute la hauteur et le panneau en couvre ≤ 25 % (SC-002 mesuré ainsi : la barre des filtres flotte au-dessus de la carte et n'est pas décomptée ; sur un écran court, la hauteur repliée descend à 25 % de la zone) |
| Toucher la poignée ×3 | replié → mi-hauteur → plein écran → replié |
| Glissements | vers le haut / le bas : position voisine ; glissement rapide vers le bas depuis plein écran : replié |
| Plein écran, liste défilée | glisser vers le bas remonte d'abord la liste, puis descend le panneau |
| Toucher « E85 » | 1 toucher : liste, carte et résumé passent à E85 (SC-001) |
| Carte | chaque repère affiche son prix ; le moins cher est distinct et au premier plan ; depuis 003, toucher une étiquette sélectionne la station |
| Égalité | si deux stations partagent le prix le plus bas, les deux sont mises en avant |
| Sélection en plein écran | le panneau passe à mi-hauteur, la station est mise en évidence dans la partie visible de la carte |
| Sélection de la moins chère | les deux distinctions (sélection et moins cher) restent visibles |
| 5 essais chronométrés | désigner la moins chère en < 3 s sans ouvrir le panneau (SC-004) |

## 4. Ordinateur (US4)

1. Fenêtre 1280 × 800 : carte + panneau latéral visibles en même temps, mêmes carburants et mise en
   avant.
2. Sélectionner une station, choisir SP98 / 20 km, puis rétrécir sous 768 px et revenir : carburant,
   rayon, résultats et sélection conservés (FR-012).

## 5. Qualité transverse

| Contrôle | Comment | Attendu |
|----------|---------|---------|
| Attribution OSM | 360 px, toutes positions du panneau | « © OpenStreetMap contributors » reste visible en haut à droite, sous la barre des filtres |
| Boutons de zoom | 360 px, message d'état affiché | Zoom en haut à droite, jamais recouvert par la barre ni par le message |
| Défilement horizontal | 360 px, toutes positions du panneau | aucun défilement de la page (SC-006) |
| Cibles tactiles | DevTools, inspecter carburants, rayon, poignée, lignes, boutons de zoom | ≥ 44 × 44 px |
| Contrastes | calculateur de contraste sur les couleurs de `@theme` | texte ≥ 4,5:1 ; icônes, repères, grands textes ≥ 3:1 (SC-007) |
| Couleur seule | vision en niveaux de gris (DevTools → *Rendering* → *Emulate vision deficiencies* → *Achromatopsia*) | carburant actif et prix le plus bas restent reconnaissables |
| Animations réduites | *Rendering* → *prefers-reduced-motion: reduce* | le panneau change de position sans animation |
| Messages | localisation bloquée ; hors ligne ; zone en mer + « Chercher ici » | messages de 001 visibles sans ouvrir le panneau ; « Réessayer » accessible |
| Géolocalisation tardive | bloquer puis autoriser lentement la localisation après avoir touché « Chercher ici » | la recherche manuelle n'est ni remplacée ni effacée (001 T041) |

## 6. Non-régression 001

Rejouer [001 quickstart](../001-carte-prix-carburants/quickstart.md) §2 à §4, en remplaçant le
défilement vers la carte (001 §3) par le passage du panneau à mi-hauteur.

## 7. Constitution

- `src/domain/` n'importe ni React, ni Leaflet, ni le DOM, ni `fetch`, ni `localStorage`.
- Chaque dépendance de `package.json` figure dans le tableau de justification du plan ; aucune autre.
- Aucun secret dans le dépôt.
- `README.md` à jour ; documents de 001 concernés mis à jour (principe VI).
