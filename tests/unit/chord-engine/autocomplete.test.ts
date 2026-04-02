import { describe, it, expect } from "vitest";
import { getChordSuggestions } from "@/lib/chord-engine/autocomplete";

describe("getChordSuggestions", () => {
  describe("empty/invalid input", () => {
    it("should return empty array for empty string", () => {
      expect(getChordSuggestions("")).toEqual([]);
    });

    it("should return empty array for whitespace only", () => {
      expect(getChordSuggestions("   ")).toEqual([]);
    });

    it("should return empty array for invalid root", () => {
      expect(getChordSuggestions("X")).toEqual([]);
    });

    it("should return empty array for numbers only", () => {
      expect(getChordSuggestions("123")).toEqual([]);
    });
  });

  describe("root note input", () => {
    it('should return suggestions starting with "C" for input "C"', () => {
      const suggestions = getChordSuggestions("C");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every((s) => s.startsWith("C"))).toBe(true);
    });

    it('should include "C" (major) in suggestions for "C"', () => {
      const suggestions = getChordSuggestions("C");
      expect(suggestions).toContain("C");
    });

    it('should include "Cm" in suggestions for "C"', () => {
      const suggestions = getChordSuggestions("C");
      expect(suggestions).toContain("Cm");
    });

    it('should include sharp/flat variants for "A"', () => {
      const suggestions = getChordSuggestions("A");
      expect(suggestions).toContain("Ab");
      expect(suggestions).toContain("A#");
    });

    it('should not suggest sharp/flat variants for "C#"', () => {
      const suggestions = getChordSuggestions("C#");
      // C# already has accidental, no further root variants
      expect(suggestions.every((s) => s.startsWith("C#"))).toBe(true);
    });
  });

  describe("partial quality input", () => {
    it('should filter suggestions for partial quality "m"', () => {
      const suggestions = getChordSuggestions("Cm");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain("Cm");
      expect(suggestions).toContain("Cmaj7");
    });

    it('should filter suggestions for "Cs" (sus chords)', () => {
      const suggestions = getChordSuggestions("Cs");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain("Csus2");
      expect(suggestions).toContain("Csus4");
    });

    it('should filter suggestions for "Cd" (dim chords)', () => {
      const suggestions = getChordSuggestions("Cd");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain("Cdim");
      expect(suggestions).toContain("Cdim7");
    });

    it('should filter suggestions for "Ca" (add/aug chords)', () => {
      const suggestions = getChordSuggestions("Ca");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain("Cadd9");
      expect(suggestions).toContain("Caug");
    });
  });

  describe("limit parameter", () => {
    it("should respect the limit parameter", () => {
      const suggestions = getChordSuggestions("C", 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it("should return all suggestions when limit is large", () => {
      const limited = getChordSuggestions("C", 100);
      const default_ = getChordSuggestions("C");
      expect(limited.length).toBeGreaterThanOrEqual(default_.length);
    });

    it("should default to max 10 suggestions", () => {
      const suggestions = getChordSuggestions("C");
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });

  describe("sorting", () => {
    it("should sort shorter suggestions first", () => {
      const suggestions = getChordSuggestions("C", 20);
      // "C" should come before "Cm7" which should come before "Cmaj7"
      const cIdx = suggestions.indexOf("C");
      const cm7Idx = suggestions.indexOf("Cm7");
      if (cIdx !== -1 && cm7Idx !== -1) {
        expect(cIdx).toBeLessThan(cm7Idx);
      }
    });
  });

  describe("case insensitivity", () => {
    it("should handle lowercase root", () => {
      const suggestions = getChordSuggestions("c");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every((s) => s.startsWith("C"))).toBe(true);
    });

    it("should handle lowercase with quality", () => {
      const suggestions = getChordSuggestions("am");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every((s) => s.startsWith("A"))).toBe(true);
    });
  });

  describe("sharp/flat root notes", () => {
    it('should return suggestions for "F#"', () => {
      const suggestions = getChordSuggestions("F#");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain("F#");
      expect(suggestions).toContain("F#m");
    });

    it('should return suggestions for "Bb"', () => {
      const suggestions = getChordSuggestions("Bb");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain("Bb");
      expect(suggestions).toContain("Bbm");
    });
  });
});
