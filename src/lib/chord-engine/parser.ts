import type { Chord, NoteName } from "./types";
import { QUALITY_ALIASES, VALID_ROOTS, LATIN_TO_ANGLO, LATIN_NOTES } from "./constants";

/**
 * Regex to extract the root note from the beginning of a chord string.
 * Matches a letter A-G (case-insensitive) optionally followed by # or b.
 */
const ROOT_REGEX = /^([A-Ga-g])(#|b)?/;

/**
 * Sorted quality alias keys, longest first, so greedy matching works correctly.
 * For example "maj7" must be tried before "maj" or "m".
 */
const SORTED_QUALITY_KEYS = Object.keys(QUALITY_ALIASES).sort((a, b) => b.length - a.length);

/**
 * Attempt to extract a Latin root note (Do, Re, Mi, Fa, Sol, La, Si)
 * from the beginning of the input string. Returns the Anglo-Saxon equivalent
 * and the number of characters consumed, or null if no Latin root was found.
 */
function extractLatinRoot(input: string): { angloRoot: string; consumed: number } | null {
  // Sort Latin names longest first to match "Sol" before "Si" wouldn't matter,
  // but ensures correct greedy matching
  const latinNames = Object.keys(LATIN_TO_ANGLO).sort((a, b) => b.length - a.length);
  for (const latin of latinNames) {
    if (input.startsWith(latin)) {
      // Check for sharp/flat after the Latin name
      const afterLatin = input.slice(latin.length);
      const accidental =
        afterLatin.startsWith("#") || afterLatin.startsWith("b") ? afterLatin[0] : "";
      return {
        angloRoot: LATIN_TO_ANGLO[latin] + accidental,
        consumed: latin.length + accidental.length,
      };
    }
  }
  return null;
}

/**
 * Parse a chord string into a Chord object.
 *
 * Supported formats:
 *   - "C", "Am", "F#dim", "Cmaj7", "Bb", "Gsus4/B", "Am7/G"
 *   - Latin roots: "Rem7", "Sol#dim"
 *
 * Returns null for invalid or empty input.
 */
export function parseChord(input: string): Chord | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return null;
  }

  let remaining = trimmed;
  let root: NoteName;

  // Try Latin root first (e.g., "Rem7", "Sol#dim")
  const latinResult = extractLatinRoot(remaining);
  if (latinResult) {
    root = latinResult.angloRoot;
    remaining = remaining.slice(latinResult.consumed);
  } else {
    // Try Anglo-Saxon root (e.g., "C", "F#", "Bb")
    const rootMatch = remaining.match(ROOT_REGEX);
    if (!rootMatch) {
      return null;
    }

    const letter = rootMatch[1].toUpperCase();
    const accidental = rootMatch[2] || "";
    root = letter + accidental;
    remaining = remaining.slice(rootMatch[0].length);
  }

  // Validate root
  if (!VALID_ROOTS.includes(root)) {
    return null;
  }

  // Split remaining into quality part and bass part
  let qualityStr = "";
  let bass: NoteName | null = null;

  const slashIndex = remaining.indexOf("/");
  if (slashIndex !== -1) {
    qualityStr = remaining.slice(0, slashIndex);
    const bassStr = remaining.slice(slashIndex + 1);

    // Parse bass note
    const bassLatinResult = extractLatinRoot(bassStr);
    if (bassLatinResult) {
      bass = bassLatinResult.angloRoot;
      // If there's extra content after the bass note, it's invalid
      if (bassStr.length > bassLatinResult.consumed) {
        return null;
      }
    } else {
      const bassMatch = bassStr.match(ROOT_REGEX);
      if (!bassMatch) {
        return null;
      }
      const bassLetter = bassMatch[1].toUpperCase();
      const bassAccidental = bassMatch[2] || "";
      bass = bassLetter + bassAccidental;

      // If there's extra content after the bass note, it's invalid
      if (bassStr.length > bassMatch[0].length) {
        return null;
      }
    }

    if (!VALID_ROOTS.includes(bass)) {
      return null;
    }
  } else {
    qualityStr = remaining;
  }

  // Resolve quality
  const quality = resolveQuality(qualityStr);
  if (quality === null) {
    return null;
  }

  return { root, quality, bass };
}

/**
 * Resolve a quality string to its canonical form.
 * Returns null if the quality is not recognized.
 */
function resolveQuality(qualityStr: string): string | null {
  // Direct lookup first
  if (qualityStr in QUALITY_ALIASES) {
    return QUALITY_ALIASES[qualityStr];
  }

  // Try greedy matching: find the longest quality alias key that matches the start
  for (const key of SORTED_QUALITY_KEYS) {
    if (key.length > 0 && qualityStr === key) {
      return QUALITY_ALIASES[key];
    }
  }

  // If the quality string is empty, it defaults to major
  if (qualityStr === "") {
    return "maj";
  }

  return null;
}

/**
 * Map from canonical quality to display suffix.
 */
const QUALITY_DISPLAY: Record<string, string> = {
  maj: "",
  min: "m",
  "7": "7",
  maj7: "maj7",
  min7: "m7",
  dim: "dim",
  aug: "aug",
  dim7: "dim7",
  m7b5: "m7b5",
  sus2: "sus2",
  sus4: "sus4",
  add9: "add9",
  add11: "add11",
  add13: "add13",
  "9": "9",
  "11": "11",
  "13": "13",
  "6": "6",
  m6: "m6",
  "m(maj7)": "m(maj7)",
  aug7: "aug7",
  maj9: "maj9",
  min9: "m9",
  "7sus4": "7sus4",
  "5": "5",
};

/**
 * Format a Chord object back into a human-readable string.
 *
 * @param chord - The chord to format
 * @param notation - "anglo_saxon" (default) or "latin"
 * @returns The formatted chord string, e.g., "Am7/G" or "Lam7/Sol"
 */
export function formatChord(
  chord: Chord,
  notation: "anglo_saxon" | "latin" = "anglo_saxon",
): string {
  const displayRoot = formatNoteName(chord.root, notation);
  const qualitySuffix =
    chord.quality in QUALITY_DISPLAY ? QUALITY_DISPLAY[chord.quality] : chord.quality;

  let result = displayRoot + qualitySuffix;

  if (chord.bass) {
    const displayBass = formatNoteName(chord.bass, notation);
    result += "/" + displayBass;
  }

  return result;
}

/**
 * Format a single note name according to the requested notation system.
 */
function formatNoteName(note: NoteName, notation: "anglo_saxon" | "latin"): string {
  if (notation === "latin") {
    // Extract the base letter and accidental
    const base = note[0];
    const accidental = note.slice(1); // "#" or "b" or ""
    const latinBase = LATIN_NOTES[base];
    if (latinBase) {
      return latinBase + accidental;
    }
  }
  return note;
}
