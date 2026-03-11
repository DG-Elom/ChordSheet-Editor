"use client";

import { useState } from "react";
import { Sparkles, Loader2, Music, Mic2, BarChart3, Search } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useLLMSettingsStore } from "@/lib/llm/settings-store";

interface AIAssistantPanelProps {
  sheetContent?: string;
  songKey?: string;
  onInsertContent?: (content: string) => void;
}

type AITask =
  | "search_chords"
  | "suggest_chords"
  | "generate_lyrics"
  | "harmonize"
  | "analyze_harmony";

export function AIAssistantPanel({
  sheetContent,
  songKey,
  onInsertContent,
}: AIAssistantPanelProps) {
  const t = useT();
  const { provider, apiKey, model, enabled } = useLLMSettingsStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<AITask | null>(null);
  const [prompt, setPrompt] = useState("");

  async function runTask(task: AITask) {
    if (!enabled || !apiKey) {
      setResult("Please configure your AI provider in Settings first.");
      setActiveTask(task);
      return;
    }
    setLoading(true);
    setActiveTask(task);
    setResult(null);

    try {
      const res = await fetch("/api/llm/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          content: task === "search_chords" ? prompt : sheetContent || prompt,
          key: songKey,
          config: {
            provider,
            apiKey,
            model: model || undefined,
          },
        }),
      });
      const data = await res.json();
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(
          typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2),
        );
      }
    } catch {
      setResult("Failed to connect to AI service.");
    } finally {
      setLoading(false);
    }
  }

  const tasks = [
    {
      id: "search_chords" as AITask,
      label: t.searchChords,
      icon: Search,
      desc: "Search the web for correct chords",
    },
    {
      id: "suggest_chords" as AITask,
      label: t.suggestChords,
      icon: Music,
      desc: "AI suggests chords for your lyrics",
    },
    {
      id: "generate_lyrics" as AITask,
      label: t.generateLyrics,
      icon: Mic2,
      desc: "Generate lyrics from a theme or style",
    },
    {
      id: "analyze_harmony" as AITask,
      label: t.analyzeHarmony,
      icon: BarChart3,
      desc: "Analyze chord progressions and harmony",
    },
    {
      id: "harmonize" as AITask,
      label: t.alternativeProgressions,
      icon: Sparkles,
      desc: "Suggest alternative chord progressions",
    },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-primary" />
        {t.aiAssistant}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {tasks.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => runTask(id)}
            disabled={loading}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
              activeTask === id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            } disabled:opacity-50`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {(activeTask === "search_chords" || !sheetContent) && (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            activeTask === "search_chords"
              ? "Song title and artist, e.g. 'Hotel California Eagles'"
              : "Enter lyrics, a theme, or describe what you want..."
          }
          className="w-full rounded border border-border bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground"
          rows={activeTask === "search_chords" ? 1 : 3}
        />
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t.analyzing}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-2">
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs text-foreground">
            {result}
          </pre>
          {onInsertContent && (
            <button
              onClick={() => onInsertContent(result)}
              className="w-full rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Insert into sheet
            </button>
          )}
        </div>
      )}
    </div>
  );
}
