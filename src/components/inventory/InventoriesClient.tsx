"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2, Layers, Calendar } from "lucide-react";
import { createInventory, deleteInventories } from "@/lib/actions/inventories";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Inventory {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  version: number;
  updatedAt: Date;
  _count: { items: number };
}

export function InventoriesClient({
  inventories: initial,
}: {
  inventories: Inventory[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [inventories, setInventories] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const allSelected =
    inventories.length > 0 && selected.size === inventories.length;
  const someSelected = selected.size > 0;

  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(inventories.map((i) => i.id))
    );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  const handleDelete = () => {
    if (
      !confirm(
        `Delete ${selected.size} inventory/inventories? This cannot be undone.`
      )
    )
      return;
    startTransition(async () => {
      await deleteInventories(Array.from(selected));
      setInventories((prev) => prev.filter((i) => !selected.has(i.id)));
      setSelected(new Set());
      toast.success("Deleted successfully");
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            Inventories
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {inventories.length} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" /> New Inventory
        </button>
      </div>

      {/* Selection Toolbar */}
      {someSelected && (
        <div className="toolbar-enter mb-4 flex items-center gap-3 px-4 py-3 bg-[var(--accent-muted)] border border-[var(--accent)] rounded-xl">
          <span className="text-sm font-medium text-[var(--accent)]">
            {selected.size} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide hidden md:table-cell">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide hidden lg:table-cell">
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {inventories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <Layers className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-muted)]">
                    No inventories yet.
                  </p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-2 text-sm text-[var(--accent)] hover:underline"
                  >
                    Create your first →
                  </button>
                </td>
              </tr>
            )}
            {inventories.map((inv) => {
              const isSelected = selected.has(inv.id);
              return (
                <tr
                  key={inv.id}
                  className={cn(
                    "border-b border-[var(--border)] last:border-0 transition-colors",
                    isSelected
                      ? "bg-[var(--accent-muted)]"
                      : "hover:bg-[var(--bg)]"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(inv.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/inventories/${inv.id}`}
                      className="font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                    >
                      {inv.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden md:table-cell max-w-xs truncate">
                    {inv.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-muted)]">
                      {inv._count.items}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(inv.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateInventoryModal onClose={() => setShowCreate(false)} />
      )}
    </>
  );
}

function CreateInventoryModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] p-6 animate-fadeIn">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-5">
          New Inventory
        </h2>
       <form action={async (formData) => { await createInventory(formData); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Name *
            </label>
            <input
              name="name"
              required
              placeholder="e.g. Electronics Stock"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Optional description"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-[var(--border)] text-[var(--text)] rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}