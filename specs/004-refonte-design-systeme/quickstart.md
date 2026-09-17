# Quickstart : valider la refonte du design

## 1. Types, tests, build

```bash
npm run typecheck && npm test && npm run build && npm run dev
```

Attendu : tests inchangés (aucune logique métier touchée), CSS compressé ≤ 15 Ko.

## 2. Structure « carte d'abord » (US1)

| Contrôle | Comment | Attendu |
|----------|---------|---------|
| Mobile | DevTools 360 × 740 | Carte visible de bord à bord ; commandes flottantes, aucun bandeau opaque |
| Surface | Mesurer la hauteur cumulée des commandes hors panneau | ≤ 148 px, soit 20 % de 740 (SC-001) |
| Ordinateur | Fenêtre 1280 × 800 | Carte ≥ 832 px de large, soit 65 % (SC-002) |
| Accent | Parcourir l'interface | Une seule couleur d'action ; le prix le plus bas garde sa couleur propre |

## 3. Thèmes (US2)

| Contrôle | Comment | Attendu |
|----------|---------|---------|
| Sombre | DevTools → *Rendering* → `prefers-color-scheme: dark` | Toute l'interface passe en sombre, y compris repères et panneaux |
| Bascule | Changer le réglage application ouverte | Suivi immédiat, sans rechargement, sans perdre carburant, rayon, résultats, sélection ni fiche (SC-004) |
| Carte | Thème sombre | Fond de carte atténué, attribution toujours lisible |
| Contrastes | Script de calcul sur les couples de tokens | 4,5:1 texte, 3:1 icônes et repères, dans les deux thèmes (SC-003) |
| Couleur seule | *Emulate vision deficiencies* → *Achromatopsia* | Carburant actif, prix le plus bas et sélection restent reconnaissables |

## 4. Cohérence et mouvement (US3)

| Contrôle | Comment | Attendu |
|----------|---------|---------|
| Échelles | Inspecter quelques éléments | Espacements, rayons, ombres, tailles proviennent des tokens (SC-005) |
| Chiffres | Changer de carburant | Les prix ne font pas sautiller la mise en page |
| Transitions | Ouvrir panneau et fiche | < 250 ms ; avec `prefers-reduced-motion: reduce`, aucune animation (SC-008) |
| États | Localisation bloquée, hors ligne, zone vide | Même langage visuel que les écrans normaux |
| Police 200 % | DevTools → taille de police très grande, ou zoom texte du navigateur | Aucun texte tronqué ni chevauchement (SC-006) |
| Identité | Onglet du navigateur | Nom et icône du projet |

## 5. Non-régression

Rejouer [002 quickstart](../002-refonte-interface-carte/quickstart.md) §2–§5 et
[003 quickstart](../003-fiche-station-recherche-lieu/quickstart.md) §2–§4 (SC-007).

## 6. Constitution

- Aucune dépendance ajoutée ; `src/domain/` inchangé ; aucun secret ; README à jour.
