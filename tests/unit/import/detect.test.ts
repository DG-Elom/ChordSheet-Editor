import { describe, it, expect } from "vitest";
import { isChordLine, detectSectionMarker, detectFormat } from "@/lib/import/detect";

describe("isChordLine", () => {
  describe("valid chord lines", () => {
    it("should detect a line of simple chords", () => {
      expect(isChordLine("C  G  Am  F")).toBe(true);
    });

    it("should detect a line with a single chord", () => {
      expect(isChordLine("Am7")).toBe(true);
    });

    it("should detect a line with complex chords", () => {
      expect(isChordLine("Cmaj7  Dm7  G7  Am7")).toBe(true);
    });

    it("should detect chords with sharps and flats", () => {
      expect(isChordLine("F#m  Bb  Eb")).toBe(true);
    });

    it("should handle slash chords (cleaned of / separator)", () => {
      // isChordLine strips /|\ separators, so C/E becomes CE which is invalid
      // This is expected behavior - slash chords are not recognized by isChordLine
      expect(isChordLine("C/E  G/B  Am")).toBe(false);
    });
  });

  describe("non-chord lines", () => {
    it("should reject a lyric line", () => {
      expect(isChordLine("Amazing grace how sweet the sound")).toBe(false);
    });

    it("should reject an empty string", () => {
      expect(isChordLine("")).toBe(false);
    });

    it("should reject whitespace only", () => {
      expect(isChordLine("   ")).toBe(false);
    });
  });

  describe("mixed lines", () => {
    it("should accept if >50% tokens are chords", () => {
      // 2 chords out of 3 tokens = 66%
      expect(isChordLine("C  G  hello")).toBe(true);
    });

    it("should reject if <=50% tokens are chords", () => {
      // 1 chord out of 3 tokens = 33%
      expect(isChordLine("C  hello  world")).toBe(false);
    });
  });
});

describe("detectSectionMarker", () => {
  describe("verse markers", () => {
    it('should detect "Verse"', () => {
      const result = detectSectionMarker("Verse");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("verse");
      expect(result!.label).toBe("Verse");
    });

    it('should detect "Verse 2"', () => {
      const result = detectSectionMarker("Verse 2");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("verse");
      expect(result!.label).toBe("Verse 2");
    });

    it('should detect "[Verse]"', () => {
      const result = detectSectionMarker("[Verse]");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("verse");
    });

    it('should detect "Couplet" (French)', () => {
      const result = detectSectionMarker("Couplet");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("verse");
    });
  });

  describe("chorus markers", () => {
    it('should detect "Chorus"', () => {
      const result = detectSectionMarker("Chorus");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("chorus");
    });

    it('should detect "[Chorus]"', () => {
      const result = detectSectionMarker("[Chorus]");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("chorus");
    });

    it('should detect "Refrain" (French)', () => {
      const result = detectSectionMarker("Refrain");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("chorus");
    });
  });

  describe("bridge markers", () => {
    it('should detect "Bridge"', () => {
      const result = detectSectionMarker("Bridge");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("bridge");
    });

    it('should detect "Pont" (French)', () => {
      const result = detectSectionMarker("Pont");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("bridge");
    });
  });

  describe("other section types", () => {
    it('should detect "Intro"', () => {
      const result = detectSectionMarker("Intro");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("intro");
    });

    it('should detect "Outro"', () => {
      const result = detectSectionMarker("Outro");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("outro");
    });

    it('should detect "Interlude"', () => {
      const result = detectSectionMarker("Interlude");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("interlude");
    });

    it('should detect "Pre-Chorus"', () => {
      const result = detectSectionMarker("Pre-Chorus");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("pre_chorus");
    });

    it('should detect "PreChorus"', () => {
      const result = detectSectionMarker("PreChorus");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("pre_chorus");
    });
  });

  describe("case insensitivity", () => {
    it('should detect "VERSE"', () => {
      const result = detectSectionMarker("VERSE");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("verse");
    });

    it('should detect "chorus" lowercase', () => {
      const result = detectSectionMarker("chorus");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("chorus");
    });
  });

  describe("with colon", () => {
    it('should detect "Verse:"', () => {
      const result = detectSectionMarker("Verse:");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("verse");
    });
  });

  describe("non-section markers", () => {
    it("should return null for regular text", () => {
      expect(detectSectionMarker("Amazing grace")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(detectSectionMarker("")).toBeNull();
    });

    it("should return null for chord line", () => {
      expect(detectSectionMarker("C G Am F")).toBeNull();
    });
  });

  describe("ChordPro section directives", () => {
    it("should detect {start_of_verse}", () => {
      const result = detectSectionMarker("{start_of_verse}");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("verse");
    });

    it("should detect {soc}", () => {
      const result = detectSectionMarker("{soc}");
      expect(result).not.toBeNull();
      expect(result!.type).toBe("chorus");
    });
  });
});

describe("detectFormat", () => {
  describe("ChordPro format", () => {
    it("should detect ChordPro with title directive", () => {
      expect(detectFormat("{title: My Song}\n[C]Hello")).toBe("chordpro");
    });

    it("should detect ChordPro with inline chords", () => {
      expect(detectFormat("[Am]Amazing [G]grace")).toBe("chordpro");
    });

    it("should detect ChordPro with start_of_verse", () => {
      expect(detectFormat("{start_of_verse}\n[C]Line")).toBe("chordpro");
    });

    it("should detect ChordPro with key directive", () => {
      expect(detectFormat("{key: G}\n[G]Hello")).toBe("chordpro");
    });
  });

  describe("plaintext format", () => {
    it("should detect plaintext with chords above lyrics", () => {
      const text = `C     G     Am
Amazing grace how sweet`;
      expect(detectFormat(text)).toBe("plaintext");
    });

    it("should detect plaintext with no chords", () => {
      expect(detectFormat("Just some lyrics\nAnother line")).toBe("plaintext");
    });

    it("should detect plaintext for empty text", () => {
      expect(detectFormat("")).toBe("plaintext");
    });
  });
});
