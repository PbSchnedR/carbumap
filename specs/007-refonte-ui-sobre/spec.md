# Feature Specification: Interface sobre — liste à gauche sur ordinateur, typographie et icônes propres

**Feature Branch**: `007-refonte-ui-sobre`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "l'ui desktop et mobile est horrible, sur desktop il faut que le menu des différentes stations soit sur le côté gauche. Et en règle générale, la police d'écriture, les boutons etc tout le design est trop ia slop (ya des emogis en plus). Il faut que tu utilises des skills comme ui ux pro max et que tu chèques des sites de design, pense à les checker"

**Relation**: Troisième passe visuelle, après [004](../004-refonte-design-systeme/spec.md) (système de
design, thèmes) et [006](../006-affichage-informations/spec.md) (tableau sur ordinateur, prix dominant
sur mobile). Les capacités fonctionnelles de 001, 002, 003, 005 et 006 restent en vigueur. Cette
fonctionnalité **remplace** une exigence de disposition de 006 (voir FR-002) et **corrige** deux choix
de 004 qui produisent le rendu générique reproché : la typographie système et les pictogrammes emoji.

**Constat de départ** (vérifié dans le code, pas supposé) :

- Sur ordinateur, la liste des stations n'est **pas** sur le côté : `src/App.tsx` place la carte en
  bandeau de 32 vh puis le tableau en dessous, sur toute la largeur. Le panneau latéral gauche de 002
  a été supprimé par 006 (`src/components/DesktopPanel.tsx` supprimé).
- Emojis réellement présents : 📍 dans `src/components/OriginBadge.tsx`, 🔍 dans
  `src/components/PlaceSearch.tsx`.
- Pictogrammes faits de caractères texte, et non d'icônes dessinées : `★` (badges, repères de carte),
  `✓` (`ChipGroup`), `←` (`StationCard`), `↑`/`↓` (en-têtes de tri), `⌖` (`SearchHereButton`).
- Typographie : `src/index.css` utilise la pile système (`ui-sans-serif, system-ui, Segoe UI, Roboto`),
  choix assumé par 004. L'application n'a donc aucune voix typographique propre.
- Boutons : tous les contrôles (carburant, rayon, position, « Chercher ici », lieu) sont des pastilles
  `rounded-pill` avec ombre portée, empilées sur deux à trois rangées au-dessus de la carte. Aucune
  hiérarchie : tout a la même forme et le même poids visuel.

## Clarifications

### Session 2026-09-18

- Q: Sur ordinateur, la colonne de gauche doit-elle contenir un vrai tableau à colonnes alignées, ou
  une liste de lignes empilées ? → A: Un tableau à colonnes alignées (prix, distance, adresse, date,
  en-têtes triables) dans une colonne gauche large d'environ 440 à 520 px ; le contenu de 006 est
  conservé tel quel, seule sa position change.
- Q: Sur ordinateur, quand on ouvre la fiche détaillée d'une station, où doit-elle s'afficher ? → A:
  La fiche remplace le contenu de la colonne gauche, avec un bouton retour vers la liste ; la carte
  reste entière et met la station en évidence (motif Apple Plans / Google Maps).
- Q: Sur mobile, faut-il garder la structure actuelle (carte plein écran + panneau glissant) ou la
  remplacer ? → A: La garder. Seul l'habillage change : typographie, icônes, et contrôles resserrés
  sur une seule rangée. Aucune bascule carte / liste, aucune refonte de structure.
- Q: Sur ordinateur, où placer les contrôles (carburant, rayon, lieu, « Ma position », « Chercher
  ici ») ? → A: Répartis selon leur cible. Titre et contrôles de recherche en haut de la colonne
  gauche ; « Chercher ici » en bouton flottant sur la carte, révélé seulement après un déplacement de
  la carte. Aucun bandeau pleine largeur au-dessus des deux colonnes. La même règle de révélation
  s'applique sur mobile, où elle libère de la place dans la rangée de contrôles.
- Q: Quelle direction typographique ? → A: IBM Plex Sans, famille unique pour toute l'application
  (humaniste, variable, licence OFL, chiffres tabulaires soignés). Inter et Geist sont écartées
  sciemment : leur omniprésence est devenue la signature visuelle des interfaces génériques.
- Note : aucun skill de design (« ui ux pro max » ou équivalent) n'existe dans cet environnement ; la
  remarque figurait déjà dans 004. En remplacement, la direction visuelle de cette spec s'appuie sur
  des **références consultées** (voir Assumptions → Références) et sur des règles vérifiables.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La liste des stations à gauche, la carte à droite (Priority: P1)

Sur mon ordinateur, la liste des stations occupe une colonne à gauche, en permanence ; la carte remplit
tout l'espace restant à droite. Je lis la liste et je regarde la carte d'un même coup d'œil, sans que
l'une pousse l'autre hors de l'écran.

**Why this priority**: C'est la demande explicite et la plus visible. La disposition actuelle (carte en
bandeau écrasé de 32 vh, tableau en dessous) casse le lien entre la liste et la carte : pour situer une
station, il faut remonter les yeux vers une bande trop basse pour montrer le contexte.

**Independent Test**: Sur une fenêtre de 1280 × 800 avec des résultats, vérifier que la liste est dans
une colonne gauche, que la carte occupe toute la hauteur restante à droite, et que sélectionner une
ligne met en évidence le repère correspondant sans défilement de page.

**Acceptance Scenarios**:

1. **Given** une fenêtre d'ordinateur et des résultats chargés, **When** la page s'affiche, **Then** la
   liste des stations est dans une colonne à gauche, sur toute la hauteur utile, et la carte occupe
   tout l'espace restant à droite.
2. **Given** cette disposition, **When** je regarde la colonne gauche, **Then** au moins 10 stations
   sont lisibles sans défiler sur une fenêtre de 1280 × 800.
3. **Given** cette disposition, **When** je regarde la carte, **Then** elle occupe toute la hauteur de
   la zone de contenu, sans être réduite à un bandeau.
4. **Given** la liste affichée, **When** je sélectionne une station dans la colonne gauche, **Then** son
   repère est mis en évidence sur la carte ; **and** sélectionner un repère sur la carte met en
   évidence la ligne correspondante et la ramène dans la vue.
5. **Given** une station sélectionnée, **When** j'ouvre sa fiche, **Then** elle s'affiche dans la
   colonne gauche à la place du tableau, la carte reste entière et garde la station en évidence ;
   **and** un retour explicite ramène au tableau dans l'état où il était (tri, défilement, sélection).
6. **Given** une fenêtre étroite sur ordinateur (768 à 1024 px), **When** la page s'affiche, **Then** la
   disposition reste utilisable : la colonne gauche se réduit en gardant les informations essentielles,
   sans défilement horizontal de la page.

---

### User Story 2 - Une typographie qui donne une voix à l'application (Priority: P1)

Les textes, les prix et les libellés ne ressemblent plus au réglage par défaut du navigateur :
l'application a une typographie choisie, avec une hiérarchie nette entre le prix, l'adresse et le
détail.

**Why this priority**: « La police d'écriture » est nommée explicitement dans la demande. C'est aussi le
levier le moins coûteux et le plus visible : une pile de polices système est précisément ce qui fait
qu'une interface « n'a l'air de rien ».

**Independent Test**: Ouvrir l'application sur trois systèmes différents (ou trois rendus simulés) et
vérifier que le rendu typographique est identique, que les chiffres de prix sont alignés en colonne, et
que quatre niveaux de hiérarchie sont distinguables sans lire le contenu.

**Acceptance Scenarios**:

1. **Given** n'importe quel écran de l'application, **When** je compare le rendu sur deux systèmes
   d'exploitation différents, **Then** la typographie est la même (pas de substitution par la police
   par défaut du système).
2. **Given** une liste de prix, **When** je la parcours, **Then** les chiffres sont de largeur fixe et
   alignés verticalement, et une valeur qui change ne décale pas la mise en page.
3. **Given** une ligne de station, **When** je la regarde sans lire, **Then** je distingue au premier
   coup d'œil le prix, l'adresse et l'information secondaire (distance, date) par la taille, la graisse
   et la couleur.
4. **Given** une connexion lente ou une police indisponible, **When** la page s'affiche, **Then** le
   texte reste lisible immédiatement et le basculement vers la police finale ne provoque pas de saut de
   mise en page perceptible.
5. **Given** l'application installée en APK Android, **When** je l'ouvre sans réseau, **Then** la
   typographie est la même qu'en ligne.

---

### User Story 3 - Des icônes dessinées, zéro emoji (Priority: P1)

Plus aucun emoji ni caractère de remplacement dans l'interface : les pictogrammes sont des icônes d'un
même jeu, de même graisse et de même taille.

**Why this priority**: Les emojis sont cités explicitement. Ils sont le marqueur le plus reconnaissable
d'une interface non conçue : leur rendu change selon le système, leur couleur échappe au thème, et leur
graisse ne s'accorde avec rien.

**Independent Test**: Rechercher tout caractère emoji ou symbole décoratif dans les sources
d'interface : le résultat doit être vide. Puis vérifier visuellement que chaque pictogramme restant
provient du même jeu d'icônes.

**Acceptance Scenarios**:

1. **Given** l'ensemble des écrans, **When** je cherche des emojis dans l'interface, **Then** il n'y en
   a aucun.
2. **Given** l'ensemble des écrans, **When** je regarde les pictogrammes (position, recherche, moins
   cher, retour, sens du tri, chercher ici), **Then** ils proviennent tous du même jeu d'icônes et
   partagent graisse, taille et style de tracé.
3. **Given** le thème sombre puis le thème clair, **When** je regarde une icône, **Then** elle prend la
   couleur du texte qui l'accompagne dans les deux thèmes.
4. **Given** une icône, **When** elle accompagne un texte, **Then** elle est ignorée par les lecteurs
   d'écran ; **and** si elle est seule dans un bouton, ce bouton porte un intitulé accessible.
5. **Given** une icône d'information (station la moins chère, prix ancien), **When** je la regarde,
   **Then** l'information reste compréhensible sans la couleur et sans l'icône seule (texte associé).

---

### User Story 4 - Des contrôles hiérarchisés plutôt qu'un tapis de pastilles (Priority: P2)

Les boutons ne se ressemblent plus tous : une action principale se distingue, les choix (carburant,
rayon) se lisent comme des choix, et les contrôles ne s'empilent plus sur trois rangées au-dessus de la
carte.

**Why this priority**: « Les boutons » sont cités. L'uniformité actuelle — tout en pastille ombrée,
même taille, même poids — est ce qui donne l'impression de composants posés au hasard. Vient après la
structure (US1) et les fondamentaux typographiques (US2, US3), dont elle dépend.

**Independent Test**: Sur les deux tailles d'écran, classer les contrôles visibles par importance en les
regardant seulement : le classement obtenu doit correspondre à l'importance réelle des actions.

**Acceptance Scenarios**:

1. **Given** n'importe quel écran, **When** je regarde les contrôles, **Then** il existe au plus trois
   niveaux d'importance visuelle (action principale, action secondaire, choix), et chaque contrôle
   appartient clairement à l'un d'eux.
2. **Given** l'écran mobile, **When** l'application s'affiche avec des résultats, **Then** les six
   carburants sont tous visibles et touchables sans faire défiler quoi que ce soit, les contrôles
   tiennent sur au plus deux rangées et occupent au plus 25 % de la hauteur de l'écran.
3. **Given** l'écran d'ordinateur, **When** l'application s'affiche, **Then** le titre et les contrôles
   de recherche sont en haut de la colonne gauche, aucun bandeau ne traverse la page, et le seul
   contrôle posé sur la carte est « Chercher ici ».
4. **Given** n'importe quelle disposition, **When** je n'ai pas bougé la carte depuis la dernière
   recherche, **Then** « Chercher ici » n'est pas affiché ; **and** dès que je déplace ou zoome la
   carte, il apparaît, puis disparaît une fois la recherche relancée.
5. **Given** un contrôle quelconque, **When** je le vise au doigt, **Then** sa cible fait au moins
   44 × 44 px.
6. **Given** un contrôle au clavier, **When** il reçoit le focus, **Then** l'indicateur de focus est
   visible dans les deux thèmes.

---

### Edge Cases

- **Fenêtre très large (≥ 1600 px)** : la colonne gauche ne s'étire pas indéfiniment ; la carte
  récupère l'espace supplémentaire.
- **Fenêtre courte (hauteur ≤ 700 px)** : la colonne gauche et la carte restent toutes deux utilisables,
  la page ne défile pas verticalement.
- **Bascule 767 ↔ 768 px** : le passage entre la présentation mobile (panneau glissant) et la
  présentation ordinateur (colonne gauche) conserve le carburant, le rayon, les résultats, le tri, la
  sélection et la fiche ouverte.
- **Aucun résultat / chargement / erreur** : la colonne gauche affiche le message dans le même langage
  visuel, la carte reste visible et manipulable.
- **Adresse très longue** : la ligne se tronque proprement dans la colonne gauche, sans élargir la
  colonne ni déborder.
- **Police système agrandie (200 %)** : la colonne gauche s'adapte sans chevauchement ni texte tronqué
  involontaire ; la carte n'est pas réduite à rien.
- **Police personnalisée indisponible** : repli sur la pile système sans page blanche ni texte invisible.
- **Animations réduites** : aucune transition sur l'ouverture de la fiche ni sur le panneau.

## Requirements *(mandatory)*

### Functional Requirements

#### Disposition sur ordinateur

- **FR-001**: Toutes les capacités de 001, 002, 003, 005 et 006 MUST rester disponibles ; aucune
  fonctionnalité MUST être ajoutée ni retirée par cette fonctionnalité.
- **FR-002**: Cette fonctionnalité **remplace** 006 FR-002 en ce qui concerne la disposition sur
  ordinateur : la carte n'est plus un bandeau au-dessus de la liste, et elle cesse d'être l'élément
  secondaire. 006 FR-008 (carte visible et synchronisée dans les deux sens) **reste en vigueur** et
  est repris ici par FR-006. À partir de
  768 px, la liste des stations MUST occuper une colonne à gauche, sur toute la hauteur de la zone de
  contenu, et la carte MUST occuper tout l'espace restant à droite, également sur toute la hauteur.
  Aucun bandeau pleine largeur MUST NOT être placé au-dessus des deux colonnes. Les exigences de
  contenu de 006 (colonnes, tri, densité, accessibilité clavier) restent en vigueur.
- **FR-003**: La colonne gauche MUST présenter les stations sous forme de **tableau à colonnes
  alignées** — prix, distance, adresse (et ville), date de mise à jour — avec en-têtes triables :
  c'est-à-dire le contenu défini par 006 (FR-003, FR-005, FR-007, FR-014, FR-015), inchangé. Sa largeur
  MUST être bornée entre environ 440 et 520 px : assez large pour aligner ces colonnes et atteindre la
  densité de FR-004, et plafonnée pour qu'une fenêtre large profite à la carte.
- **FR-004**: Au moins 10 stations MUST être lisibles sans défiler dans la colonne gauche sur une
  fenêtre de 1280 × 800 (reprise de 006 FR-004 / SC-001).
- **FR-005**: La colonne gauche et la carte MUST défiler indépendamment ; la page elle-même MUST NOT
  défiler.
- **FR-006**: La sélection MUST rester synchronisée dans les deux sens entre la colonne gauche et la
  carte, la ligne sélectionnée étant ramenée dans la vue si nécessaire (reprise de 006 FR-008).
- **FR-007**: Sur ordinateur, la fiche d'une station MUST s'afficher **à la place du tableau, dans la
  colonne gauche**, et MUST NOT réduire ni recouvrir la carte. Elle MUST porter un retour explicite
  vers le tableau, et ce retour MUST restituer le tableau dans l'état où il était (tri, position de
  défilement, ligne sélectionnée). Pendant l'affichage de la fiche, la station concernée MUST rester
  mise en évidence sur la carte.
- **FR-008**: Entre 768 et 1024 px, la présentation MUST dégrader la colonne gauche (moins de colonnes
  ou présentation condensée) plutôt que provoquer un défilement horizontal de la page.
- **FR-009**: Sur mobile (< 768 px), la structure actuelle MUST être conservée : carte plein écran et
  panneau glissant à trois positions. Cette fonctionnalité n'y change que la typographie, les icônes et
  la hiérarchie des contrôles — y compris la règle de révélation de « Chercher ici » (FR-023), qui
  s'applique aussi sur mobile. Aucune bascule carte / liste MUST être introduite, et le panneau
  glissant MUST NOT être remplacé par un autre mode de présentation.

#### Typographie

- **FR-010**: L'application MUST utiliser **IBM Plex Sans** comme famille unique, identique d'un
  système à l'autre, au lieu de la pile de polices système retenue par 004 (dont l'hypothèse
  « polices système » est explicitement levée ici). Aucune seconde famille MUST NOT être introduite.
- **FR-011**: La typographie MUST fournir des chiffres de largeur fixe pour les prix, distances et
  dates (reprise de 004 FR-011).
- **FR-012**: La typographie MUST être disponible hors ligne, y compris dans l'APK Android de 005, sans
  appel à un service externe au chargement.
- **FR-013**: Le chargement de la typographie MUST NOT rendre le texte invisible ni provoquer un
  décalage de mise en page perceptible : un repli lisible MUST s'afficher immédiatement.
- **FR-014**: L'échelle typographique MUST distinguer au moins quatre niveaux — titre, prix, texte
  courant, information secondaire — appliqués de façon identique sur les deux dispositions.

#### Icônes

- **FR-015**: L'interface MUST NOT contenir d'emoji.
- **FR-016**: Les caractères texte employés comme pictogrammes (`★`, `✓`, `←`, `↑`, `↓`, `⌖`) MUST être
  remplacés par des icônes d'un jeu unique et cohérent, y compris dans les repères de prix de la carte.
- **FR-017**: Les icônes MUST hériter de la couleur du texte et donc suivre les thèmes clair et sombre.
- **FR-018**: Une icône décorative MUST être ignorée par les technologies d'assistance ; un contrôle
  réduit à une icône MUST porter un intitulé accessible.
- **FR-019**: Aucune information MUST NOT reposer sur la seule icône ou la seule couleur ; un texte
  MUST rester disponible (reprise de 004 FR-008).

#### Contrôles

- **FR-020**: Les contrôles MUST se répartir en au plus trois niveaux visuels : action principale,
  action secondaire, choix. Un même niveau MUST avoir la même forme, la même hauteur et le même poids
  partout.
- **FR-021**: Sur mobile, les contrôles posés sur la carte MUST NOT exiger de défilement horizontal :
  les six carburants MUST tous être atteignables d'un seul toucher, sans geste de glissement
  (002 FR-007). Ils MUST tenir sur au plus deux rangées et occuper au plus 25 % de la hauteur de
  l'écran.
  *(Révisée le 2026-09-18. La version initiale exigeait **une seule** rangée : à 360 px, les six
  carburants et les trois rayons n'y tiennent pas, et la rangée devenait défilante. La lettre de
  002 FR-007 était respectée — les carburants « existaient » — mais son intention était détruite,
  puisqu'il fallait faire défiler pour atteindre le sien. La contrainte de rangée unique, inventée
  par 007, cède devant l'exigence fonctionnelle de 002.)*
- **FR-022**: Sur ordinateur, le titre et les contrôles de recherche (carburant, rayon, recherche de
  lieu, « Ma position ») MUST être regroupés en haut de la colonne gauche. Aucun bandeau de contrôles
  pleine largeur MUST NOT exister.
- **FR-023**: Le bouton « Chercher ici » MUST être un élément flottant posé sur la carte, dans les
  deux dispositions, et MUST n'apparaître qu'après un déplacement ou un zoom de la carte depuis la
  dernière recherche ; il MUST disparaître une fois la recherche relancée. Ce déclenchement est une
  règle d'affichage : la capacité de rechercher au centre de la carte (001/002) reste inchangée.
- **FR-024**: Toutes les cibles interactives MUST conserver au moins 44 × 44 px (constitution,
  principe IV).
- **FR-025**: L'indicateur de focus clavier MUST être visible sur tous les contrôles, dans les deux
  thèmes.

#### Continuité

- **FR-026**: Les règles de 004 MUST continuer de s'appliquer : valeurs visuelles issues d'échelles
  définies une seule fois, thèmes clair et sombre automatiques, contrastes 4,5:1 (texte courant) et
  3:1 (grands textes, icônes, bordures porteuses de sens), transitions de moins de 250 ms supprimées
  avec « réduire les animations », utilisabilité à 200 % de taille de police système.
- **FR-027**: Toute nouvelle ressource visuelle (typographie, jeu d'icônes) MUST être justifiée en une
  ligne dans le plan et MUST NOT faire doublon avec une ressource déjà présente (constitution,
  principe II).

### Key Entities

Aucune nouvelle donnée. Aucune nouvelle notion de présentation au-delà de celles de 004 (thème) et 006
(tri).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sur une fenêtre de 1280 × 800, la liste des stations est dans une colonne à gauche et la
  carte occupe 100 % de la hauteur de la zone de contenu à droite.
- **SC-002**: Sur cette même fenêtre, au moins 10 stations sont lisibles dans la colonne gauche sans
  défiler.
- **SC-003**: Sur une fenêtre de 1600 × 900, la carte occupe une part de largeur supérieure à celle
  qu'elle occupe sur 1280 × 800 (la colonne gauche ne s'étire pas).
- **SC-004**: Le nombre d'emojis dans l'interface est de 0, et 100 % des pictogrammes proviennent d'un
  jeu d'icônes unique.
- **SC-005**: Le rendu typographique est identique sur au moins deux systèmes d'exploitation différents
  et hors ligne dans l'APK Android.
- **SC-006**: Aucun texte n'est invisible pendant le chargement de la page, et le décalage de mise en
  page dû à la typographie est imperceptible.
- **SC-007**: Sur 360 × 740, aucun contrôle ne demande de défilement horizontal, les six carburants
  sont tous atteignables d'un toucher, et l'ensemble tient sur au plus deux rangées occupant au plus
  25 % de la hauteur.
- **SC-008**: 100 % des contrôles interactifs mesurent au moins 44 × 44 px et affichent un focus clavier
  visible dans les deux thèmes.
- **SC-009**: 100 % des couples couleur texte / fond atteignent 4,5:1 (texte courant) ou 3:1 (grands
  textes, icônes, bordures porteuses de sens), dans les deux thèmes.
- **SC-010**: 100 % des scénarios d'acceptation de 001, 002, 003, 005 et 006 passent encore, hors les
  exigences de disposition explicitement remplacées par FR-002.
- **SC-011**: À 200 % de taille de police système, aucun chevauchement ni texte tronqué involontaire sur
  les deux dispositions, et aucun défilement horizontal de la page à 360 px ni entre 768 et 1024 px.
- **SC-012**: La bascule 767 ↔ 768 px conserve carburant, rayon, résultats, tri, sélection et fiche
  ouverte.
- **SC-013**: Sur ordinateur, ouvrir une fiche puis revenir au tableau restitue le tri, la position de
  défilement et la ligne sélectionnée, et la carte n'a changé ni de taille ni de cadrage.
- **SC-014**: Sur ordinateur, aucun bandeau ne traverse la page : le seul contrôle posé sur la carte est
  « Chercher ici », et il n'est visible qu'après un déplacement ou un zoom de la carte.

## Assumptions

### Références consultées

Le skill de design demandé n'existe pas dans cet environnement ; à la place, la direction s'appuie sur
des références effectivement consultées le 2026-09-18 :

- **Map UI Patterns** (mapuipatterns.com) : la disposition demandée correspond aux motifs catalogués
  *Store locator* (liste de lieux consultable à côté de la carte), *Partial map* (la carte réserve une
  place au panneau de liste), *Location list*, *List and details* et *Search this area* — motif déjà
  implémenté par le bouton « Chercher ici ». La demande n'est donc pas un goût personnel isolé mais le
  motif standard pour ce type d'application.
- **Typographie d'interface dense** : les comparatifs 2026 convergent sur un petit ensemble de familles
  libres conçues pour les interfaces denses et disposant de chiffres tabulaires — Inter (axe de taille
  optique, OFL), IBM Plex Sans et Source Sans 3 (rendu des chiffres soigné), Geist Sans (conçue pour
  les tableaux denses). **IBM Plex Sans est retenue** (clarification du 2026-09-18). Inter et Geist
  sont écartées volontairement : elles sont devenues les polices par défaut de l'écosystème (Vercel,
  Figma, shadcn/ui), donc précisément la signature du rendu générique que cette fonctionnalité
  cherche à corriger.
- **Jeux d'icônes** : Lucide (≈ 1 600 icônes, tracé unique, très faible poids, standard de fait de
  l'écosystème React) et Phosphor (plusieurs graisses, utile si un état actif « plein » est voulu). Là
  encore, le plan tranche ; la spec exige l'unicité et la cohérence du jeu.

### Hypothèses de périmètre

- **Le mobile n'est pas restructuré** (confirmé par clarification du 2026-09-18) : la carte plein écran
  et le panneau glissant de 002/004/006 sont conservés ; seuls typographie, icônes et hiérarchie des
  contrôles changent (FR-009).
- **Aucun changement fonctionnel** : pas de nouvelle donnée, pas de nouvel écran, pas de nouveau filtre.
- **Le contenu du tableau de 006 est conservé** : colonnes, tri, densité et accessibilité clavier
  définis par 006 restent la référence ; seule sa position dans la page change (clarification du
  2026-09-18 : la forme tableau est confirmée, une liste de cartes est écartée).
- **Une typographie et un jeu d'icônes sont des dépendances acceptables** au titre du principe II de la
  constitution (« améliore nettement l'interface »), à condition d'être auto-hébergés (FR-012) et
  justifiés en une ligne dans le plan (FR-027).
- **Pas de sélecteur de thème manuel** : inchangé depuis 004.
- **Hors périmètre** : illustrations, animations complexes, changement de bibliothèque de carte,
  refonte des textes, personnalisation par l'utilisateur, changement de source de données.
