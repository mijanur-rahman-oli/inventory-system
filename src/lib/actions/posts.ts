"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

declare const global: { io?: { to: (room: string) => { emit: (event: string, data: unknown) => void } } };

export async function createPost(inventoryId: string, content: string) {
  const user = await getCurrentUser();
  if (!content.trim()) return { error: "Content required" };

  const inv = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId: user.id },
  });

  // Allow viewing/posting if user has access (owner check or public)
  // For now: owner only
  if (!inv) return { error: "Not found" };

  const post = await prisma.post.create({
    data: {
      inventoryId,
      userId: user.id,
      userName: user.displayName ?? user.primaryEmail ?? "Anonymous",
      userAvatar: user.profileImageUrl ?? null,
      content: content.trim(),
    },
  });

  // Emit via Socket.io if available
  if (global.io) {
    global.io.to(`inventory:${inventoryId}`).emit("new-post", post);
  }

  return { success: true, post };
}

export async function getPosts(inventoryId: string) {
  const user = await getCurrentUser();

  const inv = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId: user.id },
  });
  if (!inv) return { error: "Not found" };

  const posts = await prisma.post.findMany({
    where: { inventoryId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return { posts };
}