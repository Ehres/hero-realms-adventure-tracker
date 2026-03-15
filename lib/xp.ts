import { XP_PER_LOSS, XP_PER_WIN, XP_THRESHOLD } from "@/lib/constants";

export function calculateXpGain(isWinner: boolean): number {
  return isWinner ? XP_PER_WIN : XP_PER_LOSS;
}

export function applyXp(
  currentXp: number,
  currentLevel: number,
  gain: number,
): { newXp: number; newLevel: number; leveledUp: boolean } {
  const total = currentXp + gain;

  if (total >= XP_THRESHOLD) {
    return {
      newXp: total - XP_THRESHOLD,
      newLevel: currentLevel + 1,
      leveledUp: true,
    };
  }

  return {
    newXp: total,
    newLevel: currentLevel,
    leveledUp: false,
  };
}
