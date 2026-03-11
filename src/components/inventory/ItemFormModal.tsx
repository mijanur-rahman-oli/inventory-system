"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import type { FieldMeta, Item } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  inventoryId: string;
  fieldMetas: FieldMeta[];
  item?: Item | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

export function ItemFormModal({ fieldMetas, item, onClose, onSave }: Props) {
  const initial = item ?? {};
  const [values, setValues] = useState<Record<string, unknown>>({
    text1: (initial as Record<string, unknown>).text1 ?? "",
    text2: (initial as Record<string, unknown>).text2 ?? "",
    text3: (initial as Record<string, unknown>).text3 ?? "",
    multiline1: (initial as Record<string, unknown>).multiline1 ?? "",
    multiline2: (initial as Record<string, unknown>).multiline2 ?? "",
    multiline3: (initial as Record<string, unknown>).multiline3 ?? "",
    num1: (initial as Record<string, unknown>).num1 ?? "",
    num2: (initial as Record<string, unknown>).num2 ?? "",
    num3: (initial as Record<string, unknown>).num3 ?? "",
    bool1: (initial as Record<string, unknown>).bool1 ?? false,
    bool2: (initial as Record<string, unknown>).bool2 ?? false,
    bool3: (initial as Record<string, unknown>).bool3 ?? false,
    link1: (initial as Record<string, unknown>).link1 ?? "",
    link2: (initial as Record<string, unknown>).link2 ?? "",
    link3: (initial as Record<string, unknown>).link3 ?? "",
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement>>({});

  const set = (key: string, val: unknown) => setValues((v) => ({ ...v, [key]: val }));

  const handleUpload = async (fieldKey: string, file: File) => {
    setUploading(fieldKey);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) set(fieldKey, data.url);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(values)) {
        if (v === "" || v === null) data[k] = null;
        else data[k] = v;
      }
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (meta: FieldMeta) => {
    const key = meta.fieldKey;
    const val = values[key];

    switch (meta.fieldType) {
      case "text":
        return (
          <input
            value={String(val ?? "")}
            onChange={(e) => set(key, e.target.value)}
            placeholder={meta.description ?? meta.title}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
          />
        );
      case "multiline":
        return (
          <textarea
            value={String(val ?? "")}
            onChange={(e) => set(key, e.target.value)}
            rows={3}
            placeholder={meta.description ?? meta.title}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none resize-none"
          />
        );
      case "numeric":
        return (
          <input
            type="number"
            value={String(val ?? "")}
            onChange={(e) => set(key, e.target.value ? Number(e.target.value) : null)}
            placeholder={meta.description ?? meta.title}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
          />
        );
      case "boolean":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(val)}
              onChange={(e) => set(key, e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-[var(--text-muted)]">{meta.description ?? "Enabled"}</span>
          </label>
        );
      case "link":
        return (
          <div className="flex gap-2">
            <input
              value={String(val ?? "")}
              onChange={(e) => set(key, e.target.value)}
              placeholder="https://... or upload"
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
            />
            <input
              ref={(el) => { if (el) fileRefs.current[key] = el; }}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(key, e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => fileRefs.current[key]?.click()}
              disabled={uploading === key}
              className="px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors"
            >
              {uploading === key
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Upload className="w-4 h-4" />
              }
            </button>
            {val && typeof val === "string" && val.startsWith("http") && (
              <a href={val} target="_blank" rel="noreferrer"
                className="px-3 py-2 text-xs text-[var(--accent)] border border-[var(--border)] rounded-lg hover:underline"
              >
                View
              </a>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[85vh] flex flex-col bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            {item ? "Edit Item" : "New Item"}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4">
          {fieldMetas.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              No fields configured. Go to Settings to add fields.
            </p>
          ) : (
            <div className="space-y-4">
              {fieldMetas.map((meta) => (
                <div key={meta.id}>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                    {meta.title}
                    {meta.description && (
                      <span className="ml-1 text-[var(--text-muted)] font-normal text-xs">
                        ({meta.description})
                      </span>
                    )}
                  </label>
                  {renderField(meta)}
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-[var(--border)]">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
              "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
            )}
          >
            {saving ? "Saving..." : item ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--border)] text-[var(--text)] hover:opacity-80 transition-opacity"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}