# Quickstart : valider l'affichage des informations

## 1. Types, tests, build

```bash
npm run typecheck && npm test && npm run build && npm run dev
```

Attendu : tests précédents inchangés + `sorting` et `relativeDate` ; JS ≤ 180 Ko compressés.

## 2. Tableau sur ordinateur (US1)

| Contrôle | Comment | Attendu |
|----------|---------|---------|
| Densité | Fenêtre 1280 × 800, Paris 20 km | ≥ 10 stations lisibles sans défiler (SC-001) |
| Colonnes | Regarder l'alignement | Prix et distances alignés, chiffres comparables |
| Tri | Cliquer « Distance », puis à nouveau | Tri croissant puis décroissant, sens indiqué (SC-003) |
| Tri conservé | Changer de carburant après un tri | Le tri reste celui choisi |
| Valeurs manquantes | Trier sur « Mise à jour » | Les lignes sans date finissent en bas dans les deux sens |
| Synchronisation | Cliquer une ligne, puis une étiquette sur la carte | La sélection est la même des deux côtés, la ligne est ramenée dans la vue |
| En-tête collant | Faire défiler le tableau | Les en-têtes restent visibles |
| Palier réduit | Réduire à 900 px | La colonne « mise à jour » disparaît, rien n'est comprimé (FR-014) |
| Clavier | Tab jusqu'aux en-têtes, Entrée | Le tri change ; l'état est annoncé (`aria-sort`) (SC-007) |
| Performance | Paris 20 km (~400 lignes), trier | Résultat en moins d'une seconde |

## 3. Lignes sur mobile (US2)

| Contrôle | Comment | Attendu |
|----------|---------|---------|
| Hiérarchie | 360 × 740, panneau à mi-hauteur | Le prix domine ; adresse et distance secondaires |
| Densité | Compter | ≥ 3 stations complètes visibles (SC-002) |
| Moins cher | Regarder la première ligne | Marque explicite, reconnaissable en niveaux de gris |
| Prix ancien | Chercher une ligne « ancien » | Signalement visible sans masquer le prix |
| Adresse longue | Chercher une adresse longue | Troncature propre, prix toujours alignés |

## 4. Fiche station (US3)

| Contrôle | Attendu |
|----------|---------|
| Ordre de lecture | Prix du carburant choisi, puis autres carburants, puis lieu et actions |
| Autres carburants | Colonnes alignées (carburant, prix, date), pas du texte courant |
| Sans photo | Pas de grand vide : la mise en page se resserre |
| Ordinateur | La fiche ne masque pas le tableau |

## 5. Non-régression et transverse

| Contrôle | Attendu |
|----------|---------|
| 001 à 005 | Rejouer les quickstarts de [002](../002-refonte-interface-carte/quickstart.md) §2–§5 et [003](../003-fiche-station-recherche-lieu/quickstart.md) §2–§4 (SC-005) |
| Thèmes | Clair et sombre sur les deux présentations, contrastes tenus |
| Police 200 % | Aucun chevauchement dans le tableau (SC-006) |
| Défilement horizontal | Aucun à 360 px ni à 900 px (SC-008) |
| Constitution | Aucune dépendance ajoutée ; `src/domain/` pur ; aucun secret ; docs à jour |
