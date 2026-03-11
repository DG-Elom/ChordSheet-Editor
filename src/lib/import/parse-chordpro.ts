import type { ParsedSheet, ParsedSection, ParsedLine, ParsedChordPosition } from "./types";
import type { SectionType } from "@/types/database.types";

const DIRECTIVE_MAP: Record<string, SectionType> = {
  start_of_verse: "verse",
  sov: "verse",
  start_of_chorus: "chorus",
  soc: "chorus",
  start_of_bridge: "bridge",
  sob: "bridge",
  start_of_tab: "custom",
  sot: "custom",
};

function parseInlineChords(line: string): ParsedLine {
  const chords: ParsedChordPosition[] = [];
  let lyrics = "";
  let lyricPos = 0;

  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    // Add text before this chord
    const textBefore = line.slice(lastIndex, match.index);
    lyrics += textBefore;
    lyricPos += textBefore.length;

    chords.push({
      chord: match[1],
      position: lyricPos,
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  lyrics += line.slice(lastIndex);

  return { lyrics, chords };
}

export function parseChordPro(text: string): ParsedSheet {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;

  let title: string | undefined;
  let artist: string | undefined;
  let key: string | undefined;
  let tempo: string | undefined;
  let bpm: number | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Parse directives
    const directiveMatch = trimmed.match(/^\{(\w+)(?::?\s*(.*))?\}$/);
    if (directiveMatch) {
      const directive = directiveMatch[1].toLowerCase();
      const value = directiveMatch[2]?.trim() || "";

      // Metadata
      if (directive === "title" || directive === "t") {
        title = value;
        continue;
      }
      if (
        directive === "artist" ||
        directive === "a" ||
        directive === "subtitle" ||
        directive === "st"
      ) {
        artist = value;
        continue;
      }
      if (directive === "key") {
        key = value;
        continue;
      }
      if (directive === "tempo") {
        tempo = value;
        const parsed = parseInt(value);
        if (!isNaN(parsed)) bpm = parsed;
        continue;
      }

      // Section start
      if (DIRECTIVE_MAP[directive]) {
        currentSection = {
          type: DIRECTIVE_MAP[directive],
          label:
            value ||
            DIRECTIVE_MAP[directive].charAt(0).toUpperCase() + DIRECTIVE_MAP[directive].slice(1),
          lines: [],
        };
        sections.push(currentSection);
        continue;
      }

      // Section end - ignore
      if (directive.startsWith("end_of_") || directive.startsWith("eo")) {
        continue;
      }

      // Comment
      if (directive === "comment" || directive === "c" || directive === "ci") {
        // Could be used as a section label
        continue;
      }

      continue;
    }

    // Content line
    if (!currentSection) {
      currentSection = { type: "verse" as SectionType, label: "Verse", lines: [] };
      sections.push(currentSection);
    }

    currentSection.lines.push(parseInlineChords(trimmed));
  }

  return {
    title,
    artist,
    key,
    tempo,
    bpm,
    sections: sections.length > 0 ? sections : [{ type: "verse", label: "Verse", lines: [] }],
  };
}
