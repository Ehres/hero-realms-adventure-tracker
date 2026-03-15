import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type {
  adventures,
  gameParticipants,
  games,
  profiles,
} from "@/db/schema";

// --- Domain union types ---

export type HeroClass = "archer" | "clerc" | "guerrier" | "sorcier" | "voleur";

export type AdventureStatus = "active" | "paused" | "completed";

export type GameStatus = "setup" | "in-progress" | "finished";

export type LevelUpChoice = "ability" | "skill" | "health";

export type LootType = "minor" | "major" | null;

// --- Drizzle inferred types ---

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

export type Adventure = InferSelectModel<typeof adventures>;
export type NewAdventure = InferInsertModel<typeof adventures>;

export type Game = InferSelectModel<typeof games>;
export type NewGame = InferInsertModel<typeof games>;

export type GameParticipant = InferSelectModel<typeof gameParticipants>;
export type NewGameParticipant = InferInsertModel<typeof gameParticipants>;
