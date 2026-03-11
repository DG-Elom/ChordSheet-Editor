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
import { parseParagraph, buildChordAndLyricLines } from "./shared";
import type { TipTapDoc } from "./shared";

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
