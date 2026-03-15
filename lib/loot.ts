import { LOOT_TABLE } from "@/lib/constants";
import type { LootType } from "@/types";

/**
 * Returns the loot type for a given battle count.
 * Returns "minor" at battles 3 and 6, "major" at battles 9 and 12.
 * Returns null if the battle count does not trigger a loot reward.
 *
 * Callers should use canReceiveLoot as a guard before calling this function
 * to safely obtain a non-null result.
 */
export function getLootType(battleCount: number): LootType {
  const entry = LOOT_TABLE[battleCount];
  return entry !== undefined ? entry : null;
}

/**
 * Returns true when the given battle count triggers a loot reward,
 * guaranteeing that getLootType will return a non-null value for the same count.
 */
export function canReceiveLoot(battleCount: number): boolean {
  return battleCount in LOOT_TABLE;
}
