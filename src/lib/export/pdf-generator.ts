import ReactPDF, { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createElement } from "react";
import type { ChordSheet, Section } from "@/types/database.types";
import type { ExportOptions } from "@/types/editor.types";
import { SECTION_CONFIGS } from "@/types/editor.types";

// ---------------------------------------------------------------------------
// Font sizes by preset
// ---------------------------------------------------------------------------

const FONT_SIZES: Record<
  ExportOptions["fontPreset"],
  { title: number; subtitle: number; sectionLabel: number; chord: number; lyric: number }
> = {
  compact: { title: 14, subtitle: 9, sectionLabel: 9, chord: 8, lyric: 8 },
  standard: { title: 18, subtitle: 11, sectionLabel: 11, chord: 10, lyric: 10 },
  readable: { title: 22, subtitle: 13, sectionLabel: 13, chord: 12, lyric: 12 },
};

// ---------------------------------------------------------------------------
// Page dimensions (points)
// ---------------------------------------------------------------------------

const PAGE_SIZES: Record<ExportOptions["pageSize"], { width: number; height: number }> = {
  A4: { width: 595.28, height: 841.89 },
  US_LETTER: { width: 612, height: 792 },
};

// ---------------------------------------------------------------------------
// TipTap JSON types (subset used for export)
// ---------------------------------------------------------------------------

interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TipTapTextNode {
  type: "text";
  text: string;
  marks?: TipTapMark[];
}

interface TipTapParagraphNode {
  type: "paragraph";
  content?: TipTapTextNode[];
}

interface TipTapDoc {
  type: "doc";
  content?: TipTapParagraphNode[];
}

// ---------------------------------------------------------------------------
// Chord formatting helper
// ---------------------------------------------------------------------------

function formatChord(attrs: Record<string, unknown>): string {
  const root = (attrs.root as string) || "";
  const quality = (attrs.quality as string) || "";
  const bass = attrs.bass as string | null;

  // Map quality names to display symbols
  const qualityMap: Record<string, string> = {
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

  const qualityDisplay = qualityMap[quality] ?? quality;
  let chord = `${root}${qualityDisplay}`;
  if (bass) {
    chord += `/${bass}`;
  }
  return chord;
}

// ---------------------------------------------------------------------------
// Parse a TipTap paragraph into chord/lyric pairs
// ---------------------------------------------------------------------------

interface ChordLyricSegment {
  chord: string; // "" when no chord above this text
  text: string;
}

function parseParagraph(paragraph: TipTapParagraphNode): {
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

    const chordMark = node.marks?.find((m) => m.type === "chord");
    if (chordMark && chordMark.attrs) {
      hasChords = true;
      segments.push({
        chord: formatChord(chordMark.attrs),
        text: node.text,
      });
    } else {
      segments.push({ chord: "", text: node.text });
    }
  }

  return { hasChords, segments };
}

// ---------------------------------------------------------------------------
// Build a chord-line string and a lyric-line string from segments
// ---------------------------------------------------------------------------

function buildChordAndLyricLines(segments: ChordLyricSegment[]): {
  chordLine: string;
  lyricLine: string;
} {
  let chordLine = "";
  let lyricLine = "";

  for (const seg of segments) {
    const textLen = seg.text.length;
    const chordLen = seg.chord.length;

    if (seg.chord) {
      // Pad chord to at least the width of the text beneath it (+ 1 space gap)
      chordLine += seg.chord + " ".repeat(Math.max(0, textLen - chordLen + 1));
    } else {
      // No chord over this segment -- fill chord line with spaces
      chordLine += " ".repeat(textLen);
    }

    lyricLine += seg.text;
  }

  return { chordLine: chordLine.trimEnd(), lyricLine };
}

// ---------------------------------------------------------------------------
// React-PDF component tree (built using createElement)
// ---------------------------------------------------------------------------

function buildPDFElement(
  sheet: ChordSheet,
  sections: Section[],
  options: ExportOptions,
): React.ReactElement {
  const sizes = FONT_SIZES[options.fontPreset];
  const pageSize = PAGE_SIZES[options.pageSize];
  const margin = 40;

  const styles = StyleSheet.create({
    page: {
      paddingTop: margin,
      paddingBottom: margin + 20, // extra room for page numbers
      paddingHorizontal: margin,
      fontFamily: "Courier",
      fontSize: sizes.lyric,
    },
    header: {
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#cccccc",
      paddingBottom: 8,
    },
    title: {
      fontSize: sizes.title,
      fontWeight: "bold",
      marginBottom: 2,
    },
    subtitle: {
      fontSize: sizes.subtitle,
      color: "#555555",
    },
    metaRow: {
      flexDirection: "row",
      gap: 16,
      marginTop: 4,
    },
    metaItem: {
      fontSize: sizes.subtitle,
      color: "#666666",
    },
    columnsWrapper: {
      flexDirection: "row",
      gap: 20,
    },
    column: {
      flex: 1,
    },
    sectionBlock: {
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: sizes.sectionLabel,
      fontWeight: "bold",
      marginBottom: 4,
      paddingVertical: 1,
      paddingHorizontal: 4,
      borderRadius: 2,
    },
    chordLine: {
      fontSize: sizes.chord,
      fontWeight: "bold",
      color: options.chordColor || "#3b82f6",
      fontFamily: "Courier",
      lineHeight: 1.3,
    },
    lyricLine: {
      fontSize: sizes.lyric,
      fontFamily: "Courier",
      lineHeight: 1.3,
    },
    emptyLine: {
      fontSize: sizes.lyric,
      lineHeight: 1.3,
    },
    pageNumber: {
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 8,
      color: "#999999",
    },
  });

  // ---- Build section elements ----

  function buildSectionElements(section: Section): React.ReactElement[] {
    const elements: React.ReactElement[] = [];
    const config = SECTION_CONFIGS[section.type];
    const doc = section.content as unknown as TipTapDoc;

    // Section label
    if (options.sectionLabels) {
      elements.push(
        createElement(
          Text,
          {
            key: `label-${section.id}`,
            style: [styles.sectionLabel, { color: config.color }],
          },
          `[${section.label || config.label}]`,
        ),
      );
    }

    // Parse paragraphs from TipTap JSON
    const paragraphs = doc?.content ?? [];

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      if (para.type !== "paragraph") continue;

      const { hasChords, segments } = parseParagraph(para);

      if (!para.content || para.content.length === 0) {
        // Empty paragraph = blank line
        elements.push(
          createElement(Text, { key: `empty-${section.id}-${i}`, style: styles.emptyLine }, " "),
        );
        continue;
      }

      const { chordLine, lyricLine } = buildChordAndLyricLines(segments);

      if (options.contentMode === "chords_only") {
        // Only show chord lines (skip paragraphs with no chords)
        if (hasChords) {
          elements.push(
            createElement(
              Text,
              { key: `chord-${section.id}-${i}`, style: styles.chordLine },
              chordLine,
            ),
          );
        }
      } else if (options.contentMode === "lyrics_only") {
        // Only show lyric lines
        elements.push(
          createElement(
            Text,
            { key: `lyric-${section.id}-${i}`, style: styles.lyricLine },
            lyricLine,
          ),
        );
      } else {
        // Full mode: chord line above lyric line
        if (hasChords) {
          elements.push(
            createElement(
              Text,
              { key: `chord-${section.id}-${i}`, style: styles.chordLine },
              chordLine,
            ),
          );
        }
        elements.push(
          createElement(
            Text,
            { key: `lyric-${section.id}-${i}`, style: styles.lyricLine },
            lyricLine,
          ),
        );
      }
    }

    return elements;
  }

  // ---- Build header ----

  const headerChildren: React.ReactElement[] = [];

  if (options.showHeader) {
    headerChildren.push(createElement(Text, { key: "title", style: styles.title }, sheet.title));

    if (sheet.artist) {
      headerChildren.push(
        createElement(Text, { key: "artist", style: styles.subtitle }, sheet.artist),
      );
    }

    const metaItems: React.ReactElement[] = [];
    if (sheet.song_key) {
      metaItems.push(
        createElement(Text, { key: "key", style: styles.metaItem }, `Key: ${sheet.song_key}`),
      );
    }
    if (sheet.tempo) {
      metaItems.push(
        createElement(Text, { key: "tempo", style: styles.metaItem }, `Tempo: ${sheet.tempo}`),
      );
    }
    if (sheet.bpm) {
      metaItems.push(
        createElement(Text, { key: "bpm", style: styles.metaItem }, `BPM: ${sheet.bpm}`),
      );
    }

    if (metaItems.length > 0) {
      headerChildren.push(
        createElement(View, { key: "meta", style: styles.metaRow }, ...metaItems),
      );
    }
  }

  // ---- Build section blocks ----

  const sectionBlocks: React.ReactElement[] = sections.map((section) =>
    createElement(
      View,
      { key: `section-${section.id}`, style: styles.sectionBlock },
      ...buildSectionElements(section),
    ),
  );

  // ---- Handle columns ----

  let bodyContent: React.ReactElement;
  if (options.columns === 2) {
    const mid = Math.ceil(sectionBlocks.length / 2);
    const leftBlocks = sectionBlocks.slice(0, mid);
    const rightBlocks = sectionBlocks.slice(mid);

    bodyContent = createElement(
      View,
      { style: styles.columnsWrapper },
      createElement(View, { style: styles.column }, ...leftBlocks),
      createElement(View, { style: styles.column }, ...rightBlocks),
    );
  } else {
    bodyContent = createElement(View, {}, ...sectionBlocks);
  }

  // ---- Assemble page ----

  const pageChildren: React.ReactElement[] = [];

  if (options.showHeader && headerChildren.length > 0) {
    pageChildren.push(
      createElement(View, { key: "header", style: styles.header }, ...headerChildren),
    );
  }

  pageChildren.push(bodyContent);

  if (options.showPageNumbers) {
    pageChildren.push(
      createElement(Text, {
        key: "pageNum",
        style: styles.pageNumber,
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
          `${pageNumber} / ${totalPages}`,
      } as Record<string, unknown>),
    );
  }

  const page = createElement(
    Page,
    {
      size: { width: pageSize.width, height: pageSize.height },
      style: styles.page,
    },
    ...pageChildren,
  );

  return createElement(Document, {}, page);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generatePDF(
  sheet: ChordSheet,
  sections: Section[],
  options: ExportOptions,
): Promise<Uint8Array> {
  const doc = buildPDFElement(sheet, sections, options);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await ReactPDF.renderToStream(doc as any);

  // Collect stream chunks into a buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
  }

  // Concatenate all chunks
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
