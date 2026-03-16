"use server";

import { db } from "@/db";
import { adventures } from "@/db/schema";
import {
  MAX_ABILITY_RANK,
  MAX_HP,
  MAX_HEALTH_UPGRADES,
  MAX_SKILL_RANK,
  HEALTH_UPGRADE_VALUES,
} from "@/lib/constants";
import { applyLevelUpSchema, createAdventureSchema } from "@/lib/validators";
import { type Adventure, type HeroClass, type LevelUpChoice } from "@/types";
import { eq } from "drizzle-orm";

export async function createAdventure(
  profileId: string,
  heroClass: HeroClass
): Promise<string> {
  const parsed = createAdventureSchema.parse({ profileId, heroClass });
  const id = crypto.randomUUID();
  await db.insert(adventures).values({
    id,
    profileId: parsed.profileId,
    heroClass: parsed.heroClass,
    xp: 0,
    level: 1,
    maxHp: MAX_HP[parsed.heroClass],
    abilityRank: 1,
    skillRank: 1,
    status: "active",
    battleCount: 0,
    healthUpgrades: 0,
    pendingLevelUp: false,
    inventory: [],
  });
  return id;
}

export async function pauseAdventure(adventureId: string): Promise<void> {
  await db
    .update(adventures)
    .set({ status: "paused" })
    .where(eq(adventures.id, adventureId));
}

export async function resumeAdventure(adventureId: string): Promise<void> {
  await db
    .update(adventures)
    .set({ status: "active" })
    .where(eq(adventures.id, adventureId));
}

export async function applyLevelUp(
  adventureId: string,
  choice: LevelUpChoice
): Promise<void> {
  const parsed = applyLevelUpSchema.parse({ adventureId, choice });

  const rows = await db
    .select()
    .from(adventures)
    .where(eq(adventures.id, parsed.adventureId));

  const adventure = rows[0];
  if (!adventure) {
    throw new Error(`Adventure not found: ${parsed.adventureId}`);
  }

  if (parsed.choice === "ability") {
    if (adventure.abilityRank >= MAX_ABILITY_RANK) {
      throw new Error(
        `Ability rank is already at max (${MAX_ABILITY_RANK})`
      );
    }
    await db
      .update(adventures)
      .set({ abilityRank: adventure.abilityRank + 1, pendingLevelUp: false })
      .where(eq(adventures.id, parsed.adventureId));
  } else if (parsed.choice === "skill") {
    if (adventure.skillRank >= MAX_SKILL_RANK) {
      throw new Error(`Skill rank is already at max (${MAX_SKILL_RANK})`);
    }
    await db
      .update(adventures)
      .set({ skillRank: adventure.skillRank + 1, pendingLevelUp: false })
      .where(eq(adventures.id, parsed.adventureId));
  } else {
    // "health"
    if (adventure.healthUpgrades >= MAX_HEALTH_UPGRADES) {
      throw new Error(
        `Health upgrades already at max (${MAX_HEALTH_UPGRADES})`
      );
    }
    const hpGain = HEALTH_UPGRADE_VALUES[adventure.healthUpgrades];
    if (hpGain === undefined) {
      throw new Error(
        `No health upgrade value for index ${adventure.healthUpgrades}`
      );
    }
    await db
      .update(adventures)
      .set({
        healthUpgrades: adventure.healthUpgrades + 1,
        maxHp: adventure.maxHp + hpGain,
        pendingLevelUp: false,
      })
      .where(eq(adventures.id, parsed.adventureId));
  }
}

export async function getAdventure(
  adventureId: string
): Promise<Adventure | null> {
  const rows = await db
    .select()
    .from(adventures)
    .where(eq(adventures.id, adventureId));
  return (rows[0] as Adventure | undefined) ?? null;
}

export async function getAdventuresByProfile(
  profileId: string
): Promise<Adventure[]> {
  const rows = await db
    .select()
    .from(adventures)
    .where(eq(adventures.profileId, profileId))
    .orderBy(adventures.startedAt);
  return rows as Adventure[];
}

export async function hasPendingLevelUps(): Promise<boolean> {
  const rows = await db
    .select({ id: adventures.id })
    .from(adventures)
    .where(eq(adventures.pendingLevelUp, true))
    .limit(1);
  return rows.length > 0;
}
