# AGENTS.md - Hero Realms Campaign Tracker

**Last Updated:** March 2026  
**Project Type:** Full-Stack Web Application (Next.js 16 + React 19 + PostgreSQL)  
**Status:** Active Development (Phase 10+)

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL connection string (Neon serverless via Vercel)

### Setup
```bash
# Clone and install
git clone git@github.com:Ehres/hero-realms-adventure-tracker.git
cd hero-realms-campaign-tracker
pnpm install

# Configure environment
# Create .env.local with DATABASE_URL from Vercel Storage
cat > .env.local << EOF
DATABASE_URL=postgres://[user]:[pass]@[host]/[db]
EOF

# Start development server
pnpm dev
# Open http://localhost:3000
```

### Key Scripts
```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm db:generate      # Generate migrations after schema changes
pnpm db:migrate       # Apply pending migrations
pnpm db:push          # Sync schema with live DB (dev only)
pnpm db:studio        # Open Drizzle Studio (visual DB browser)
```

---

## 📚 Project Overview

### What Is This?
A **campaign tracker for the board game "Hero Realms"** that enables players to:
- Create player profiles and manage multiple hero adventures (5 classes)
- Run multi-player game sessions with real-time HP tracking
- Manage character progression (XP, leveling, abilities, skills, health upgrades)
- Track loot pickups and inventory management
- View comprehensive player statistics

### Target Audience
Solo/group board game players who want digital campaign persistence without a full D&D system.

### Domain Model
```
Profile (player account)
  ├─ Adventure (hero character per profile)
  │   ├─ Hero Class: archer | clerc | guerrier | sorcier | voleur
  │   ├─ Progression: Level + XP + Abilities + Skills + Health
  │   └─ Inventory: 4-slot loot storage
  └─ Game Sessions (multiplayer sessions)
      └─ GameParticipants (adventures playing in session)
```

---

## 🏗️ Architecture & Tech Stack

### Frontend Stack
| Technology     | Version | Purpose                                    |
| -------------- | ------- | ------------------------------------------ |
| **Next.js**        | 16.1.6  | React framework with App Router            |
| **React**          | 19.2.3  | UI library with Server Components support |
| **TypeScript**     | ^5      | Strict mode: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes |
| **Tailwind CSS**   | v4      | Utility-first CSS with CSS variables      |
| **shadcn/ui**      | ^4.0.8  | Copy-paste component library              |
| **warcraftcn-ui**  | custom  | Warcraft III-themed component overrides   |
| **Zustand**        | ^5.0.11 | Lightweight state management (UI only)    |
| **Zod**            | ^4.3.6  | TypeScript-first schema validation        |

### Backend & Database Stack
| Technology            | Version | Purpose                                 |
| --------------------- | ------- | --------------------------------------- |
| **Next.js Server Actions** | 16.1.6  | Backend mutations (no REST API needed) |
| **Drizzle ORM**           | ^0.45.1 | Type-safe SQL ORM with migrations     |
| **Neon PostgreSQL**       | latest  | Serverless PostgreSQL (Vercel Storage) |

### Build & Deploy
| Tool         | Purpose                             |
| ------------ | ----------------------------------- |
| **Turbopack**    | Fast bundler (10x faster than Webpack) |
| **drizzle-kit**  | Migration generator & executor      |
| **Vercel**       | Hosting + automatic deployments     |
| **GitHub**       | Source control & CI/CD integration |

### Key Design Decisions
See **[TECHNICAL_CHOICES.md](./TECHNICAL_CHOICES.md)** for detailed trade-off analysis:
- ✅ Server Actions over REST API (type-safety, less overhead)
- ✅ Next.js App Router over Pages (Server Components by default)
- ✅ Drizzle ORM over Prisma (smaller bundle, better DX)
- ✅ Zustand over Redux (UI state only, keep DB as source of truth)
- ✅ Tailwind v4 over CSS-in-JS (performance, mobile-first)

---

## 💾 Database Schema

### Tables (PostgreSQL via Neon)

#### `profiles`
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```
**Purpose:** Player accounts  
**Indexed:** (none)

#### `adventures`
```sql
CREATE TABLE adventures (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  heroClass TEXT NOT NULL, -- 'archer'|'clerc'|'guerrier'|'sorcier'|'voleur'
  startedAt TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- 'active'|'paused'|'completed'
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0, -- 0-100 (rollover on level up)
  maxHp INTEGER NOT NULL, -- 40-55 depending on class
  battleCount INTEGER DEFAULT 0, -- triggers loot at 3,6,9,12
  abilityRank INTEGER DEFAULT 1, -- 1-5
  skillRank INTEGER DEFAULT 1, -- 1-3
  healthUpgrades INTEGER DEFAULT 0, -- 0-2 (+5 or +10 HP each)
  inventory TEXT[], -- 4 slots max, JSON strings
  pendingLevelUp BOOLEAN DEFAULT FALSE -- gates new game launch
);
```
**Purpose:** Hero characters per profile  
**Indexed:** `adventures(profileId)` for fast profile lookup

#### `games`
```sql
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  date TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'setup', -- 'setup'|'in-progress'|'finished'
  winnerAdventureId TEXT REFERENCES adventures(id)
);
```
**Purpose:** Game sessions  
**Indexed:** (none)

#### `gameParticipants`
```sql
CREATE TABLE gameParticipants (
  id TEXT PRIMARY KEY,
  gameId TEXT NOT NULL REFERENCES games(id),
  adventureId TEXT NOT NULL REFERENCES adventures(id),
  currentHp INTEGER NOT NULL
);
```
**Purpose:** Adventures playing in a game (HP tracker)  
**Indexed:** `gameParticipants(gameId)`, `gameParticipants(adventureId)`

### Key Constraints
- ✅ Drizzle ORM enforces foreign keys
- ✅ Cascading deletes configured for profile → adventures → games
- ✅ NOT NULL constraints on required fields
- ✅ Max 4-item inventory (enforced in Server Actions)
- ✅ Pending level-up prevents game launch (app logic)

**Schema Definition:** [`db/schema.ts`](./db/schema.ts)

---

## 🔄 Data Access Pattern: Server Actions

**Key Principle:** No traditional REST API. All mutations via **Next.js Server Actions** (`"use server"`).

### Example: Create a Profile
```typescript
// app/actions/profiles.ts
"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function createProfile(name: string) {
  const id = crypto.randomUUID();
  await db.insert(profiles).values({ id, name, createdAt: new Date() });
  return id;
}
```

### Usage from Client Component
```typescript
"use client";

import { createProfile } from "@/app/actions/profiles";

export function NewProfileForm() {
  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const profileId = await createProfile(name); // Type-safe RPC call
    router.push(`/profiles/${profileId}`);
  };
  
  return <form action={handleSubmit}>...</form>;
}
```

### Benefits
✅ Type-safe (TypeScript validates client ↔ server contract)  
✅ No HTTP overhead (direct database access)  
✅ Automatic data invalidation (Next.js handles revalidation)  
✅ Error handling (Server Action errors propagate to client)  

**Server Actions Directory:** [`app/actions/`](./app/actions/)

---

## 📁 Project Structure & Key Files

### Routing (Next.js App Router)
```
app/
├── page.tsx                    # Home: Profile list + New Game button
├── layout.tsx                  # Root layout (fonts, globals.css)
├── globals.css                 # Tailwind base + CSS variables
├── loading.tsx                 # Loading skeleton
├── profiles/[profileId]/       # Profile detail page
├── adventures/[adventureId]/   # Adventure detail page
└── game/
    ├── new/                    # Game setup wizard
    │   ├── page.tsx
    │   └── _components/game-setup-wizard.tsx
    └── [gameId]/
        ├── combat/             # HP tracker (main gameplay)
        ├── end/                # XP distribution screen
        └── levelup/            # Level-up choice UI
```

### Server Actions (Backend Mutations)
```
app/actions/
├── profiles.ts        # createProfile, deleteProfile
├── adventures.ts      # createAdventure, applyLevelUp, updateInventory
├── games.ts           # startGame, updateHp, endGame
├── game-queries.ts    # getGameData, getParticipants
├── stats.ts           # Calculate profile statistics
└── loot.ts            # Loot trigger logic
```

### Components (UI Layer)
```
components/
├── ui/                # shadcn/ui + warcraftcn (customizable)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ... (standard shadcn components)
├── profiles/          # Profile-related components
├── adventures/        # Adventure-related components
├── game/              # Game session components
└── shared/            # Reusable utilities (41 components)
```

### Database Layer
```
db/
├── index.ts           # Drizzle client initialization + Neon connection
└── schema.ts          # PostgreSQL table definitions (Drizzle schema)
```

### Utilities & Logic
```
lib/
├── constants.ts       # MAX_HP per class, XP thresholds, hero colors, loot table
├── xp.ts              # Level-up calculation + XP rollover logic
├── loot.ts            # Loot trigger logic (minor at 3,6 | major at 9,12)
├── validators.ts      # Zod validators for input validation
└── utils.ts           # Helper utilities (cn, formatting, etc.)
```

### State Management (UI Only)
```
stores/
└── game-store.ts      # Zustand: Current game session state (HP, participants)
```

### Hooks
```
hooks/
├── use-active-game.ts # Get current game from store
└── use-adventure.ts   # Fetch adventure data from DB
```

---

## 🔧 Development Workflow

### Adding a New Feature

#### 1. Schema Change → Migration
```bash
# Update db/schema.ts with new table or column

# Generate migration
pnpm db:generate

# Apply to dev DB
pnpm db:push

# Review generated migration in drizzle/ folder
git add drizzle/
```

#### 2. Server Action → Backend Logic
```typescript
// app/actions/new-feature.ts
"use server";

import { db } from "@/db";
import { newTable } from "@/db/schema";

export async function doSomething(input: string) {
  // Validate input with Zod
  const validated = newFeatureValidator.parse(input);
  
  // Execute query
  const result = await db.insert(newTable).values(validated).returning();
  
  return result;
}
```

#### 3. Component → UI Layer
```typescript
// components/features/my-component.tsx
"use client"; // if using hooks/interactivity

import { doSomething } from "@/app/actions/new-feature";

export function MyComponent() {
  const [data, setData] = useState(null);
  
  const handleClick = async () => {
    const result = await doSomething("input");
    setData(result);
  };
  
  return <button onClick={handleClick}>Submit</button>;
}
```

#### 4. Route → Page Integration
```typescript
// app/features/page.tsx
import { MyComponent } from "@/components/features/my-component";

export default function FeaturePage() {
  return <MyComponent />;
}
```

### Component Best Practices

#### Server Components (Default)
```typescript
// app/profiles/[profileId]/page.tsx
import { db } from "@/db";
import { adventures } from "@/db/schema";

export default async function ProfilePage({ params }) {
  // ✅ Fetch data directly in server component
  const profileAdventures = await db
    .select()
    .from(adventures)
    .where(eq(adventures.profileId, params.profileId));
  
  return <div>{/* render profileAdventures */}</div>;
}
```

#### Client Components (Interactive Only)
```typescript
// components/game/hp-tracker.tsx
"use client";

import { updateHp } from "@/app/actions/games";
import { useGameStore } from "@/stores/game-store";

export function HpTracker() {
  const { currentHp } = useGameStore();
  
  const handleDecrement = async () => {
    await updateHp(gameId, currentHp - 1);
  };
  
  return <button onClick={handleDecrement}>-1 HP</button>;
}
```

### Testing
- ✅ Unit tests for `lib/` utilities (XP calculation, loot logic)
- ✅ Integration tests for Server Actions
- ✅ Component tests for shadcn/ui customizations
- ✅ E2E tests for critical user flows (create profile → start game → end game)

See **[TECHNICAL_CHOICES.md](./TECHNICAL_CHOICES.md)** for testing strategy.

---

## 📋 Common Tasks Reference

### Profile Management
**Create Profile**
- File: [`app/actions/profiles.ts::createProfile()`](./app/actions/profiles.ts)
- Flow: Form → Server Action → DB insert → Redirect

**Delete Profile**
- File: [`app/actions/profiles.ts::deleteProfile()`](./app/actions/profiles.ts)
- Flow: Confirmation dialog → Server Action → Cascade delete (adventures, games)

### Adventure Management
**Create Adventure (Hero)**
- File: [`app/actions/adventures.ts::createAdventure()`](./app/actions/adventures.ts)
- Inputs: profileId, heroClass (validates class is one of 5)
- Sets: initial maxHp (class-dependent), level=1, xp=0

**Apply Level-Up**
- File: [`app/actions/adventures.ts::applyLevelUp()`](./app/actions/adventures.ts)
- Inputs: adventureId, improvementType ('ability'|'skill'|'health')
- Logic: Increment appropriate rank, roll over XP if > 100

**Update Inventory**
- File: [`app/actions/adventures.ts::updateInventory()`](./app/actions/adventures.ts)
- Constraint: Max 4 items
- Validates: Item names, prevents duplicates

### Game Session Management
**Start Game**
- File: [`app/actions/games.ts::startGame()`](./app/actions/games.ts)
- Inputs: adventureIds[] (selected participants)
- Gate: Rejects if any adventure has `pendingLevelUp=true`
- Creates: games row + gameParticipants rows

**Update HP During Combat**
- File: [`app/actions/games.ts::updateHp()`](./app/actions/games.ts)
- UI: +1, -1, +5, -5 buttons (Zustand store)
- DB: Sync to gameParticipants.currentHp on submit

**End Game (Determine Winner)**
- File: [`app/actions/games.ts::endGame()`](./app/actions/games.ts)
- Inputs: gameId, winnerAdventureId
- Logic: Add XP (winner: +30, loser: +10)
- Check: Trigger level-up if XP >= 100
- Check: Trigger loot if battleCount reaches 3, 6, 9, or 12

### Game Logic Calculations
**XP & Level-Up**
- File: [`lib/xp.ts`](./lib/xp.ts)
- Threshold: 100 XP per level
- Rollover: Excess XP carries to next level
- Max Ranks: Ability 1-5, Skill 1-3, Health +2 upgrades

**Loot Trigger**
- File: [`lib/loot.ts`](./lib/loot.ts)
- Minor Loot: Battle 3 & 6
- Major Loot: Battle 9 & 12
- Loot Table: Randomized from predefined pool (see `lib/constants.ts`)

**Player Statistics**
- File: [`app/actions/stats.ts`](./app/actions/stats.ts)
- Calculates: Total wins, losses, XP gained, adventures completed
- Used by: Profile statistics page

---

## 🎨 Styling & Design System

### Tailwind CSS v4 Configuration
- **Framework:** Utility-first, mobile-first
- **CSS Variables:** Custom properties in [`globals.css`](./globals.css)
- **Dark Mode:** Always enabled (no light mode variant)

### Hero Class Color System
```css
/* globals.css */
--color-archer:    rgb(134, 239, 172)   /* Green */
--color-clerc:     rgb(253, 224, 71)    /* Yellow */
--color-guerrier:  rgb(239, 68, 68)     /* Red */
--color-sorcier:   rgb(96, 165, 250)    /* Blue */
--color-voleur:    rgb(107, 114, 128)   /* Gray */
```

### Typography
```
Headings:    Cinzel (fantasy serif)
Body:        System default (sans-serif)
Monospace:   Geist Mono (details, stats)
Font Size:   Tailwind v4 defaults (sm, base, lg, xl, 2xl, etc.)
```

### Component Library
**shadcn/ui** (copy-paste, modify in `components/ui/`)
- Button, Card, Dialog, Dropdown, Input, Select, Tooltip, etc.

**warcraftcn-ui** (Warcraft III themed overrides)
- Custom shadows, borders, gradients for fantasy aesthetic
- Located: `components/ui/warcraftcn/`

### Responsive Design
```typescript
// Mobile-first Tailwind approach
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

---

## 🚀 Deployment & Infrastructure

### Vercel Hosting
- **Automatic deployments** on push to `main` branch
- **Preview URLs** for all pull requests
- **Environment variables** managed via Vercel dashboard
- **Build command:** `next build`
- **Start command:** `next start`

### Database: Neon PostgreSQL (Serverless)
- **Connection:** Via Vercel Storage integration
- **Cold starts:** ~50-100ms (acceptable for board game use)
- **Backups:** Automatic daily snapshots
- **Connection string:** Injected as `DATABASE_URL` in `.env.local`

### CI/CD
```
git push origin main
  ↓
GitHub detects push
  ↓
Vercel triggers build
  ↓
Next.js builds (Turbopack)
  ↓
Tests run (if configured)
  ↓
Deploy to production
  ↓
All environments (staging, preview) updated
```

### Environment Setup
```bash
# Local development
cat > .env.local << EOF
DATABASE_URL=postgres://[user]:[password]@[host]/[db]
EOF

# Vercel dashboard
# Settings → Environment Variables
# Add DATABASE_URL (auto-populated from Storage)
```

---

## 🔧 MCP Tools & Extensions

### Recommended Model Context Protocol (MCP) Integrations

These tools enhance agent capabilities for this project:

#### 1. **PostgreSQL Inspector** (Database Queries & Schema)
**Purpose:** Direct database inspection and query execution  
**Use Cases:**
- Inspect live database structure and content
- Execute complex queries during debugging
- Performance analysis of schema design
- Verify migrations applied correctly

**Setup:**
```bash
# Install PostgreSQL client tools
brew install postgresql

# In Claude Code:
# Connect using DATABASE_URL from .env.local
psql $DATABASE_URL
```

#### 2. **Drizzle Studio** (Visual ORM Inspector)
**Purpose:** GUI-based database browser powered by Drizzle  
**Use Cases:**
- Visual schema inspection
- Browse table contents without SQL
- Verify migrations without psql
- Quick data validation during feature development

**Setup:**
```bash
pnpm db:studio
# Opens web UI at http://localhost:5555
```

#### 3. **TypeScript LSP** (Code Intelligence)
**Purpose:** Jump to definitions, find references, hover info  
**Use Cases:**
- Navigate `db/schema.ts` to understand column types
- Find all Server Action usages across components
- Trace data flow from DB → Action → Component
- Refactor with confidence (find all references)

**Benefits:**
- Eliminates guessing about type compatibility
- Reduces time to understand codebase
- Enables safe refactoring

#### 4. **Git History Analyzer** (Commit & PR Context)
**Purpose:** Understand design decisions via commit history  
**Use Cases:**
- Why was Server Actions chosen over REST API?
- How did the loot system evolve?
- What changed between releases?
- Blame-based feature discovery

**Usage:**
```bash
git log --oneline                 # Recent commits
git log --grep="loot"             # Search commits by message
git show <commit>                 # Detailed commit info
git log -p -- lib/xp.ts           # Changes to specific file
```

#### 5. **Next.js Inspector** (Framework Context)
**Purpose:** Understand App Router structure and server/client boundaries  
**Use Cases:**
- Verify which components are server vs. client
- Analyze page routes and dynamic segments
- Identify performance bottlenecks
- Understand data flow through App Router

**Usage:**
```bash
# Next.js built-in:
# - Preview dynamic routes at http://localhost:3000
# - Check console for server/client component info
# - React DevTools extension for component tree
```

#### 6. **ESLint Integration** (Code Quality)
**Purpose:** Enforce TypeScript & Next.js best practices  
**Usage:**
```bash
pnpm lint
# Catches:
# - Unused variables
# - Type mismatches
# - Server/client component violations
# - Accessibility issues
```

#### 7. **Zod Validator Explorer** (Input Validation)
**Purpose:** Understand input validation schemas  
**Use Cases:**
- Verify what inputs Server Actions accept
- Debug validation errors
- Understand field constraints

**Key validators:** See [`lib/validators.ts`](./lib/validators.ts)

---

## 📖 References & Deep Dives

### Project Documentation
| Document | Purpose | Audience |
| -------- | ------- | -------- |
| **[README.md](./README.md)** | Project overview (template, outdated) | New contributors |
| **[PRD.md](./PRD.md)** | Product requirements (French) | Product & design |
| **[TECHNICAL_CHOICES.md](./TECHNICAL_CHOICES.md)** | Architecture decisions & trade-offs | Engineers & architects |
| **[TASKS_PLAN.md](./TASKS_PLAN.md)** | 11-phase implementation roadmap | Project managers & developers |

### External Resources
**Next.js 16 Documentation**
- [App Router Docs](https://nextjs.org/docs/app) (routing, layouts, server components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

**React 19 Documentation**
- [Server Components](https://react.dev/reference/rsc/server-components)
- [Client Components](https://react.dev/reference/directives/use-client)

**Database & ORM**
- [Drizzle ORM Docs](https://orm.drizzle.team/) (queries, migrations, types)
- [PostgreSQL Docs](https://www.postgresql.org/docs/) (SQL, constraints, indexing)
- [Neon Dashboard](https://console.neon.tech/) (database management)

**Frontend Frameworks**
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Zod Validation](https://zod.dev/)

**Deployment & Infrastructure**
- [Vercel Docs](https://vercel.com/docs) (deployments, serverless, storage)
- [Neon PostgreSQL Guide](https://neon.tech/docs/)

---

## 🎯 Key Principles for Development

### 1. Server Components by Default
```typescript
// ✅ GOOD: Fetch directly in server component
export default async function Page() {
  const data = await db.select().from(adventures);
  return <Adventures data={data} />;
}

// ❌ AVOID: Fetching in client component (causes waterfall)
"use client";
const [data, setData] = useState(null);
useEffect(() => { /* fetch */ }, []);
```

### 2. Type Safety Across Boundaries
```typescript
// ✅ GOOD: Infer types from DB schema
type Adventure = typeof adventures.$inferSelect;

// ❌ AVOID: Manual type definitions that diverge from schema
interface Adventure { /* manual */ }
```

### 3. Database is Source of Truth
```typescript
// ✅ GOOD: Zustand for UI state, DB for persistence
const uiState = useGameStore(); // temporary (HP during combat)
const persistedData = await db.query(...); // permanent

// ❌ AVOID: Storing persistent data in localStorage or Zustand
```

### 4. Validate at Entry Points
```typescript
// ✅ GOOD: Zod validation in Server Actions
"use server";
export async function createAdventure(input: unknown) {
  const validated = adventureValidator.parse(input);
  // Safe to use validated
}

// ❌ AVOID: Trusting client input
export async function createAdventure(input: Adventure) {
  // input might be tampered with
}
```

### 5. Keep Components Composable
```typescript
// ✅ GOOD: Data fetching separate from UI
async function PageWithData() {
  const data = await fetchData();
  return <DisplayComponent data={data} />;
}

// ❌ AVOID: Mixing data fetching with rendering
function PageWithData() {
  useEffect(() => { /* fetch */ }, []);
  return <DisplayComponent />;
}
```

---

## 🐛 Debugging Tips

### Server Action Errors
```typescript
// Server Action errors appear in Network tab, not console
// Check: DevTools → Network → find fetch request
// Response contains error details

// Add logging:
"use server";
export async function myAction(input: string) {
  console.log("Server action called with:", input);
  try {
    const result = await db.query(...);
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error; // Propagates to client
  }
}
```

### Database Inspection
```bash
# Option 1: Drizzle Studio (visual)
pnpm db:studio

# Option 2: PostgreSQL CLI (SQL)
psql $DATABASE_URL
\dt                    # List tables
\d adventures          # Describe adventures table
SELECT * FROM adventures LIMIT 5;  # View data
```

### Component Rendering Issues
```typescript
// Check: Is this a server or client component?
// "use client" ← Client component
// (no directive) ← Server component

// React.StrictMode logs twice in dev (intentional)
// Check browser console for warnings/errors

// Use React DevTools extension to inspect component tree
```

### Type Mismatches
```bash
# Run TypeScript compiler
pnpm tsc --noEmit

# ESLint catches unsafe usage
pnpm lint

# Both are auto-checked in editor (if using TypeScript LSP)
```

---

## 📊 Project Statistics

| Metric | Value |
| ------ | ----- |
| **Total Components** | 41+ |
| **Server Actions** | 6 files, 20+ functions |
| **Database Tables** | 4 (profiles, adventures, games, gameParticipants) |
| **Lines of Code (est.)** | 3,500+ |
| **Test Coverage** | Basic (to be expanded) |
| **TypeScript Strictness** | Maximum (all strict flags enabled) |
| **Package Dependencies** | 25+ (lean stack) |

---

## 🤝 Contributing

### Commit Style
```bash
# Follow conventional commits
git commit -m "feat: add inventory management"
git commit -m "fix: correct XP rollover calculation"
git commit -m "refactor: simplify game setup wizard"
```

### Code Review Checklist
- [ ] TypeScript: No `any` types, all inferred correctly
- [ ] Database: Schema changes include migrations
- [ ] Server Actions: Input validated with Zod
- [ ] Components: Proper server/client boundaries
- [ ] Tests: Unit tests for `lib/` logic
- [ ] UI: Responsive design (mobile-first)

### Before Opening a PR
```bash
pnpm install          # Update dependencies
pnpm db:push          # Sync DB schema
pnpm dev              # Test locally
pnpm lint             # Fix linting issues
pnpm tsc --noEmit     # Check types
```

---

## 📞 Support & Questions

### Common Issues
| Issue | Solution |
| ----- | -------- |
| `DATABASE_URL not found` | Create `.env.local` with connection string |
| Migrations not applying | Run `pnpm db:push` or `pnpm db:migrate` |
| `"use client"` errors | Ensure client components don't fetch data |
| Type mismatches | Check `db/schema.ts` for column types |
| Slow development | Ensure Turbopack is enabled in `next.config.ts` |

### Escalation
- **Architecture Questions:** See TECHNICAL_CHOICES.md
- **Feature Requests:** Create issue on GitHub
- **Bug Reports:** Include steps to reproduce + error logs
- **Database Issues:** Check Neon dashboard for connection status

---

## ✅ Checklist for AI Agents & Developers

### Before Starting Work
- [ ] Clone repository
- [ ] Run `pnpm install`
- [ ] Create `.env.local` with DATABASE_URL
- [ ] Run `pnpm dev` and verify localhost:3000 loads
- [ ] Read PRD.md (understand requirements)
- [ ] Read TECHNICAL_CHOICES.md (understand architecture)

### During Development
- [ ] Check file structure in `app/`, `components/`, `lib/`, `db/`
- [ ] Use Server Actions for mutations (`app/actions/`)
- [ ] Validate input with Zod validators
- [ ] Keep components server-first (add `"use client"` only when needed)
- [ ] Use Zustand only for ephemeral UI state
- [ ] Update `db/schema.ts` first, then run `pnpm db:generate`

### Before Committing
- [ ] Run `pnpm lint` and fix issues
- [ ] Run `pnpm tsc --noEmit` and verify no type errors
- [ ] Test locally: `pnpm dev` and manually verify feature
- [ ] Update tests if logic changes
- [ ] Write meaningful commit message

### Before Merging to Main
- [ ] All tests pass
- [ ] Code review approved
- [ ] No console errors/warnings
- [ ] Database migrations applied cleanly
- [ ] Vercel preview deployment successful

---

**Last Updated:** March 2026  
**Maintained By:** Hero Realms Development Team  
**Questions?** Check TECHNICAL_CHOICES.md or open an issue on GitHub
