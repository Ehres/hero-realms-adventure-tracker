"use server";

import { db } from "@/db";
import { adventures } from "@/db/schema";
import { INVENTORY_SLOTS } from "@/lib/constants";
import { eq } from "drizzle-orm";

export async function assignLoot(
  adventureId: string,
  lootName: string
): Promise<void> {
  const rows = await db
    .select()
    .from(adventures)
    .where(eq(adventures.id, adventureId));

  const adventure = rows[0];
  if (!adventure) {
    throw new Error(`Adventure not found: ${adventureId}`);
  }

  if (adventure.inventory.length >= INVENTORY_SLOTS) {
    throw new Error(
      `Inventory is full (max ${INVENTORY_SLOTS} slots). Use replaceLoot to swap an item.`
    );
  }

  await db
    .update(adventures)
    .set({ inventory: [...adventure.inventory, lootName] })
    .where(eq(adventures.id, adventureId));
}

export async function replaceLoot(
  adventureId: string,
  slotIndex: number,
  newLootName: string
): Promise<void> {
  const rows = await db
    .select()
    .from(adventures)
    .where(eq(adventures.id, adventureId));

  const adventure = rows[0];
  if (!adventure) {
    throw new Error(`Adventure not found: ${adventureId}`);
  }

  if (slotIndex < 0 || slotIndex >= adventure.inventory.length) {
    throw new Error(
      `Invalid slot index ${slotIndex}. Inventory has ${adventure.inventory.length} items.`
    );
  }

  const newInventory = [...adventure.inventory];
  newInventory[slotIndex] = newLootName;

  await db
    .update(adventures)
    .set({ inventory: newInventory })
    .where(eq(adventures.id, adventureId));
}
