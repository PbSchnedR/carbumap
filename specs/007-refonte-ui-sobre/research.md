# Phase 0 — Recherche : interface sobre (007)

Date : 2026-09-18. Les faits marqués « vérifié » ont été contrôlés sur la source (registre npm, code du
dépôt) et non tirés de mémoire.

---

## R1 — Police : `@fontsource-variable/ibm-plex-sans`

**Décision** : ajouter `@fontsource-variable/ibm-plex-sans`, importée une fois dans `src/index.css`,
en préférant le sous-ensemble latin si le paquet l'expose.

**Rationale** :

- IBM Plex Sans est le choix arrêté en clarification (spec, session 2026-09-18).
- **Vérifié au registre npm** : version 5.3.0, licence `OFL-1.1`, dernière publication **2026-07-19** —
  donc reconnue et maintenue au sens du principe II.
- **Vérifié** : la fonte variable expose les axes `wght` 100–700, `wdth` 75–100 et `ital` 0–1. Seul
  `wght` est utilisé ; les graisses employées aujourd'hui (500, 600, 700, 800) se ramènent à 400/500/600/700.
- Auto-hébergement : Vite copie le woff2 dans le bundle, donc aucun appel réseau au chargement. C'est
  la seule façon de satisfaire **FR-012** (hors ligne dans l'APK Capacitor).

**Alternatives écartées** :

- **Inter / Geist** — écartées explicitement par l'utilisateur : polices par défaut de Vercel, Figma et
  shadcn/ui, donc précisément la signature du rendu générique que 007 corrige.
- **Google Fonts en CDN** — appel réseau au chargement, rendrait l'APK dépendant du réseau (FR-012), et
  ajoute un tiers pour rien.
- **Copier les woff2 à la main dans `public/`** — évite la dépendance, mais oblige à écrire et maintenir
  les `@font-face`, les plages `unicode-range` et les mises à jour. Le principe II autorise une
  dépendance qui « simplifie nettement le code » : c'est le cas.

**Chiffres tabulaires — résolu le 2026-09-18, par inspection du fichier de police** (fontTools sur
`files/ibm-plex-sans-latin-wght-normal.woff2`) :

- La table `GSUB` contient `ccmp`, `dnom`, `frac`, `liga`, `numr` — **`tnum` est absent**.
- Mais les dix chiffres ont **déjà la même chasse** : `hmtx` donne 600 unités pour `zero` à `nine`.
- Axe unique `wght` 100–700 (défaut 400).

**Conclusion** : les chiffres d'IBM Plex Sans sont tabulaires **par défaut**. FR-011 est satisfaite par
les métriques de la police, sans `tnum`. Les deux replis prévus ici (`font-feature-settings: 'tnum' 1`,
puis version statique) sont **sans objet**.

Les classes `tabular-nums` existantes sont conservées : elles ne coûtent rien et restent utiles pour la
police de repli affichée pendant le `swap`, dont les chiffres, eux, sont proportionnels.

**Conséquence sur les graisses** : l'axe s'arrête à 700, or trois composants utilisaient
`font-extrabold` (800) et `.price-marker--cheapest` un `font-weight: 800`. Le navigateur ramène ces
valeurs à 700 : la distinction voulue avec le `font-bold` voisin n'existait tout simplement pas.
Remplacés par 700, explicitement.

---

## R2 — Chargement de la police sans clignotement ni saut (FR-013)

**Décision** : conserver le `font-display: swap` fourni par Fontsource, et garder une pile de repli
système explicite dans `--font-sans`.

**Rationale** : la police est un fichier local servi avec l'application, pas une ressource distante :
la fenêtre pendant laquelle le repli est affiché est très courte. `swap` garantit qu'aucun texte n'est
invisible (FR-013, première moitié).

**Risque assumé** : `swap` peut produire un léger recalage quand la police finale remplace le repli.
Les métriques d'IBM Plex Sans et celles des polices système diffèrent. Si le recalage est visible au
contrôle du quickstart, la correction est `size-adjust` / `ascent-override` sur une `@font-face` de
repli — non prévue par défaut, car c'est de la complexité pour un problème qui ne se manifestera
peut-être pas.

**Alternative écartée** : `font-display: block` — masque le texte jusqu'au chargement, ce qui viole
directement FR-013.

---

## R3 — Icônes : module SVG local, aucune librairie

**Décision** : écrire `src/components/icons.tsx`, exposant 9 icônes à partir d'un dictionnaire de
chemins SVG : `mapPin`, `search`, `star`, `check`, `arrowLeft`, `arrowUp`, `arrowDown`, `crosshair`,
`locate`. Tracé unique, `stroke-width` constant, `stroke="currentColor"`, `fill="none"`.

**Rationale** — trois raisons, dont une décisive :

1. **Décisive** : `MapView.priceIcon()` construit le repère de prix comme une **chaîne HTML** passée à
   `L.divIcon` (vérifié, `MapView.tsx:37-44`). Un composant React d'une librairie n'y est pas
   utilisable sans `renderToString`. Un dictionnaire de chemins permet d'exposer à la fois un composant
   React et une fonction `iconSvg(name)` renvoyant une chaîne — les deux usages, une seule source.
2. **Principe II** : 9 icônes représentent quelques dizaines de lignes. La constitution interdit
   d'ajouter une dépendance quand « quelques lignes de code suffisent ».
3. **Cohérence** : FR-016 exige un jeu unique, de même graisse et de même taille. Un dictionnaire
   maison rend cela structurellement vrai, plutôt que discipliné à la main.

**Alternatives écartées** :

- **Lucide (`lucide-react`)** — excellente et très vivante (**vérifié** : 1.47.0 publiée le 2026-09-17,
  licence ISC), mais elle ne résout pas le problème du repère Leaflet et tombe sous le coup du
  principe II. Ses tracés, sous licence ISC, peuvent en revanche servir de référence de dessin pour
  les 9 chemins, à condition de conserver la mention de licence.
- **Phosphor (`@phosphor-icons/react`)** — je l'avais suggérée avant vérification ; **vérifié** : sa
  dernière publication est la 2.1.10 du **2025-05-22**, soit seize mois avant aujourd'hui. Le critère
  « maintenue » du principe II n'est pas rempli. Suggestion retirée.
- **Garder les caractères texte** (`★ ✓ ← ↑ ↓ ⌖`) — c'est l'état actuel, et FR-016 le proscrit : leur
  dessin, leur graisse et leur alignement dépendent de la police et du système.

---

## R4 — Largeur de la colonne gauche

**Décision** : `width: clamp(380px, 36vw, 520px)` sur la colonne, la carte prenant le reste.

**Rationale** : vérification des trois bornes qui comptent —

| Fenêtre | Colonne | Carte | Exigence |
|---|---|---|---|
| 768 px | 380 px | 388 px (51 %) | FR-008 : dégradation admise sous 1024 px, pas de défilement horizontal |
| 1280 px | 461 px | 819 px (64 %) | FR-004 : dans la fourchette 440–520 px |
| 1600 px | 520 px (plafond) | 1080 px (68 %) | SC-003 : la part de la carte augmente avec la fenêtre |

Le plafond à 520 px est ce qui fait passer SC-003 : sans lui, une colonne en pourcentage grandirait
avec la fenêtre et la part de la carte resterait constante.

**Note de cohérence** : entre 768 et 1024 px, la colonne descend à 380 px, hors de la fourchette
440–520 px de FR-004. C'est voulu et couvert par FR-008, qui prévoit explicitement la dégradation dans
cette plage ; FR-004 est rattachée à la densité mesurée sur 1280 × 800.

**Alternative écartée** : largeur fixe de 460 px — plus simple, mais échoue à 768 px (la carte tombe à
308 px) et ne profite pas des grands écrans.

---

## R5 — Distinguer un déplacement de carte voulu par l'utilisateur (FR-023)

**Problème** : « Chercher ici » ne doit apparaître **qu'après** un déplacement ou un zoom fait par
l'utilisateur. Or `MapView` déplace aussi la carte tout seul, à trois endroits (vérifié) :
`fitBounds` après chaque recherche, `panInside` à la sélection d'une station, et `setView` initial.
Leaflet émet `moveend` dans tous les cas, sans distinguer l'origine.

**Décision** : drapeau posé autour des déplacements programmatiques.

- Un `programmaticMoveRef` est mis à `true` juste avant `fitBounds` / `panInside` / `setView`.
- Le gestionnaire `moveend` lit le drapeau : s'il est levé, il le baisse et ne signale rien ; sinon il
  appelle `onUserMove()`.
- `App` garde un booléen `mapMovedSinceSearch`, remis à `false` à chaque recherche aboutie.
- La décision d'affichage elle-même est une fonction pure, `shouldOfferSearchHere()`, testée.

**Rationale** : c'est la seule approche fiable sans toucher aux internes de Leaflet. `dragend` seul ne
suffit pas — il ignore le zoom à la molette et les boutons `+`/`−`.

**Alternatives écartées** :

- **`map.on('dragend zoomend')`** — `zoomend` se déclenche aussi pour `fitBounds`, donc le bouton
  apparaîtrait juste après chaque recherche, exactement ce que FR-023 interdit.
- **Comparer le centre avant/après** — il faut quand même savoir qui a bougé la carte ; on déplace le
  problème et on ajoute un seuil arbitraire en degrés.
- **Lire `map._animatingZoom`** — propriété privée, non contractuelle.

---

## R6 — Conserver l'état du tableau quand la fiche s'ouvre (FR-007, SC-013)

**Décision** : ne pas démonter le tableau. La colonne gauche rend le tableau et la fiche en même temps,
le tableau portant l'attribut `hidden` lorsque la fiche est ouverte.

**Rationale** : FR-007 exige que le retour restitue **le tri, la position de défilement et la ligne
sélectionnée**. Le tri et la sélection vivent déjà dans l'état de `App` et survivent à un démontage ;
la **position de défilement**, non — elle appartient au nœud DOM et serait perdue. Garder le nœud monté
règle le problème sans code de sauvegarde/restauration.

**Effet de bord à surveiller** : `StationTable` appelle `scrollIntoView` sur la ligne sélectionnée. Sur
un élément `hidden`, l'appel est sans effet — ce qui est le comportement voulu — mais il faut vérifier
qu'il se rejoue au retour si la sélection a changé entre-temps (elle ne peut pas : la fiche porte sur la
station sélectionnée).

**Alternative écartée** : mémoriser `scrollTop` dans une `ref` et le réappliquer au remontage — même
résultat, plus de code, et un rendu intermédiaire où le tableau apparaît en haut avant de sauter.

---

## R7 — Trois niveaux de contrôles (FR-020)

**Décision** : trois niveaux, appliqués partout.

| Niveau | Emploi | Traitement |
|---|---|---|
| Action principale | « Chercher ici » | Fond accent, texte sur accent, ombre flottante |
| Action secondaire | « Ma position », « Réessayer », retour de la fiche | Contour, fond de surface, sans ombre |
| Choix | Carburant, rayon | Pastilles `ChipGroup`, l'option active en plein |

**Rationale** : l'état actuel (vérifié) donne à tout la même pastille arrondie avec `shadow-float` —
« Chercher ici », « Ma position », les carburants et les rayons sont visuellement interchangeables.
C'est la cause directe du reproche sur les boutons. Retirer l'ombre des niveaux 2 et 3 suffit à créer
la hiérarchie, sans nouvelle valeur de design : `--shadow-float` devient le marqueur de « ce qui flotte
au-dessus de la carte », ce qu'il aurait toujours dû être.

**Alternative écartée** : introduire des tailles distinctes par niveau — entrerait en conflit avec la
cible de 44 px (FR-024) et multiplierait les valeurs, contre 004 FR-009.
