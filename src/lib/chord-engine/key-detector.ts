import type { Chord } from "./types";
import { NOTES_SHARP, NOTES_FLAT } from "./constants";

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_SCALE_QUALITIES = ["maj", "min", "min", "maj", "maj", "min", "dim"];

const MAJOR_KEY_CHORDS: Record<string, { root: string; quality: string }[]> = {};

for (let i = 0; i < 12; i++) {
  const keyRoot = NOTES_SHARP[i];
  MAJOR_KEY_CHORDS[keyRoot] = MAJOR_SCALE_INTERVALS.map((interval, idx) => ({
    root: NOTES_SHARP[(i + interval) % 12],
    quality: MAJOR_SCALE_QUALITIES[idx],
  }));
}

function normalizeNote(note: string): number {
  const idx = NOTES_SHARP.indexOf(note);
  if (idx !== -1) return idx;
  const flatIdx = NOTES_FLAT.indexOf(note);
  if (flatIdx !== -1) return flatIdx;
  return -1;
}

export function detectKey(chords: Chord[]): { key: string; confidence: number } | null {
  if (chords.length === 0) return null;

  let bestKey = "C";
  let bestScore = -1;

  for (const keyRoot of NOTES_SHARP) {
    const diatonic = MAJOR_KEY_CHORDS[keyRoot];
    let score = 0;

    for (let i = 0; i < chords.length; i++) {
      const chord = chords[i];
      const posWeight = i === 0 || i === chords.length - 1 ? 2 : 1;

      const fits = diatonic.some((d) => {
        if (normalizeNote(d.root) !== normalizeNote(chord.root)) return false;
        const cq = chord.quality;
        if (d.quality === "maj")
          return ["maj", "7", "maj7", "6", "add9", "sus4", "sus2", "9", "13"].includes(cq);
        if (d.quality === "min")
          return ["min", "min7", "m6", "min9", "m(maj7)", "m7b5"].includes(cq);
        if (d.quality === "dim") return ["dim", "dim7", "m7b5"].includes(cq);
        return false;
      });

      if (fits) {
        score += posWeight;
        if (normalizeNote(chord.root) === normalizeNote(keyRoot)) {
          score += posWeight * 0.5;
        }
        const fifth = NOTES_SHARP[(NOTES_SHARP.indexOf(keyRoot) + 7) % 12];
        if (normalizeNote(chord.root) === normalizeNote(fifth)) {
          score += posWeight * 0.3;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestKey = keyRoot;
    }
  }

  const confidence = Math.min(1, bestScore / Math.max(1, chords.length * 1.5));
  return { key: bestKey, confidence };
}
