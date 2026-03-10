"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { useUpdateSheet } from "@/lib/hooks/use-chord-sheet";

const AUTOSAVE_DELAY = 2000;

export function useAutosave() {
  const { sheet, isDirty, setDirty, setSaving } = useEditorStore();
  const updateSheet = useUpdateSheet();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isDirty || !sheet) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await updateSheet.mutateAsync({
          id: sheet.id,
          data: {
            title: sheet.title,
            artist: sheet.artist ?? undefined,
            song_key: sheet.song_key ?? undefined,
            tempo: sheet.tempo ?? undefined,
            bpm: sheet.bpm ?? undefined,
          },
        });
        setDirty(false);
      } finally {
        setSaving(false);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, sheet, setDirty, setSaving, updateSheet]);
}
