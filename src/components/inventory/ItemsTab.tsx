"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink
} from "lucide-react";
import { deleteItems, createItem, updateItem } from "@/lib/actions/items";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { FieldMeta, Item } from "@/types";
import { ItemFormModal } from "./ItemFormModal";

interface Props {
  inventory: {
    id: string;
    version: number;
    fieldMetas: FieldMeta[];
    idTemplate: { elements: unknown; sequenceVal: number } | null;
  };
  items: Item[];
  itemsTotal: number;
  totalPages: number;
  currentPage: number;
  searchQuery: string;
}

export function ItemsTab({
  inventory,
  items,
  itemsTotal,
  totalPages,
  currentPage,
  searchQuery,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  // Reset selection when navigation occurs
  useEffect(() => {
    setSelected(new Set());
  }, [currentPage, searchQuery]);

  const tableFields = inventory.fieldMetas.filter((f) => f.showInTable);
  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selected.size} item(s)?`)) return;
    startTransition(async () => {
      const result = await deleteItems(inventory.id, Array.from(selected));
      if (result && "error" in result) {
        toast.error(result.error ?? "Failed to delete items");
        return;
      }
      setSelected(new Set());
      toast.success("Items deleted successfully");
      router.refresh();
    });
  };

  const handleEditSelected = () => {
    const id = Array.from(selected)[0];
    const item = items.find((i) => i.id === id);
    if (item) {
      setEditItem(item);
    }
  };

  const onSearch = (q: string) => {
    router.push(`${pathname}?tab=items&q=${encodeURIComponent(q)}&page=1`);
  };

  const goPage = (p: number) => {
    router.push(`${pathname}?tab=items&q=${encodeURIComponent(searchQuery)}&page=${p}`);
  };

  const renderFieldCell = (item: Item, f: FieldMeta) => {
    const val = (item as any)[f.fieldKey];
    
    if (val === null || val === undefined) return <span className="text-gray-400">—</span>;

    if (f.fieldType === "link") {
      return (
        <a
          href={String(val)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-blue-500 hover:underline text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          View <ExternalLink className="w-3 h-3" />
        </a>
      );
    }

    if (f.fieldType === "boolean") {
      return (
        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase", val ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
          {val ? "Yes" : "No"}
        </span>
      );
    }

    return <span>{String(val)}</span>;
  };

  return (
    <>
      {/* Header Actions */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            defaultValue={searchQuery}
            onKeyDown={(e) => e.key === "Enter" && onSearch(e.currentTarget.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Item
        </button>
      </div>

      {/* Floating Toolbar for Selection */}
      {someSelected && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-semibold text-blue-700">{selected.size} selected</span>
          <div className="h-4 w-[1px] bg-blue-200 mx-2" />
          {selected.size === 1 && (
            <button onClick={handleEditSelected} className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600">
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
          <button 
            onClick={handleDelete} 
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-500 hover:underline">
            Clear Selection
          </button>
        </div>
      )}

      {/* Table Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-4 py-3 text-center">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Custom ID</th>
                {tableFields.map((f) => (
                  <th key={f.id} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                    {f.title}
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={tableFields.length + 3} className="px-4 py-20 text-center text-gray-400">
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onDoubleClick={() => setEditItem(item)}
                    className={cn("hover:bg-gray-50 cursor-pointer transition-colors", selected.has(item.id) && "bg-blue-50/50")}
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{item.customId || "—"}</td>
                    {tableFields.map((f) => (
                      <td key={f.id} className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                        {renderFieldCell(item, f)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-500">Showing page {currentPage} of {totalPages}</p>
          <div className="flex gap-1">
            <button
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <ItemFormModal
          inventoryId={inventory.id}
          fieldMetas={inventory.fieldMetas}
          onClose={() => setShowCreate(false)}
          onSave={async (data) => {
            const res = await createItem(inventory.id, data);
            if (res && "error" in res) return toast.error(res.error);
            toast.success("Item created");
            setShowCreate(false);
            router.refresh();
          }}
        />
      )}

      {editItem && (
        <ItemFormModal
          inventoryId={inventory.id}
          fieldMetas={inventory.fieldMetas}
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={async (data) => {
            const res = await updateItem(inventory.id, editItem.id, editItem.version, data);
            if (res && "error" in res) return toast.error("Update failed (Conflict detected)");
            toast.success("Item updated");
            setEditItem(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}