import type { Chord, NoteName } from "./types";
import { LATIN_NOTES, LATIN_TO_ANGLO } from "./constants";

/**
 * Convert an Anglo-Saxon note name to its Latin (solfege) equivalent.
 *
 * Examples:
 *   - "C" -> "Do"
 *   - "F#" -> "Fa#"
 *   - "Bb" -> "Sib"
 *
 * If the note is not recognized, it is returned unchanged.
 */
export function toLatin(noteName: string): string {
  if (!noteName || noteName.length === 0) return noteName;

  const base = noteName[0].toUpperCase();
  const accidental = noteName.slice(1); // "#", "b", or ""

  const latinBase = LATIN_NOTES[base];
  if (latinBase) {
    return latinBase + accidental;
  }

  return noteName;
}

/**
 * Convert a Latin (solfege) note name to its Anglo-Saxon equivalent.
 *
 * Examples:
 *   - "Do" -> "C"
 *   - "Fa#" -> "F#"
 *   - "Sib" -> "Bb"
 *
 * If the note is not recognized, it is returned unchanged.
 */
export function toAngloSaxon(noteName: string): string {
  if (!noteName || noteName.length === 0) return noteName;

  // Sort Latin names longest first for greedy matching (e.g., "Sol" before "Si")
  const latinNames = Object.keys(LATIN_TO_ANGLO).sort((a, b) => b.length - a.length);

  for (const latin of latinNames) {
    if (noteName.startsWith(latin)) {
      const accidental = noteName.slice(latin.length); // "#", "b", or ""
      return LATIN_TO_ANGLO[latin] + accidental;
    }
  }

  return noteName;
}

/**
 * Convert all note names in a chord to the target notation system.
 *
 * @param chord - The chord to convert
 * @param target - "anglo_saxon" or "latin"
 * @returns A new Chord with note names converted to the target notation
 */
export function convertNotation(chord: Chord, target: "anglo_saxon" | "latin"): Chord {
  const convertNote =
    target === "latin" ? (note: NoteName) => toLatin(note) : (note: NoteName) => toAngloSaxon(note);

  return {
    root: convertNote(chord.root),
    quality: chord.quality,
    bass: chord.bass ? convertNote(chord.bass) : null,
  };
}
