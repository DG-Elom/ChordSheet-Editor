import { describe, it, expect } from "vitest";
import { parseChordPro } from "@/lib/import/parse-chordpro";

describe("parseChordPro", () => {
  describe("metadata directives", () => {
    it("should parse {title} directive", () => {
      const result = parseChordPro("{title: Amazing Grace}");
      expect(result.title).toBe("Amazing Grace");
    });

    it("should parse {t} shorthand for title", () => {
      const result = parseChordPro("{t: Amazing Grace}");
      expect(result.title).toBe("Amazing Grace");
    });

    it("should parse {artist} directive", () => {
      const result = parseChordPro("{artist: John Newton}");
      expect(result.artist).toBe("John Newton");
    });

    it("should parse {subtitle} as artist", () => {
      const result = parseChordPro("{subtitle: John Newton}");
      expect(result.artist).toBe("John Newton");
    });

    it("should parse {key} directive", () => {
      const result = parseChordPro("{key: G}");
      expect(result.key).toBe("G");
    });

    it("should parse {tempo} directive", () => {
      const result = parseChordPro("{tempo: 120}");
      expect(result.tempo).toBe("120");
      expect(result.bpm).toBe(120);
    });

    it("should handle non-numeric tempo", () => {
      const result = parseChordPro("{tempo: Allegro}");
      expect(result.tempo).toBe("Allegro");
      expect(result.bpm).toBeUndefined();
    });
  });

  describe("section directives", () => {
    it("should parse {start_of_verse} directive", () => {
      const text = `{start_of_verse}
[C]Amazing [G]grace
{end_of_verse}`;
      const result = parseChordPro(text);
      expect(result.sections[0].type).toBe("verse");
    });

    it("should parse {sov} shorthand", () => {
      const text = `{sov}
[C]Amazing [G]grace
{eov}`;
      const result = parseChordPro(text);
      expect(result.sections[0].type).toBe("verse");
    });

    it("should parse {start_of_chorus} directive", () => {
      const text = `{start_of_chorus}
[Am]How sweet [F]the sound
{end_of_chorus}`;
      const result = parseChordPro(text);
      expect(result.sections[0].type).toBe("chorus");
    });

    it("should parse {soc} shorthand", () => {
      const text = `{soc}
[Am]How sweet
{eoc}`;
      const result = parseChordPro(text);
      expect(result.sections[0].type).toBe("chorus");
    });

    it("should parse {start_of_bridge} directive", () => {
      const text = `{start_of_bridge}
[Em]Through many [D]dangers
{end_of_bridge}`;
      const result = parseChordPro(text);
      expect(result.sections[0].type).toBe("bridge");
    });

    it("should parse section label from directive value", () => {
      const text = `{start_of_verse: Verse 2}
[C]Line one`;
      const result = parseChordPro(text);
      expect(result.sections[0].label).toBe("Verse 2");
    });

    it("should use default label when no value given", () => {
      const text = `{start_of_verse}
[C]Line`;
      const result = parseChordPro(text);
      expect(result.sections[0].label).toBe("Verse");
    });
  });

  describe("inline chord parsing", () => {
    it("should extract chords from [C] notation", () => {
      const text = `{sov}
[C]Amazing [G]grace`;
      const result = parseChordPro(text);
      const line = result.sections[0].lines[0];
      expect(line.chords.length).toBe(2);
      expect(line.chords[0].chord).toBe("C");
      expect(line.chords[1].chord).toBe("G");
    });

    it("should extract lyrics without chord brackets", () => {
      const text = `{sov}
[C]Amazing [G]grace`;
      const result = parseChordPro(text);
      const line = result.sections[0].lines[0];
      expect(line.lyrics).toBe("Amazing grace");
    });

    it("should track chord positions correctly", () => {
      const text = `{sov}
[C]Amazing [G]grace`;
      const result = parseChordPro(text);
      const line = result.sections[0].lines[0];
      expect(line.chords[0].position).toBe(0);
      expect(line.chords[1].position).toBe(8);
    });

    it("should handle line with no chords", () => {
      const text = `{sov}
Just a plain line`;
      const result = parseChordPro(text);
      const line = result.sections[0].lines[0];
      expect(line.chords.length).toBe(0);
      expect(line.lyrics).toBe("Just a plain line");
    });

    it("should handle chord at end of line", () => {
      const text = `{sov}
Amazing grace[C]`;
      const result = parseChordPro(text);
      const line = result.sections[0].lines[0];
      expect(line.chords[0].chord).toBe("C");
      expect(line.lyrics).toBe("Amazing grace");
    });
  });

  describe("implicit sections", () => {
    it("should create a default verse section for content without directives", () => {
      const text = "[C]Amazing [G]grace";
      const result = parseChordPro(text);
      expect(result.sections.length).toBe(1);
      expect(result.sections[0].type).toBe("verse");
    });
  });

  describe("multiple sections", () => {
    it("should parse multiple sections", () => {
      const text = `{start_of_verse}
[C]Line 1
{end_of_verse}
{start_of_chorus}
[Am]Chorus line
{end_of_chorus}`;
      const result = parseChordPro(text);
      expect(result.sections.length).toBe(2);
      expect(result.sections[0].type).toBe("verse");
      expect(result.sections[1].type).toBe("chorus");
    });
  });

  describe("empty input", () => {
    it("should return a default empty section for empty input", () => {
      const result = parseChordPro("");
      expect(result.sections.length).toBe(1);
      expect(result.sections[0].type).toBe("verse");
      expect(result.sections[0].lines.length).toBe(0);
    });
  });

  describe("full document", () => {
    it("should parse a complete ChordPro document", () => {
      const text = `{title: Amazing Grace}
{artist: John Newton}
{key: G}
{tempo: 90}

{start_of_verse: Verse 1}
[G]Amazing [G7]grace how [C]sweet the [G]sound
That [G]saved a [Em]wretch like [D]me
{end_of_verse}

{start_of_chorus}
[C]I once was [G]lost
{end_of_chorus}`;
      const result = parseChordPro(text);
      expect(result.title).toBe("Amazing Grace");
      expect(result.artist).toBe("John Newton");
      expect(result.key).toBe("G");
      expect(result.bpm).toBe(90);
      expect(result.sections.length).toBe(2);
      expect(result.sections[0].type).toBe("verse");
      expect(result.sections[0].label).toBe("Verse 1");
      expect(result.sections[1].type).toBe("chorus");
    });
  });
});
