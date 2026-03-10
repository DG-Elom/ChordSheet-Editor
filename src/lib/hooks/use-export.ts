"use client";

import { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import type { ExportOptions } from "@/types/editor.types";

interface UseExportReturn {
  exporting: boolean;
  error: string | null;
  exportSheet: (sheetId: string, options: ExportOptions) => Promise<void>;
  clearError: () => void;
}

export function useExport(): UseExportReturn {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const exportSheet = useCallback(async (sheetId: string, options: ExportOptions) => {
    setExporting(true);
    setError(null);

    try {
      const endpoint = options.format === "pdf" ? "/api/export/pdf" : "/api/export/docx";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId, options }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Export failed" }));
        throw new Error(errBody.error || "Export failed");
      }

      // Extract filename from Content-Disposition header, or fall back
      const disposition = res.headers.get("Content-Disposition");
      let filename = `export.${options.format}`;
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const blob = await res.blob();
      saveAs(blob, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";
      setError(message);
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, error, exportSheet, clearError };
}
