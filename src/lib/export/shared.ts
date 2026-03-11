// Shared types and utilities for all export generators

export interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TipTapTextNode {
  type: "text";
  text: string;
  marks?: TipTapMark[];
}

export interface TipTapParagraphNode {
  type: "paragraph";
  content?: TipTapTextNode[];
}

export interface TipTapDoc {
  type: "doc";
  content?: TipTapParagraphNode[];
}

export interface ChordLyricSegment {
  chord: string;
  text: string;
}

const QUALITY_MAP: Record<string, string> = {
  maj: "",
  min: "m",
  dim: "dim",
  aug: "aug",
  sus2: "sus2",
  sus4: "sus4",
  "7": "7",
  maj7: "maj7",
  min7: "m7",
  dim7: "dim7",
  aug7: "aug7",
  add9: "add9",
  "9": "9",
  "6": "6",
  min6: "m6",
  "11": "11",
  "13": "13",
};

export function formatChordFromAttrs(attrs: Record<string, unknown>): string {
  const root = (attrs.root as string) || "";
  const quality = (attrs.quality as string) || "";
  const bass = attrs.bass as string | null;

  const qualityDisplay = QUALITY_MAP[quality] ?? quality;
  let chord = `${root}${qualityDisplay}`;
  if (bass) {
    chord += `/${bass}`;
  }
  return chord;
}

export function parseParagraph(paragraph: TipTapParagraphNode): {
  hasChords: boolean;
  segments: ChordLyricSegment[];
} {
  const segments: ChordLyricSegment[] = [];
  let hasChords = false;

  if (!paragraph.content) {
    return { hasChords: false, segments: [{ chord: "", text: "" }] };
  }

  for (const node of paragraph.content) {
    if (node.type !== "text") continue;

    const chordMark = node.marks?.find((m) => m.type === "chord" || m.type === "chordMark");
    if (chordMark && chordMark.attrs) {
      hasChords = true;
      segments.push({
        chord: formatChordFromAttrs(chordMark.attrs),
        text: node.text,
      });
    } else {
      segments.push({ chord: "", text: node.text });
    }
  }

  return { hasChords, segments };
}

export function buildChordAndLyricLines(segments: ChordLyricSegment[]): {
  chordLine: string;
  lyricLine: string;
} {
  let chordLine = "";
  let lyricLine = "";

  for (const seg of segments) {
    const textLen = seg.text.length;
    const chordLen = seg.chord.length;

    if (seg.chord) {
      chordLine += seg.chord + " ".repeat(Math.max(0, textLen - chordLen + 1));
    } else {
      chordLine += " ".repeat(textLen);
    }

    lyricLine += seg.text;
  }

  return { chordLine: chordLine.trimEnd(), lyricLine };
}
