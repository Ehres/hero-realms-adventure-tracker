# Plan d'Implémentation — Hero Realms Campaign Tracker

> Basé sur [PRD.md](./PRD.md) et [TECHNICAL_CHOICES.md](./TECHNICAL_CHOICES.md)
> Dernière mise à jour : Mars 2026

---

## Phase 1 — Initialisation du Projet

**Objectif :** Avoir un projet Next.js 16 fonctionnel avec toute la toolchain configurée.

### 1.1 Scaffolding Next.js 16
- [ ] `pnpm create next-app@latest` avec TypeScript, App Router, Tailwind CSS v4, ESLint
- [ ] Vérifier que `turbopack` est activé par défaut (bundler dev)
- [ ] Configurer `tsconfig.json` en mode strict :
  ```json
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
  ```
- [ ] Configurer les alias de chemin (`@/` → racine du projet)

### 1.2 Dépendances principales
- [ ] `pnpm add drizzle-orm @neondatabase/serverless zustand zod`
- [ ] `pnpm add -D drizzle-kit`

### 1.3 shadcn/ui
- [ ] `pnpm dlx shadcn@latest init` — initialiser shadcn dans le projet
- [ ] Installer les composants de base : `button`, `card`, `dialog`, `select`, `badge`, `input`, `label`, `progress`

### 1.4 warcraftcn-ui
- [ ] Tester la compatibilité avec Tailwind CSS v4
- [ ] Installer les composants warcraftcn souhaités (button, card, badge, input) via la CLI shadcn
- [ ] Si incompatibilité Tailwind v4 : documenter et rester sur les composants shadcn standards

### 1.5 Thème CSS (globals.css)
- [ ] Définir les variables CSS pour les couleurs par classe de héros :
  - Archer → Vert
  - Clerc → Jaune / Blanc
  - Guerrier → Rouge
  - Sorcier → Bleu
  - Voleur → Gris / Noir
- [ ] Définir le thème global (background sombre, typographie fantasy si pertinent)

### 1.6 Structure de dossiers
- [ ] Créer l'arborescence vide selon `TECHNICAL_CHOICES.md` §8 :
  - `app/actions/`
  - `app/profiles/[profileId]/`
  - `app/adventures/[adventureId]/`
  - `app/game/new/`
  - `app/game/[gameId]/combat/`
  - `app/game/[gameId]/end/`
  - `app/game/[gameId]/levelup/`
  - `components/profiles/`
  - `components/adventures/`
  - `components/game/`
  - `components/shared/`
  - `db/`
  - `stores/`
  - `types/`
  - `lib/`
  - `hooks/`
  - `public/icons/`

**Livrable Phase 1 :** `pnpm dev` lance l'application sans erreur, la page d'accueil affiche un placeholder.

---

## Phase 2 — Base de Données & Couche Données

**Objectif :** Avoir le schéma SQL défini, les migrations générées, et la connexion Neon opérationnelle.

### 2.1 Configuration Neon
- [ ] Provisionner une base Neon via le dashboard Vercel (Storage → Neon Postgres)
- [ ] Récupérer `DATABASE_URL` et l'ajouter dans `.env.local`
- [ ] S'assurer que `.env.local` est dans `.gitignore`

### 2.2 Client Drizzle (`db/index.ts`)
- [ ] Configurer le client Drizzle avec le driver `neon-http`
- [ ] Exporter l'instance `db`

### 2.3 Schéma (`db/schema.ts`)
- [ ] Table `profiles` : id, name, createdAt
- [ ] Table `adventures` : id, profileId (FK), heroClass, startedAt, status, level, xp, maxHp, battleCount, abilityRank, skillRank, healthUpgrades, inventory (text[]), pendingLevelUp
- [ ] Table `games` : id, date, status, winnerAdventureId
- [ ] Table `game_participants` : id, gameId (FK), adventureId (FK), currentHp
- [ ] Vérifier les index nécessaires (profileId sur adventures, gameId sur game_participants)

### 2.4 Configuration Drizzle Kit (`drizzle.config.ts`)
- [ ] Configurer le fichier `drizzle.config.ts` pointant vers le schéma et la DATABASE_URL

### 2.5 Migration initiale
- [ ] `pnpm drizzle-kit generate` — générer la migration
- [ ] `pnpm drizzle-kit migrate` — appliquer à la base Neon
- [ ] Commiter les fichiers de migration dans `drizzle/`

**Livrable Phase 2 :** Les tables existent en base, le client `db` est importable et fonctionnel.

---

## Phase 3 — Types Métier & Logique Pure

**Objectif :** Définir tous les types et implémenter la logique métier sans dépendance React.

### 3.1 Types (`types/index.ts`)
- [ ] `HeroClass` — union type : `"archer" | "clerc" | "guerrier" | "sorcier" | "voleur"`
- [ ] `AdventureStatus` — `"active" | "paused" | "completed"`
- [ ] `GameStatus` — `"setup" | "in-progress" | "finished"`
- [ ] `LevelUpChoice` — `"ability" | "skill" | "health"`
- [ ] `LootType` — `"minor" | "major" | null`
- [ ] Types inférés depuis le schéma Drizzle pour `Profile`, `Adventure`, `Game`, `GameParticipant`

### 3.2 Constantes (`lib/constants.ts`)
- [ ] `MAX_HP` par classe :
  - Guerrier : 50, Clerc : 55
  - Archer, Sorcier, Voleur : valeurs à définir (placeholder avec valeurs raisonnables, ex: 45, 40, 45)
- [ ] `XP_PER_WIN` = 30
- [ ] `XP_PER_LOSS` = 10
- [ ] `XP_THRESHOLD` = 100 (seuil de level-up)
- [ ] `MAX_ABILITY_RANK` = 5
- [ ] `MAX_SKILL_RANK` = 3
- [ ] `MAX_HEALTH_UPGRADES` = 2
- [ ] `HEALTH_UPGRADE_VALUES` = [5, 10] (palier 1 et 2)
- [ ] `INVENTORY_SLOTS` = 4
- [ ] `LOOT_TABLE` : `{ 3: "minor", 6: "minor", 9: "major", 12: "major" }`
- [ ] Couleurs par classe (mapping pour Tailwind)

### 3.3 Moteur d'XP (`lib/xp.ts`)
- [ ] `calculateXpGain(isWinner: boolean): number` — retourne 30 ou 10
- [ ] `applyXp(currentXp: number, currentLevel: number, gain: number): { newXp: number, newLevel: number, leveledUp: boolean }` — logique de rollover (ex: 90 + 30 = niveau+1 avec 20 XP restants)
- [ ] Tests unitaires pour les cas limites :
  - XP exact au seuil (100 pile)
  - Multi-level-up en un gain (peu probable mais robuste)
  - XP à 0 + gain < 100

### 3.4 Logique de Loot (`lib/loot.ts`)
- [ ] `getLootType(battleCount: number): LootType` — retourne "minor", "major" ou null selon le compteur
- [ ] `canReceiveLoot(battleCount: number): boolean`
- [ ] Tests unitaires pour chaque palier (3, 6, 9, 12, >12)

### 3.5 Validation Zod (`lib/validators.ts`)
- [ ] Schéma de validation pour `createProfile` (name: string, min 1, max 50)
- [ ] Schéma pour `createAdventure` (profileId, heroClass)
- [ ] Schéma pour `endGame` (gameId, winnerAdventureId)
- [ ] Schéma pour `applyLevelUp` (adventureId, choice: LevelUpChoice)

**Livrable Phase 3 :** Toute la logique métier est testée unitairement et prête à être consommée.

---

## Phase 4 — Server Actions

**Objectif :** Implémenter toutes les mutations serveur avec validation des entrées.

### 4.1 Profils (`app/actions/profiles.ts`)
- [ ] `createProfile(name: string)` — valider avec Zod, insérer en base, retourner l'id
- [ ] `deleteProfile(profileId: string)` — supprimer le profil et ses aventures associées (cascade)
- [ ] `getProfiles()` — récupérer tous les profils (Server Component query)
- [ ] `getProfile(profileId: string)` — récupérer un profil avec ses aventures et statistiques

### 4.2 Aventures (`app/actions/adventures.ts`)
- [ ] `createAdventure(profileId: string, heroClass: HeroClass)` — initialiser avec XP=0, Level=1, maxHp selon classe
- [ ] `pauseAdventure(adventureId: string)` — passer le status à "paused"
- [ ] `resumeAdventure(adventureId: string)` — passer le status à "active"
- [ ] `applyLevelUp(adventureId: string, choice: LevelUpChoice)` — appliquer le choix :
  - `"ability"` → abilityRank +1 (vérifier max 5)
  - `"skill"` → skillRank +1 (vérifier max 3)
  - `"health"` → healthUpgrades +1, maxHp + bonus (vérifier max 2)
  - Passer `pendingLevelUp` à `false`
- [ ] `getAdventure(adventureId: string)` — détail complet d'une aventure

### 4.3 Parties (`app/actions/games.ts`)
- [ ] `createGame(adventureIds: string[])` — créer une partie + participants, vérifier qu'aucun participant n'a `pendingLevelUp`
- [ ] `startCombat(gameId: string)` — passer le status à "in-progress", remettre les HP à max
- [ ] `updateHp(participantId: string, newHp: number)` — mettre à jour les HP d'un participant
- [ ] `endGame(gameId: string, winnerAdventureId: string)` :
  1. Passer le status à "finished"
  2. Attribuer 30 XP au gagnant, 10 XP aux autres
  3. Appliquer la logique de level-up (rollover) et mettre `pendingLevelUp` si nécessaire
  4. Incrémenter `battleCount` de chaque aventure participante
  5. Vérifier et déclencher le loot si applicable
  6. `revalidatePath` pour rafraîchir les données

### 4.4 Loot (`app/actions/loot.ts`)
- [ ] `assignLoot(adventureId: string, lootName: string)` — ajouter au tableau inventory
- [ ] `replaceLoot(adventureId: string, slotIndex: number, newLootName: string)` — remplacer un trésor existant si inventaire plein

**Livrable Phase 4 :** Toutes les mutations sont fonctionnelles et testables via des appels directs.

---

## Phase 5 — Composants Partagés

**Objectif :** Créer les composants réutilisables avant les pages.

### 5.1 `components/shared/xp-bar.tsx`
- [ ] Barre de progression XP (0 → 100)
- [ ] Affichage du texte "XX / 100 XP"
- [ ] Couleur dorée pour le thème

### 5.2 `components/shared/star-rank.tsx`
- [ ] Affichage de N étoiles remplies sur un total de M (ex: 3/5)
- [ ] Props : `current: number`, `max: number`
- [ ] Utilisé pour Capacité (max 5) et Compétence (max 3)

### 5.3 `components/shared/inventory-slots.tsx`
- [ ] 4 emplacements visuels (grille 2x2 ou ligne)
- [ ] Affichage du nom du trésor ou emplacement vide
- [ ] Gestion du "swap" quand inventaire plein (via callback)

### 5.4 `components/adventures/hero-class-badge.tsx`
- [ ] Badge coloré selon la classe du héros
- [ ] Utilise les variables CSS `--color-{classe}`
- [ ] Props : `heroClass: HeroClass`

### 5.5 Layout racine (`app/layout.tsx`)
- [ ] Configuration des fonts (Google Fonts ou font locale fantasy)
- [ ] Import de `globals.css`
- [ ] Structure HTML de base avec thème sombre

**Livrable Phase 5 :** Composants partagés prêts, visibles via une page de test si nécessaire.

---

## Phase 6 — Gestion des Profils

**Objectif :** Implémenter l'écran d'accueil et la gestion complète des profils.

### 6.1 Page d'accueil (`app/page.tsx`)
- [ ] Server Component : charger les profils depuis la base
- [ ] Afficher la liste via `<ProfileList />`
- [ ] Bouton "Nouveau profil" ouvrant un dialog
- [ ] Bouton "Nouvelle Partie" visible en permanence (PRD §3)

### 6.2 `components/profiles/profile-list.tsx`
- [ ] Client Component
- [ ] Affiche les profils sous forme de cartes
- [ ] État vide : message d'invitation à créer un premier profil

### 6.3 `components/profiles/profile-card.tsx`
- [ ] Nom du joueur
- [ ] Nombre d'aventures en cours
- [ ] Lien vers la page de détail (`/profiles/[profileId]`)
- [ ] Résumé rapide : nombre de victoires, classe préférée

### 6.4 `components/profiles/create-profile-dialog.tsx`
- [ ] Dialog shadcn/ui avec un champ "Nom du joueur"
- [ ] Validation côté client (min 1 caractère)
- [ ] Appel au Server Action `createProfile`
- [ ] Fermeture du dialog + rafraîchissement de la liste après création

### 6.5 Page détail profil (`app/profiles/[profileId]/page.tsx`)
- [ ] Server Component : charger le profil + ses aventures + statistiques
- [ ] Section **Aventures** : liste des aventures (actives, en pause, terminées)
- [ ] Section **Statistiques** (PRD §7) :
  - Nombre total de parties jouées
  - Victoires / Défaites
  - Classe la plus jouée
  - Niveau max atteint
  - Total XP gagné
  - Historique des aventures (classe, dates, niveau)
- [ ] Bouton "Nouvelle aventure" → ouvre un sélecteur de classe

**Livrable Phase 6 :** On peut créer des profils, les voir, consulter leurs stats (vides pour l'instant).

---

## Phase 7 — Gestion des Aventures

**Objectif :** Permettre la création, consultation et gestion des aventures.

### 7.1 Création d'une aventure
- [ ] Dialog ou page de sélection de la classe de héros (5 choix visuels)
- [ ] Chaque classe affiche : nom, couleur, PV Max
- [ ] Appel au Server Action `createAdventure`

### 7.2 `components/adventures/adventure-card.tsx`
- [ ] Classe du héros + badge coloré
- [ ] Niveau actuel + barre XP
- [ ] Statut (active / en pause)
- [ ] Rangs de Capacité (étoiles) et Compétence
- [ ] Compteur de batailles
- [ ] Bouton Pause / Reprendre

### 7.3 Page détail aventure (`app/adventures/[adventureId]/page.tsx`)
- [ ] Server Component : charger l'aventure complète
- [ ] Affichage détaillé :
  - Classe + couleur
  - Niveau + XP bar
  - PV Max (incluant bonus santé)
  - Rang Capacité (étoiles /5) + description de l'effet actuel
  - Rang Compétence (/3) + description de l'effet actuel
  - Inventaire (4 slots)
  - Historique des parties de cette aventure
- [ ] Actions disponibles : Pause / Reprendre / Supprimer

**Livrable Phase 7 :** Cycle complet profil → aventure fonctionnel.

---

## Phase 8 — Partie : Setup & Combat

**Objectif :** Implémenter le flux de lancement de partie et l'interface de combat (Life Tracker).

### 8.1 Zustand Game Store (`stores/game-store.ts`)
- [ ] État : `participants[]` (adventureId, currentHp, maxHp, profileName, heroClass)
- [ ] Actions : `initParticipants()`, `setHp(adventureId, delta)`, `reset()`
- [ ] Les HP ne descendent pas en dessous de 0
- [ ] Sélecteurs atomiques

### 8.2 Page Setup (`app/game/new/page.tsx`)
- [ ] Étape 1 : Sélection des profils participants (checkboxes)
- [ ] Étape 2 : Pour chaque profil, choix de l'aventure :
  - Reprendre une aventure existante (en pause ou active)
  - Créer une nouvelle aventure (sélection de classe)
- [ ] Vérification : aucun participant n'a `pendingLevelUp === true` (PRD §5.3)
- [ ] Bouton "Lancer la partie" → appel Server Action `createGame`

### 8.3 Écran récapitulatif pré-combat
- [ ] Pour chaque héros participant, afficher :
  - Nom du joueur + classe du héros
  - Effet actuel de la **Capacité** (selon rang)
  - Effet actuel de la **Compétence** (selon rang)
- [ ] Bouton "Commencer le combat" → redirection vers `/game/[gameId]/combat`

### 8.4 Page Combat (`app/game/[gameId]/combat/page.tsx`)
- [ ] Client Component principal utilisant le Zustand store
- [ ] Pour chaque héros :
  - Affichage proéminent des PV actuels (gros chiffre)
  - Couleur distincte si HP > maxHp (surplus de soin)
  - Couleur rouge/critique si HP bas
  - Boutons : **-5**, **-1**, **+1**, **+5**
  - Nom du joueur + classe (badge coloré)
- [ ] Layout responsive :
  - Mobile : participants empilés verticalement
  - Desktop : côte à côte (2-4 joueurs)
- [ ] Bouton "Fin de partie" en bas de l'écran

### 8.5 Hook `use-active-game.ts`
- [ ] Wrapper autour du Zustand store
- [ ] Accès simplifié aux participants et actions

**Livrable Phase 8 :** On peut lancer une partie, ajuster les PV en temps réel, et terminer la partie.

---

## Phase 9 — Fin de Partie & Progression

**Objectif :** Implémenter la mécanique de fin de partie, attribution d'XP, level-up et loot.

### 9.1 Page Fin de Partie (`app/game/[gameId]/end/page.tsx`)
- [ ] Sélection du gagnant parmi les participants (radio buttons)
- [ ] Affichage de l'aperçu XP :
  - Gagnant : "+30 XP"
  - Autres : "+10 XP"
- [ ] Bouton "Confirmer" → appel Server Action `endGame`
- [ ] Après confirmation :
  - Affichage du récapitulatif XP pour chaque joueur
  - Si level-up détecté → redirection vers `/game/[gameId]/levelup`
  - Si loot déclenché → notification/modal pour le loot
  - Sinon → retour à l'accueil

### 9.2 Page Level-Up (`app/game/[gameId]/levelup/page.tsx`)
- [ ] Pour chaque joueur ayant `pendingLevelUp === true` :
  - Affichage du nouveau niveau atteint
  - **Animation de célébration** (confettis / écran doré)
  - Choix parmi 3 catégories (si disponibles) :
    1. **Capacité** (Action Or) : rang actuel +1 → afficher les étoiles (max 5)
    2. **Compétence** (1x/partie) : rang actuel +1 (max 3)
    3. **Santé** : +5 PV (palier 1) ou +10 PV (palier 2) — max 2
  - Les options au maximum sont grisées / non sélectionnables
  - Bouton "Confirmer" → appel Server Action `applyLevelUp`

### 9.3 `components/game/levelup-choice.tsx`
- [ ] 3 cartes visuelles représentant chaque catégorie
- [ ] État sélectionné visuellement marqué
- [ ] Informations sur l'effet du rang suivant

### 9.4 Système de Loot (intégré à la fin de partie)
- [ ] Après `endGame`, vérifier `battleCount` de chaque aventure
- [ ] Si loot déclenché (bataille 3, 6, 9, 12) :
  - **Animation de célébration** (confettis)
  - Affichage du type de loot (Mineur / Majeur)
  - Champ de saisie pour le **nom du trésor** (l'application ne gère pas les effets, juste le nom)
  - Si inventaire plein (4 slots) : interface de remplacement (choisir quel trésor défausser)
  - Appel Server Action `assignLoot` ou `replaceLoot`

### 9.5 Flux complet de fin de partie (diagramme)
```
Combat terminé
    → Sélection du gagnant
    → Attribution XP (30/10)
    → Pour chaque aventure :
        ├── Incrémenter battleCount
        ├── Si level-up → pendingLevelUp = true
        └── Si loot (battleCount = 3,6,9,12) → déclencher loot
    → Redirection :
        ├── Si pendingLevelUp → /game/[gameId]/levelup
        ├── Si loot en attente → page loot (ou modal)
        └── Sinon → retour accueil
```

**Livrable Phase 9 :** Cycle complet de jeu fonctionnel (création → combat → fin → progression).

---

## Phase 10 — Statistiques

**Objectif :** Implémenter les vues de statistiques détaillées.

### 10.1 Statistiques profil (PRD §7)
- [ ] **Nombre total de parties jouées** : COUNT des game_participants liés aux aventures du profil
- [ ] **Victoires / Défaites** : COUNT des games où winnerAdventureId appartient au profil vs total
- [ ] **Classe la plus jouée** : GROUP BY heroClass sur les aventures, COUNT des parties
- [ ] **Niveau max atteint** : MAX(level) sur les aventures
- [ ] **Total XP gagné** : SUM calculé (level * 100 + xp) sur toutes les aventures
- [ ] **Historique des aventures** : liste triée par date (classe, dates début/fin, niveau)

### 10.2 Requêtes SQL optimisées
- [ ] Créer des fonctions de requête dédiées dans `app/actions/stats.ts`
- [ ] Utiliser les agrégats SQL de Drizzle (count, sum, max, groupBy)
- [ ] Éviter les N+1 queries

**Livrable Phase 10 :** La page profil affiche des statistiques complètes et à jour.

---

## Phase 11 — UX & Polish

**Objectif :** Animations, responsive, feedback visuel et finitions.

### 11.1 Animations
- [ ] **Confettis Level-Up** : utiliser une lib comme `canvas-confetti` ou `react-confetti`
- [ ] **Confettis Loot** : animation similaire au loot de trésor
- [ ] Transition douce entre les pages (App Router transitions)

### 11.2 Responsive Design
- [ ] Page d'accueil : grille de profils adaptative (1 col mobile, 2-3 cols desktop)
- [ ] Life Tracker : layout vertical (mobile) vs horizontal (desktop)
- [ ] Dialogs : plein écran sur mobile, modale centrée sur desktop
- [ ] Tester sur les breakpoints : `sm` (640px), `md` (768px), `lg` (1024px)

### 11.3 Feedback visuel
- [ ] HP surplus (> maxHp) : couleur verte/dorée distincte
- [ ] HP critique (< 20%) : couleur rouge pulsante
- [ ] Bouton "Nouvelle Partie" désactivé si level-up en attente (avec tooltip explicatif)
- [ ] États de chargement (Spinner / Skeleton pendant les Server Actions)

### 11.4 Accessibilité de base
- [ ] Boutons HP suffisamment grands pour le tactile (min 44x44px)
- [ ] Contraste suffisant pour les textes sur fonds colorés
- [ ] Labels sur les formulaires

**Livrable Phase 11 :** Application visuellement polie et agréable à utiliser sur mobile et desktop.

---

## Phase 12 — Déploiement & Production

**Objectif :** Mettre l'application en production sur Vercel.

### 12.1 Configuration Vercel
- [ ] Connecter le dépôt Git à Vercel
- [ ] Provisionner Neon Postgres depuis le dashboard Vercel
- [ ] Vérifier que `DATABASE_URL` est injectée dans tous les environnements
- [ ] Configurer le domaine (si applicable)

### 12.2 CI/CD
- [ ] Vérifier que les preview deployments fonctionnent sur chaque branche/PR
- [ ] Script de migration automatique ou manuelle avant déploiement
- [ ] Ajouter un script `postbuild` ou `predeploy` pour les migrations si nécessaire

### 12.3 Vérifications finales
- [ ] Build de production sans erreur (`pnpm build`)
- [ ] Test sur mobile réel (iOS Safari, Android Chrome)
- [ ] Vérifier les performances (Lighthouse)
- [ ] Vérifier que `.env.local` n'est pas commité

**Livrable Phase 12 :** Application déployée et accessible en production.

---

## Récapitulatif des Phases

| Phase | Nom                          | Dépend de | Effort estimé |
| ----- | ---------------------------- | --------- | ------------- |
| 1     | Initialisation Projet        | —         | 1-2h          |
| 2     | Base de Données              | 1         | 1-2h          |
| 3     | Types & Logique Métier       | 1         | 2-3h          |
| 4     | Server Actions               | 2, 3      | 3-4h          |
| 5     | Composants Partagés          | 1         | 2-3h          |
| 6     | Gestion des Profils          | 4, 5      | 3-4h          |
| 7     | Gestion des Aventures        | 6         | 3-4h          |
| 8     | Partie : Setup & Combat      | 7         | 4-5h          |
| 9     | Fin de Partie & Progression  | 8         | 4-5h          |
| 10    | Statistiques                 | 9         | 2-3h          |
| 11    | UX & Polish                  | 10        | 3-4h          |
| 12    | Déploiement                  | 11        | 1-2h          |

**Effort total estimé : ~30-40 heures**

---

## Points en suspens (à résoudre avant/pendant l'implémentation)

| #   | Sujet                  | Détail                                                                 | Phase impactée |
| --- | ---------------------- | ---------------------------------------------------------------------- | -------------- |
| 1   | PV Max                 | Valeurs à définir pour Archer, Sorcier et Voleur                       | 3              |
| 2   | Résultat solo          | Victoire automatique ou choix libre ?                                  | 9              |
| 3   | Textes des capacités   | Table des effets par rang (Capacité 1→5, Compétence 1→3) par classe   | 7, 8           |
| 4   | warcraftcn + Tailwind v4 | Compatibilité à vérifier à l'initialisation                          | 1              |
