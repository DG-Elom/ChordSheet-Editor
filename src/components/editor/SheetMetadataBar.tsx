"use client";

import { useEditorStore } from "@/lib/store/editor-store";
import { useUserStore } from "@/lib/store/user-store";
import { Music, Save, Loader2, Youtube, ExternalLink } from "lucide-react";
import { useT } from "@/lib/i18n";

export function SheetMetadataBar() {
  const { sheet, updateSheet, isDirty, isSaving } = useEditorStore();
  const notation = useUserStore((s) => s.notation);
  const t = useT();

  if (!sheet) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2">
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={sheet.title}
          onChange={(e) => updateSheet({ title: e.target.value })}
          placeholder={t.songTitle}
          className="bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={sheet.artist ?? ""}
          onChange={(e) => updateSheet({ artist: e.target.value || null })}
          placeholder={t.artist}
          className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">{t.key}:</span>
        <input
          type="text"
          value={sheet.song_key ?? ""}
          onChange={(e) => updateSheet({ song_key: e.target.value || null })}
          placeholder={notation === "latin" ? "Do" : "C"}
          className="w-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">{t.bpm}:</span>
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
        <span className="text-xs text-muted-foreground">{t.time}:</span>
        <input
          type="text"
          value={sheet.time_signature}
          onChange={(e) => updateSheet({ time_signature: e.target.value })}
          className="w-10 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-1">
        <Youtube className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="url"
          value={sheet.youtube_url ?? ""}
          onChange={(e) => updateSheet({ youtube_url: e.target.value || null })}
          placeholder={t.youtubeUrl}
          className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {sheet.youtube_url && (
          <a
            href={sheet.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
        {isSaving ? (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t.saving}
          </span>
        ) : isDirty ? (
          <span className="flex items-center gap-1">
            <Save className="h-3 w-3" />
            {t.unsaved}
          </span>
        ) : (
          <span>{t.saved}</span>
        )}
      </div>
    </div>
  );
}
