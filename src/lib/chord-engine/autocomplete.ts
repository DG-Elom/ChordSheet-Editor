import { VALID_ROOTS } from "./constants";

/**
 * Map from canonical quality to the suffix used in chord display.
 * This mirrors the QUALITY_DISPLAY map in parser.ts but is used
 * specifically for generating autocomplete suggestions.
 */
const QUALITY_TO_SUFFIX: Record<string, string> = {
  maj: "",
  min: "m",
  "7": "7",
  maj7: "maj7",
  min7: "m7",
  dim: "dim",
  aug: "aug",
  dim7: "dim7",
  m7b5: "m7b5",
  sus2: "sus2",
  sus4: "sus4",
  add9: "add9",
  add11: "add11",
  add13: "add13",
  "9": "9",
  "11": "11",
  "13": "13",
  "6": "6",
  m6: "m6",
  "m(maj7)": "m(maj7)",
  aug7: "aug7",
  maj9: "maj9",
  min9: "m9",
  "7sus4": "7sus4",
  "5": "5",
};

/**
 * Given a partial chord input string, return a list of chord name suggestions.
 *
 * The function works by:
 * 1. Extracting the root note from the input (if present)
 * 2. Taking the remaining string as a partial quality
 * 3. Filtering all known qualities whose display suffix starts with the partial quality
 * 4. Building full chord strings from the root + matching quality suffixes
 *
 * If the input is empty, returns an empty array.
 * If only a partial root is entered (e.g., "A"), also suggests notes that start
 * with that letter (e.g., "Ab", "A#").
 *
 * @param input - The partial chord string typed by the user
 * @param limit - Maximum number of suggestions to return (default: 10)
 * @returns An array of chord name suggestions
 */
export function getChordSuggestions(input: string, limit: number = 10): string[] {
  if (!input || input.trim().length === 0) {
    return [];
  }

  const trimmed = input.trim();
  const suggestions: string[] = [];

  // Try to parse the input as a (possibly partial) chord
  // First, extract the root note
  const rootMatch = trimmed.match(/^([A-Ga-g])(#|b)?/);
  if (!rootMatch) {
    return [];
  }

  const rootLetter = rootMatch[1].toUpperCase();
  const rootAccidental = rootMatch[2] || "";
  const root = rootLetter + rootAccidental;
  const qualityPart = trimmed.slice(rootMatch[0].length);

  // Validate that root is a valid note
  if (!VALID_ROOTS.includes(root)) {
    return [];
  }

  // Generate suggestions based on the quality part
  const suffixes = Object.values(QUALITY_TO_SUFFIX);
  const uniqueSuffixes = [...new Set(suffixes)];

  for (const suffix of uniqueSuffixes) {
    if (suffix.startsWith(qualityPart)) {
      const suggestion = root + suffix;
      if (!suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }
  }

  // If the quality part is empty, also suggest root notes that extend
  // the current input (e.g., "A" -> also suggest "Ab", "A#")
  if (qualityPart === "" && rootAccidental === "") {
    for (const validRoot of VALID_ROOTS) {
      if (
        validRoot.startsWith(rootLetter) &&
        validRoot !== root &&
        !suggestions.includes(validRoot)
      ) {
        suggestions.push(validRoot);
      }
    }
  }

  // Sort suggestions: exact/shorter matches first, then alphabetically
  suggestions.sort((a, b) => {
    // Exact match gets highest priority
    if (a === trimmed) return -1;
    if (b === trimmed) return 1;

    // Shorter suggestions come first
    if (a.length !== b.length) return a.length - b.length;

    // Alphabetical
    return a.localeCompare(b);
  });

  return suggestions.slice(0, limit);
}
