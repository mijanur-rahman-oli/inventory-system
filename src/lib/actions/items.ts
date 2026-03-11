"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCustomId } from "@/lib/customId";
import type { IdElement } from "@/types";

const ItemDataSchema = z.object({
  text1: z.string().optional().nullable(),
  text2: z.string().optional().nullable(),
  text3: z.string().optional().nullable(),
  multiline1: z.string().optional().nullable(),
  multiline2: z.string().optional().nullable(),
  multiline3: z.string().optional().nullable(),
  num1: z.coerce.number().optional().nullable(),
  num2: z.coerce.number().optional().nullable(),
  num3: z.coerce.number().optional().nullable(),
  bool1: z.boolean().optional().nullable(),
  bool2: z.boolean().optional().nullable(),
  bool3: z.boolean().optional().nullable(),
  link1: z.string().optional().nullable(),
  link2: z.string().optional().nullable(),
  link3: z.string().optional().nullable(),
});

async function verifyInventoryOwner(inventoryId: string, userId: string) {
  const inv = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId },
  });
  return !!inv;
}

export async function createItem(inventoryId: string, data: unknown) {
  const userId = await getCurrentUserId();

  if (!(await verifyInventoryOwner(inventoryId, userId))) {
    return { error: "Not found" };
  }

  const parsed = ItemDataSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed" };
  }

  // Generate custom ID if template exists
  let customId: string | null = null;
  const template = await prisma.idTemplate.findUnique({
    where: { inventoryId },
  });

  if (template && (template.elements as unknown[]).length > 0) {
    const elements = template.elements as IdElement[];
    let attempts = 0;
    let generated = "";

    while (attempts < 5) {
      generated = generateCustomId(elements, template.sequenceVal);
      const exists = await prisma.item.findUnique({
        where: { inventoryId_customId: { inventoryId, customId: generated } },
      });
      if (!exists) {
        customId = generated;
        break;
      }
      attempts++;
    }

    if (!customId) return { error: "Could not generate unique custom ID" };

    // Increment sequence
    await prisma.idTemplate.update({
      where: { inventoryId },
      data: { sequenceVal: { increment: 1 } },
    });
  }

  const item = await prisma.item.create({
    data: {
      inventoryId,
      customId,
      ...parsed.data,
    },
  });

  revalidatePath(`/inventories/${inventoryId}`);
  return { success: true, item };
}

export async function updateItem(
  inventoryId: string,
  itemId: string,
  version: number,
  data: unknown
) {
  const userId = await getCurrentUserId();

  if (!(await verifyInventoryOwner(inventoryId, userId))) {
    return { error: "Not found" };
  }

  const parsed = ItemDataSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed" };
  }

  const result = await prisma.item.updateMany({
    where: { id: itemId, inventoryId, version },
    data: {
      ...parsed.data,
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    return {
      error: "CONFLICT: Item was modified. Please refresh and try again.",
    };
  }

  revalidatePath(`/inventories/${inventoryId}`);
  return { success: true };
}

export async function deleteItems(inventoryId: string, itemIds: string[]) {
  const userId = await getCurrentUserId();

  if (!(await verifyInventoryOwner(inventoryId, userId))) {
    return { error: "Not found" };
  }

  await prisma.item.deleteMany({
    where: { id: { in: itemIds }, inventoryId },
  });

  revalidatePath(`/inventories/${inventoryId}`);
  return { success: true };
}

export async function getItems(
  inventoryId: string,
  opts: { q?: string; page?: number; pageSize?: number } = {}
) {
  const userId = await getCurrentUserId();

  const inv = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId },
  });
  if (!inv) return { error: "Not found" };

  const { q = "", page = 1, pageSize = 20 } = opts;

  const where = q
    ? {
        inventoryId,
        OR: [
          { customId: { contains: q, mode: "insensitive" as const } },
          { text1: { contains: q, mode: "insensitive" as const } },
          { text2: { contains: q, mode: "insensitive" as const } },
          { text3: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : { inventoryId };

  const [total, items] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { items, total, totalPages: Math.ceil(total / pageSize) };
}