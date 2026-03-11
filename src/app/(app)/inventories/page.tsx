import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InventoriesClient } from "@/components/inventory/InventoriesClient";

export default async function InventoriesPage() {
  const userId = await getCurrentUserId();

  const inventories = await prisma.inventory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <InventoriesClient inventories={inventories} />
    </div>
  );
}