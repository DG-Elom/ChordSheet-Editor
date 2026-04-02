# Skill: Chord Engine

## Location

`src/lib/chord-engine/` — pure TypeScript, no React dependency.

## Core API

```typescript
import {
  parseChord, // "Cm7/G" → { root: "C", quality: "min7", bass: "G" }
  formatChord, // { root, quality, bass } → "Cm7/G"
  transpose, // transpose(chord, semitones) → new Chord
  transposeNote, // transposeNote("C", 3) → "Eb"
  getChordSuggestions, // getChordSuggestions("Cm", 10) → autocomplete list
  detectKey, // detectKey(["C", "Am", "F", "G"]) → "C"
  getCapoChords, // getCapoChords("G", 2) → chords at capo 2
  suggestCapoPositions, // suggestCapoPositions(chords) → [{ fret, chords }]
  toLatin, // "C" → "Do", "D" → "Re"
  toAngloSaxon, // "Do" → "C", "Re" → "D"
  convertNotation, // convert array of chords between notations
} from "@/lib/chord-engine";
```

## Supported Notations

- **Anglo-Saxon:** C, C#, Db, D, D#, Eb, E, F, F#, Gb, G, G#, Ab, A, A#, Bb, B
- **Latin:** Do, Do#, Reb, Re, Re#, Mib, Mi, Fa, Fa#, Solb, Sol, Sol#, Lab, La, La#, Sib, Si

## Supported Qualities

25+: maj, min, 7, maj7, min7, dim, dim7, aug, aug7, sus2, sus4, 9, 11, 13, add9, add11, add13, m7b5, 6, m6, etc.

## Chord Diagrams

```typescript
import { GUITAR_CHORDS, UKULELE_CHORDS, PIANO_CHORDS } from "@/lib/chord-engine/diagrams";
// Lookup: GUITAR_CHORDS["C"]["maj"] → fret positions
```

## Adding a New Quality

1. Add alias in `constants.ts` QUALITY_ALIASES
2. Add display format in `formatChord` switch
3. Add diagrams in `diagrams.ts` if available
4. Add to test cases in `tests/unit/chord-engine/parser.test.ts`
