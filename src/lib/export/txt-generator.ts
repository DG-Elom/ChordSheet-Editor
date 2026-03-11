import type { ChordSheet, Section } from "@/types/database.types";
import type { ExportOptions } from "@/types/editor.types";
import { SECTION_CONFIGS } from "@/types/editor.types";
import { parseParagraph, buildChordAndLyricLines } from "./shared";
import type { TipTapDoc } from "./shared";

export function generateTXT(
  sheet: ChordSheet,
  sections: Section[],
  options: Pick<ExportOptions, "contentMode" | "showHeader" | "sectionLabels">,
): string {
  const lines: string[] = [];

  // Header
  if (options.showHeader) {
    lines.push(sheet.title);
    if (sheet.artist) lines.push(sheet.artist);
    const meta: string[] = [];
    if (sheet.song_key) meta.push(`Key: ${sheet.song_key}`);
    if (sheet.tempo) meta.push(`Tempo: ${sheet.tempo}`);
    if (sheet.bpm) meta.push(`BPM: ${sheet.bpm}`);
    if (meta.length > 0) lines.push(meta.join(" | "));
    lines.push("---");
    lines.push("");
  }

  // Sections
  for (const section of sections) {
    const config = SECTION_CONFIGS[section.type];
    const doc = section.content as unknown as TipTapDoc;

    if (options.sectionLabels) {
      lines.push(`[${section.label || config.label}]`);
    }

    const paragraphs = doc?.content ?? [];

    for (const para of paragraphs) {
      if (para.type !== "paragraph") continue;

      if (!para.content || para.content.length === 0) {
        lines.push("");
        continue;
      }

      const { hasChords, segments } = parseParagraph(para);
      const { chordLine, lyricLine } = buildChordAndLyricLines(segments);

      if (options.contentMode === "chords_only") {
        if (hasChords) lines.push(chordLine);
      } else if (options.contentMode === "lyrics_only") {
        lines.push(lyricLine);
      } else {
        if (hasChords) lines.push(chordLine);
        lines.push(lyricLine);
      }
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
