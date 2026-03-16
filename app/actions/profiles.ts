"use server";

import { db } from "@/db";
import { adventures, profiles } from "@/db/schema";
import { createProfileSchema } from "@/lib/validators";
import { type Profile } from "@/types";
import { count, eq } from "drizzle-orm";

export async function createProfile(name: string): Promise<string> {
  const parsed = createProfileSchema.parse({ name });
  const id = crypto.randomUUID();
  await db.insert(profiles).values({
    id,
    name: parsed.name,
  });
  return id;
}

export async function deleteProfile(profileId: string): Promise<void> {
  await db.delete(adventures).where(eq(adventures.profileId, profileId));
  await db.delete(profiles).where(eq(profiles.id, profileId));
}

export async function getProfiles(): Promise<Profile[]> {
  const rows = await db
    .select()
    .from(profiles)
    .orderBy(profiles.createdAt);
  return rows.reverse() as Profile[];
}

export async function getProfilesWithAdventureCounts(): Promise<(Profile & { adventureCount: number })[]> {
  const rows = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      createdAt: profiles.createdAt,
      adventureCount: count(adventures.id),
    })
    .from(profiles)
    .leftJoin(adventures, eq(adventures.profileId, profiles.id))
    .groupBy(profiles.id, profiles.name, profiles.createdAt)
    .orderBy(profiles.createdAt);
  return rows.reverse().map((r) => ({
    ...r,
    adventureCount: Number(r.adventureCount),
  }));
}

export async function getProfile(profileId: string): Promise<Profile | null> {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId));
  return (rows[0] as Profile | undefined) ?? null;
}
