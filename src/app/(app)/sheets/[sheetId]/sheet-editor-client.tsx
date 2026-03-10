"use client";

import { ChordSheetEditor } from "@/components/editor/ChordSheetEditor";
import { useAutosave } from "@/lib/hooks/use-autosave";
import type { ChordSheet, Section } from "@/types/database.types";

interface SheetEditorClientProps {
  sheet: ChordSheet;
  sections: Section[];
}

export function SheetEditorClient({ sheet, sections }: SheetEditorClientProps) {
  useAutosave();

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <ChordSheetEditor sheet={sheet} sections={sections} />
    </div>
  );
}
