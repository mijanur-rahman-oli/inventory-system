"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GripVertical, Eye, EyeOff, Save, CheckCircle } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { saveFieldMetas, updateInventory } from "@/lib/actions/inventories";
import type { FieldMeta, FieldType, FieldKey } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const FIELD_GROUPS: { type: FieldType; label: string; keys: FieldKey[] }[] = [
  { type: "text", label: "Single-line Text", keys: ["text1", "text2", "text3"] },
  { type: "multiline", label: "Multi-line Text", keys: ["multiline1", "multiline2", "multiline3"] },
  { type: "numeric", label: "Numeric", keys: ["num1", "num2", "num3"] },
  { type: "link", label: "Link / Image", keys: ["link1", "link2", "link3"] },
  { type: "boolean", label: "Boolean", keys: ["bool1", "bool2", "bool3"] },
];

function buildDefaultMetas(existing: FieldMeta[]): FieldMeta[] {
  const all: FieldMeta[] = [];
  let sortOrder = 0;
  for (const group of FIELD_GROUPS) {
    for (const key of group.keys) {
      const ex = existing.find((m) => m.fieldKey === key);
      all.push(
        ex ?? {
          id: key,
          inventoryId: "",
          fieldKey: key,
          fieldType: group.type,
          title: `${group.label} ${key.slice(-1)}`,
          description: null,
          showInTable: false,
          sortOrder: sortOrder++,
        }
      );
      sortOrder++;
    }
  }
  return all.sort((a, b) => a.sortOrder - b.sortOrder);
}

interface Props {
  inventory: {
    id: string;
    name: string;
    description: string | null;
    version: number;
    fieldMetas: FieldMeta[];
  };
}

export function InventorySettingsTab({ inventory }: Props) {
  const [name, setName] = useState(inventory.name);
  const [desc, setDesc] = useState(inventory.description ?? "");
  const [metas, setMetas] = useState<FieldMeta[]>(() => buildDefaultMetas(inventory.fieldMetas));
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await updateInventory(inventory.id, inventory.version, { name, description: desc });
      await saveFieldMetas(
        inventory.id,
        metas.map((m, i) => ({ ...m, sortOrder: i }))
      );
      setSaveStatus("saved");
      setIsDirty(false);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      toast.error("Save failed");
      setSaveStatus("idle");
    }
  }, [inventory.id, inventory.version, name, desc, metas]);

  // Auto-save every 8 seconds if dirty
  useEffect(() => {
    if (!isDirty) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { handleSave(); }, 8000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isDirty, handleSave]);

  const markDirty = () => setIsDirty(true);

  const updateMeta = (idx: number, patch: Partial<FieldMeta>) => {
    setMetas((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
    markDirty();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMetas((prev) => {
        const from = prev.findIndex((m) => m.fieldKey === active.id);
        const to = prev.findIndex((m) => m.fieldKey === over.id);
        return arrayMove(prev, from, to);
      });
      markDirty();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Auto-save status */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">
          {isDirty ? "Auto-saves in 8s..." : "All changes saved"}
        </p>
        <div className="flex items-center gap-2">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <CheckCircle className="w-3 h-3" /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saveStatus === "saving" ? "Saving..." : "Save Now"}
          </button>
        </div>
      </div>

      {/* Inventory info */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-[var(--text)]">Inventory Info</h3>
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Name *</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); markDirty(); }}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Description</label>
          <textarea
            value={desc}
            onChange={(e) => { setDesc(e.target.value); markDirty(); }}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Custom Fields */}
      <div className="card p-5">
        <h3 className="font-semibold text-[var(--text)] mb-1">Custom Fields</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Drag to reorder. Toggle visibility in table. Up to 3 per type.
        </p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={metas.map((m) => m.fieldKey)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {metas.map((meta, idx) => (
                <SortableFieldRow
                  key={meta.fieldKey}
                  meta={meta}
                  onChange={(patch) => updateMeta(idx, patch)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableFieldRow({
  meta,
  onChange,
}: {
  meta: FieldMeta;
  onChange: (patch: Partial<FieldMeta>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: meta.fieldKey,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const typeLabel: Record<string, string> = {
    text: "Text",
    multiline: "Multiline",
    numeric: "Num",
    link: "Link",
    boolean: "Bool",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]",
        "transition-shadow",
        isDragging ? "shadow-lg opacity-80 z-10" : ""
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-[var(--text-muted)] hover:text-[var(--text)] cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-muted)] flex-shrink-0 w-16 text-center">
        {typeLabel[meta.fieldType] ?? meta.fieldType}
      </span>

      <input
        value={meta.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Field title"
        className="flex-1 px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none min-w-0"
      />

      <input
        value={meta.description ?? ""}
        onChange={(e) => onChange({ description: e.target.value || null })}
        placeholder="Tooltip (optional)"
        className="w-40 px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none hidden lg:block"
      />

      <button
        onClick={() => onChange({ showInTable: !meta.showInTable })}
        title={meta.showInTable ? "Hide from table" : "Show in table"}
        className={cn(
          "p-1.5 rounded-lg transition-colors flex-shrink-0",
          meta.showInTable
            ? "text-[var(--accent)] bg-[var(--accent-muted)]"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        )}
      >
        {meta.showInTable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}