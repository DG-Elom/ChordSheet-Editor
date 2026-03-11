"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, FileMusic, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import type { ChordSheet } from "@/types/database.types";

export function GlobalSearch() {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ChordSheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when closing
  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setOpen((p) => !p);
      }
      if (e.key === "Escape" && open) handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("chord_sheets")
      .select("*")
      .or(`title.ilike.%${q}%,artist.ilike.%${q}%,song_key.ilike.%${q}%`)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .limit(10);
    setResults(data ?? []);
    setSelectedIndex(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleSelect = (sheet: ChordSheet) => {
    handleClose();
    router.push(`/sheets/${sheet.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((p) => Math.min(p + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) handleSelect(results[selectedIndex]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">{t.loading}</div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">{t.noResults}</div>
          )}
          {!loading &&
            results.map((sheet, idx) => (
              <button
                key={sheet.id}
                onClick={() => handleSelect(sheet)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${idx === selectedIndex ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted"}`}
              >
                <FileMusic className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{sheet.title || "Untitled"}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {sheet.artist && <span>{sheet.artist}</span>}
                    {sheet.song_key && (
                      <span className="rounded bg-muted px-1 py-0.5">{sheet.song_key}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          {!query && !loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t.searchPlaceholder}
            </div>
          )}
        </div>
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">↑↓</kbd>{" "}
          navigate{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">↵</kbd>{" "}
          open{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">esc</kbd>{" "}
          close
        </div>
      </div>
    </div>
  );
}
