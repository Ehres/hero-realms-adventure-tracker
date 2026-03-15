# Choix Techniques — Hero Realms Campaign Tracker

> Document de référence pour les décisions d'architecture et de stack technique.
> Version : 1.1 — Mars 2026

---

## 1. Vue d'ensemble

| Catégorie          | Choix retenu                        | Statut     |
| ------------------ | ----------------------------------- | ---------- |
| Framework          | Next.js 16 (App Router)             | Retenu     |
| Langage            | TypeScript (strict mode)            | Retenu     |
| UI Components      | shadcn/ui + warcraftcn-ui           | Retenu     |
| Styles             | Tailwind CSS v4                     | Retenu     |
| État global        | Zustand (état UI éphémère)          | Retenu     |
| Stockage           | Vercel Postgres (Neon)              | Retenu     |
| ORM                | Drizzle ORM                         | Retenu     |
| Déploiement        | Vercel                              | Retenu     |
| Gestionnaire deps  | pnpm                                | Recommandé |

---

## 2. Framework & Rendu

### Next.js 16 — App Router

Next.js 16 avec l'App Router est retenu comme framework principal.

**Justification :**

- Structure de fichiers claire et conventionnelle (`app/`, layouts, pages)
- Support natif de TypeScript
- Déploiement Vercel sans configuration (zéro friction)
- L'App Router permet un mélange fine-grained de Server Components et Client Components
- **React Compiler (stable)** : mémoïsation automatique, plus besoin de `useMemo`/`useCallback` manuels
- **Turbopack (stable)** : bundler par défaut, jusqu'à 10x plus rapide en dev
- **Cache Components** (`"use cache"`) : nouveau modèle de cache explicite et granulaire

**Stratégie de rendu :**

Cette application est un tracker interactif avec des données persistées en base. La stratégie est :

- **Server Components** : pages qui chargent les données depuis Neon (profils, aventures, stats)
- **Client Components** : composants interactifs temps réel (life tracker, formulaires, animations)

```tsx
// app/page.tsx — Server Component : charge les profils depuis la BDD
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ProfileList } from "@/components/profiles/profile-list";

export default async function HomePage() {
  const data = await db.select().from(profiles);
  return <ProfileList profiles={data} />;
}

// components/profiles/profile-list.tsx — Client Component : interactions UI
"use client";

export function ProfileList({ profiles }: { profiles: Profile[] }) {
  // gestion des interactions, animations, etc.
}
```

**Routing :**

| Route                            | Description                              |
| -------------------------------- | ---------------------------------------- |
| `/`                              | Liste des profils joueurs                |
| `/profiles/[profileId]`          | Détail d'un profil (aventures + stats)   |
| `/adventures/[adventureId]`      | Détail d'une aventure                    |
| `/game/new`                      | Lancement d'une nouvelle partie          |
| `/game/[gameId]/combat`          | Interface de combat (Life Tracker)       |
| `/game/[gameId]/end`             | Fin de partie, attribution XP            |
| `/game/[gameId]/levelup`         | Choix d'amélioration après level-up      |

---

## 3. UI & Design System

### shadcn/ui

shadcn/ui est une collection de composants **copiés dans le projet** (pas une dépendance npm classique). Les composants sont installés à la demande via la CLI :

```bash
pnpm dlx shadcn@latest add button card dialog select
```

Les composants sont placés dans `components/ui/` et sont entièrement modifiables.

**Avantage clé :** contrôle total sur le style et le comportement — pas de sur-couche de bibliothèque tierce à surcharger.

### warcraftcn-ui

[warcraftcn-ui](https://warcraftcn.com) est une bibliothèque de composants open source inspirée de l'interface de **Warcraft III**, construite sur shadcn/ui. Même architecture copy-paste — les composants s'installent via la CLI shadcn et deviennent du code source modifiable dans le projet.

**Composants disponibles :** Accordion, Avatar, Badge, Button, Card, Checkbox, Cursor, Dropdown Menu, Input, Label, Pagination, Radio Group, Skeleton, Spinner, Textarea, Tooltip.

```bash
# Installation composant par composant via la CLI shadcn
pnpm dlx shadcn@latest add https://warcraftcn.com/r/button.json
pnpm dlx shadcn@latest add https://warcraftcn.com/r/card.json
pnpm dlx shadcn@latest add https://warcraftcn.com/r/badge.json
pnpm dlx shadcn@latest add https://warcraftcn.com/r/input.json
```

**Usage typique :** boutons stylisés fantasy, panneaux avec bordures dorées, typographie épique. Ces composants sont utilisés pour les éléments narratifs (en-têtes, cartes de héros, écrans de level-up).

> Les composants warcraftcn **remplacent ou surchargent** les composants shadcn correspondants dans `components/ui/`.

### Tailwind CSS

Tailwind CSS v4 est inclus par défaut avec shadcn/ui. La configuration du thème se fait dans `app/globals.css` via les tokens CSS personnalisés.

**Palette thématique à définir dans `globals.css` :**

```css
@layer base {
  :root {
    /* Couleurs par classe de héros */
    --color-archer:  134 239 172;  /* vert */
    --color-clerc:   253 224 71;   /* jaune/blanc */
    --color-guerrier: 239 68 68;   /* rouge */
    --color-sorcier: 96 165 250;   /* bleu */
    --color-voleur:  107 114 128;  /* gris */
  }
}
```

Ces variables sont consommées via les classes utilitaires Tailwind :

```tsx
<span className="text-[rgb(var(--color-guerrier))]">Guerrier</span>
```

---

## 4. Stockage des données

### Décision : Vercel Postgres (Neon)

**Contexte :** L'application doit persister les données en ligne pour permettre un accès multi-appareils (plusieurs joueurs depuis leurs propres téléphones lors d'une session de jeu).

**Option retenue : Vercel Postgres (propulsé par Neon)**

| Critère                  | localStorage + Zustand | Vercel KV      | **Vercel Postgres (Neon)** | Supabase       |
| ------------------------ | ---------------------- | -------------- | -------------------------- | -------------- |
| Complexité d'intégration | Nulle                  | Faible         | **Faible**                 | Moyenne        |
| Infrastructure requise   | Aucune                 | Vercel         | **Vercel**                 | Supabase       |
| Fonctionne hors-ligne    | Oui                    | Non            | **Non**                    | Non            |
| Multi-appareils          | Non                    | Oui (clé/val) | **Oui (SQL)**              | Oui            |
| Requêtes complexes       | Non                    | Non            | **Oui**                    | Oui            |
| Intégration Vercel       | —                      | Native         | **Native (1 clic)**        | Manuelle       |

**Justification :**
- Provisioning en 1 clic depuis le dashboard Vercel, variables d'env injectées automatiquement
- SQL relationnel adapté au schéma structuré du PRD (profils → aventures → parties)
- Free tier Neon : 512 Mo stockage, 190h compute/mois — largement suffisant
- Compatible avec les Server Actions et Route Handlers Next.js 16
- Neon est serverless (cold start minimal, scale to zero)

### ORM : Drizzle ORM

Drizzle ORM est retenu pour l'accès à la base de données.

```bash
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit
```

**Pourquoi Drizzle et pas Prisma ?**
- Schéma défini en TypeScript (fichier `db/schema.ts`) — pas de fichier `.prisma` séparé
- Requêtes type-safe sans génération de code
- Léger et adapté aux environnements serverless (Vercel Edge, Neon)
- Migrations gérées via `drizzle-kit`

### Schéma de base de données

```ts
// db/schema.ts
import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adventures = pgTable("adventures", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").references(() => profiles.id).notNull(),
  heroClass: text("hero_class").notNull(), // HeroClass union
  startedAt: timestamp("started_at").defaultNow().notNull(),
  status: text("status").notNull().default("active"), // active | paused | completed
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  maxHp: integer("max_hp").notNull(),
  battleCount: integer("battle_count").notNull().default(0),
  abilityRank: integer("ability_rank").notNull().default(1),  // 1–5
  skillRank: integer("skill_rank").notNull().default(1),      // 1–3
  healthUpgrades: integer("health_upgrades").notNull().default(0), // 0–2
  inventory: text("inventory").array(),                       // 4 emplacements (noms)
  pendingLevelUp: boolean("pending_level_up").notNull().default(false),
});

export const games = pgTable("games", {
  id: text("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull().default("setup"), // setup | in-progress | finished
  winnerAdventureId: text("winner_adventure_id"),
});

export const gameParticipants = pgTable("game_participants", {
  id: text("id").primaryKey(),
  gameId: text("game_id").references(() => games.id).notNull(),
  adventureId: text("adventure_id").references(() => adventures.id).notNull(),
  currentHp: integer("current_hp").notNull(),
});
```

### Accès aux données — Server Actions

Les mutations passent par des **Server Actions** Next.js 16 (pas de route API dédiée) :

```ts
// app/actions/profiles.ts
"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function createProfile(name: string) {
  const id = crypto.randomUUID();
  await db.insert(profiles).values({ id, name });
  return id;
}
```

### Configuration Neon

```ts
// db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

La variable `DATABASE_URL` est injectée automatiquement par Vercel lors de la connexion de la base depuis le dashboard.

---

## 5. État global

### Zustand

Zustand est retenu pour la gestion d'état **UI côté client uniquement** (état de la partie en cours, HP en temps réel pendant le combat). La persistance des données est déléguée à Vercel Postgres via des Server Actions — Zustand n'a donc plus besoin du middleware `persist`.

```bash
pnpm add zustand
```

**Séparation des responsabilités :**

| Couche       | Rôle                                                              |
| ------------ | ----------------------------------------------------------------- |
| Zustand      | État UI éphémère : HP en cours de partie, étape du wizard de setup |
| Server Actions + Neon | Persistance durable : profils, aventures, historique des parties |

**Structure du store de combat (exemple) :**

```ts
// stores/game-store.ts
import { create } from "zustand";

type Participant = {
  adventureId: string;
  currentHp: number;
  maxHp: number;
};

type GameStore = {
  participants: Participant[];
  setHp: (adventureId: string, delta: number) => void;
  reset: () => void;
};

export const useGameStore = create<GameStore>()((set) => ({
  participants: [],
  setHp: (adventureId, delta) =>
    set((s) => ({
      participants: s.participants.map((p) =>
        p.adventureId === adventureId
          ? { ...p, currentHp: Math.max(0, p.currentHp + delta) }
          : p
      ),
    })),
  reset: () => set({ participants: [] }),
}));
```

**Sélecteurs :** toujours utiliser des sélecteurs atomiques pour éviter les re-renders inutiles :

```ts
// Bon — re-render uniquement si les participants changent
const participants = useGameStore((s) => s.participants);

// Mauvais — re-render à chaque changement du store
const store = useGameStore();
```

---

## 6. Typage

### TypeScript — Mode strict

TypeScript est activé en mode strict dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Conventions :**

- Tous les types métier dans `types/index.ts`
- Les props de composants sont typées avec des `interface` locales (non exportées si usage unique)
- Pas de `any` — utiliser `unknown` puis type guard si nécessaire
- Les identifiants sont des `string` (UUID via `crypto.randomUUID()`)

---

## 7. Déploiement

### Vercel

Le projet est déployé sur Vercel avec connexion directe au dépôt Git.

**Flux de déploiement :**

```
git push origin main
    └── Vercel détecte le push
        └── Build automatique (next build)
            └── Déploiement en production
```

**Preview deployments :** chaque Pull Request / branche génère automatiquement une URL de preview Vercel.

**Variables d'environnement :**

```env
# .env.local (ne pas commiter)
DATABASE_URL=postgres://...  # Injectée automatiquement par Vercel lors du provisioning Neon
```

La variable `DATABASE_URL` est provisionnée automatiquement depuis le dashboard Vercel : **Storage → Connect Store → Neon Postgres**. Elle est disponible dans tous les environnements (production, preview, development).

**Configuration `next.config.ts` minimale :**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aucune configuration spécifique requise pour ce projet
};

export default nextConfig;
```

---

## 8. Structure de projet

```
hero-realms-campaign-tracker/
├── app/
│   ├── layout.tsx                    # Layout racine (fonts, globals.css)
│   ├── page.tsx                      # / — Liste des profils
│   ├── profiles/
│   │   └── [profileId]/
│   │       └── page.tsx              # Détail profil + stats + aventures
│   ├── adventures/
│   │   └── [adventureId]/
│   │       └── page.tsx              # Détail aventure
│   ├── game/
│   │   ├── new/
│   │   │   └── page.tsx              # Setup nouvelle partie
│   │   └── [gameId]/
│   │       ├── combat/
│   │       │   └── page.tsx          # Life Tracker
│   │       ├── end/
│   │       │   └── page.tsx          # Fin de partie + XP
│   │       └── levelup/
│   │           └── page.tsx          # Choix d'amélioration
│   ├── globals.css                   # Tokens CSS + Tailwind base
│   └── actions/                      # Server Actions Next.js 16
│       ├── profiles.ts               # createProfile, deleteProfile
│       ├── adventures.ts             # createAdventure, applyLevelUp, etc.
│       └── games.ts                  # startGame, updateHp, endGame
│
├── components/
│   ├── ui/                           # Composants shadcn/ui (auto-générés)
│   ├── profiles/
│   │   ├── profile-card.tsx
│   │   ├── profile-list.tsx
│   │   └── create-profile-dialog.tsx
│   ├── adventures/
│   │   ├── adventure-card.tsx
│   │   └── hero-class-badge.tsx
│   ├── game/
│   │   ├── hp-tracker.tsx
│   │   ├── participant-selector.tsx
│   │   └── levelup-choice.tsx
│   └── shared/
│       ├── xp-bar.tsx
│       ├── star-rank.tsx             # Barre de 5 étoiles (Capacité)
│       └── inventory-slots.tsx
│
├── db/
│   ├── index.ts                      # Client Drizzle + Neon
│   └── schema.ts                     # Schéma SQL (tables)
│
├── stores/
│   └── game-store.ts                 # Zustand — état éphémère du combat (HP)
│
├── types/
│   └── index.ts                      # Tous les types métier
│
├── lib/
│   ├── constants.ts                  # PV max par classe, seuils XP, etc.
│   ├── xp.ts                         # Logique de level-up / rollover XP
│   └── loot.ts                       # Logique de déclenchement du loot
│
├── hooks/
│   ├── use-adventure.ts              # Hook d'accès aux données aventure
│   └── use-active-game.ts            # Hook état de la partie en cours
│
├── public/
│   └── icons/                        # Icônes des classes de héros
│
├── PRD.md
├── TECHNICAL_CHOICES.md
├── next.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Principe d'organisation :**

- `app/` — routing uniquement (pages et layouts), le moins de logique possible
- `components/` — composants React, organisés par domaine fonctionnel
- `stores/` — état global Zustand
- `lib/` — logique pure (fonctions sans dépendance React)
- `hooks/` — hooks React encapsulant l'accès au store

---

## 9. Points de vigilance

### Vercel Postgres (Neon) — Limites du free tier

| Limite              | Valeur free tier | Impact pour ce projet              |
| ------------------- | ---------------- | ---------------------------------- |
| Stockage            | 512 Mo           | Négligeable (< 1 Mo attendu)       |
| Compute             | 190h/mois        | Suffisant — Neon scale to zero     |
| Connexions actives  | 20               | Suffisant pour usage personnel     |
| Branches de preview | 10               | Suffisant pour le développement    |

### Neon — Variables d'environnement par environnement

Vercel injecte automatiquement `DATABASE_URL` pour **production** et **preview**. Pour le développement local, récupérer la chaîne de connexion depuis le dashboard Vercel et l'ajouter dans `.env.local`.

### Drizzle — Migrations

Les migrations doivent être générées et appliquées avant chaque déploiement :

```bash
# Générer une migration après modification du schéma
pnpm drizzle-kit generate

# Appliquer les migrations (à lancer manuellement ou via un script de déploiement)
pnpm drizzle-kit migrate
```

Ne pas oublier de commiter les fichiers de migration (`drizzle/`) dans Git.

### Server Actions — Ne pas exposer la logique client

Les Server Actions (`"use server"`) s'exécutent côté serveur et ont accès à la base de données. Ne jamais passer de données sensibles depuis le client sans validation. Utiliser `zod` pour valider les inputs :

```ts
import { z } from "zod";

const schema = z.object({ name: z.string().min(1).max(50) });

export async function createProfile(raw: unknown) {
  const { name } = schema.parse(raw);
  // ...
}
```

### shadcn/ui — Installation manuelle des composants

shadcn/ui n'est **pas** une dépendance npm classique. Chaque composant doit être installé explicitement :

```bash
# Exemples de composants à installer au fil du développement
pnpm dlx shadcn@latest add button card dialog select badge progress
```

Les composants générés dans `components/ui/` sont du code source du projet — les modifier directement si besoin.

### warcraftcn-ui — Compatibilité Tailwind v4

Vérifier la compatibilité de warcraftcn-ui avec Tailwind CSS v4 au moment de l'initialisation du projet. Si des conflits de configuration apparaissent, rester sur Tailwind v3 (supporté nativement par shadcn/ui).

### Next.js App Router — Client Components par défaut

Tous les composants interactifs doivent déclarer `"use client"` en première ligne. L'oublier provoque des erreurs de build (`useState` non utilisable en Server Component).

Règle pratique : **tout composant qui utilise `useAppStore`, `useState`, `useEffect` ou des handlers d'événements doit être un Client Component.**

### Partie en cours — État bloquant

Selon le PRD (§5.3), un joueur avec un level-up en attente ne peut pas lancer une nouvelle partie. Cette contrainte doit être vérifiée dans le store :

```ts
// Vérification à ajouter dans startGame
const hasAdventuresWithPendingLevelUp = participants.some(({ adventureId }) => {
  const adventure = get().adventures.find((a) => a.id === adventureId);
  return adventure?.pendingLevelUp === true;
});

if (hasAdventuresWithPendingLevelUp) {
  throw new Error("Un joueur a un level-up en attente.");
}
```
