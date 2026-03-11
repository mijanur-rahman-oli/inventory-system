import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { FieldMeta } from "@prisma/client";

export default async function InventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>;
}) {
  const userId = await getCurrentUserId();
  const { id } = await params;
  const sp = await searchParams;

  const inventory = await prisma.inventory.findFirst({
    where: { id, userId },
    include: {
      fieldMetas: { orderBy: { sortOrder: "asc" } },
      idTemplate: true,
    },
  });

  if (!inventory) notFound();

  const tab = sp.tab ?? "items";
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page ?? 1));
  const pageSize = 20;

  const where = q
    ? {
        inventoryId: id,
        OR: [
          { customId: { contains: q, mode: "insensitive" as const } },
          { text1: { contains: q, mode: "insensitive" as const } },
          { text2: { contains: q, mode: "insensitive" as const } },
          { text3: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : { inventoryId: id };

  const [itemsCount, items] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const posts = tab === "discussion"
    ? await prisma.post.findMany({
        where: { inventoryId: id },
        orderBy: { createdAt: "asc" },
        take: 100,
      })
    : [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <InventoryTabs
        inventory={{
          ...inventory,
         fieldMetas: inventory.fieldMetas as FieldMeta[],
          idTemplate: inventory.idTemplate,
        }}
        items={items.map(item => ({
          ...item,
          num1: item.num1 ? Number(item.num1) : null,
          num2: item.num2 ? Number(item.num2) : null,
          num3: item.num3 ? Number(item.num3) : null,
        }))}
        itemsTotal={itemsCount}
        totalPages={Math.ceil(itemsCount / pageSize)}
        currentPage={page}
        currentTab={tab}
        searchQuery={q}
        posts={posts}
      />
    </div>
  );
}