"use client";

import { useState, useEffect } from "react";
import { History, RotateCcw, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import type { SheetVersion } from "@/types/database.types";

interface VersionHistoryProps {
  sheetId: string;
  open: boolean;
  onClose: () => void;
  onRestore?: (snapshot: Record<string, unknown>) => void;
}

export function VersionHistory({ sheetId, open, onClose, onRestore }: VersionHistoryProps) {
  const t = useT();
  const [versions, setVersions] = useState<SheetVersion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("sheet_versions")
        .select("*")
        .eq("sheet_id", sheetId)
        .order("version_number", { ascending: false })
        .limit(50);
      setVersions(data ?? []);
      setLoading(false);
    })();
  }, [open, sheetId]);

  async function handleRestore(version: SheetVersion) {
    onRestore?.(version.content_snapshot);
    onClose();
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <History className="h-5 w-5" />
            {t.versionHistory}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">{t.loading}</div>
        ) : versions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t.previousVersions}: 0
          </div>
        ) : (
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {versions.map((v, idx) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded border border-border px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">
                    v{v.version_number}
                    {idx === 0 && (
                      <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        {t.currentVersion}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(v.created_at)}</div>
                </div>
                {idx > 0 && (
                  <button
                    onClick={() => handleRestore(v)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t.restoreVersion}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
