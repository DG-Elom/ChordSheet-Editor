"use client";

import { useState } from "react";
import { X, Download, FileText, FileIcon, Loader2 } from "lucide-react";
import { useExport } from "@/lib/hooks/use-export";
import type { ExportOptions } from "@/types/editor.types";

interface ExportDialogProps {
  sheetId: string;
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ sheetId, open, onClose }: ExportDialogProps) {
  const { exporting, error, exportSheet, clearError } = useExport();

  const [options, setOptions] = useState<ExportOptions>({
    format: "pdf",
    pageSize: "A4",
    columns: 1,
    contentMode: "full",
    fontPreset: "standard",
    showHeader: true,
    showPageNumbers: true,
    chordStyle: "bold",
    chordColor: "#3b82f6",
    sectionLabels: true,
  });

  if (!open) return null;

  const handleExport = async () => {
    clearError();
    await exportSheet(sheetId, options);
    if (!error) {
      // keep dialog open in case of error; otherwise close after short delay
      setTimeout(onClose, 300);
    }
  };

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Export Sheet</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Format */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-card-foreground">Format</legend>
            <div className="flex gap-3">
              <button
                onClick={() => updateOption("format", "pdf")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                  options.format === "pdf"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                <FileText className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={() => updateOption("format", "docx")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                  options.format === "docx"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                <FileIcon className="h-4 w-4" />
                DOCX
              </button>
            </div>
          </fieldset>

          {/* Page Size */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-card-foreground">Page Size</legend>
            <div className="flex gap-3">
              {(["A4", "US_LETTER"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateOption("pageSize", size)}
                  className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    options.pageSize === size
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {size === "US_LETTER" ? "US Letter" : size}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Columns */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-card-foreground">Columns</legend>
            <div className="flex gap-3">
              {([1, 2] as const).map((col) => (
                <button
                  key={col}
                  onClick={() => updateOption("columns", col)}
                  className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    options.columns === col
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {col} Column{col === 2 ? "s" : ""}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Content Mode */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-card-foreground">Content</legend>
            <div className="flex gap-3">
              {(
                [
                  { value: "full", label: "Full" },
                  { value: "chords_only", label: "Chords Only" },
                  { value: "lyrics_only", label: "Lyrics Only" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateOption("contentMode", value)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    options.contentMode === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Font Preset */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-card-foreground">Font Size</legend>
            <div className="flex gap-3">
              {(
                [
                  { value: "compact", label: "Compact" },
                  { value: "standard", label: "Standard" },
                  { value: "readable", label: "Readable" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateOption("fontPreset", value)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    options.fontPreset === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {options.format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
