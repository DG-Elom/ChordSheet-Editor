"use client";

import { useEditorStore } from "@/lib/store/editor-store";
import { useUserStore } from "@/lib/store/user-store";
import { Music, Save, Loader2 } from "lucide-react";

export function SheetMetadataBar() {
  const { sheet, updateSheet, isDirty, isSaving } = useEditorStore();
  const notation = useUserStore((s) => s.notation);

  if (!sheet) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2">
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={sheet.title}
          onChange={(e) => updateSheet({ title: e.target.value })}
          placeholder="Song title"
          className="bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={sheet.artist ?? ""}
          onChange={(e) => updateSheet({ artist: e.target.value || null })}
          placeholder="Artist"
          className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Key:</span>
        <input
          type="text"
          value={sheet.song_key ?? ""}
          onChange={(e) => updateSheet({ song_key: e.target.value || null })}
          placeholder={notation === "latin" ? "Do" : "C"}
          className="w-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">BPM:</span>
        <input
          type="number"
          value={sheet.bpm ?? ""}
          onChange={(e) => updateSheet({ bpm: e.target.value ? parseInt(e.target.value) : null })}
          placeholder="120"
          className="w-14 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          min={1}
          max={399}
        />
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Time:</span>
        <input
          type="text"
          value={sheet.time_signature}
          onChange={(e) => updateSheet({ time_signature: e.target.value })}
          className="w-10 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
        {isSaving ? (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        ) : isDirty ? (
          <span className="flex items-center gap-1">
            <Save className="h-3 w-3" />
            Unsaved
          </span>
        ) : (
          <span>Saved</span>
        )}
      </div>
    </div>
  );
}
