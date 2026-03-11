"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useLLMSettingsStore } from "@/lib/llm/settings-store";
import { ImportPreview } from "@/components/import/ImportPreview";
import { ImportFromUrl } from "@/components/import/ImportFromUrl";
import type { ParsedSheet } from "@/lib/import/types";

export function ImportPageClient() {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawText, setRawText] = useState("");
  const [parsedSheet, setParsedSheet] = useState<ParsedSheet | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [songKey, setSongKey] = useState("");
  const [importing, setImporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const llmEnabled = useLLMSettingsStore((s) => s.enabled);
  const llmProvider = useLLMSettingsStore((s) => s.provider);
  const llmApiKey = useLLMSettingsStore((s) => s.apiKey);
  const llmModel = useLLMSettingsStore((s) => s.model);

  const parseText = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setParsedSheet(null);
        return;
      }

      // Dynamic import to keep bundle small
      const { detectFormat } = await import("@/lib/import/detect");
      const format = detectFormat(text);

      let parsed: ParsedSheet;
      if (format === "chordpro") {
        const { parseChordPro } = await import("@/lib/import/parse-chordpro");
        parsed = parseChordPro(text);
      } else {
        const { parsePlainText } = await import("@/lib/import/parse-plaintext");
        parsed = parsePlainText(text);
      }

      setParsedSheet(parsed);
      if (parsed.title && !title) setTitle(parsed.title);
      if (parsed.artist && !artist) setArtist(parsed.artist);
      if (parsed.key && !songKey) setSongKey(parsed.key);
    },
    [title, artist, songKey],
  );

  const handleTextChange = useCallback(
    (text: string) => {
      setRawText(text);
      // Debounce parsing
      const timer = setTimeout(() => parseText(text), 300);
      return () => clearTimeout(timer);
    },
    [parseText],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      const text = await file.text();
      setRawText(text);

      // Try to get title from filename
      if (!title) {
        const name = file.name.replace(/\.(txt|chopro|chordpro|cho|pro)$/i, "");
        setTitle(name);
      }

      parseText(text);
    },
    [parseText, title],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleEnhanceWithAI = useCallback(async () => {
    if (!rawText.trim() || !llmApiKey) return;

    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/llm/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "detect_sections",
          payload: rawText,
          config: {
            provider: llmProvider,
            apiKey: llmApiKey,
            model: llmModel || undefined,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "AI analysis failed");
      }

      const result = await res.json();

      // Update metadata from AI
      if (result.title) setTitle(result.title);
      if (result.artist) setArtist(result.artist);
      if (result.key) setSongKey(result.key);

      // If AI returned sections with line ranges, re-parse with hints
      if (result.sections && parsedSheet) {
        const enhancedSections = result.sections.map(
          (s: { type: string; label: string; startLine: number; endLine: number }) => ({
            type: s.type || "verse",
            label: s.label || "Verse",
            lines: parsedSheet.sections.flatMap((ps) => ps.lines).slice(s.startLine, s.endLine + 1),
          }),
        );

        setParsedSheet({
          ...parsedSheet,
          title: result.title || parsedSheet.title,
          artist: result.artist || parsedSheet.artist,
          key: result.key || parsedSheet.key,
          sections: enhancedSections.length > 0 ? enhancedSections : parsedSheet.sections,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }, [rawText, llmProvider, llmApiKey, llmModel, parsedSheet]);

  const handleImport = useCallback(async () => {
    if (!parsedSheet) return;

    setImporting(true);
    setError(null);

    try {
      const { parsedSectionToDBSection } = await import("@/lib/import/to-tiptap");

      const sections = parsedSheet.sections.map((section, i) =>
        parsedSectionToDBSection(section, "temp", i),
      );

      const res = await fetch("/api/sheets/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled",
          artist: artist || undefined,
          song_key: songKey || undefined,
          sections: sections.map((s) => ({
            type: s.type,
            label: s.label,
            sort_order: s.sort_order,
            content: s.content,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Import failed");
      }

      const sheet = await res.json();
      router.push(`/sheets/${sheet.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setImporting(false);
    }
  }, [parsedSheet, title, artist, songKey, router]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t.importSheetTitle}</h2>
        <p className="mt-1 text-muted-foreground">{t.pasteOrUpload}</p>
      </div>

      {/* Metadata fields */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">{t.songTitle}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.songTitle}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">{t.artist}</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder={t.artist}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">{t.key}</label>
          <input
            type="text"
            value={songKey}
            onChange={(e) => setSongKey(e.target.value)}
            placeholder="C"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Import from URL */}
      <ImportFromUrl
        onImport={(content, urlTitle) => {
          setRawText(content);
          if (urlTitle && !title) setTitle(urlTitle);
          parseText(content);
        }}
      />

      {/* Two-panel layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Input */}
        <div className="space-y-4">
          <textarea
            value={rawText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={t.pasteLyrics}
            className="h-96 w-full rounded-lg border border-input bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {/* File upload dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-accent/30"
          >
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">{t.dropFileHere}</p>
            <p className="text-xs text-muted-foreground/70">{t.orClickToUpload}</p>
            <p className="mt-1 text-xs text-muted-foreground/50">.txt, .chopro, .chordpro</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.chopro,.chordpro,.cho,.pro"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{t.preview}</h3>
            <div className="flex items-center gap-2">
              {parsedSheet && (
                <span className="text-xs text-muted-foreground">
                  {parsedSheet.sections.length} {t.sectionsDetected}
                </span>
              )}
              {llmEnabled && llmApiKey && rawText.trim() && (
                <button
                  onClick={handleEnhanceWithAI}
                  disabled={analyzing}
                  className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t.analyzing}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      {t.enhanceWithAI}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="h-96 overflow-y-auto rounded-lg border border-border bg-card p-4">
            {parsedSheet ? (
              <ImportPreview sheet={parsedSheet} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <FileText className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">{t.noContentDetected}</p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={!parsedSheet || importing}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.importing}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {t.importButton}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
