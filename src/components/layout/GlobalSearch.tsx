"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Package, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "inventory" | "item";
  id: string;
  inventoryId: string;
  inventoryName: string;
  snippet: string;
  href: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
          "bg-[var(--bg-card)] border border-[var(--border)]",
          "text-[var(--text-muted)] hover:text-[var(--text)]",
          "transition-all w-64"
        )}
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs border border-[var(--border)] rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className={cn(
            "fixed top-1/4 left-1/2 -translate-x-1/2 z-50",
            "w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl",
            "border border-[var(--border)] overflow-hidden animate-fadeIn"
          )}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
              <Search className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search inventories and items..."
                className="flex-1 bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none text-sm"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                  Searching...
                </div>
              )}
              {!loading && results.length === 0 && query.length >= 2 && (
                <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                  No results for &quot;{query}&quot;
                </div>
              )}
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--accent-muted)] text-left transition-colors"
                >
                  {r.type === "inventory"
                    ? <Layers className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                    : <Package className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                  }
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[var(--text)] truncate">{r.snippet}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{r.inventoryName}</div>
                  </div>
                  <span className={cn(
                    "ml-auto text-xs px-2 py-0.5 rounded-full",
                    r.type === "inventory"
                      ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                      : "bg-[var(--border)] text-[var(--text-muted)]"
                  )}>
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}