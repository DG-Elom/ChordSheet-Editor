# Testing Strategy

## Setup

- **Framework:** Vitest 4 + @testing-library/react
- **Config:** `vitest.config.ts` (jsdom environment, `@` alias)
- **Location:** `tests/unit/` for unit tests

## Existing Tests

```
tests/unit/chord-engine/
  notation.test.ts      # toLatin, toAngloSaxon conversions
  parser.test.ts        # parseChord, formatChord
  transposer.test.ts    # transpose by semitones
```

## What Must Be Tested

### Priority 1 — Chord Engine (pure functions, highest ROI)

- `parser.ts`: all chord qualities, edge cases, invalid input
- `transposer.ts`: all notes, sharps/flats, octave wrapping
- `notation.ts`: Latin ↔ Anglo-Saxon both directions
- `key-detector.ts`: common progressions
- `autocomplete.ts`: prefix matching
- `capo.ts`: position suggestions

### Priority 2 — Import/Export

- `parse-chordpro.ts`: directives, inline chords, sections
- `parse-plaintext.ts`: chords-above-lyrics detection
- `detect.ts`: format auto-detection
- `to-tiptap.ts`: correct TipTap JSON structure
- Export generators: verify output structure (mock PDF/DOCX libs)

### Priority 3 — API & Hooks

- Zod validators: sheet-schema, section-schema, share-schema
- `use-autosave`: debounce behavior, dirty flag reset
- API routes: auth checks, validation, error responses

## Test Principles

- Pure functions first (chord-engine, parsers)
- Mock Supabase client for hooks/API tests
- Never test TipTap internals — test extracted data instead
- Run `npx vitest run` before every commit
