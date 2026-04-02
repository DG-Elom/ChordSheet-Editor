import { describe, it, expect } from "vitest";
import { detectKey } from "@/lib/chord-engine/key-detector";
import type { Chord } from "@/lib/chord-engine/types";

function chord(root: string, quality: string = "maj"): Chord {
  return { root, quality, bass: null };
}

describe("detectKey", () => {
  describe("empty input", () => {
    it("should return null for empty chord array", () => {
      expect(detectKey([])).toBeNull();
    });
  });

  describe("common major key progressions", () => {
    it("should detect C major from I-IV-V-I", () => {
      const chords = [chord("C"), chord("F"), chord("G"), chord("C")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("C");
    });

    it("should detect G major from I-IV-V-I", () => {
      const chords = [chord("G"), chord("C"), chord("D"), chord("G")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("G");
    });

    it("should detect D major from I-IV-V-I", () => {
      const chords = [chord("D"), chord("G"), chord("A"), chord("D")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("D");
    });

    it("should detect A major from I-IV-V-I", () => {
      const chords = [chord("A"), chord("D"), chord("E"), chord("A")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("A");
    });

    it("should detect E major from I-IV-V-I", () => {
      const chords = [chord("E"), chord("A"), chord("B"), chord("E")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("E");
    });

    it("should detect F major from I-IV-V-I", () => {
      const chords = [chord("F"), chord("Bb"), chord("C"), chord("F")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("F");
    });
  });

  describe("progressions with minor chords", () => {
    it("should detect C major from I-vi-IV-V", () => {
      const chords = [chord("C"), chord("A", "min"), chord("F"), chord("G")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("C");
    });

    it("should detect G major from I-vi-IV-V", () => {
      const chords = [chord("G"), chord("E", "min"), chord("C"), chord("D")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("G");
    });
  });

  describe("progressions with 7th chords", () => {
    it("should detect C from C - Am7 - Dm7 - G7", () => {
      const chords = [chord("C"), chord("A", "min7"), chord("D", "min7"), chord("G", "7")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("C");
    });

    it("should detect G from Gmaj7 - Em7 - Am7 - D7", () => {
      const chords = [chord("G", "maj7"), chord("E", "min7"), chord("A", "min7"), chord("D", "7")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("G");
    });
  });

  describe("confidence score", () => {
    it("should return a confidence between 0 and 1", () => {
      const chords = [chord("C"), chord("F"), chord("G"), chord("C")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.confidence).toBeGreaterThanOrEqual(0);
      expect(result!.confidence).toBeLessThanOrEqual(1);
    });

    it("should have higher confidence for strong progressions than ambiguous ones", () => {
      // Strong: clearly in C
      const strongChords = [chord("C"), chord("F"), chord("G"), chord("C")];
      // Ambiguous: chords from different keys
      const ambiguousChords = [chord("C"), chord("F#"), chord("Eb"), chord("A")];
      const strongResult = detectKey(strongChords);
      const ambiguousResult = detectKey(ambiguousChords);
      expect(strongResult!.confidence).toBeGreaterThan(ambiguousResult!.confidence);
    });
  });

  describe("single chord", () => {
    it("should return a result for a single chord", () => {
      const chords = [chord("C")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      expect(result!.key).toBe("C");
    });
  });

  describe("flat key detection", () => {
    it("should detect Bb from Bb - Eb - F - Bb", () => {
      const chords = [chord("Bb"), chord("Eb"), chord("F"), chord("Bb")];
      const result = detectKey(chords);
      expect(result).not.toBeNull();
      // Bb maps to A# in NOTES_SHARP, so the key will be A#
      expect(result!.key).toBe("A#");
    });
  });
});
