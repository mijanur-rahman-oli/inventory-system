import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [inventories, items] = await Promise.all([
    prisma.inventory.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, name: true, description: true },
    }),
    prisma.item.findMany({
      where: {
        inventory: { userId: user.id },
        OR: [
          { customId: { contains: q, mode: "insensitive" } },
          { text1: { contains: q, mode: "insensitive" } },
          { text2: { contains: q, mode: "insensitive" } },
          { text3: { contains: q, mode: "insensitive" } },
          { multiline1: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      include: { inventory: { select: { id: true, name: true } } },
    }),
  ]);

  const results = [
    ...inventories.map((inv) => ({
      type: "inventory" as const,
      id: inv.id,
      inventoryId: inv.id,
      inventoryName: inv.name,
      snippet: inv.description ?? inv.name,
      href: `/inventories/${inv.id}`,
    })),
    ...items.map((item) => ({
      type: "item" as const,
      id: item.id,
      inventoryId: item.inventoryId,
      inventoryName: item.inventory.name,
      snippet:
        item.customId ??
        item.text1 ??
        item.text2 ??
        `Item ${item.id.slice(0, 8)}`,
      href: `/inventories/${item.inventoryId}?item=${item.id}`,
    })),
  ];

  return NextResponse.json({ results });
}