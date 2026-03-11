import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Package, Layers, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  const [inventoryCount, itemCount, recentInventories] = await Promise.all([
    prisma.inventory.count({ where: { userId } }),
    prisma.item.count({ where: { inventory: { userId } } }),
    prisma.inventory.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const stats = [
    { label: "Inventories", value: inventoryCount, icon: Layers, color: "text-indigo-500" },
    { label: "Total Items", value: itemCount, icon: Package, color: "text-emerald-500" },
    { label: "Active", value: inventoryCount, icon: TrendingUp, color: "text-sky-500" },
    { label: "Alerts", value: 0, icon: AlertTriangle, color: "text-amber-500" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Overview of your inventory system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                  {stat.label}
                </span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-[var(--text)]">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Inventories */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[var(--text)]">Recent Inventories</h2>
          <Link
            href="/inventories"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            View all
          </Link>
        </div>

        {recentInventories.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-muted)]">No inventories yet.</p>
            <Link
              href="/inventories"
              className="mt-3 inline-block text-sm text-[var(--accent)] hover:underline"
            >
              Create your first →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentInventories.map((inv) => (
              <Link
                key={inv.id}
                href={`/inventories/${inv.id}`}
                className="group p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--text)] truncate group-hover:text-[var(--accent)]">
                      {inv.name}
                    </div>
                    {inv.description && (
                      <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                        {inv.description}
                      </div>
                    )}
                  </div>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-muted)] flex-shrink-0">
                    {inv._count.items} items
                  </span>
                </div>
                <div className="mt-3 text-xs text-[var(--text-muted)]">
                  Updated {new Date(inv.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}