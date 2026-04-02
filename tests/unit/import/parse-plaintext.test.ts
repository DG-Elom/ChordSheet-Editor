import { describe, it, expect } from "vitest";
import { parsePlainText } from "@/lib/import/parse-plaintext";

describe("parsePlainText", () => {
  describe("chords above lyrics", () => {
    it("should pair chord line with lyric line below", () => {
      const text = `Verse
C     G     Am
Amazing grace how sweet`;
      const result = parsePlainText(text);
      const line = result.sections[0].lines[0];
      expect(line.chords.length).toBe(3);
      expect(line.chords[0].chord).toBe("C");
      expect(line.chords[1].chord).toBe("G");
      expect(line.chords[2].chord).toBe("Am");
      expect(line.lyrics).toBe("Amazing grace how sweet");
    });

    it("should track chord positions from original spacing", () => {
      const text = `Verse
C     G
Hello world`;
      const result = parsePlainText(text);
      const line = result.sections[0].lines[0];
      expect(line.chords[0].position).toBe(0);
      expect(line.chords[1].position).toBe(6);
    });
  });

  describe("section detection", () => {
    it("should detect Verse section marker", () => {
      const text = `Verse
C     G
Hello world`;
      const result = parsePlainText(text);
      expect(result.sections[0].type).toBe("verse");
      expect(result.sections[0].label).toBe("Verse");
    });

    it("should detect Chorus section marker", () => {
      const text = `Chorus
Am    F
How sweet the sound`;
      const result = parsePlainText(text);
      expect(result.sections[0].type).toBe("chorus");
    });

    it("should detect multiple sections", () => {
      const text = `Verse
C     G
Hello world

Chorus
Am    F
Sweet sound`;
      const result = parsePlainText(text);
      expect(result.sections.length).toBe(2);
      expect(result.sections[0].type).toBe("verse");
      expect(result.sections[1].type).toBe("chorus");
    });
  });

  describe("title and artist detection", () => {
    it("should detect title from first non-chord line", () => {
      const text = `Amazing Grace
John Newton

Verse
C     G
Hello world`;
      const result = parsePlainText(text);
      expect(result.title).toBe("Amazing Grace");
    });

    it("should detect artist from second non-chord line", () => {
      const text = `Amazing Grace
John Newton

Verse
C     G
Hello world`;
      const result = parsePlainText(text);
      expect(result.artist).toBe("John Newton");
    });
  });

  describe("chord-only lines", () => {
    it("should handle chord line followed by empty line", () => {
      const text = `Verse
C  G  Am  F

Another line`;
      const result = parsePlainText(text);
      // The chord line before empty should be added as chord-only
      const firstLine = result.sections[0].lines[0];
      expect(firstLine.chords.length).toBeGreaterThan(0);
      expect(firstLine.lyrics).toBe("");
    });
  });

  describe("lyric-only lines", () => {
    it("should handle lyric line without chords above", () => {
      const text = `Verse
Just a lyric line`;
      const result = parsePlainText(text);
      const line = result.sections[0].lines[0];
      expect(line.lyrics).toBe("Just a lyric line");
      expect(line.chords.length).toBe(0);
    });
  });

  describe("default section", () => {
    it("should create default verse section when no section marker", () => {
      const text = `C     G
Hello world`;
      const result = parsePlainText(text);
      expect(result.sections.length).toBeGreaterThanOrEqual(1);
      expect(result.sections[0].type).toBe("verse");
    });
  });

  describe("empty input", () => {
    it("should return default section for empty input", () => {
      const result = parsePlainText("");
      expect(result.sections.length).toBe(1);
      expect(result.sections[0].type).toBe("verse");
      expect(result.sections[0].lines.length).toBe(0);
    });
  });

  describe("trailing chord line", () => {
    it("should handle chord line at end of input", () => {
      const text = `Verse
C  G  Am`;
      const result = parsePlainText(text);
      const lastLine = result.sections[0].lines[result.sections[0].lines.length - 1];
      expect(lastLine.chords.length).toBeGreaterThan(0);
    });
  });
});
