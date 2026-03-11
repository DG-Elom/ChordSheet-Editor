// Types
export type { Chord, NoteName, ChordToken } from "./types";

// Constants
export {
  NOTES_SHARP,
  NOTES_FLAT,
  LATIN_NOTES,
  LATIN_TO_ANGLO,
  QUALITY_ALIASES,
  ALL_QUALITIES,
  VALID_ROOTS,
} from "./constants";

// Parser
export { parseChord, formatChord } from "./parser";

// Transposer
export { transpose, transposeNote } from "./transposer";

// Notation
export { toLatin, toAngloSaxon, convertNotation } from "./notation";

// Autocomplete
export { getChordSuggestions } from "./autocomplete";

// Key detector
export { detectKey } from "./key-detector";

// Capo
export { getCapoChords, getSoundingKey, suggestCapoPositions } from "./capo";

// Diagrams
export { getChordDiagram, GUITAR_CHORDS, UKULELE_CHORDS, PIANO_CHORDS } from "./diagrams";
export type { ChordDiagram, PianoChordData } from "./diagrams";
