import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  SectionType,
} from "docx";
import type { ChordSheet, Section } from "@/types/database.types";
import type { ExportOptions } from "@/types/editor.types";
import { SECTION_CONFIGS } from "@/types/editor.types";

// ---------------------------------------------------------------------------
// Font sizes by preset (half-points for docx)
// ---------------------------------------------------------------------------

const FONT_SIZES: Record<
  ExportOptions["fontPreset"],
  { title: number; subtitle: number; sectionLabel: number; chord: number; lyric: number }
> = {
  compact: { title: 28, subtitle: 18, sectionLabel: 18, chord: 16, lyric: 16 },
  standard: { title: 36, subtitle: 22, sectionLabel: 22, chord: 20, lyric: 20 },
  readable: { title: 44, subtitle: 26, sectionLabel: 26, chord: 24, lyric: 24 },
};

// ---------------------------------------------------------------------------
// TipTap JSON types
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
// Segment parsing
// ---------------------------------------------------------------------------

interface ChordLyricSegment {
  chord: string;
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
      chordLine += seg.chord + " ".repeat(Math.max(0, textLen - chordLen + 1));
    } else {
      chordLine += " ".repeat(textLen);
    }

    lyricLine += seg.text;
  }

  return { chordLine: chordLine.trimEnd(), lyricLine };
}

// ---------------------------------------------------------------------------
// Hex color to docx-compatible format (strip # prefix)
// ---------------------------------------------------------------------------

function hexColor(color: string): string {
  return color.replace("#", "");
}

// ---------------------------------------------------------------------------
// Build DOCX paragraphs for a section
// ---------------------------------------------------------------------------

function buildSectionParagraphs(
  section: Section,
  options: ExportOptions,
  sizes: (typeof FONT_SIZES)["standard"],
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const config = SECTION_CONFIGS[section.type];
  const doc = section.content as unknown as TipTapDoc;

  // Section label
  if (options.sectionLabels) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 200, after: 60 },
        children: [
          new TextRun({
            text: `[${section.label || config.label}]`,
            bold: true,
            size: sizes.sectionLabel,
            font: "Courier New",
            color: hexColor(config.color),
          }),
        ],
      }),
    );
  }

  const tipTapParagraphs = doc?.content ?? [];

  for (const para of tipTapParagraphs) {
    if (para.type !== "paragraph") continue;

    const { hasChords, segments } = parseParagraph(para);

    if (!para.content || para.content.length === 0) {
      paragraphs.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [] }));
      continue;
    }

    const { chordLine, lyricLine } = buildChordAndLyricLines(segments);

    if (options.contentMode === "chords_only") {
      if (hasChords) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 0, after: 0 },
            children: [
              new TextRun({
                text: chordLine,
                bold: true,
                size: sizes.chord,
                font: "Courier New",
                color: hexColor(options.chordColor || "#3b82f6"),
              }),
            ],
          }),
        );
      }
    } else if (options.contentMode === "lyrics_only") {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: lyricLine,
              size: sizes.lyric,
              font: "Courier New",
            }),
          ],
        }),
      );
    } else {
      // Full mode
      if (hasChords) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 40, after: 0 },
            children: [
              new TextRun({
                text: chordLine,
                bold: true,
                size: sizes.chord,
                font: "Courier New",
                color: hexColor(options.chordColor || "#3b82f6"),
              }),
            ],
          }),
        );
      }
      paragraphs.push(
        new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: lyricLine,
              size: sizes.lyric,
              font: "Courier New",
            }),
          ],
        }),
      );
    }
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateDOCX(
  sheet: ChordSheet,
  sections: Section[],
  options: ExportOptions,
): Promise<Uint8Array> {
  const sizes = FONT_SIZES[options.fontPreset];

  // ---- Header paragraphs ----
  const headerParagraphs: Paragraph[] = [];

  if (options.showHeader) {
    headerParagraphs.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: sheet.title,
            bold: true,
            size: sizes.title,
          }),
        ],
      }),
    );

    if (sheet.artist) {
      headerParagraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: sheet.artist,
              size: sizes.subtitle,
              color: "555555",
              italics: true,
            }),
          ],
        }),
      );
    }

    const metaParts: string[] = [];
    if (sheet.song_key) metaParts.push(`Key: ${sheet.song_key}`);
    if (sheet.tempo) metaParts.push(`Tempo: ${sheet.tempo}`);
    if (sheet.bpm) metaParts.push(`BPM: ${sheet.bpm}`);

    if (metaParts.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: metaParts.join("   |   "),
              size: sizes.subtitle,
              color: "666666",
            }),
          ],
        }),
      );
    }

    // Divider line
    headerParagraphs.push(
      new Paragraph({
        spacing: { after: 200 },
        border: {
          bottom: { style: "single" as const, size: 1, color: "CCCCCC" },
        },
        children: [],
      }),
    );
  }

  // ---- Section paragraphs ----
  const allSectionParagraphs: Paragraph[] = [];
  for (const section of sections) {
    allSectionParagraphs.push(...buildSectionParagraphs(section, options, sizes));
  }

  // ---- Column configuration ----
  const columnConfig = options.columns === 2 ? { column: { space: 400, count: 2 } } : {};

  // ---- Assemble document ----
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: options.pageSize === "A4" ? 11906 : 12240, // twips
              height: options.pageSize === "A4" ? 16838 : 15840,
            },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
          type: SectionType.CONTINUOUS,
          ...columnConfig,
        },
        children: [...headerParagraphs, ...allSectionParagraphs],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Uint8Array(buffer);
}
