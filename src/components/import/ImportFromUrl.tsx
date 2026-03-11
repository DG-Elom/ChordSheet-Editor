"use client";

import { useState } from "react";
import { Link, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";

interface ImportFromUrlProps {
  onImport: (content: string, title?: string) => void;
}

export function ImportFromUrl({ onImport }: ImportFromUrlProps) {
  const t = useT();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        onImport(data.content, data.title);
        setUrl("");
      }
    } catch {
      setError("Failed to import from URL");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{t.importFromUrl}</label>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded border border-border px-3 py-2">
          <Link className="h-4 w-4 text-muted-foreground" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.pasteUrl}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleImport()}
          />
        </div>
        <button
          onClick={handleImport}
          disabled={loading || !url.trim()}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.importButton}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
