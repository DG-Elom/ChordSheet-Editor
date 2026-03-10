import type { Chord, NoteName } from "./types";
import { NOTES_SHARP, NOTES_FLAT } from "./constants";

/**
 * Roots that belong to "flat key" contexts in music theory.
 * When one of these is the original root, the transposed result will
 * prefer flat spellings for enharmonic notes.
 *
 * Flat keys: F (1 flat), Bb (2 flats), Eb (3 flats), Ab (4 flats),
 *            Db (5 flats), Gb (6 flats)
 *
 * Everything else (C, G, D, A, E, B, F#, C#, etc.) prefers sharps.
 */
const FLAT_KEY_ROOTS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb"]);

/**
 * Enharmonic corrections applied after transposition.
 * Some sharp spellings are very uncommon in practice and should be
 * converted to their flat equivalents for readability:
 *   G# -> Ab, D# -> Eb, A# -> Bb
 *
 * C# and F# are left as-is because they are common key names.
 */
const ENHARMONIC_CORRECTIONS: Record<string, string> = {
  "G#": "Ab",
  "D#": "Eb",
  "A#": "Bb",
};

/**
 * Apply enharmonic corrections to convert uncommon sharp spellings
 * to their more common flat equivalents.
 */
function correctEnharmonic(note: NoteName): NoteName {
  return ENHARMONIC_CORRECTIONS[note] ?? note;
}

/**
 * Determine whether an original root note prefers flat spellings.
 */
function rootPrefersFlats(note: NoteName): boolean {
  return FLAT_KEY_ROOTS.has(note) || note.includes("b");
}

/**
 * Get the semitone index (0-11) for a given note name.
 * Looks up in both sharp and flat note arrays.
 * Returns -1 if the note is not found.
 */
function noteToIndex(note: NoteName): number {
  const sharpIdx = NOTES_SHARP.indexOf(note);
  if (sharpIdx !== -1) return sharpIdx;
  const flatIdx = NOTES_FLAT.indexOf(note);
  if (flatIdx !== -1) return flatIdx;
  return -1;
}

/**
 * Convert a semitone index to a note name, using sharps or flats as specified.
 */
function indexToNote(index: number, useFlats: boolean): NoteName {
  const normalizedIndex = ((index % 12) + 12) % 12;
  return useFlats ? NOTES_FLAT[normalizedIndex] : NOTES_SHARP[normalizedIndex];
}

/**
 * Transpose a single note by a given number of semitones.
 *
 * @param note - The note to transpose
 * @param semitones - Number of semitones to transpose (positive = up, negative = down)
 * @param useFlats - Whether to use flat notation for the result
 * @returns The transposed note name
 */
export function transposeNote(note: NoteName, semitones: number, useFlats: boolean): NoteName {
  const index = noteToIndex(note);
  if (index === -1) return note; // Return as-is if unrecognized
  return indexToNote(index + semitones, useFlats);
}

/**
 * Transpose a chord by a given number of semitones.
 *
 * The transposition preserves the chord quality and handles:
 * - Sharp/flat preference inherited from the original root's key context
 * - Enharmonic correction: G#->Ab, D#->Eb, A#->Bb (uncommon sharps
 *   are converted to common flats)
 * - Slash chord bass note transposition
 * - Wrapping around the octave (e.g., B + 1 = C)
 *
 * @param chord - The chord to transpose
 * @param semitones - Number of semitones to transpose (positive = up, negative = down)
 * @returns A new Chord with the transposed root (and bass, if present)
 */
export function transpose(chord: Chord, semitones: number): Chord {
  if (semitones === 0) {
    return { ...chord };
  }

  const rootIndex = noteToIndex(chord.root);
  if (rootIndex === -1) {
    return { ...chord };
  }

  // Determine sharp/flat preference from the original root's key family
  const useFlats = rootPrefersFlats(chord.root);

  // Transpose root and apply enharmonic correction
  const newRootIndex = (((rootIndex + semitones) % 12) + 12) % 12;
  const rawRoot = indexToNote(newRootIndex, useFlats);
  const newRoot = correctEnharmonic(rawRoot);

  // Transpose bass note if present, using the same preference
  let newBass: NoteName | null = null;
  if (chord.bass) {
    const bassIndex = noteToIndex(chord.bass);
    if (bassIndex !== -1) {
      const newBassIndex = (((bassIndex + semitones) % 12) + 12) % 12;
      const rawBass = indexToNote(newBassIndex, useFlats);
      newBass = correctEnharmonic(rawBass);
    } else {
      newBass = chord.bass;
    }
  }

  return {
    root: newRoot,
    quality: chord.quality,
    bass: newBass,
  };
}
