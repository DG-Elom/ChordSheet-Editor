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
      // Client-side formats
      if (
        options.format === "txt" ||
        options.format === "chopro" ||
        options.format === "png" ||
        options.format === "midi"
      ) {
        const { sheet, sections } = await fetchSheetAndSections(sheetId);

        if (options.format === "txt") {
          const { generateTXT } = await import("@/lib/export/txt-generator");
          const content = generateTXT(sheet, sections, options);
          const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
          saveAs(blob, `${sheet.title || "export"}.txt`);
          return;
        }

        if (options.format === "chopro") {
          const { generateChordPro } = await import("@/lib/export/chopro-generator");
          const content = generateChordPro(sheet, sections, options);
          const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
          saveAs(blob, `${sheet.title || "export"}.chopro`);
          return;
        }

        if (options.format === "png") {
          const { generatePng } = await import("@/lib/export/png-generator");
          const exportData = {
            title: sheet.title || "Untitled",
            artist: sheet.artist || undefined,
            songKey: sheet.song_key || undefined,
            sections: sections.map((s) => ({
              label: s.label || s.type,
              lines: extractTextLines(s),
            })),
          };
          const blob = await generatePng(exportData, options);
          saveAs(blob, `${sheet.title || "export"}.png`);
          return;
        }

        if (options.format === "midi") {
          const { generateMidi } = await import("@/lib/export/midi-generator");
          const chords = extractChords(sections);
          const blob = generateMidi(chords, sheet.bpm || 120);
          saveAs(blob, `${sheet.title || "export"}.mid`);
          return;
        }
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

function extractTextLines(section: Section): string[] {
  const content = section.content as Record<string, unknown>;
  if (!content?.content) return [];
  const paragraphs = content.content as Array<Record<string, unknown>>;
  return paragraphs
    .filter((p) => p.type === "paragraph")
    .map((p) => {
      if (!p.content) return "";
      return (p.content as Array<{ text?: string }>).map((n) => n.text || "").join("");
    });
}

function extractChords(sections: Section[]): string[] {
  const chords: string[] = [];
  for (const section of sections) {
    const content = section.content as Record<string, unknown>;
    if (!content?.content) continue;
    const paragraphs = content.content as Array<Record<string, unknown>>;
    for (const p of paragraphs) {
      if (!p.content) continue;
      for (const inline of p.content as Array<{
        marks?: Array<{ type: string; attrs?: Record<string, string> }>;
      }>) {
        if (!inline.marks) continue;
        for (const mark of inline.marks) {
          if (mark.type === "chordMark" && mark.attrs) {
            const q = mark.attrs.quality === "maj" ? "" : mark.attrs.quality;
            chords.push(mark.attrs.root + q);
          }
        }
      }
    }
  }
  return chords;
}
