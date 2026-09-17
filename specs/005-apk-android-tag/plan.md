# Implementation Plan: APK Android produit à chaque tag `v*`

**Branch**: `005-apk-android-tag` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-apk-android-tag/spec.md`

## Summary

Le site existant est empaqueté dans une application Android avec Capacitor : un projet `android/`
versionné, une configuration unique, et deux comportements natifs (autorisation de localisation,
bouton « retour »). Une GitHub Action déclenchée par les tags `v*` vérifie les types et les tests,
construit le site puis l'APK avec la version du tag, crée la release si besoin et y attache l'APK.

## Technical Context

**Language/Version**: TypeScript 7 / React 19 pour le web ; projet Android généré par Capacitor 8.5.2
(Java 21 côté construction).

**Primary Dependencies**: `@capacitor/core`, `@capacitor/android`, `@capacitor/app`,
`@capacitor/geolocation` (runtime) ; `@capacitor/cli` (dev). Versions 8.5.x vérifiées sur npm le
2026-09-17 ; `@capacitor/android` exige `@capacitor/core ^8.5.0`, `@capacitor/cli` exige Node ≥ 22.

**Storage**: inchangé (`localStorage` dans la WebView).

**Testing**: Vitest + `tsc --noEmit` comme aujourd'hui, exécutés par l'action avant toute
construction ; l'APK lui-même se teste sur un téléphone (quickstart).

**Target Platform**: Android via WebView Capacitor ; le site reste identique sur navigateur.

**Project Type**: application web statique + enveloppe Android.

**Performance Goals**: exécution complète de l'action < 20 min (SC-001) ; ouverture de l'application
< 5 s (SC-003).

**Constraints**: dépôt GitHub **public** ; aucun secret dans le dépôt (APK signé en débogage) ;
aucune fonctionnalité ajoutée ou retirée ; comportement du bouton « retour » imposé par FR-015.

**Scale/Scope**: 1 fichier de configuration Capacitor, 1 projet `android/` généré, 1 workflow, 2
adaptations de code (localisation, bouton retour), README.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* Constitution **1.1.0**.

| Principe | Vérification | Avant | Après |
|----------|--------------|-------|-------|
| I. Simplicité, pas de backend | Toujours aucun serveur : l'APK embarque le site et appelle les mêmes API publiques | ✅ | ✅ |
| II. Dépendances utiles | 4 paquets Capacitor, justifiés ci-dessous ; aucun autre | ✅ | ✅ |
| III. Logique pure et testée | `src/domain/` inchangé ; les adaptations natives restent dans `src/lib/` et `src/hooks/` | ✅ | ✅ |
| IV. Mobile | C'est l'objet même de la fonctionnalité ; l'interface reste celle de 004 | ✅ | ✅ |
| V. Aucun secret | APK signé avec la clé de débogage ; aucune clé dans le dépôt ; une signature de publication passerait par les secrets GitHub | ✅ | ✅ |
| VI. Documentation à jour | README : prérequis, procédure de tag, installation, version minimale d'Android | ✅ | ✅ |

**Dépendances (principe II)**

| Dépendance | Type | Apport |
|------------|------|--------|
| `@capacitor/core`, `@capacitor/android` | runtime | Enveloppe Android et pont natif : c'est l'approche retenue avec l'utilisateur |
| `@capacitor/geolocation` | runtime | Demande l'autorisation de localisation Android au bon moment ; sur le web, il délègue à `navigator.geolocation` (FR-008) |
| `@capacitor/app` | runtime | Événement du bouton « retour » matériel, impossible à intercepter autrement (FR-015) |
| `@capacitor/cli` | dev | Génère et synchronise le projet `android/` |

Aucune violation : la section Complexity Tracking est vide.

## Phase 0 — Décisions (research)

**R1. Environnement de construction** — Le runner `ubuntu-latest` de GitHub fournit déjà le SDK Android
(`ANDROID_HOME=/usr/local/lib/android/sdk`, **vérifié** dans la documentation des images de runner) ;
l'action ajoute seulement Java 21 (`actions/setup-java`) et Node. Aucun émulateur, aucun test
d'instrumentation : la construction se limite à `assembleDebug`.

**R2. Version issue du tag** — `android/app/build.gradle` lit `versionName` et `versionCode` depuis des
propriétés Gradle, avec des valeurs de repli. L'action passe `-PversionName=1.2.3` (tag sans le `v`) et
`-PversionCode=<numéro d'exécution>`, qui est monotone. La version s'affiche ensuite dans les
informations de l'application (SC-005).

**R3. Release** — `softprops/action-gh-release` crée la release du tag si elle n'existe pas et y
attache l'APK, sans la remplacer si elle existe déjà (clarification de la spec). Le dépôt étant
public, le lien est téléchargeable sans compte (FR-016).

**R4. Localisation native** — Dans une WebView, `navigator.geolocation` ne suffit pas : l'autorisation
Android doit être demandée à l'exécution. `src/lib/geolocation.ts` passe donc par
`@capacitor/geolocation`, dont l'implémentation web délègue à `navigator.geolocation` : le
comportement du site est inchangé, et les codes d'échec existants (`denied`, `unavailable`,
`timeout`, `unsupported`) sont conservés.

**R5. Bouton « retour »** — Un écouteur `App.addListener('backButton')` appelle une pile de fermeture :
fiche ouverte → fermer la fiche ; sinon panneau non replié → replier ; sinon quitter (FR-015). La règle
est une fonction pure testée (`backAction`), l'écouteur reste dans un hook.

**R6. Signature** — `assembleDebug` produit un APK signé avec la clé de débogage d'Android : aucun
secret, installation possible en autorisant les « sources inconnues ». Une signature de publication
resterait compatible (clé en secret GitHub, `assembleRelease`).

**R7. Projet `android/` versionné** — Le dossier généré est commité, pour que le manifeste, le nom et
l'icône soient modifiables et que la construction soit reproductible. `npx cap sync android` recopie
`dist/` avant chaque construction.

## Phase 1 — Conception

### Fichiers

```text
capacitor.config.ts             # appId, appName, webDir: 'dist'
android/                        # projet Android généré, versionné
  app/build.gradle              # versionName / versionCode depuis les propriétés Gradle
  app/src/main/AndroidManifest.xml  # permissions INTERNET et localisation
  app/src/main/res/…            # nom et icône de l'application
.github/workflows/android.yml   # déclencheur tags v*, contrôles, build, release
src/lib/geolocation.ts          # via @capacitor/geolocation
src/domain/backAction.ts        # règle pure du bouton retour (nouveau, testé)
src/hooks/useAndroidBackButton.ts # écouteur natif (nouveau)
tests/unit/backAction.test.ts   # nouveau
README.md                       # procédure de publication et d'installation
```

### Workflow

1. déclencheur : `push` sur `tags: ['v*']`
2. `actions/checkout`, `actions/setup-node` (Node 24, cache npm), `actions/setup-java` (Temurin 21)
3. `npm ci`, `npm run typecheck`, `npm test` — un échec arrête tout (FR-003)
4. `npm run build`, `npx cap sync android`
5. `./gradlew assembleDebug -PversionName=<tag sans v> -PversionCode=<run number>`
6. renommage en `carbumap-<version>.apk`, puis release + pièce jointe

**Structure Decision**: le projet Android est un dossier de plus à la racine, sans toucher à
l'organisation de `src/` ; les deux adaptations natives suivent la séparation existante (règle pure
dans `domain/`, effet dans `hooks/` et `lib/`).

## Relevé d'implémentation (2026-09-17)

- Projet `android/` généré par `npx cap add android` **sans SDK Android local** : la génération ne
  demande que Node (vérifié). Les deux plugins (`@capacitor/app`, `@capacitor/geolocation`) ont été
  détectés automatiquement.
- Valeurs par défaut du projet généré : `minSdkVersion = 24`, `targetSdkVersion = 36`. **Relevé à 26**
  (Android 8.0) à la convergence : l'icône du projet est vectorielle, donc réservée aux icônes
  adaptatives (API 26+) ; en dessous, Android aurait affiché l'icône Capacitor par défaut. Les PNG
  hérités ont été supprimés.
- Tests : 69 (66 + 3 pour `backAction`). Build web : 178,2 Ko de JS compressés (contre 174,4 avant),
  l'augmentation venant des plugins Capacitor chargés côté web.
- `npm audit` signale 3 vulnérabilités modérées, toutes dans `@capacitor/cli` (via `xcode` → `uuid`) :
  outillage de développement, jamais livré dans l'APK. `npm audit fix --force` rétrograderait
  Capacitor : non appliqué.
- **Non vérifié** : la construction Gradle elle-même (aucun SDK Android ici) et donc l'APK.

## Complexity Tracking

Aucune violation de la constitution à justifier.
