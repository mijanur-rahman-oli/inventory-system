import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminClient } from "@/components/admin/AdminClient";
import { stackServerApp } from "@/stack/server";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const isAdmin =
    (user.clientMetadata as { role?: string })?.role === "admin";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Get all users from Stack Auth safely
  let users: {
    id: string;
    displayName: string;
    primaryEmail: string;
    role: string;
    isBlocked: boolean;
    createdAt: string;
    inventoryCount: number;
  }[] = [];

  try {
    const result = await stackServerApp.listUsers();

    // Handle both { items: [] } and direct array responses
    const stackUsers = Array.isArray(result)
      ? result
      : result?.items ?? [];

    // Get inventory counts per user
    const inventoryCounts = await prisma.inventory.groupBy({
      by: ["userId"],
      _count: { id: true },
    });

    const countMap = Object.fromEntries(
      inventoryCounts.map((r) => [r.userId, r._count.id])
    );

    users = stackUsers.map((u: {
      id: string;
      displayName?: string | null;
      primaryEmail?: string | null;
      clientMetadata?: unknown;
      signedUpAt?: string | Date | null;
    }) => ({
      id: u.id,
      displayName: u.displayName ?? "Unknown",
      primaryEmail: u.primaryEmail ?? "",
      role:
        (u.clientMetadata as { role?: string })?.role === "admin"
          ? "admin"
          : "user",
      isBlocked:
        (u.clientMetadata as { isBlocked?: boolean })?.isBlocked ===
        true,
      createdAt: u.signedUpAt
        ? new Date(u.signedUpAt).toISOString()
        : new Date().toISOString(),
      inventoryCount: countMap[u.id] ?? 0,
    }));
  } catch (err) {
    console.error("Failed to load users:", err);
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminClient users={users} currentUserId={user.id} />
    </div>
  );
}