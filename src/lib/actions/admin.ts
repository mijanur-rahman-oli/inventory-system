"use server";

import { getCurrentUser } from "@/lib/auth";
import { stackServerApp } from "@/stack/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const user = await getCurrentUser();
  const isAdmin =
    (user.clientMetadata as { role?: string })?.role === "admin";
  if (!isAdmin) throw new Error("Unauthorized");
  return user;
}

export async function promoteUser(userId: string) {
  await verifyAdmin();
  const target = await stackServerApp.getUser(userId);
  if (!target) return { error: "User not found" };

  await target.setClientMetadata({
    ...(target.clientMetadata as object ?? {}),
    role: "admin",
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function demoteUser(userId: string) {
  const currentUser = await verifyAdmin();

  const target = await stackServerApp.getUser(userId);
  if (!target) return { error: "User not found" };

  // Check at least one admin remains
  try {
    const result = await stackServerApp.listUsers();
    const allUsers = Array.isArray(result)
      ? result
      : result?.items ?? [];

    const adminCount = allUsers.filter(
      (u: { clientMetadata?: unknown }) =>
        (u.clientMetadata as { role?: string })?.role === "admin"
    ).length;

    if (adminCount <= 1) {
      return {
        error: "Cannot demote: at least one admin must remain",
      };
    }
  } catch {
    // continue
  }

  await target.setClientMetadata({
    ...(target.clientMetadata as object ?? {}),
    role: "user",
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function blockUser(userId: string) {
  const currentUser = await verifyAdmin();
  if (userId === currentUser.id) {
    return { error: "Cannot block yourself" };
  }

  const target = await stackServerApp.getUser(userId);
  if (!target) return { error: "User not found" };

  await target.setClientMetadata({
    ...(target.clientMetadata as object ?? {}),
    isBlocked: true,
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function unblockUser(userId: string) {
  await verifyAdmin();

  const target = await stackServerApp.getUser(userId);
  if (!target) return { error: "User not found" };

  await target.setClientMetadata({
    ...(target.clientMetadata as object ?? {}),
    isBlocked: false,
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUsers(userIds: string[]) {
  const currentUser = await verifyAdmin();

  for (const userId of userIds) {
    if (userId === currentUser.id) continue;

    try {
      const target = await stackServerApp.getUser(userId);
      if (target) {
        await target.delete();
      }
    } catch {
      // continue with next user
    }

    await prisma.inventory.deleteMany({ where: { userId } });
  }

  revalidatePath("/admin");
  return { success: true };
}