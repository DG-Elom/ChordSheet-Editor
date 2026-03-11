import { parseChord } from "@/lib/chord-engine";
import type { JSONContent } from "@tiptap/react";
import type { ParsedSheet, ParsedSection } from "./types";

/**
 * Convert a ParsedLine to a TipTap paragraph with chord marks
 */
function lineToTipTapParagraph(line: {
  lyrics: string;
  chords: Array<{ chord: string; position: number }>;
}): JSONContent {
  if (!line.lyrics && line.chords.length === 0) {
    return { type: "paragraph" };
  }

  if (line.chords.length === 0) {
    return {
      type: "paragraph",
      content: [{ type: "text", text: line.lyrics }],
    };
  }

  const content: JSONContent[] = [];
  const lyrics = line.lyrics || " ".repeat(Math.max(...line.chords.map((c) => c.position)) + 1);

  // Sort chords by position
  const sortedChords = [...line.chords].sort((a, b) => a.position - b.position);
  let lastPos = 0;

  for (const chordPos of sortedChords) {
    // Add text before this chord (without chord mark)
    if (chordPos.position > lastPos) {
      const text = lyrics.slice(lastPos, chordPos.position);
      if (text) {
        content.push({ type: "text", text });
      }
    }

    // Parse the chord to get root/quality/bass
    const parsed = parseChord(chordPos.chord);
    const chordEnd = Math.min(
      chordPos.position + Math.max(1, chordPos.chord.length),
      lyrics.length || chordPos.position + 1,
    );
    const text = lyrics.slice(chordPos.position, chordEnd) || " ";

    if (parsed) {
      content.push({
        type: "text",
        text,
        marks: [
          {
            type: "chordMark",
            attrs: {
              root: parsed.root,
              quality: parsed.quality,
              bass: parsed.bass ?? null,
              id: crypto.randomUUID(),
            },
          },
        ],
      });
    } else {
      // Chord couldn't be parsed - just add as text
      content.push({ type: "text", text });
    }

    lastPos = chordEnd;
  }

  // Add remaining text
  if (lastPos < lyrics.length) {
    const remaining = lyrics.slice(lastPos);
    if (remaining) {
      content.push({ type: "text", text: remaining });
    }
  }

  return {
    type: "paragraph",
    content: content.length > 0 ? content : [{ type: "text", text: " " }],
  };
}

/**
 * Convert a ParsedSection to a TipTap sectionNode
 */
function sectionToTipTap(section: ParsedSection, _index: number): JSONContent {
  const paragraphs =
    section.lines.length > 0
      ? section.lines.map((line) => lineToTipTapParagraph(line))
      : [{ type: "paragraph" }];

  return {
    type: "sectionNode",
    attrs: {
      sectionId: crypto.randomUUID(),
      sectionType: section.type,
      label: section.label,
      collapsed: false,
    },
    content: paragraphs,
  };
}

/**
 * Convert a full ParsedSheet to TipTap editor JSONContent
 */
export function parsedSheetToTipTap(parsed: ParsedSheet): JSONContent {
  return {
    type: "doc",
    content: parsed.sections.map((section, i) => sectionToTipTap(section, i)),
  };
}

/**
 * Convert a ParsedSection to database-ready section data
 */
export function parsedSectionToDBSection(
  section: ParsedSection,
  sheetId: string,
  sortOrder: number,
): {
  sheet_id: string;
  type: string;
  label: string;
  sort_order: number;
  content: Record<string, unknown>;
} {
  const tiptapSection = sectionToTipTap(section, sortOrder);

  return {
    sheet_id: sheetId,
    type: section.type,
    label: section.label,
    sort_order: sortOrder,
    content: {
      type: "doc",
      content: tiptapSection.content ?? [{ type: "paragraph" }],
    },
  };
}
