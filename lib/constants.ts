import type { HeroClass } from "@/types";

export const MAX_HP: Record<HeroClass, number> = {
  guerrier: 50,
  clerc: 55,
  archer: 45,
  sorcier: 40,
  voleur: 45,
};

export const XP_PER_WIN = 30;
export const XP_PER_LOSS = 10;
export const XP_THRESHOLD = 100;

export const MAX_ABILITY_RANK = 5;
export const MAX_SKILL_RANK = 3;
export const MAX_HEALTH_UPGRADES = 2;

export const HEALTH_UPGRADE_VALUES: [number, number] = [5, 10];

export const INVENTORY_SLOTS = 4;

export const LOOT_TABLE: Record<number, "minor" | "major"> = {
  3: "minor",
  6: "minor",
  9: "major",
  12: "major",
};

export const HERO_COLORS: Record<HeroClass, string> = {
  archer: "rgb(134, 239, 172)",
  clerc: "rgb(253, 224, 71)",
  guerrier: "rgb(239, 68, 68)",
  sorcier: "rgb(96, 165, 250)",
  voleur: "rgb(107, 114, 128)",
};
