"use server";

import { db } from "@/db";
import { adventures, gameParticipants, games } from "@/db/schema";
import { canReceiveLoot, getLootType } from "@/lib/loot";
import { endGameSchema } from "@/lib/validators";
import { applyXp, calculateXpGain } from "@/lib/xp";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createGame(adventureIds: string[]): Promise<string> {
  // Check no participant has pendingLevelUp=true
  for (const advId of adventureIds) {
    const rows = await db
      .select()
      .from(adventures)
      .where(eq(adventures.id, advId));
    const adventure = rows[0];
    if (!adventure) {
      throw new Error(`Adventure not found: ${advId}`);
    }
    if (adventure.pendingLevelUp) {
      throw new Error(
        `Adventure ${advId} has a pending level-up. Resolve it before starting a game.`
      );
    }
  }

  const gameId = crypto.randomUUID();
  await db.insert(games).values({
    id: gameId,
    status: "setup",
    winnerAdventureId: null,
  });

  for (const advId of adventureIds) {
    const rows = await db
      .select()
      .from(adventures)
      .where(eq(adventures.id, advId));
    const adventure = rows[0];
    if (!adventure) {
      throw new Error(`Adventure not found: ${advId}`);
    }
    await db.insert(gameParticipants).values({
      id: crypto.randomUUID(),
      gameId,
      adventureId: advId,
      currentHp: adventure.maxHp,
    });
  }

  return gameId;
}

export async function startCombat(gameId: string): Promise<void> {
  // Fetch all participants for this game
  const participants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.gameId, gameId));

  // Reset each participant's HP to their adventure's maxHp
  for (const participant of participants) {
    const rows = await db
      .select()
      .from(adventures)
      .where(eq(adventures.id, participant.adventureId));
    const adventure = rows[0];
    if (!adventure) {
      throw new Error(`Adventure not found: ${participant.adventureId}`);
    }
    await db
      .update(gameParticipants)
      .set({ currentHp: adventure.maxHp })
      .where(eq(gameParticipants.id, participant.id));
  }

  await db
    .update(games)
    .set({ status: "in-progress" })
    .where(eq(games.id, gameId));
}

export async function updateHp(
  participantId: string,
  newHp: number
): Promise<void> {
  const clampedHp = Math.max(0, newHp);
  await db
    .update(gameParticipants)
    .set({ currentHp: clampedHp })
    .where(eq(gameParticipants.id, participantId));
}

export async function endGame(
  gameId: string,
  winnerAdventureId: string
): Promise<{
  pendingLevelUps: string[];
  pendingLoots: Array<{ adventureId: string; lootType: "minor" | "major" }>;
}> {
  const parsed = endGameSchema.parse({ gameId, winnerAdventureId });

  // Set game status and winner
  await db
    .update(games)
    .set({ status: "finished", winnerAdventureId: parsed.winnerAdventureId })
    .where(eq(games.id, parsed.gameId));

  const participants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.gameId, parsed.gameId));

  const pendingLevelUps: string[] = [];
  const pendingLoots: Array<{ adventureId: string; lootType: "minor" | "major" }> = [];

  for (const participant of participants) {
    const rows = await db
      .select()
      .from(adventures)
      .where(eq(adventures.id, participant.adventureId));
    const adventure = rows[0];
    if (!adventure) {
      throw new Error(`Adventure not found: ${participant.adventureId}`);
    }

    const isWinner = participant.adventureId === parsed.winnerAdventureId;
    const xpGain = calculateXpGain(isWinner);
    const { newXp, newLevel, leveledUp } = applyXp(
      adventure.xp,
      adventure.level,
      xpGain
    );

    const newBattleCount = adventure.battleCount + 1;

    const updateData: {
      battleCount: number;
      xp: number;
      level: number;
      pendingLevelUp?: boolean;
    } = {
      battleCount: newBattleCount,
      xp: newXp,
      level: newLevel,
    };

    if (leveledUp) {
      updateData.pendingLevelUp = true;
      pendingLevelUps.push(participant.adventureId);
    }

    await db
      .update(adventures)
      .set(updateData)
      .where(eq(adventures.id, participant.adventureId));

    if (canReceiveLoot(newBattleCount)) {
      const lootType = getLootType(newBattleCount);
      if (lootType !== null) {
        pendingLoots.push({ adventureId: participant.adventureId, lootType });
      }
    }
  }

  revalidatePath("/");

  return { pendingLevelUps, pendingLoots };
}
