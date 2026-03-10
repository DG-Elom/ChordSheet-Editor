import { describe, it, expect } from "vitest";
import { transpose, transposeNote } from "@/lib/chord-engine/transposer";
import { parseChord, formatChord } from "@/lib/chord-engine/parser";
import type { Chord } from "@/lib/chord-engine/types";

/**
 * Helper: parse a chord string, transpose it, and return the formatted result.
 */
function transposeChordString(input: string, semitones: number): string {
  const chord = parseChord(input);
  expect(chord).not.toBeNull();
  const transposed = transpose(chord!, semitones);
  return formatChord(transposed);
}

describe("transpose", () => {
  describe("basic transposition up", () => {
    it("should transpose C up 2 semitones to D", () => {
      expect(transposeChordString("C", 2)).toBe("D");
    });

    it("should transpose C up 4 semitones to E", () => {
      expect(transposeChordString("C", 4)).toBe("E");
    });

    it("should transpose C up 5 semitones to F", () => {
      expect(transposeChordString("C", 5)).toBe("F");
    });

    it("should transpose C up 7 semitones to G", () => {
      expect(transposeChordString("C", 7)).toBe("G");
    });

    it("should transpose D up 2 semitones to E", () => {
      expect(transposeChordString("D", 2)).toBe("E");
    });

    it("should transpose A up 3 semitones to C", () => {
      expect(transposeChordString("A", 3)).toBe("C");
    });
  });

  describe("transposition with wrapping", () => {
    it("should transpose B up 1 semitone to C", () => {
      expect(transposeChordString("B", 1)).toBe("C");
    });

    it("should transpose B up 2 semitones to C#", () => {
      expect(transposeChordString("B", 2)).toBe("C#");
    });

    it("should transpose A up 12 semitones back to A", () => {
      expect(transposeChordString("A", 12)).toBe("A");
    });
  });

  describe("transposition down", () => {
    it("should transpose G down 2 semitones to F", () => {
      expect(transposeChordString("G", -2)).toBe("F");
    });

    it("should transpose D down 2 semitones to C", () => {
      expect(transposeChordString("D", -2)).toBe("C");
    });

    it("should transpose C down 1 semitone to B", () => {
      expect(transposeChordString("C", -1)).toBe("B");
    });

    it("should transpose E down 12 semitones back to E", () => {
      expect(transposeChordString("E", -12)).toBe("E");
    });
  });

  describe("transposition preserves quality", () => {
    it("should transpose Am7 up 3 semitones to Cm7", () => {
      expect(transposeChordString("Am7", 3)).toBe("Cm7");
    });

    it("should transpose Cmaj7 up 2 semitones to Dmaj7", () => {
      expect(transposeChordString("Cmaj7", 2)).toBe("Dmaj7");
    });

    it("should transpose Gdim up 1 semitone to Abdim", () => {
      expect(transposeChordString("Gdim", 1)).toBe("Abdim");
    });

    it("should transpose Dsus4 up 5 semitones to Gsus4", () => {
      expect(transposeChordString("Dsus4", 5)).toBe("Gsus4");
    });

    it("should transpose E7 down 2 semitones to D7", () => {
      expect(transposeChordString("E7", -2)).toBe("D7");
    });
  });

  describe("flat root transposition", () => {
    it("should transpose Bb up 1 semitone to B", () => {
      expect(transposeChordString("Bb", 1)).toBe("B");
    });

    it("should transpose Eb up 2 semitones to F", () => {
      expect(transposeChordString("Eb", 2)).toBe("F");
    });

    it("should transpose Ab down 1 semitone to G", () => {
      expect(transposeChordString("Ab", -1)).toBe("G");
    });
  });

  describe("slash chord transposition", () => {
    it("should transpose C/E up 2 semitones to D/F#", () => {
      expect(transposeChordString("C/E", 2)).toBe("D/F#");
    });

    it("should transpose Am7/G up 3 semitones to Cm7/Bb", () => {
      expect(transposeChordString("Am7/G", 3)).toBe("Cm7/Bb");
    });

    it("should transpose D/F# down 2 semitones to C/E", () => {
      expect(transposeChordString("D/F#", -2)).toBe("C/E");
    });

    it("should transpose G/B up 5 semitones to C/E", () => {
      expect(transposeChordString("G/B", 5)).toBe("C/E");
    });
  });

  describe("zero transposition", () => {
    it("should return an identical chord when transposing by 0", () => {
      const chord: Chord = { root: "C", quality: "maj7", bass: "E" };
      const result = transpose(chord, 0);
      expect(result).toEqual(chord);
      // Ensure it's a new object (not the same reference)
      expect(result).not.toBe(chord);
    });
  });

  describe("transposeNote", () => {
    it("should transpose C up 2 semitones to D (sharps)", () => {
      expect(transposeNote("C", 2, false)).toBe("D");
    });

    it("should transpose C up 1 semitone to C# (sharps)", () => {
      expect(transposeNote("C", 1, false)).toBe("C#");
    });

    it("should transpose C up 1 semitone to Db (flats)", () => {
      expect(transposeNote("C", 1, true)).toBe("Db");
    });

    it("should transpose B up 1 semitone to C", () => {
      expect(transposeNote("B", 1, false)).toBe("C");
    });
  });
});
