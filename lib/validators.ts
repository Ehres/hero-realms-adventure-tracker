import { z } from "zod";

export const createProfileSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createAdventureSchema = z.object({
  profileId: z.string().uuid(),
  heroClass: z.enum(["archer", "clerc", "guerrier", "sorcier", "voleur"]),
});

export const endGameSchema = z.object({
  gameId: z.string().uuid(),
  winnerAdventureId: z.string().uuid(),
});

export const applyLevelUpSchema = z.object({
  adventureId: z.string().uuid(),
  choice: z.enum(["ability", "skill", "health"]),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type CreateAdventureInput = z.infer<typeof createAdventureSchema>;
export type EndGameInput = z.infer<typeof endGameSchema>;
export type ApplyLevelUpInput = z.infer<typeof applyLevelUpSchema>;
