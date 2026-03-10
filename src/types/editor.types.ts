import type { SectionType } from "./database.types";

export interface ChordData {
  root: string;
  quality: string;
  bass: string | null;
  id: string;
}

export interface SectionConfig {
  type: SectionType;
  label: string;
  shortLabel: string;
  color: string;
}

export const SECTION_CONFIGS: Record<SectionType, SectionConfig> = {
  verse: { type: "verse", label: "Verse", shortLabel: "V", color: "#3b82f6" },
  chorus: { type: "chorus", label: "Chorus", shortLabel: "C", color: "#f97316" },
  bridge: { type: "bridge", label: "Bridge", shortLabel: "B", color: "#8b5cf6" },
  pre_chorus: { type: "pre_chorus", label: "Pre-Chorus", shortLabel: "PC", color: "#22c55e" },
  intro: { type: "intro", label: "Intro", shortLabel: "I", color: "#6b7280" },
  outro: { type: "outro", label: "Outro", shortLabel: "O", color: "#6b7280" },
  interlude: { type: "interlude", label: "Interlude", shortLabel: "Int", color: "#eab308" },
  tag: { type: "tag", label: "Tag", shortLabel: "T", color: "#ef4444" },
  custom: { type: "custom", label: "Custom", shortLabel: "?", color: "#a855f7" },
};

export interface ExportOptions {
  format: "pdf" | "docx";
  pageSize: "A4" | "US_LETTER";
  columns: 1 | 2;
  contentMode: "full" | "chords_only" | "lyrics_only";
  fontPreset: "compact" | "standard" | "readable";
  showHeader: boolean;
  showPageNumbers: boolean;
  chordStyle: "bold" | "colored" | "boxed";
  chordColor: string;
  sectionLabels: boolean;
}
