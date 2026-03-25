import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;

  if (!token) {
    return json(
      { success: false, error: "Missing Authorization header" },
      401
    );
  }

  const inventory = await prisma.inventory.findUnique({
    where: { apiToken: token },
  });

  if (!inventory) {
    return json(
      { success: false, error: "Invalid token" },
      401
    );
  }

  // Use Prisma aggregate — fastest and cleanest
  const [agg, items] = await Promise.all([
    prisma.item.aggregate({
      where: { inventoryId: inventory.id },
      _count: { id: true },
      _avg: { num1: true, num2: true, num3: true },
      _min: { num1: true, num2: true, num3: true },
      _max: { num1: true, num2: true, num3: true },
    }),
    prisma.item.findMany({
      where: { inventoryId: inventory.id },
      select: {
        text1: true,
        text2: true,
        text3: true,
        customId: true,
        createdAt: true,
      },
    }),
  ]);

  // Top 3 most frequent text values using reduce
  const freq: Record<string, number> = {};
  for (const item of items) {
    for (const v of [item.text1, item.text2, item.text3]) {
      if (v?.trim()) {
        freq[v.trim()] = (freq[v.trim()] ?? 0) + 1;
      }
    }
  }

  const topTextValues = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([value, count]) => ({ value, count }));

  return json({
    success: true,
    inventoryId: inventory.id,
    inventoryTitle: inventory.name,
    description: inventory.description ?? null,
    aggregations: {
      totalItems: agg._count.id,
      num1: {
        average: agg._avg.num1 ? Number(agg._avg.num1.toFixed(2)) : null,
        min: agg._min.num1 ? Number(agg._min.num1) : null,
        max: agg._max.num1 ? Number(agg._max.num1) : null,
      },
      num2: {
        average: agg._avg.num2 ? Number(agg._avg.num2.toFixed(2)) : null,
        min: agg._min.num2 ? Number(agg._min.num2) : null,
        max: agg._max.num2 ? Number(agg._max.num2) : null,
      },
      num3: {
        average: agg._avg.num3 ? Number(agg._avg.num3.toFixed(2)) : null,
        min: agg._min.num3 ? Number(agg._min.num3) : null,
        max: agg._max.num3 ? Number(agg._max.num3) : null,
      },
    },
    topTextValues,
    generatedAt: new Date().toISOString(),
  });
}