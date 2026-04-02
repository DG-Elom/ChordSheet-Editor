import { describe, it, expect } from "vitest";
import { getCapoChords, getSoundingKey, suggestCapoPositions } from "@/lib/chord-engine/capo";
import type { Chord } from "@/lib/chord-engine/types";

function chord(root: string, quality: string = "maj", bass: string | null = null): Chord {
  return { root, quality, bass };
}

describe("getCapoChords", () => {
  it("should return same chords with capo 0", () => {
    const chords = [chord("C"), chord("G"), chord("Am", "min")];
    const result = getCapoChords(chords, 0);
    expect(result).toEqual(chords);
  });

  it("should transpose down by capo fret number", () => {
    // Capo on fret 2: to play sounding G, shape would be F (G - 2 semitones)
    const chords = [chord("G"), chord("C"), chord("D")];
    const result = getCapoChords(chords, 2);
    // G transposed down 2 = F, C down 2 = Bb, D down 2 = C
    expect(result[0].root).toBe("F");
    expect(result[1].root).toBe("Bb");
    expect(result[2].root).toBe("C");
  });

  it("should transpose down by capo fret 3", () => {
    const chords = [chord("C"), chord("F"), chord("G")];
    const result = getCapoChords(chords, 3);
    // C down 3 = A, F down 3 = D, G down 3 = E
    expect(result[0].root).toBe("A");
    expect(result[1].root).toBe("D");
    expect(result[2].root).toBe("E");
  });

  it("should preserve chord quality", () => {
    const chords = [chord("A", "min7"), chord("D", "7"), chord("G", "maj7")];
    const result = getCapoChords(chords, 2);
    expect(result[0].quality).toBe("min7");
    expect(result[1].quality).toBe("7");
    expect(result[2].quality).toBe("maj7");
  });

  it("should handle slash chords", () => {
    const chords = [chord("C", "maj", "E")];
    const result = getCapoChords(chords, 2);
    // C down 2 = Bb, E down 2 = D
    expect(result[0].root).toBe("Bb");
    expect(result[0].bass).toBe("D");
  });
});

describe("getSoundingKey", () => {
  it("should return same key with capo 0", () => {
    expect(getSoundingKey("C", 0)).toBe("C");
  });

  it("should transpose key up by capo fret", () => {
    // Playing C shapes with capo on 2 -> sounds D
    expect(getSoundingKey("C", 2)).toBe("D");
  });

  it("should transpose G up 3 frets to Bb", () => {
    expect(getSoundingKey("G", 3)).toBe("A#");
  });

  it("should transpose A up 2 frets to B", () => {
    expect(getSoundingKey("A", 2)).toBe("B");
  });

  it("should wrap around correctly", () => {
    // B + 1 = C
    expect(getSoundingKey("B", 1)).toBe("C");
  });
});

describe("suggestCapoPositions", () => {
  it("should return positions sorted by difficulty", () => {
    const chords = [chord("F"), chord("Bb"), chord("C")];
    const results = suggestCapoPositions(chords);
    expect(results.length).toBeGreaterThan(0);

    for (let i = 1; i < results.length; i++) {
      expect(results[i].difficulty).toBeGreaterThanOrEqual(results[i - 1].difficulty);
    }
  });

  it("should include fret 0 in results", () => {
    const chords = [chord("C"), chord("G"), chord("F")];
    const results = suggestCapoPositions(chords);
    const fret0 = results.find((r) => r.fret === 0);
    expect(fret0).toBeDefined();
  });

  it("should include frets 0 through 7", () => {
    const chords = [chord("C"), chord("G")];
    const results = suggestCapoPositions(chords);
    expect(results.length).toBe(8);
    const frets = results.map((r) => r.fret).sort((a, b) => a - b);
    expect(frets).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("should have lower difficulty for easy open chord shapes", () => {
    // C, G, Am, Em are easy shapes -> capo 0 should have very low difficulty
    const chords = [chord("C"), chord("G"), chord("A", "min"), chord("E", "min")];
    const results = suggestCapoPositions(chords);
    const fret0 = results.find((r) => r.fret === 0)!;
    expect(fret0.difficulty).toBe(0);
  });

  it("should have higher difficulty for barre chord shapes", () => {
    // F, Bb are hard shapes
    const chords = [chord("F"), chord("Bb")];
    const results = suggestCapoPositions(chords);
    const fret0 = results.find((r) => r.fret === 0)!;
    expect(fret0.difficulty).toBeGreaterThan(0);
  });

  it("should return correct capo chord shapes", () => {
    const chords = [chord("F"), chord("Bb"), chord("C")];
    const results = suggestCapoPositions(chords);

    // With capo on 5: F-5=C, Bb-5=F... hmm still F
    // With capo on 1: F-1=E, Bb-1=A, C-1=B
    const fret1 = results.find((r) => r.fret === 1)!;
    expect(fret1.chords[0].root).toBe("E");
    expect(fret1.chords[1].root).toBe("A");
    expect(fret1.chords[2].root).toBe("B");
  });
});
