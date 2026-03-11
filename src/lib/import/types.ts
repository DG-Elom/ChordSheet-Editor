import type { SectionType } from "@/types/database.types";

export interface ParsedChordPosition {
  chord: string;
  position: number;
}

export interface ParsedLine {
  lyrics: string;
  chords: ParsedChordPosition[];
}

export interface ParsedSection {
  type: SectionType;
  label: string;
  lines: ParsedLine[];
}

export interface ParsedSheet {
  title?: string;
  artist?: string;
  key?: string;
  tempo?: string;
  bpm?: number;
  sections: ParsedSection[];
}
