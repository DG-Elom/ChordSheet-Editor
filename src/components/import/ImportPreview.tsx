"use client";

import { SECTION_CONFIGS } from "@/types/editor.types";
import type { ParsedSheet } from "@/lib/import/types";
import type { SectionType } from "@/types/database.types";

interface ImportPreviewProps {
  sheet: ParsedSheet;
}

export function ImportPreview({ sheet }: ImportPreviewProps) {
  return (
    <div className="space-y-4">
      {sheet.sections.map((section, sIdx) => {
        const config = SECTION_CONFIGS[section.type as SectionType] ?? SECTION_CONFIGS.custom;

        return (
          <div key={sIdx} className="space-y-1">
            {/* Section header */}
            <div className="flex items-center gap-2">
              <span
                className="rounded px-1.5 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: config.color }}
              >
                {config.shortLabel}
              </span>
              <span className="text-xs font-medium text-foreground">{section.label}</span>
            </div>

            {/* Lines */}
            <div className="space-y-0 pl-2 font-mono text-sm">
              {section.lines.map((line, lIdx) => (
                <div key={lIdx}>
                  {line.chords.length > 0 && (
                    <div className="text-primary">
                      {renderChordLine(line.chords, line.lyrics.length)}
                    </div>
                  )}
                  <div className="text-foreground">{line.lyrics || "\u00A0"}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderChordLine(
  chords: Array<{ chord: string; position: number }>,
  lyricLength: number,
): string {
  const maxLen = Math.max(lyricLength, ...chords.map((c) => c.position + c.chord.length)) + 1;
  const chars = new Array(maxLen).fill(" ");

  for (const { chord, position } of chords) {
    for (let i = 0; i < chord.length && position + i < maxLen; i++) {
      chars[position + i] = chord[i];
    }
  }

  return chars.join("").trimEnd();
}
