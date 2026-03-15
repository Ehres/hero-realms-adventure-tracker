"use server";

import { db } from "@/db";
import { adventures, gameParticipants, games } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function getProfileStats(profileId: string): Promise<{
  totalGames: number;
  wins: number;
  losses: number;
  favoriteClass: string | null;
  maxLevel: number;
  totalXpGained: number;
  adventureHistory: Array<{
    id: string;
    heroClass: string;
    startedAt: Date;
    level: number;
    status: string;
  }>;
}> {
  // 1. Get all adventures for the profile
  const profileAdventures = await db
    .select()
    .from(adventures)
    .where(eq(adventures.profileId, profileId));

  if (profileAdventures.length === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      favoriteClass: null,
      maxLevel: 0,
      totalXpGained: 0,
      adventureHistory: [],
    };
  }

  const adventureIds = profileAdventures.map((a) => a.id);

  // 2. Get all gameParticipants for those adventures
  const participants = await db
    .select()
    .from(gameParticipants)
    .where(inArray(gameParticipants.adventureId, adventureIds));

  const participantGameIds = [...new Set(participants.map((p) => p.gameId))];

  // 3. Get all games where the profile's adventures participated
  const profileGames =
    participantGameIds.length > 0
      ? await db
          .select()
          .from(games)
          .where(inArray(games.id, participantGameIds))
      : [];

  const adventureIdSet = new Set(adventureIds);

  // 4. Calculate stats in JavaScript
  const totalGames = profileGames.length;

  const wins = profileGames.filter(
    (g) =>
      g.winnerAdventureId !== null && adventureIdSet.has(g.winnerAdventureId),
  ).length;

  const losses = totalGames - wins;

  // favoriteClass: most common heroClass among adventures that have games played
  const adventuresWithGames = new Set(participants.map((p) => p.adventureId));
  const classCounts = new Map<string, number>();
  for (const adventure of profileAdventures) {
    if (adventuresWithGames.has(adventure.id)) {
      const current = classCounts.get(adventure.heroClass) ?? 0;
      classCounts.set(adventure.heroClass, current + 1);
    }
  }

  let favoriteClass: string | null = null;
  let maxCount = 0;
  for (const [heroClass, count] of classCounts) {
    if (count > maxCount) {
      maxCount = count;
      favoriteClass = heroClass;
    }
  }

  // maxLevel: max level across all adventures (0 if no adventures)
  const maxLevel =
    profileAdventures.length > 0
      ? profileAdventures.reduce(
          (max, a) => Math.max(max, a.level),
          profileAdventures[0]?.level ?? 0,
        )
      : 0;

  // totalXpGained: sum of (level * 100 + xp) for all adventures
  const totalXpGained = profileAdventures.reduce(
    (sum, a) => sum + a.level * 100 + a.xp,
    0,
  );

  // adventureHistory: sorted by startedAt descending
  const adventureHistory = profileAdventures
    .slice()
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .map((a) => ({
      id: a.id,
      heroClass: a.heroClass,
      startedAt: a.startedAt,
      level: a.level,
      status: a.status,
    }));

  return {
    totalGames,
    wins,
    losses,
    favoriteClass,
    maxLevel,
    totalXpGained,
    adventureHistory,
  };
}
