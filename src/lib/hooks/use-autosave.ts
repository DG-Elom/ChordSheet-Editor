"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { useUpdateSheet } from "@/lib/hooks/use-chord-sheet";
import type { JSONContent } from "@tiptap/react";

const AUTOSAVE_DELAY = 2000;

/**
 * Extract section data from Tiptap editor JSON content.
 * Each top-level sectionNode in the editor corresponds to a section.
 */
function extractSectionsFromContent(editorContent: JSONContent): Array<{
  sectionId: string;
  sectionType: string;
  label: string;
  content: JSONContent;
  sortOrder: number;
}> {
  if (!editorContent?.content) return [];

  return editorContent.content
    .filter((node) => node.type === "sectionNode")
    .map((node, index) => ({
      sectionId: node.attrs?.sectionId ?? "",
      sectionType: node.attrs?.sectionType ?? "verse",
      label: node.attrs?.label ?? "",
      content: {
        type: "doc",
        content: node.content ?? [{ type: "paragraph" }],
      },
      sortOrder: index,
    }));
}

export function useAutosave() {
  const { sheet, editorContent, isDirty, setDirty, setSaving } = useEditorStore();
  const updateSheet = useUpdateSheet();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track which sections exist in DB to know if we need to create or update
  const knownSectionIdsRef = useRef<Set<string>>(new Set());

  // Initialize known section IDs from the store
  useEffect(() => {
    const sections = useEditorStore.getState().sections;
    knownSectionIdsRef.current = new Set(sections.map((s) => s.id));
  }, []);

  useEffect(() => {
    if (!isDirty || !sheet) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        // 1. Save sheet metadata
        await updateSheet.mutateAsync({
          id: sheet.id,
          data: {
            title: sheet.title,
            artist: sheet.artist ?? undefined,
            song_key: sheet.song_key ?? undefined,
            tempo: sheet.tempo ?? undefined,
            bpm: sheet.bpm ?? undefined,
            youtube_url: sheet.youtube_url ?? undefined,
          },
        });

        // 2. Save section content from editor
        if (editorContent) {
          const sectionData = extractSectionsFromContent(editorContent);

          const sectionPromises = sectionData.map(async (section) => {
            const isKnown = knownSectionIdsRef.current.has(section.sectionId);

            if (isKnown) {
              // Update existing section
              const res = await fetch(`/api/sheets/${sheet.id}/sections/${section.sectionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: section.sectionType,
                  label: section.label || undefined,
                  sort_order: section.sortOrder,
                  content: section.content,
                }),
              });
              return res.ok;
            } else {
              // Create new section
              const res = await fetch(`/api/sheets/${sheet.id}/sections`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sheet_id: sheet.id,
                  type: section.sectionType,
                  label: section.label || undefined,
                  sort_order: section.sortOrder,
                  content: section.content,
                }),
              });
              if (res.ok) {
                const created = await res.json();
                knownSectionIdsRef.current.add(created.id);
              }
              return res.ok;
            }
          });

          await Promise.all(sectionPromises);
        }

        setDirty(false);
      } catch {
        // Silently fail — will retry on next dirty cycle
      } finally {
        setSaving(false);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, sheet, editorContent, setDirty, setSaving, updateSheet]);
}
