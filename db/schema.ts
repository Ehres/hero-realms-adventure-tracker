import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adventures = pgTable(
  "adventures",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id),
    heroClass: text("hero_class").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    status: text("status").notNull().default("active"),
    level: integer("level").notNull().default(1),
    xp: integer("xp").notNull().default(0),
    maxHp: integer("max_hp").notNull(),
    battleCount: integer("battle_count").notNull().default(0),
    abilityRank: integer("ability_rank").notNull().default(1),
    skillRank: integer("skill_rank").notNull().default(1),
    healthUpgrades: integer("health_upgrades").notNull().default(0),
    inventory: text("inventory").array().notNull().default([]),
    pendingLevelUp: boolean("pending_level_up").notNull().default(false),
  },
  (table) => [index("adventures_profile_id_idx").on(table.profileId)],
);

export const games = pgTable("games", {
  id: text("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull().default("setup"),
  winnerAdventureId: text("winner_adventure_id"),
});

export const gameParticipants = pgTable(
  "game_participants",
  {
    id: text("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id),
    adventureId: text("adventure_id")
      .notNull()
      .references(() => adventures.id),
    currentHp: integer("current_hp").notNull(),
  },
  (table) => [
    index("game_participants_game_id_idx").on(table.gameId),
    index("game_participants_adventure_id_idx").on(table.adventureId),
  ],
);
