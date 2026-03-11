import { parseChord } from "@/lib/chord-engine";
import type { SectionType } from "@/types/database.types";

/**
 * Check if a line is predominantly chords (>50% of tokens are valid chords)
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  for (const token of tokens) {
    // Remove common separators
    const cleaned = token.replace(/[|/\\,()]/g, "").trim();
    if (!cleaned) continue;
    if (parseChord(cleaned)) {
      chordCount++;
    }
  }

  return tokens.length >= 1 && chordCount / tokens.length > 0.5;
}

const SECTION_PATTERNS: Array<{
  regex: RegExp;
  type: SectionType;
  labelFn?: (match: RegExpMatchArray) => string;
}> = [
  {
    regex: /^\[?\s*(?:verse|couplet)\s*(\d*)\s*\]?\s*:?\s*$/i,
    type: "verse",
    labelFn: (m) => (m[1] ? `Verse ${m[1]}` : "Verse"),
  },
  {
    regex: /^\[?\s*(?:chorus|refrain)\s*(\d*)\s*\]?\s*:?\s*$/i,
    type: "chorus",
    labelFn: (m) => (m[1] ? `Chorus ${m[1]}` : "Chorus"),
  },
  {
    regex: /^\[?\s*(?:bridge|pont)\s*(\d*)\s*\]?\s*:?\s*$/i,
    type: "bridge",
    labelFn: (m) => (m[1] ? `Bridge ${m[1]}` : "Bridge"),
  },
  {
    regex: /^\[?\s*(?:pre[- ]?chorus|pre[- ]?refrain)\s*(\d*)\s*\]?\s*:?\s*$/i,
    type: "pre_chorus",
    labelFn: (m) => (m[1] ? `Pre-Chorus ${m[1]}` : "Pre-Chorus"),
  },
  { regex: /^\[?\s*(?:intro)\s*\]?\s*:?\s*$/i, type: "intro" },
  { regex: /^\[?\s*(?:outro|fin)\s*\]?\s*:?\s*$/i, type: "outro" },
  { regex: /^\[?\s*(?:interlude)\s*\]?\s*:?\s*$/i, type: "interlude" },
  { regex: /^\[?\s*(?:tag)\s*\]?\s*:?\s*$/i, type: "tag" },
  // ChordPro section directives
  {
    regex: /^\{start_of_verse(?::?\s*(.*))?\}$/i,
    type: "verse",
    labelFn: (m) => m[1]?.trim() || "Verse",
  },
  {
    regex: /^\{start_of_chorus(?::?\s*(.*))?\}$/i,
    type: "chorus",
    labelFn: (m) => m[1]?.trim() || "Chorus",
  },
  {
    regex: /^\{start_of_bridge(?::?\s*(.*))?\}$/i,
    type: "bridge",
    labelFn: (m) => m[1]?.trim() || "Bridge",
  },
  { regex: /^\{sov(?::?\s*(.*))?\}$/i, type: "verse", labelFn: (m) => m[1]?.trim() || "Verse" },
  { regex: /^\{soc(?::?\s*(.*))?\}$/i, type: "chorus", labelFn: (m) => m[1]?.trim() || "Chorus" },
  { regex: /^\{sob(?::?\s*(.*))?\}$/i, type: "bridge", labelFn: (m) => m[1]?.trim() || "Bridge" },
];

export function detectSectionMarker(line: string): { type: SectionType; label: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  for (const pattern of SECTION_PATTERNS) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      const label = pattern.labelFn
        ? pattern.labelFn(match)
        : pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1);
      return { type: pattern.type, label };
    }
  }

  return null;
}

export function detectFormat(text: string): "chordpro" | "plaintext" {
  // Check for ChordPro hallmarks
  const hasDirectives = /\{(?:title|t|artist|a|key|start_of_|sov|soc|sob):?\s/i.test(text);
  const hasInlineChords = /\[[A-G][#b]?[a-z0-9]*\]/i.test(text);

  if (hasDirectives || (hasInlineChords && !isChordLine(text.split("\n")[0] || ""))) {
    return "chordpro";
  }

  return "plaintext";
}
