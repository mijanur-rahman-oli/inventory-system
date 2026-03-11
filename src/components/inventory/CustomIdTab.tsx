"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, RefreshCw, Save, GripVertical } from "lucide-react";
import { saveIdTemplate } from "@/lib/actions/inventories";
import { generateCustomId, ID_ELEMENT_LABELS } from "@/lib/customId";
import type { IdElement, IdElementType } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const PALETTE: { type: IdElementType; description: string }[] = [
  { type: "fixed", description: "Fixed text prefix/suffix" },
  { type: "sequence", description: "Auto-incrementing number" },
  { type: "date", description: "Current date YYYYMMDD" },
  { type: "time", description: "Current time HHMMSS" },
  { type: "rand6", description: "6-digit random number" },
  { type: "rand9", description: "9-digit random number" },
  { type: "rand20", description: "20-bit binary random" },
  { type: "rand32", description: "32-bit hex random" },
  { type: "guid", description: "Global Unique Identifier" },
];

interface Props {
  inventory: {
    id: string;
    idTemplate: { elements: unknown; sequenceVal: number } | null;
  };
}

export function CustomIdTab({ inventory }: Props) {
  const parseElements = (): IdElement[] => {
    try {
      const raw = inventory.idTemplate?.elements;
      if (!raw) return [];
      return (typeof raw === "string" ? JSON.parse(raw) : raw) as IdElement[];
    } catch {
      return [];
    }
  };

  const [elements, setElements] = useState<IdElement[]>(parseElements);
  const [preview, setPreview] = useState(() =>
    generateCustomId(parseElements(), inventory.idTemplate?.sequenceVal ?? 0)
  );
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const regeneratePreview = useCallback(
    (els: IdElement[]) => {
      setPreview(generateCustomId(els, inventory.idTemplate?.sequenceVal ?? 0));
    },
    [inventory.idTemplate?.sequenceVal]
  );

  const addElement = (type: IdElementType) => {
    const el: IdElement = {
      id: `${type}-${Date.now()}`,
      type,
      value: type === "fixed" ? "PREFIX-" : undefined,
    };
    const next = [...elements, el];
    setElements(next);
    regeneratePreview(next);
  };

  const removeElement = (id: string) => {
    const next = elements.filter((e) => e.id !== id);
    setElements(next);
    regeneratePreview(next);
  };

  const updateFixed = (id: string, value: string) => {
    const next = elements.map((e) => (e.id === id ? { ...e, value } : e));
    setElements(next);
    regeneratePreview(next);
  };

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(String(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setElements((prev) => {
        const from = prev.findIndex((e) => e.id === active.id);
        const to = prev.findIndex((e) => e.id === over.id);
        const next = arrayMove(prev, from, to);
        regeneratePreview(next);
        return next;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await saveIdTemplate(inventory.id, elements);
    setSaving(false);
    if ("error" in result) {
      toast.error(result.error ?? "Error");
      return;
    }
    toast.success("Custom ID template saved");
  };

  const activeElement = activeId
    ? elements.find((e) => e.id === activeId)
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="font-semibold text-[var(--text)] mb-1">
          Custom ID Builder
        </h3>
        <p className="text-sm text-[var(--text-muted)]">
          Drag elements to build your ID format. Each item gets a unique ID
          generated from this template.
        </p>
      </div>

      {/* Palette */}
      <div className="card p-5">
        <h4 className="text-sm font-medium text-[var(--text)] mb-3">
          Available Elements
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PALETTE.map((item) => (
            <button
              key={item.type}
              onClick={() => addElement(item.type)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)]",
                "text-left text-sm hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]",
                "transition-all group"
              )}
            >
              <Plus className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
              <div>
                <div className="font-medium text-[var(--text)] text-xs">
                  {ID_ELEMENT_LABELS[item.type]}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Builder area */}
      <div className="card p-5">
        <h4 className="text-sm font-medium text-[var(--text)] mb-3">
          Template
        </h4>
        {elements.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Add elements from the palette above
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={elements.map((e) => e.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2 min-h-16 p-3 border border-[var(--border)] rounded-xl bg-[var(--bg)]">
                {elements.map((el) => (
                  <SortableElement
                    key={el.id}
                    element={el}
                    onRemove={() => removeElement(el.id)}
                    onValueChange={(v) => updateFixed(el.id, v)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeElement && (
                <div className="px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-sm shadow-xl opacity-90">
                  {ID_ELEMENT_LABELS[activeElement.type]}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Live Preview */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-[var(--text)]">
            Live Preview
          </h4>
          <button
            onClick={() => regeneratePreview(elements)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Regenerate
          </button>
        </div>
        <div className="font-mono text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--accent)] break-all">
          {preview || (
            <span className="text-[var(--text-muted)] italic">
              No elements added
            </span>
          )}
        </div>
        {preview && (
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Length: {preview.length} characters
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>
    </div>
  );
}

function SortableElement({
  element,
  onRemove,
  onValueChange,
}: {
  element: IdElement;
  onRemove: () => void;
  onValueChange: (v: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-xs font-medium",
        "bg-[var(--bg-card)] border-[var(--border)]",
        isDragging ? "opacity-50" : ""
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-[var(--text-muted)] cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3 h-3" />
      </button>

      {element.type === "fixed" ? (
        <input
          value={element.value ?? ""}
          onChange={(e) => onValueChange(e.target.value)}
          className="bg-transparent text-[var(--text)] text-xs w-20 focus:outline-none border-b border-[var(--border)] focus:border-[var(--accent)]"
          placeholder="text..."
        />
      ) : (
        <span className="text-[var(--accent)]">
          {ID_ELEMENT_LABELS[element.type]}
        </span>
      )}

      <button
        onClick={onRemove}
        className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}