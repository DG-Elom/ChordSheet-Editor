import type { Chord } from "./types";
import { transpose, transposeNote } from "./transposer";

export function getCapoChords(chords: Chord[], capoFret: number): Chord[] {
  if (capoFret === 0) return chords;
  return chords.map((chord) => transpose(chord, -capoFret));
}

export function getSoundingKey(shapeKey: string, capoFret: number): string {
  if (capoFret === 0) return shapeKey;
  return transposeNote(shapeKey, capoFret, false);
}

export function suggestCapoPositions(
  chords: Chord[],
): { fret: number; chords: Chord[]; difficulty: number }[] {
  const EASY_SHAPES = new Set(["C", "G", "D", "A", "E", "Am", "Em", "Dm"]);
  const results: { fret: number; chords: Chord[]; difficulty: number }[] = [];

  for (let fret = 0; fret <= 7; fret++) {
    const capoChords = getCapoChords(chords, fret);
    let difficulty = 0;

    for (const chord of capoChords) {
      const simpleCheck = chord.root + (chord.quality === "min" ? "m" : "");
      if (!EASY_SHAPES.has(simpleCheck)) {
        difficulty += 1;
      }
      if (["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(chord.root)) {
        difficulty += 0.5;
      }
    }

    results.push({ fret, chords: capoChords, difficulty });
  }

  return results.sort((a, b) => a.difficulty - b.difficulty);
}
