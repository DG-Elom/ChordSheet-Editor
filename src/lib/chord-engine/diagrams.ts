export interface ChordDiagram {
  name: string;
  positions: number[];
  barres: { fret: number; from: number; to: number }[];
  baseFret: number;
}

export interface PianoChordData {
  name: string;
  notes: number[];
}

export const GUITAR_CHORDS: Record<string, ChordDiagram> = {
  C_maj: { name: "C", positions: [-1, 3, 2, 0, 1, 0], barres: [], baseFret: 1 },
  D_maj: { name: "D", positions: [-1, -1, 0, 2, 3, 2], barres: [], baseFret: 1 },
  E_maj: { name: "E", positions: [0, 2, 2, 1, 0, 0], barres: [], baseFret: 1 },
  F_maj: {
    name: "F",
    positions: [1, 3, 3, 2, 1, 1],
    barres: [{ fret: 1, from: 0, to: 5 }],
    baseFret: 1,
  },
  G_maj: { name: "G", positions: [3, 2, 0, 0, 0, 3], barres: [], baseFret: 1 },
  A_maj: { name: "A", positions: [-1, 0, 2, 2, 2, 0], barres: [], baseFret: 1 },
  B_maj: {
    name: "B",
    positions: [-1, 2, 4, 4, 4, 2],
    barres: [{ fret: 2, from: 1, to: 5 }],
    baseFret: 1,
  },
  Bb_maj: {
    name: "Bb",
    positions: [-1, 1, 3, 3, 3, 1],
    barres: [{ fret: 1, from: 1, to: 5 }],
    baseFret: 1,
  },
  Eb_maj: { name: "Eb", positions: [-1, -1, 1, 3, 4, 3], barres: [], baseFret: 1 },
  Ab_maj: {
    name: "Ab",
    positions: [4, 6, 6, 5, 4, 4],
    barres: [{ fret: 4, from: 0, to: 5 }],
    baseFret: 1,
  },
  "F#_maj": {
    name: "F#",
    positions: [2, 4, 4, 3, 2, 2],
    barres: [{ fret: 2, from: 0, to: 5 }],
    baseFret: 1,
  },
  "C#_maj": {
    name: "C#",
    positions: [-1, 4, 3, 1, 2, 1],
    barres: [{ fret: 1, from: 2, to: 5 }],
    baseFret: 1,
  },
  C_min: {
    name: "Cm",
    positions: [-1, 3, 5, 5, 4, 3],
    barres: [{ fret: 3, from: 1, to: 5 }],
    baseFret: 1,
  },
  D_min: { name: "Dm", positions: [-1, -1, 0, 2, 3, 1], barres: [], baseFret: 1 },
  E_min: { name: "Em", positions: [0, 2, 2, 0, 0, 0], barres: [], baseFret: 1 },
  F_min: {
    name: "Fm",
    positions: [1, 3, 3, 1, 1, 1],
    barres: [{ fret: 1, from: 0, to: 5 }],
    baseFret: 1,
  },
  G_min: {
    name: "Gm",
    positions: [3, 5, 5, 3, 3, 3],
    barres: [{ fret: 3, from: 0, to: 5 }],
    baseFret: 1,
  },
  A_min: { name: "Am", positions: [-1, 0, 2, 2, 1, 0], barres: [], baseFret: 1 },
  B_min: {
    name: "Bm",
    positions: [-1, 2, 4, 4, 3, 2],
    barres: [{ fret: 2, from: 1, to: 5 }],
    baseFret: 1,
  },
  "F#_min": {
    name: "F#m",
    positions: [2, 4, 4, 2, 2, 2],
    barres: [{ fret: 2, from: 0, to: 5 }],
    baseFret: 1,
  },
  "C#_min": {
    name: "C#m",
    positions: [-1, 4, 6, 6, 5, 4],
    barres: [{ fret: 4, from: 1, to: 5 }],
    baseFret: 1,
  },
  Bb_min: {
    name: "Bbm",
    positions: [-1, 1, 3, 3, 2, 1],
    barres: [{ fret: 1, from: 1, to: 5 }],
    baseFret: 1,
  },
  C_7: { name: "C7", positions: [-1, 3, 2, 3, 1, 0], barres: [], baseFret: 1 },
  D_7: { name: "D7", positions: [-1, -1, 0, 2, 1, 2], barres: [], baseFret: 1 },
  E_7: { name: "E7", positions: [0, 2, 0, 1, 0, 0], barres: [], baseFret: 1 },
  G_7: { name: "G7", positions: [3, 2, 0, 0, 0, 1], barres: [], baseFret: 1 },
  A_7: { name: "A7", positions: [-1, 0, 2, 0, 2, 0], barres: [], baseFret: 1 },
  B_7: { name: "B7", positions: [-1, 2, 1, 2, 0, 2], barres: [], baseFret: 1 },
  A_min7: { name: "Am7", positions: [-1, 0, 2, 0, 1, 0], barres: [], baseFret: 1 },
  D_min7: { name: "Dm7", positions: [-1, -1, 0, 2, 1, 1], barres: [], baseFret: 1 },
  E_min7: { name: "Em7", positions: [0, 2, 0, 0, 0, 0], barres: [], baseFret: 1 },
  C_maj7: { name: "Cmaj7", positions: [-1, 3, 2, 0, 0, 0], barres: [], baseFret: 1 },
  G_maj7: { name: "Gmaj7", positions: [3, 2, 0, 0, 0, 2], barres: [], baseFret: 1 },
  A_maj7: { name: "Amaj7", positions: [-1, 0, 2, 1, 2, 0], barres: [], baseFret: 1 },
  A_sus2: { name: "Asus2", positions: [-1, 0, 2, 2, 0, 0], barres: [], baseFret: 1 },
  D_sus2: { name: "Dsus2", positions: [-1, -1, 0, 2, 3, 0], barres: [], baseFret: 1 },
  A_sus4: { name: "Asus4", positions: [-1, 0, 2, 2, 3, 0], barres: [], baseFret: 1 },
  D_sus4: { name: "Dsus4", positions: [-1, -1, 0, 2, 3, 3], barres: [], baseFret: 1 },
  E_sus4: { name: "Esus4", positions: [0, 2, 2, 2, 0, 0], barres: [], baseFret: 1 },
};

export const UKULELE_CHORDS: Record<string, ChordDiagram> = {
  C_maj: { name: "C", positions: [0, 0, 0, 3], barres: [], baseFret: 1 },
  D_maj: { name: "D", positions: [2, 2, 2, 0], barres: [], baseFret: 1 },
  E_maj: { name: "E", positions: [1, 4, 0, 2], barres: [], baseFret: 1 },
  F_maj: { name: "F", positions: [2, 0, 1, 0], barres: [], baseFret: 1 },
  G_maj: { name: "G", positions: [0, 2, 3, 2], barres: [], baseFret: 1 },
  A_maj: { name: "A", positions: [2, 1, 0, 0], barres: [], baseFret: 1 },
  B_maj: {
    name: "B",
    positions: [4, 3, 2, 2],
    barres: [{ fret: 2, from: 2, to: 3 }],
    baseFret: 1,
  },
  A_min: { name: "Am", positions: [2, 0, 0, 0], barres: [], baseFret: 1 },
  D_min: { name: "Dm", positions: [2, 2, 1, 0], barres: [], baseFret: 1 },
  E_min: { name: "Em", positions: [0, 4, 3, 2], barres: [], baseFret: 1 },
  G_min: { name: "Gm", positions: [0, 2, 3, 1], barres: [], baseFret: 1 },
  C_7: { name: "C7", positions: [0, 0, 0, 1], barres: [], baseFret: 1 },
  G_7: { name: "G7", positions: [0, 2, 1, 2], barres: [], baseFret: 1 },
  A_7: { name: "A7", positions: [0, 1, 0, 0], barres: [], baseFret: 1 },
  A_min7: { name: "Am7", positions: [0, 0, 0, 0], barres: [], baseFret: 1 },
};

export const PIANO_CHORDS: Record<string, PianoChordData> = {
  C_maj: { name: "C", notes: [60, 64, 67] },
  D_maj: { name: "D", notes: [62, 66, 69] },
  E_maj: { name: "E", notes: [64, 68, 71] },
  F_maj: { name: "F", notes: [65, 69, 72] },
  G_maj: { name: "G", notes: [67, 71, 74] },
  A_maj: { name: "A", notes: [69, 73, 76] },
  B_maj: { name: "B", notes: [71, 75, 78] },
  C_min: { name: "Cm", notes: [60, 63, 67] },
  D_min: { name: "Dm", notes: [62, 65, 69] },
  E_min: { name: "Em", notes: [64, 67, 71] },
  F_min: { name: "Fm", notes: [65, 68, 72] },
  G_min: { name: "Gm", notes: [67, 70, 74] },
  A_min: { name: "Am", notes: [69, 72, 76] },
  B_min: { name: "Bm", notes: [71, 74, 78] },
  C_7: { name: "C7", notes: [60, 64, 67, 70] },
  D_7: { name: "D7", notes: [62, 66, 69, 72] },
  E_7: { name: "E7", notes: [64, 68, 71, 74] },
  G_7: { name: "G7", notes: [67, 71, 74, 77] },
  A_7: { name: "A7", notes: [69, 73, 76, 79] },
  C_maj7: { name: "Cmaj7", notes: [60, 64, 67, 71] },
  A_min7: { name: "Am7", notes: [69, 72, 76, 79] },
  D_min7: { name: "Dm7", notes: [62, 65, 69, 72] },
  E_min7: { name: "Em7", notes: [64, 67, 71, 74] },
};

export function getChordDiagram(
  root: string,
  quality: string,
  instrument: "guitar" | "ukulele" | "piano",
): ChordDiagram | PianoChordData | null {
  const qualityMap: Record<string, string> = {
    maj: "maj",
    min: "min",
    "7": "7",
    maj7: "maj7",
    min7: "min7",
    dim: "dim",
    aug: "aug",
    sus2: "sus2",
    sus4: "sus4",
  };

  const normalizedQuality = qualityMap[quality] || quality;
  const key = `${root}_${normalizedQuality}`;

  const db =
    instrument === "guitar"
      ? GUITAR_CHORDS
      : instrument === "ukulele"
        ? UKULELE_CHORDS
        : PIANO_CHORDS;

  if (key in db) return db[key] as ChordDiagram | PianoChordData;

  const enharmonics: Record<string, string> = {
    "C#": "Db",
    Db: "C#",
    "D#": "Eb",
    Eb: "D#",
    "F#": "Gb",
    Gb: "F#",
    "G#": "Ab",
    Ab: "G#",
    "A#": "Bb",
    Bb: "A#",
  };

  if (root in enharmonics) {
    const altKey = `${enharmonics[root]}_${normalizedQuality}`;
    if (altKey in db) return db[altKey] as ChordDiagram | PianoChordData;
  }

  return null;
}
