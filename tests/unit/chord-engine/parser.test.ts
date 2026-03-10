import { describe, it, expect } from "vitest";
import { parseChord, formatChord } from "@/lib/chord-engine/parser";
import type { Chord } from "@/lib/chord-engine/types";

describe("parseChord", () => {
  describe("basic major chords", () => {
    it('should parse "C" as C major', () => {
      expect(parseChord("C")).toEqual({
        root: "C",
        quality: "maj",
        bass: null,
      });
    });

    it('should parse "D" as D major', () => {
      expect(parseChord("D")).toEqual({
        root: "D",
        quality: "maj",
        bass: null,
      });
    });

    it('should parse "G" as G major', () => {
      expect(parseChord("G")).toEqual({
        root: "G",
        quality: "maj",
        bass: null,
      });
    });
  });

  describe("sharp and flat roots", () => {
    it('should parse "F#" as F# major', () => {
      expect(parseChord("F#")).toEqual({
        root: "F#",
        quality: "maj",
        bass: null,
      });
    });

    it('should parse "Bb" as Bb major', () => {
      expect(parseChord("Bb")).toEqual({
        root: "Bb",
        quality: "maj",
        bass: null,
      });
    });

    it('should parse "Eb" as Eb major', () => {
      expect(parseChord("Eb")).toEqual({
        root: "Eb",
        quality: "maj",
        bass: null,
      });
    });

    it('should parse "C#" as C# major', () => {
      expect(parseChord("C#")).toEqual({
        root: "C#",
        quality: "maj",
        bass: null,
      });
    });

    it('should parse "Ab" as Ab major', () => {
      expect(parseChord("Ab")).toEqual({
        root: "Ab",
        quality: "maj",
        bass: null,
      });
    });
  });

  describe("minor chords", () => {
    it('should parse "Am" as A minor', () => {
      expect(parseChord("Am")).toEqual({
        root: "A",
        quality: "min",
        bass: null,
      });
    });

    it('should parse "Dm" as D minor', () => {
      expect(parseChord("Dm")).toEqual({
        root: "D",
        quality: "min",
        bass: null,
      });
    });

    it('should parse "F#m" as F# minor', () => {
      expect(parseChord("F#m")).toEqual({
        root: "F#",
        quality: "min",
        bass: null,
      });
    });

    it('should parse "Bbm" as Bb minor', () => {
      expect(parseChord("Bbm")).toEqual({
        root: "Bb",
        quality: "min",
        bass: null,
      });
    });
  });

  describe("seventh chords", () => {
    it('should parse "A7" as A dominant 7', () => {
      expect(parseChord("A7")).toEqual({
        root: "A",
        quality: "7",
        bass: null,
      });
    });

    it('should parse "Am7" as A minor 7', () => {
      expect(parseChord("Am7")).toEqual({
        root: "A",
        quality: "min7",
        bass: null,
      });
    });

    it('should parse "Cmaj7" as C major 7', () => {
      expect(parseChord("Cmaj7")).toEqual({
        root: "C",
        quality: "maj7",
        bass: null,
      });
    });

    it('should parse "CM7" as C major 7', () => {
      expect(parseChord("CM7")).toEqual({
        root: "C",
        quality: "maj7",
        bass: null,
      });
    });

    it('should parse "Dm7" as D minor 7 (using m7 alias)', () => {
      expect(parseChord("Dm7")).toEqual({
        root: "D",
        quality: "min7",
        bass: null,
      });
    });
  });

  describe("diminished and augmented chords", () => {
    it('should parse "F#dim" as F# diminished', () => {
      expect(parseChord("F#dim")).toEqual({
        root: "F#",
        quality: "dim",
        bass: null,
      });
    });

    it('should parse "Bdim7" as B diminished 7', () => {
      expect(parseChord("Bdim7")).toEqual({
        root: "B",
        quality: "dim7",
        bass: null,
      });
    });

    it('should parse "Caug" as C augmented', () => {
      expect(parseChord("Caug")).toEqual({
        root: "C",
        quality: "aug",
        bass: null,
      });
    });
  });

  describe("suspended chords", () => {
    it('should parse "Gsus4" as G sus4', () => {
      expect(parseChord("Gsus4")).toEqual({
        root: "G",
        quality: "sus4",
        bass: null,
      });
    });

    it('should parse "Dsus2" as D sus2', () => {
      expect(parseChord("Dsus2")).toEqual({
        root: "D",
        quality: "sus2",
        bass: null,
      });
    });

    it('should parse "Asus" as A sus4 (sus defaults to sus4)', () => {
      expect(parseChord("Asus")).toEqual({
        root: "A",
        quality: "sus4",
        bass: null,
      });
    });
  });

  describe("extended and add chords", () => {
    it('should parse "C9" as C9', () => {
      expect(parseChord("C9")).toEqual({
        root: "C",
        quality: "9",
        bass: null,
      });
    });

    it('should parse "Cadd9" as C add9', () => {
      expect(parseChord("Cadd9")).toEqual({
        root: "C",
        quality: "add9",
        bass: null,
      });
    });

    it('should parse "G6" as G6', () => {
      expect(parseChord("G6")).toEqual({
        root: "G",
        quality: "6",
        bass: null,
      });
    });

    it('should parse "Am6" as Am6', () => {
      expect(parseChord("Am6")).toEqual({
        root: "A",
        quality: "m6",
        bass: null,
      });
    });
  });

  describe("slash chords", () => {
    it('should parse "C/E" as C major over E', () => {
      expect(parseChord("C/E")).toEqual({
        root: "C",
        quality: "maj",
        bass: "E",
      });
    });

    it('should parse "Am7/G" as Am7 over G', () => {
      expect(parseChord("Am7/G")).toEqual({
        root: "A",
        quality: "min7",
        bass: "G",
      });
    });

    it('should parse "D/F#" as D major over F#', () => {
      expect(parseChord("D/F#")).toEqual({
        root: "D",
        quality: "maj",
        bass: "F#",
      });
    });

    it('should parse "Gsus4/B" as Gsus4 over B', () => {
      expect(parseChord("Gsus4/B")).toEqual({
        root: "G",
        quality: "sus4",
        bass: "B",
      });
    });

    it('should parse "Bb/D" as Bb major over D', () => {
      expect(parseChord("Bb/D")).toEqual({
        root: "Bb",
        quality: "maj",
        bass: "D",
      });
    });
  });

  describe("quality aliases", () => {
    it('should normalize "min" alias for minor', () => {
      expect(parseChord("Amin")).toEqual({
        root: "A",
        quality: "min",
        bass: null,
      });
    });

    it('should normalize "-" alias for minor', () => {
      expect(parseChord("A-")).toEqual({
        root: "A",
        quality: "min",
        bass: null,
      });
    });

    it('should normalize "+" alias for augmented', () => {
      expect(parseChord("C+")).toEqual({
        root: "C",
        quality: "aug",
        bass: null,
      });
    });

    it('should normalize "-7" alias for minor 7', () => {
      expect(parseChord("A-7")).toEqual({
        root: "A",
        quality: "min7",
        bass: null,
      });
    });
  });

  describe("invalid input", () => {
    it("should return null for empty string", () => {
      expect(parseChord("")).toBeNull();
    });

    it("should return null for whitespace only", () => {
      expect(parseChord("   ")).toBeNull();
    });

    it('should return null for "X" (invalid root)', () => {
      expect(parseChord("X")).toBeNull();
    });

    it('should return null for "H" (invalid root)', () => {
      expect(parseChord("H")).toBeNull();
    });

    it("should return null for numbers only", () => {
      expect(parseChord("123")).toBeNull();
    });

    it("should return null for invalid quality", () => {
      expect(parseChord("Cxyz")).toBeNull();
    });

    it("should return null for slash with invalid bass", () => {
      expect(parseChord("C/X")).toBeNull();
    });

    it("should return null for null input", () => {
      expect(parseChord(null as unknown as string)).toBeNull();
    });

    it("should return null for undefined input", () => {
      expect(parseChord(undefined as unknown as string)).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle lowercase input by normalizing the root letter", () => {
      expect(parseChord("am7")).toEqual({
        root: "A",
        quality: "min7",
        bass: null,
      });
    });

    it("should trim whitespace", () => {
      expect(parseChord("  C  ")).toEqual({
        root: "C",
        quality: "maj",
        bass: null,
      });
    });

    it('should parse power chord "C5"', () => {
      expect(parseChord("C5")).toEqual({
        root: "C",
        quality: "5",
        bass: null,
      });
    });
  });
});

describe("formatChord", () => {
  describe("Anglo-Saxon notation (default)", () => {
    it("should format major chord without suffix", () => {
      const chord: Chord = { root: "C", quality: "maj", bass: null };
      expect(formatChord(chord)).toBe("C");
    });

    it('should format minor chord with "m" suffix', () => {
      const chord: Chord = { root: "A", quality: "min", bass: null };
      expect(formatChord(chord)).toBe("Am");
    });

    it("should format dominant 7 chord", () => {
      const chord: Chord = { root: "G", quality: "7", bass: null };
      expect(formatChord(chord)).toBe("G7");
    });

    it("should format minor 7 chord", () => {
      const chord: Chord = { root: "A", quality: "min7", bass: null };
      expect(formatChord(chord)).toBe("Am7");
    });

    it("should format major 7 chord", () => {
      const chord: Chord = { root: "C", quality: "maj7", bass: null };
      expect(formatChord(chord)).toBe("Cmaj7");
    });

    it("should format diminished chord", () => {
      const chord: Chord = { root: "F#", quality: "dim", bass: null };
      expect(formatChord(chord)).toBe("F#dim");
    });

    it("should format augmented chord", () => {
      const chord: Chord = { root: "C", quality: "aug", bass: null };
      expect(formatChord(chord)).toBe("Caug");
    });

    it("should format suspended chord", () => {
      const chord: Chord = { root: "G", quality: "sus4", bass: null };
      expect(formatChord(chord)).toBe("Gsus4");
    });

    it("should format slash chord", () => {
      const chord: Chord = { root: "C", quality: "maj", bass: "E" };
      expect(formatChord(chord)).toBe("C/E");
    });

    it("should format slash chord with quality", () => {
      const chord: Chord = { root: "A", quality: "min7", bass: "G" };
      expect(formatChord(chord)).toBe("Am7/G");
    });

    it("should format flat root chord", () => {
      const chord: Chord = { root: "Bb", quality: "maj", bass: null };
      expect(formatChord(chord)).toBe("Bb");
    });
  });

  describe("Latin notation", () => {
    it("should format C major as Do", () => {
      const chord: Chord = { root: "C", quality: "maj", bass: null };
      expect(formatChord(chord, "latin")).toBe("Do");
    });

    it("should format A minor as Lam", () => {
      const chord: Chord = { root: "A", quality: "min", bass: null };
      expect(formatChord(chord, "latin")).toBe("Lam");
    });

    it("should format D7 as Re7", () => {
      const chord: Chord = { root: "D", quality: "7", bass: null };
      expect(formatChord(chord, "latin")).toBe("Re7");
    });

    it("should format F# as Fa#", () => {
      const chord: Chord = { root: "F#", quality: "maj", bass: null };
      expect(formatChord(chord, "latin")).toBe("Fa#");
    });

    it("should format Bb as Sib", () => {
      const chord: Chord = { root: "Bb", quality: "maj", bass: null };
      expect(formatChord(chord, "latin")).toBe("Sib");
    });

    it("should format slash chord with Latin bass", () => {
      const chord: Chord = { root: "C", quality: "maj", bass: "E" };
      expect(formatChord(chord, "latin")).toBe("Do/Mi");
    });

    it("should format Am7/G in Latin as Lam7/Sol", () => {
      const chord: Chord = { root: "A", quality: "min7", bass: "G" };
      expect(formatChord(chord, "latin")).toBe("Lam7/Sol");
    });
  });

  describe("round-trip: parse then format", () => {
    const roundTripCases = [
      "C",
      "Am",
      "G7",
      "Cmaj7",
      "Am7",
      "F#dim",
      "Caug",
      "Gsus4",
      "C/E",
      "Am7/G",
      "Bb",
      "D/F#",
    ];

    for (const input of roundTripCases) {
      it(`should round-trip "${input}"`, () => {
        const parsed = parseChord(input);
        expect(parsed).not.toBeNull();
        expect(formatChord(parsed!)).toBe(input);
      });
    }
  });
});
