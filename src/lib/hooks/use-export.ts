"use client";

import { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import type { ExportOptions } from "@/types/editor.types";
import type { ChordSheet, Section } from "@/types/database.types";

interface UseExportReturn {
  exporting: boolean;
  error: string | null;
  exportSheet: (sheetId: string, options: ExportOptions) => Promise<void>;
  clearError: () => void;
}

async function fetchSheetAndSections(
  sheetId: string,
): Promise<{ sheet: ChordSheet; sections: Section[] }> {
  const [sheetRes, sectionsRes] = await Promise.all([
    fetch(`/api/sheets/${sheetId}`),
    fetch(`/api/sheets/${sheetId}/sections`),
  ]);
  if (!sheetRes.ok) throw new Error("Failed to fetch sheet");
  if (!sectionsRes.ok) throw new Error("Failed to fetch sections");
  const sheet = await sheetRes.json();
  const sections = await sectionsRes.json();
  return { sheet, sections };
}

export function useExport(): UseExportReturn {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const exportSheet = useCallback(async (sheetId: string, options: ExportOptions) => {
    setExporting(true);
    setError(null);

    try {
      // TXT and ChordPro are generated client-side
      if (options.format === "txt" || options.format === "chopro") {
        const { sheet, sections } = await fetchSheetAndSections(sheetId);

        let content: string;
        let filename: string;

        if (options.format === "txt") {
          const { generateTXT } = await import("@/lib/export/txt-generator");
          content = generateTXT(sheet, sections, options);
          filename = `${sheet.title || "export"}.txt`;
        } else {
          const { generateChordPro } = await import("@/lib/export/chopro-generator");
          content = generateChordPro(sheet, sections, options);
          filename = `${sheet.title || "export"}.chopro`;
        }

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        saveAs(blob, filename);
        return;
      }

      // PDF and DOCX are generated server-side
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
