import type { ChordSheet, Section } from "@/types/database.types";
import type { ExportOptions } from "@/types/editor.types";
import { parseParagraph } from "./shared";
import type { TipTapDoc } from "./shared";

const SECTION_TYPE_TO_CHOPRO: Record<string, string> = {
  verse: "verse",
  chorus: "chorus",
  bridge: "bridge",
  pre_chorus: "bridge",
  intro: "verse",
  outro: "verse",
  interlude: "verse",
  tag: "verse",
  custom: "verse",
};

export function generateChordPro(
  sheet: ChordSheet,
  sections: Section[],
  options: Pick<ExportOptions, "contentMode">,
): string {
  const lines: string[] = [];

  // Metadata directives
  lines.push(`{title: ${sheet.title}}`);
  if (sheet.artist) lines.push(`{artist: ${sheet.artist}}`);
  if (sheet.song_key) lines.push(`{key: ${sheet.song_key}}`);
  if (sheet.bpm) lines.push(`{tempo: ${sheet.bpm}}`);
  lines.push("");

  // Sections
  for (const section of sections) {
    const choproType = SECTION_TYPE_TO_CHOPRO[section.type] || "verse";
    const label = section.label || "";
    lines.push(`{start_of_${choproType}: ${label}}`);

    const doc = section.content as unknown as TipTapDoc;
    const paragraphs = doc?.content ?? [];

    for (const para of paragraphs) {
      if (para.type !== "paragraph") continue;

      if (!para.content || para.content.length === 0) {
        lines.push("");
        continue;
      }

      const { segments } = parseParagraph(para);

      if (options.contentMode === "lyrics_only") {
        // Just lyrics, no chords
        lines.push(segments.map((s) => s.text).join(""));
      } else if (options.contentMode === "chords_only") {
        // Only show chord markers
        const chordParts = segments.filter((s) => s.chord).map((s) => `[${s.chord}]`);
        if (chordParts.length > 0) lines.push(chordParts.join(" "));
      } else {
        // Full: inline chords in lyrics
        let line = "";
        for (const seg of segments) {
          if (seg.chord) {
            line += `[${seg.chord}]`;
          }
          line += seg.text;
        }
        lines.push(line);
      }
    }

    lines.push(`{end_of_${choproType}}`);
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
