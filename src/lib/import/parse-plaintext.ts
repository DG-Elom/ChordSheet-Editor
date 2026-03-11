import type { ParsedSheet, ParsedSection, ParsedLine, ParsedChordPosition } from "./types";
import type { SectionType } from "@/types/database.types";
import { isChordLine, detectSectionMarker } from "./detect";

/**
 * Parse a chord line and pair chords with positions in the lyric line below
 */
function pairChordLineWithLyrics(chordLineStr: string, lyricLineStr: string): ParsedLine {
  const chords: ParsedChordPosition[] = [];
  const tokens = chordLineStr.matchAll(/(\S+)/g);

  for (const match of tokens) {
    chords.push({
      chord: match[1],
      position: match.index ?? 0,
    });
  }

  return {
    lyrics: lyricLineStr,
    chords,
  };
}

export function parsePlainText(text: string): ParsedSheet {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  let pendingChordLine: string | null = null;
  let detectedTitle: string | undefined;
  let detectedArtist: string | undefined;

  // Try to detect title/artist from first lines (before any content)
  let contentStarted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip ChordPro end directives if they somehow appear
    if (/^\{end_of_/i.test(trimmed) || /^\{eo[vcb]\}/i.test(trimmed)) continue;

    // Check for section marker
    const sectionMarker = detectSectionMarker(trimmed);
    if (sectionMarker) {
      // Save pending chord line before starting new section
      if (pendingChordLine !== null && currentSection) {
        currentSection.lines.push({
          lyrics: "",
          chords: [...pendingChordLine.matchAll(/(\S+)/g)].map((m) => ({
            chord: m[1],
            position: m.index ?? 0,
          })),
        });
        pendingChordLine = null;
      }

      currentSection = {
        type: sectionMarker.type,
        label: sectionMarker.label,
        lines: [],
      };
      sections.push(currentSection);
      contentStarted = true;
      continue;
    }

    // Try to detect title/artist from first non-empty lines
    if (!contentStarted && trimmed && !isChordLine(trimmed)) {
      if (!detectedTitle) {
        detectedTitle = trimmed;
        continue;
      } else if (!detectedArtist) {
        detectedArtist = trimmed;
        continue;
      }
    }

    // Empty line
    if (!trimmed) {
      if (pendingChordLine !== null && currentSection) {
        // Chord line with no lyric line below - add as chord-only line
        currentSection.lines.push({
          lyrics: "",
          chords: [...pendingChordLine.matchAll(/(\S+)/g)].map((m) => ({
            chord: m[1],
            position: m.index ?? 0,
          })),
        });
        pendingChordLine = null;
      }
      continue;
    }

    contentStarted = true;

    // Ensure we have a section
    if (!currentSection) {
      currentSection = { type: "verse" as SectionType, label: "Verse", lines: [] };
      sections.push(currentSection);
    }

    // Check if this is a chord line
    if (isChordLine(trimmed)) {
      if (pendingChordLine !== null) {
        // Previous chord line had no lyric line - add it
        currentSection.lines.push({
          lyrics: "",
          chords: [...pendingChordLine.matchAll(/(\S+)/g)].map((m) => ({
            chord: m[1],
            position: m.index ?? 0,
          })),
        });
      }
      pendingChordLine = line; // Keep original spacing for position matching
      continue;
    }

    // Regular lyric line
    if (pendingChordLine !== null) {
      // Pair with pending chord line
      currentSection.lines.push(pairChordLineWithLyrics(pendingChordLine, trimmed));
      pendingChordLine = null;
    } else {
      // Lyric line without chords
      currentSection.lines.push({ lyrics: trimmed, chords: [] });
    }
  }

  // Handle trailing pending chord line
  if (pendingChordLine !== null && currentSection) {
    currentSection.lines.push({
      lyrics: "",
      chords: [...pendingChordLine.matchAll(/(\S+)/g)].map((m) => ({
        chord: m[1],
        position: m.index ?? 0,
      })),
    });
  }

  return {
    title: detectedTitle,
    artist: detectedArtist,
    sections: sections.length > 0 ? sections : [{ type: "verse", label: "Verse", lines: [] }],
  };
}
