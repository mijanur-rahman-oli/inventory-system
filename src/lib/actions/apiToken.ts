"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export async function generateApiToken(inventoryId: string) {
  const userId = await getCurrentUserId();

  const inv = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId },
  });
  if (!inv) return { error: "Not found" };

  const token = `inv_${randomBytes(32).toString("hex")}`;

  await prisma.inventory.update({
    where: { id: inventoryId },
    data: { apiToken: token },
  });

  revalidatePath(`/inventories/${inventoryId}/settings`);
  return { success: true, token };
}

export async function revokeApiToken(inventoryId: string) {
  const userId = await getCurrentUserId();

  await prisma.inventory.updateMany({
    where: { id: inventoryId, userId },
    data: { apiToken: null },
  });

  revalidatePath(`/inventories/${inventoryId}/settings`);
  return { success: true };
}