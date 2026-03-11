"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const InventorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function createInventory(formData: FormData) {
  const userId = await getCurrentUserId();

  const parsed = InventorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const inventory = await prisma.inventory.create({
    data: {
      userId,
      name: parsed.data.name,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  redirect(`/inventories/${inventory.id}`);
}

export async function updateInventory(
  id: string,
  version: number,
  data: { name?: string; description?: string; imageUrl?: string }
) {
  const userId = await getCurrentUserId();

  const result = await prisma.inventory.updateMany({
    where: { id, userId, version },
    data: {
      ...data,
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    return {
      error:
        "Conflict: This inventory was modified by someone else. Please refresh.",
    };
  }

  revalidatePath(`/inventories/${id}`);
  return { success: true };
}

export async function deleteInventory(id: string) {
  const userId = await getCurrentUserId();

  await prisma.inventory.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/inventories");
  redirect("/inventories");
}

export async function deleteInventories(ids: string[]) {
  const userId = await getCurrentUserId();

  await prisma.inventory.deleteMany({
    where: { id: { in: ids }, userId },
  });

  revalidatePath("/inventories");
}

export async function saveFieldMetas(
  inventoryId: string,
  metas: Array<{
    fieldKey: string;
    fieldType: string;
    title: string;
    description?: string;
    showInTable: boolean;
    sortOrder: number;
  }>
) {
  const userId = await getCurrentUserId();

  const inv = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId },
  });
  if (!inv) return { error: "Not found" };

  // Upsert each field meta
  await Promise.all(
    metas.map((meta) =>
      prisma.fieldMeta.upsert({
        where: {
          inventoryId_fieldKey: {
            inventoryId,
            fieldKey: meta.fieldKey,
          },
        },
        update: {
          title: meta.title,
          description: meta.description,
          showInTable: meta.showInTable,
          sortOrder: meta.sortOrder,
        },
        create: {
          inventoryId,
          fieldKey: meta.fieldKey,
          fieldType: meta.fieldType,
          title: meta.title,
          description: meta.description,
          showInTable: meta.showInTable,
          sortOrder: meta.sortOrder,
        },
      })
    )
  );

  revalidatePath(`/inventories/${inventoryId}/settings`);
  return { success: true };
}

export async function saveIdTemplate(
  inventoryId: string,
  elements: unknown[]
) {
  const userId = await getCurrentUserId();

  const inv = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId },
  });
  if (!inv) return { error: "Not found" };

  await prisma.idTemplate.upsert({
    where: { inventoryId },
    update: { elements: JSON.stringify(elements) },
    create: {
      inventoryId,
      elements: JSON.stringify(elements),
      sequenceVal: 0,
    },
  });

  revalidatePath(`/inventories/${inventoryId}/settings`);
  return { success: true };
}