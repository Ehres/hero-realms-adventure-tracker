"use server";

import { db } from "@/db";
import { adventures, gameParticipants, games, profiles } from "@/db/schema";
import type { Adventure, Game, Profile } from "@/types";
import { eq } from "drizzle-orm";

export type ParticipantWithDetails = {
  id: string;
  adventureId: string;
  currentHp: number;
  adventure: Adventure;
  profile: Profile;
};

export type GameWithParticipants = {
  game: Game;
  participants: ParticipantWithDetails[];
};

export async function getGameWithParticipants(
  gameId: string
): Promise<GameWithParticipants | null> {
  const gameRows = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId));

  const game = gameRows[0] as Game | undefined;
  if (!game) return null;

  const participantRows = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.gameId, gameId));

  const participants: ParticipantWithDetails[] = [];

  for (const participant of participantRows) {
    const adventureRows = await db
      .select()
      .from(adventures)
      .where(eq(adventures.id, participant.adventureId));

    const adventure = adventureRows[0] as Adventure | undefined;
    if (!adventure) continue;

    const profileRows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, adventure.profileId));

    const profile = profileRows[0] as Profile | undefined;
    if (!profile) continue;

    participants.push({
      id: participant.id,
      adventureId: participant.adventureId,
      currentHp: participant.currentHp,
      adventure,
      profile,
    });
  }

  return { game, participants };
}

export type ProfileWithAdventures = {
  profile: Profile;
  adventures: Adventure[];
};

export async function getAdventuresForSetup(): Promise<ProfileWithAdventures[]> {
  const profileRows = await db
    .select()
    .from(profiles)
    .orderBy(profiles.createdAt);

  const result: ProfileWithAdventures[] = [];

  for (const profile of profileRows) {
    const adventureRows = await db
      .select()
      .from(adventures)
      .where(eq(adventures.profileId, profile.id));

    const activeAdventures = (adventureRows as Adventure[]).filter(
      (a) => a.status === "active" || a.status === "paused"
    );

    result.push({
      profile: profile as Profile,
      adventures: activeAdventures,
    });
  }

  return result.reverse();
}
