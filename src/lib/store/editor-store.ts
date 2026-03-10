import { create } from "zustand";
import type { ChordSheet, Section } from "@/types/database.types";

interface EditorState {
  sheet: ChordSheet | null;
  sections: Section[];
  isDirty: boolean;
  isSaving: boolean;
  focusMode: boolean;
  activeSectionId: string | null;
  chordInsertMode: boolean;

  setSheet: (sheet: ChordSheet | null) => void;
  updateSheet: (updates: Partial<ChordSheet>) => void;
  setSections: (sections: Section[]) => void;
  addSection: (section: Section) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  removeSection: (id: string) => void;
  reorderSections: (ids: string[]) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  toggleFocusMode: () => void;
  setActiveSectionId: (id: string | null) => void;
  toggleChordInsertMode: () => void;
  reset: () => void;
}

const initialState = {
  sheet: null,
  sections: [],
  isDirty: false,
  isSaving: false,
  focusMode: false,
  activeSectionId: null,
  chordInsertMode: false,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setSheet: (sheet) => set({ sheet }),

  updateSheet: (updates) =>
    set((state) => ({
      sheet: state.sheet ? { ...state.sheet, ...updates } : null,
      isDirty: true,
    })),

  setSections: (sections) => set({ sections }),

  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section],
      isDirty: true,
    })),

  updateSection: (id, updates) =>
    set((state) => ({
      sections: state.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      isDirty: true,
    })),

  removeSection: (id) =>
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== id),
      isDirty: true,
    })),

  reorderSections: (ids) =>
    set((state) => {
      const sectionMap = new Map(state.sections.map((s) => [s.id, s]));
      const reordered = ids
        .map((id, index) => {
          const section = sectionMap.get(id);
          return section ? { ...section, sort_order: index } : null;
        })
        .filter((s): s is Section => s !== null);
      return { sections: reordered, isDirty: true };
    }),

  setDirty: (isDirty) => set({ isDirty }),
  setSaving: (isSaving) => set({ isSaving }),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
  setActiveSectionId: (activeSectionId) => set({ activeSectionId }),
  toggleChordInsertMode: () => set((state) => ({ chordInsertMode: !state.chordInsertMode })),
  reset: () => set(initialState),
}));
