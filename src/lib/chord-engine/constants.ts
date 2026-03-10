export const NOTES_SHARP: readonly string[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const NOTES_FLAT: readonly string[] = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

/** Map from Anglo-Saxon note names to Latin (solfege) names */
export const LATIN_NOTES: Record<string, string> = {
  C: "Do",
  D: "Re",
  E: "Mi",
  F: "Fa",
  G: "Sol",
  A: "La",
  B: "Si",
};

/** Map from Latin (solfege) note names to Anglo-Saxon names */
export const LATIN_TO_ANGLO: Record<string, string> = Object.fromEntries(
  Object.entries(LATIN_NOTES).map(([anglo, latin]) => [latin, anglo]),
);

/**
 * Maps common chord quality aliases to their normalized forms.
 * Keys are the raw input suffix; values are the canonical quality string.
 */
export const QUALITY_ALIASES: Record<string, string> = {
  // Major
  "": "maj",
  maj: "maj",
  M: "maj",
  major: "maj",

  // Minor
  m: "min",
  min: "min",
  "-": "min",
  minor: "min",

  // Augmented
  "+": "aug",
  aug: "aug",

  // Diminished
  o: "dim",
  "\u00B0": "dim", // ° character
  dim: "dim",

  // Dominant 7
  "7": "7",
  dom7: "7",

  // Major 7
  maj7: "maj7",
  Maj7: "maj7",
  M7: "maj7",
  major7: "maj7",

  // Minor 7
  m7: "min7",
  min7: "min7",
  "-7": "min7",
  minor7: "min7",

  // Diminished 7
  dim7: "dim7",
  o7: "dim7",
  "\u00B07": "dim7",

  // Half-diminished 7 (minor 7 flat 5)
  m7b5: "m7b5",
  "\u00F8": "m7b5", // ø character
  "\u00F87": "m7b5",

  // Suspended
  sus2: "sus2",
  sus4: "sus4",
  sus: "sus4", // "sus" alone defaults to sus4

  // Add chords
  add9: "add9",
  add11: "add11",
  add13: "add13",

  // Extended dominants
  "9": "9",
  "11": "11",
  "13": "13",

  // 6th chords
  "6": "6",
  m6: "m6",
  min6: "m6",

  // Minor-major 7
  "m(maj7)": "m(maj7)",
  "min(maj7)": "m(maj7)",
  mM7: "m(maj7)",
  minmaj7: "m(maj7)",

  // Augmented 7
  "+7": "aug7",
  aug7: "aug7",

  // Major 9, minor 9, etc.
  maj9: "maj9",
  M9: "maj9",
  m9: "min9",
  min9: "min9",

  // 7sus4
  "7sus4": "7sus4",
  "7sus": "7sus4",

  // Power chord
  "5": "5",
};

/**
 * All recognized chord qualities for autocomplete.
 * These are the canonical (normalized) quality values.
 */
export const ALL_QUALITIES: readonly string[] = [
  "maj",
  "min",
  "7",
  "maj7",
  "min7",
  "dim",
  "aug",
  "dim7",
  "m7b5",
  "sus2",
  "sus4",
  "add9",
  "add11",
  "add13",
  "9",
  "11",
  "13",
  "6",
  "m6",
  "m(maj7)",
  "aug7",
  "maj9",
  "min9",
  "7sus4",
  "5",
] as const;

/**
 * Valid root note names (both sharp and flat variants).
 */
export const VALID_ROOTS: readonly string[] = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
] as const;
