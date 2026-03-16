# Guide Fonctionnel — Hero Realms Campaign Tracker

> Documentation complète des fonctionnalités implémentées dans l'application.
> Dernière mise à jour : Mars 2026

---

## Présentation

Hero Realms Campaign Tracker est un **tracker de campagne pour le jeu de plateau Hero Realms**. Il permet aux joueurs de suivre leur progression entre les parties : profils joueurs, aventures de héros, sessions de combat avec suivi de PV en temps réel, et progression (XP, niveaux, loot).

L'application est conçue pour être utilisée **sur mobile pendant les parties** (Life Tracker) et **sur desktop pour la gestion** (profils, stats, aventures).

---

## Glossaire

| Terme        | Définition                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **Profil**   | Un joueur réel (ex: Alice, Bob). Possède plusieurs aventures et des statistiques globales.        |
| **Héros**    | Un personnage d'une classe donnée (Archer, Clerc, Guerrier, Sorcier, Voleur).                     |
| **Aventure** | La progression d'un profil avec un héros spécifique. Peut être mise en pause et reprise.          |
| **Partie**   | Une session de jeu unique datée, impliquant un ou plusieurs joueurs. S'inscrit dans une aventure. |

---

## 1. Gestion des Profils

### Vue d'accueil
L'écran d'accueil affiche la **liste de tous les profils joueurs** sous forme de cartes. Chaque carte montre le nom du joueur, le nombre d'aventures et le nombre de victoires. Un clic mène à la page détail du profil.

**Pourquoi :** Permettre un accès rapide à chaque joueur dès l'ouverture de l'app, sans navigation complexe.

### Création d'un profil
- Champ requis : **Nom du joueur** (min 1 caractère, validation Zod)
- Via un dialog modal depuis la page d'accueil
- Nombre de profils : illimité

### Page détail profil
Affiche pour un joueur donné :
- **Section Aventures** : groupées par statut (En cours / En pause / Terminées)
- **Section Statistiques** : 6 indicateurs (voir §7)
- Bouton "Nouvelle aventure" pour créer un nouveau héros

### Suppression de profil
- Suppression en cascade : supprime aussi toutes les aventures et participations aux parties

**Fichiers clés :**
- `app/page.tsx` — Page d'accueil
- `app/profiles/[profileId]/page.tsx` — Détail profil
- `app/actions/profiles.ts` — Server Actions (CRUD)
- `components/profiles/` — Composants UI

---

## 2. Aventures & Héros

### Création d'une aventure
- Lie **un profil joueur** à **une classe de héros** via un dialog de sélection visuel
- 5 classes disponibles, chacune avec sa couleur et ses PV max :

| Classe     | PV Max | Couleur |
| ---------- | ------ | ------- |
| Guerrier   | 50     | Rouge   |
| Clerc      | 55     | Jaune   |
| Archer     | 45     | Vert    |
| Sorcier    | 40     | Bleu    |
| Voleur     | 45     | Gris    |

- Initialisation : XP = 0, Niveau = 1, Compteur de Batailles = 0, Rang Capacité = 1, Rang Compétence = 1

**Pourquoi :** Chaque joueur peut mener plusieurs aventures en parallèle avec des héros différents, reflétant les règles de campagne de Hero Realms.

### Gestion des aventures
- Un profil peut avoir **plusieurs aventures simultanées**
- Une aventure peut être **mise en pause** et **reprise** à tout moment
- Les aventures sont identifiées par : Classe du héros + Date de début

### Page détail aventure
Affiche toutes les informations de progression :
- Classe + badge coloré + statut
- Niveau + barre XP (0→100)
- PV Max (incluant bonus santé)
- Rang Capacité (étoiles /5)
- Rang Compétence (/3)
- Améliorations Santé (/2)
- Inventaire (4 slots)
- Compteur de batailles
- Contrôles : Pause / Reprendre

**Fichiers clés :**
- `app/adventures/[adventureId]/page.tsx` — Détail aventure
- `app/actions/adventures.ts` — Server Actions
- `components/adventures/` — Composants UI
- `lib/constants.ts` — Constantes (MAX_HP, rangs, etc.)

---

## 3. Lancement d'une Partie

### Game Setup Wizard (2 étapes)
1. **Sélection des profils** participants (minimum 2 joueurs)
2. **Choix de l'aventure** pour chaque profil :
   - Reprendre une aventure existante (active ou en pause)
   - Créer une nouvelle aventure (sélection de classe)

### Gardes de sécurité
- Un joueur avec un **level-up en attente** ne peut pas être sélectionné (bouton "Nouvelle Partie" désactivé avec tooltip explicatif)
- Validation côté serveur avant la création de la partie

### Déroulement
- La partie est **datée automatiquement**
- Les **PV de chaque héros sont remis à leur maximum** en début de combat

**Pourquoi :** Le wizard en 2 étapes simplifie le flux. Le blocage sur level-up en attente force les joueurs à faire leurs choix de progression avant de relancer une partie, comme dans les règles du jeu.

**Fichiers clés :**
- `app/game/new/` — Page setup
- `app/game/new/_components/game-setup-wizard.tsx` — Wizard multi-étapes
- `app/actions/games.ts` — `createGame()`, `startCombat()`
- `components/shared/new-game-button.tsx` — Bouton avec état désactivé

---

## 4. Interface de Combat (Life Tracker)

### Compteur de PV
- Affichage proéminent des PV actuels (gros chiffre mono)
- Barre de vie visuelle avec couleurs dynamiques
- Boutons d'ajustement : **-5 / -1 / +1 / +5** (grille 2x2, min 72px pour le tactile)

### Etats visuels des PV
| Condition | Affichage |
| --------- | --------- |
| Normal | Texte blanc, barre verte |
| Surplus (HP > Max) | Texte jaune, barre jaune |
| Critique (HP < 20%) | Texte rouge pulsant, barre rouge |
| Mort (HP = 0) | Texte rouge destructif |

### Layout responsive
- **Mobile** : participants empilés verticalement (1 colonne)
- **Tablette** : grille 2 colonnes
- **Desktop** : grille 3 colonnes

### Gestion d'état
- Les PV sont gérés localement via **Zustand** pendant le combat (réactivité immédiate)
- Synchronisation en base via Server Action `updateHp()`

**Pourquoi :** Le Life Tracker est l'écran le plus utilisé pendant une partie réelle. L'utilisation de Zustand pour l'état local garantit des mises à jour instantanées sans attendre le serveur. Les boutons sont dimensionnés pour le tactile car l'app est utilisée sur mobile pendant le jeu.

**Fichiers clés :**
- `app/game/[gameId]/combat/page.tsx` — Page combat
- `components/game/hp-tracker.tsx` — Composant HP par joueur
- `stores/game-store.ts` — Zustand store (participants, HP)
- `hooks/use-active-game.ts` — Hook d'accès au store

---

## 5. Fin de Partie & Progression

### Désignation du gagnant
- Sélection via radio buttons parmi les participants
- Aperçu XP en temps réel :
  - Gagnant : **+30 XP** (surligné bleu)
  - Autres joueurs : **+10 XP**

### Moteur d'XP
- Seuil de level-up : **100 XP**
- **Mécanique de rollover** : l'XP excédentaire est conservé
  - Exemple : 90 XP + 30 XP = Niveau suivant avec 20/100 XP
- Le serveur calcule automatiquement les level-ups et déclenche `pendingLevelUp`

**Pourquoi :** Le rollover évite que les joueurs "perdent" de l'XP en dépassant le seuil. Le mécanisme de `pendingLevelUp` force le choix d'amélioration avant la prochaine partie.

### Level-Up
Quand un joueur atteint 100 XP, il choisit **1 amélioration parmi 3 catégories** :

| Catégorie                            | Effet                              | Limite          |
| ------------------------------------ | ---------------------------------- | --------------- |
| **Capacité** (Action Or)             | Rang +1 (affiché en étoiles)       | Rang 5 maximum  |
| **Compétence** (Une fois par partie) | Rang +1                            | Rang 3 maximum  |
| **Santé**                            | Palier 1 : +5 PV / Palier 2 : +10 PV | 2 max       |

- Les options au maximum sont **grisées et non sélectionnables**
- **Animation de confettis** au chargement de la page (or, orange, blanc)
- Gestion multi-joueurs : choix séquentiel, les joueurs terminés sont marqués "Terminé"

**Fichiers clés :**
- `app/game/[gameId]/end/page.tsx` — Sélection gagnant
- `app/game/[gameId]/levelup/page.tsx` — Choix level-up
- `components/game/levelup-choice.tsx` — Cartes de choix
- `components/game/end-game-content.tsx` — Flux de fin
- `lib/xp.ts` — Calcul XP et rollover
- `app/actions/adventures.ts` — `applyLevelUp()`

---

## 6. Système de Loot

### Déclencheur
Le loot est basé sur le **compteur de batailles** de chaque aventure :

| Bataille      | Type de Loot |
| ------------- | ------------ |
| 3 et 6        | Loot Mineur  |
| 9 et 12       | Loot Majeur  |
| Au-delà de 12 | Aucun loot   |

### Attribution
- **Modal avec confettis** (or, orange, argent) à l'obtention d'un loot
- Affichage du type (Majeur/Mineur) et de la classe du héros
- Champ de saisie pour le **nom du trésor** (texte libre)
- Option de passer (bouton "Passer")
- Traitement séquentiel si plusieurs joueurs ont un loot

### Inventaire
- **4 emplacements** visuels (grille avec slots vides/remplis)
- Le trésor est purement informatif (nom/type, sans effet mécanique)

**Pourquoi :** Le système de loot reproduit fidèlement les règles de campagne Hero Realms. L'inventaire est volontairement simple (juste un nom) car les effets sont gérés physiquement avec les cartes du jeu.

**Fichiers clés :**
- `components/game/end-game-content.tsx` — Dialog de loot
- `components/shared/inventory-slots.tsx` — Affichage inventaire
- `app/actions/loot.ts` — `assignLoot()`, `replaceLoot()`
- `lib/loot.ts` — `getLootType()`, `canReceiveLoot()`
- `lib/constants.ts` — `LOOT_TABLE`

---

## 7. Statistiques (Vue Profil)

La page profil affiche **6 indicateurs** dans une grille :

| Statistique | Calcul |
| ----------- | ------ |
| **Parties jouées** | Nombre total de parties (tous héros confondus) |
| **Victoires** | Parties gagnées (affiché en vert) |
| **Défaites** | Parties perdues (affiché en rouge) |
| **Classe favorite** | Classe la plus jouée (badge coloré) |
| **Niveau max** | Plus haut niveau atteint (tous héros) |
| **XP total** | Somme de (niveau × 100 + XP) sur toutes les aventures |

**Pourquoi :** Ces statistiques donnent une vue d'ensemble de la progression globale d'un joueur à travers toutes ses aventures, motivant le jeu à long terme.

**Fichiers clés :**
- `components/profiles/profile-stats.tsx` — Affichage stats
- `app/actions/stats.ts` — `getProfileStats()` (requêtes SQL optimisées)

---

## 8. Design & Expérience Utilisateur

### Thème visuel
- **Dark mode** permanent (pas de mode clair)
- Esthétique **fantasy/Warcraft** via les composants warcraftcn-ui
- Typographie : **Cinzel** (titres, headings) + **Geist Mono** (détails, stats)

### Code couleur par classe
| Classe   | Couleur                    | CSS Variable       |
| -------- | -------------------------- | ------------------- |
| Archer   | Vert (`rgb(134,239,172)`)  | `--color-archer`    |
| Clerc    | Jaune (`rgb(253,224,71)`)  | `--color-clerc`     |
| Guerrier | Rouge (`rgb(239,68,68)`)   | `--color-guerrier`  |
| Sorcier  | Bleu (`rgb(96,165,250)`)   | `--color-sorcier`   |
| Voleur   | Gris (`rgb(107,114,128)`)  | `--color-voleur`    |

### Animations
- **Confettis Level-Up** : or, orange, rouge foncé, blanc (via `canvas-confetti`)
- **Confettis Loot** : or, orange, argent

### Feedback visuel
- HP surplus > max : jaune
- HP critique < 20% : rouge pulsant
- Bouton "Nouvelle Partie" désactivé avec tooltip si level-up en attente
- Spinners et skeletons pendant les chargements (style Warcraft)

### Responsive
- Mobile-first (Tailwind v4)
- Grilles adaptatives : 1 col mobile → 2-3 cols desktop
- Dialogs : adaptés mobile/desktop
- Boutons HP : min 72px pour le tactile

### Accessibilité
- Attributs ARIA (`aria-label`, `aria-invalid`, `aria-describedby`, `aria-disabled`)
- Focus visible (`focus-visible:ring-2`)
- Labels sur tous les formulaires
- HTML sémantique (headings, buttons, links)

**Fichiers clés :**
- `app/globals.css` — Variables CSS, thème, couleurs
- `app/layout.tsx` — Fonts, dark mode
- `components/ui/warcraftcn/` — Composants thématiques (10 composants)
- `components/ui/` — Composants shadcn/ui (17 composants)
- `components/shared/confetti.tsx` — Animations confettis

---

## 9. Persistance & Architecture

### Server Actions (pas de REST API)
Toutes les mutations passent par des **Next.js Server Actions** (`"use server"`), offrant :
- Typage bout en bout (TypeScript client ↔ serveur)
- Pas d'overhead HTTP
- Invalidation automatique des données (revalidatePath)

### Base de données
- **PostgreSQL** (Neon Serverless) via **Drizzle ORM**
- 4 tables : `profiles`, `adventures`, `games`, `gameParticipants`
- Cascading deletes configurés
- Validation d'entrée avec **Zod** sur chaque Server Action

### Etat UI
- **Zustand** uniquement pour l'état éphémère du combat (HP en temps réel)
- La base de données est la **source de vérité** pour toute donnée persistante

**Pourquoi ces choix :** Voir [TECHNICAL_CHOICES.md](../TECHNICAL_CHOICES.md) pour l'analyse détaillée des trade-offs.
