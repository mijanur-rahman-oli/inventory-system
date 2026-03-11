import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shield, Users } from "lucide-react";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const isAdmin = (user.clientMetadata as { role?: string })?.role === "admin";

  const inventoryStats = await prisma.inventory.groupBy({
    by: ["userId"],
    _count: { id: true },
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-[var(--accent)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Admin Panel</h1>
          <p className="text-sm text-[var(--text-muted)]">System management</p>
        </div>
        {isAdmin && (
          <span className="ml-auto text-xs px-3 py-1 rounded-full bg-[var(--accent)] text-white font-medium">
            Admin
          </span>
        )}
      </div>

      {!isAdmin ? (
        <div className="card p-8 text-center">
          <Shield className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-muted)]">Admin access required.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Contact your system administrator to get admin privileges.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--text)]">Active Users</span>
              </div>
              <div className="text-3xl font-bold text-[var(--text)]">
                {inventoryStats.length}
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-[var(--text)]">Total Inventories</span>
              </div>
              <div className="text-3xl font-bold text-[var(--text)]">
                {inventoryStats.reduce((s, u) => s + u._count.id, 0)}
              </div>
            </div>
          </div>

          {/* Users table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--text)]">User Activity</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                    User ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                    Inventories
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryStats.map((row) => (
                  <tr key={row.userId} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)]">
                    <td className="px-5 py-3 text-sm font-mono text-[var(--text-muted)]">
                      {row.userId.slice(0, 20)}...
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-muted)]">
                        {row._count.id}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}