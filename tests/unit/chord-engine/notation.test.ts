import { describe, it, expect } from "vitest";
import { toLatin, toAngloSaxon, convertNotation } from "@/lib/chord-engine/notation";
import type { Chord } from "@/lib/chord-engine/types";

describe("toLatin", () => {
  describe("basic note conversions", () => {
    it('should convert "C" to "Do"', () => {
      expect(toLatin("C")).toBe("Do");
    });

    it('should convert "D" to "Re"', () => {
      expect(toLatin("D")).toBe("Re");
    });

    it('should convert "E" to "Mi"', () => {
      expect(toLatin("E")).toBe("Mi");
    });

    it('should convert "F" to "Fa"', () => {
      expect(toLatin("F")).toBe("Fa");
    });

    it('should convert "G" to "Sol"', () => {
      expect(toLatin("G")).toBe("Sol");
    });

    it('should convert "A" to "La"', () => {
      expect(toLatin("A")).toBe("La");
    });

    it('should convert "B" to "Si"', () => {
      expect(toLatin("B")).toBe("Si");
    });
  });

  describe("accidentals", () => {
    it('should convert "C#" to "Do#"', () => {
      expect(toLatin("C#")).toBe("Do#");
    });

    it('should convert "Bb" to "Sib"', () => {
      expect(toLatin("Bb")).toBe("Sib");
    });

    it('should convert "F#" to "Fa#"', () => {
      expect(toLatin("F#")).toBe("Fa#");
    });

    it('should convert "Eb" to "Mib"', () => {
      expect(toLatin("Eb")).toBe("Mib");
    });

    it('should convert "Ab" to "Lab"', () => {
      expect(toLatin("Ab")).toBe("Lab");
    });
  });

  describe("edge cases", () => {
    it("should return empty string for empty input", () => {
      expect(toLatin("")).toBe("");
    });

    it("should return unrecognized notes unchanged", () => {
      expect(toLatin("X")).toBe("X");
    });
  });
});

describe("toAngloSaxon", () => {
  describe("basic note conversions", () => {
    it('should convert "Do" to "C"', () => {
      expect(toAngloSaxon("Do")).toBe("C");
    });

    it('should convert "Re" to "D"', () => {
      expect(toAngloSaxon("Re")).toBe("D");
    });

    it('should convert "Mi" to "E"', () => {
      expect(toAngloSaxon("Mi")).toBe("E");
    });

    it('should convert "Fa" to "F"', () => {
      expect(toAngloSaxon("Fa")).toBe("F");
    });

    it('should convert "Sol" to "G"', () => {
      expect(toAngloSaxon("Sol")).toBe("G");
    });

    it('should convert "La" to "A"', () => {
      expect(toAngloSaxon("La")).toBe("A");
    });

    it('should convert "Si" to "B"', () => {
      expect(toAngloSaxon("Si")).toBe("B");
    });
  });

  describe("accidentals", () => {
    it('should convert "Do#" to "C#"', () => {
      expect(toAngloSaxon("Do#")).toBe("C#");
    });

    it('should convert "Sib" to "Bb"', () => {
      expect(toAngloSaxon("Sib")).toBe("Bb");
    });

    it('should convert "Fa#" to "F#"', () => {
      expect(toAngloSaxon("Fa#")).toBe("F#");
    });

    it('should convert "Mib" to "Eb"', () => {
      expect(toAngloSaxon("Mib")).toBe("Eb");
    });

    it('should convert "Lab" to "Ab"', () => {
      expect(toAngloSaxon("Lab")).toBe("Ab");
    });

    it('should convert "Reb" to "Db"', () => {
      expect(toAngloSaxon("Reb")).toBe("Db");
    });
  });

  describe("edge cases", () => {
    it("should return empty string for empty input", () => {
      expect(toAngloSaxon("")).toBe("");
    });

    it("should return unrecognized notes unchanged", () => {
      expect(toAngloSaxon("X")).toBe("X");
    });
  });
});

describe("convertNotation", () => {
  describe("converting to Latin", () => {
    it("should convert a simple major chord to Latin", () => {
      const chord: Chord = { root: "C", quality: "maj", bass: null };
      expect(convertNotation(chord, "latin")).toEqual({
        root: "Do",
        quality: "maj",
        bass: null,
      });
    });

    it("should convert a minor chord with sharp to Latin", () => {
      const chord: Chord = { root: "F#", quality: "min", bass: null };
      expect(convertNotation(chord, "latin")).toEqual({
        root: "Fa#",
        quality: "min",
        bass: null,
      });
    });

    it("should convert a slash chord to Latin", () => {
      const chord: Chord = { root: "A", quality: "min7", bass: "G" };
      expect(convertNotation(chord, "latin")).toEqual({
        root: "La",
        quality: "min7",
        bass: "Sol",
      });
    });

    it("should convert flat notes to Latin", () => {
      const chord: Chord = { root: "Bb", quality: "7", bass: "Eb" };
      expect(convertNotation(chord, "latin")).toEqual({
        root: "Sib",
        quality: "7",
        bass: "Mib",
      });
    });
  });

  describe("converting to Anglo-Saxon", () => {
    it("should convert a simple Latin chord to Anglo-Saxon", () => {
      const chord: Chord = { root: "Do", quality: "maj", bass: null };
      expect(convertNotation(chord, "anglo_saxon")).toEqual({
        root: "C",
        quality: "maj",
        bass: null,
      });
    });

    it("should convert a Latin slash chord to Anglo-Saxon", () => {
      const chord: Chord = { root: "La", quality: "min7", bass: "Sol" };
      expect(convertNotation(chord, "anglo_saxon")).toEqual({
        root: "A",
        quality: "min7",
        bass: "G",
      });
    });

    it("should convert Latin accidentals to Anglo-Saxon", () => {
      const chord: Chord = { root: "Fa#", quality: "min", bass: null };
      expect(convertNotation(chord, "anglo_saxon")).toEqual({
        root: "F#",
        quality: "min",
        bass: null,
      });
    });
  });

  describe("round-trip conversions", () => {
    it("should return the original chord after Anglo->Latin->Anglo", () => {
      const original: Chord = { root: "A", quality: "min7", bass: "G" };
      const latin = convertNotation(original, "latin");
      const backToAnglo = convertNotation(latin, "anglo_saxon");
      expect(backToAnglo).toEqual(original);
    });

    it("should round-trip a sharp chord correctly", () => {
      const original: Chord = { root: "F#", quality: "dim", bass: null };
      const latin = convertNotation(original, "latin");
      expect(latin.root).toBe("Fa#");
      const backToAnglo = convertNotation(latin, "anglo_saxon");
      expect(backToAnglo).toEqual(original);
    });

    it("should round-trip a flat slash chord correctly", () => {
      const original: Chord = { root: "Bb", quality: "maj7", bass: "D" };
      const latin = convertNotation(original, "latin");
      expect(latin.root).toBe("Sib");
      expect(latin.bass).toBe("Re");
      const backToAnglo = convertNotation(latin, "anglo_saxon");
      expect(backToAnglo).toEqual(original);
    });
  });
});
