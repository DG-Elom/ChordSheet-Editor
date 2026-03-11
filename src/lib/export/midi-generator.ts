// Simple MIDI file generator for chord progressions
// Generates a Type 0 MIDI file with chord notes

const NOTE_MAP: Record<string, number> = {
  C: 60,
  "C#": 61,
  Db: 61,
  D: 62,
  "D#": 63,
  Eb: 63,
  E: 64,
  F: 65,
  "F#": 66,
  Gb: 66,
  G: 67,
  "G#": 68,
  Ab: 68,
  A: 69,
  "A#": 70,
  Bb: 70,
  B: 71,
};

interface ChordNotes {
  root: number;
  notes: number[];
}

function parseChordToMidi(chord: string): ChordNotes | null {
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return null;

  const rootNote = match[1];
  const quality = match[2].toLowerCase();
  const root = NOTE_MAP[rootNote];
  if (root === undefined) return null;

  let intervals: number[];

  if (quality.includes("dim")) {
    intervals = [0, 3, 6];
  } else if (quality.includes("aug")) {
    intervals = [0, 4, 8];
  } else if (quality.includes("m") && !quality.includes("maj")) {
    intervals = [0, 3, 7];
    if (quality.includes("7")) intervals.push(10);
  } else if (quality.includes("maj7")) {
    intervals = [0, 4, 7, 11];
  } else if (quality.includes("7")) {
    intervals = [0, 4, 7, 10];
  } else if (quality.includes("sus4")) {
    intervals = [0, 5, 7];
  } else if (quality.includes("sus2")) {
    intervals = [0, 2, 7];
  } else {
    intervals = [0, 4, 7]; // Major triad
  }

  return { root, notes: intervals.map((i) => root + i) };
}

function writeVarLen(value: number): number[] {
  const bytes: number[] = [];
  let v = value;
  bytes.unshift(v & 0x7f);
  v >>= 7;
  while (v > 0) {
    bytes.unshift((v & 0x7f) | 0x80);
    v >>= 7;
  }
  return bytes;
}

function writeInt16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

function writeInt32(value: number): number[] {
  return [(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

export function generateMidi(chords: string[], bpm: number = 120, beatsPerChord: number = 4): Blob {
  const ticksPerBeat = 480;
  const chordDuration = ticksPerBeat * beatsPerChord;
  const velocity = 80;

  // Build track data
  const trackData: number[] = [];

  // Tempo meta event (at delta 0)
  const microsecondsPerBeat = Math.round(60000000 / bpm);
  trackData.push(...writeVarLen(0)); // delta
  trackData.push(0xff, 0x51, 0x03); // tempo meta
  trackData.push(
    (microsecondsPerBeat >> 16) & 0xff,
    (microsecondsPerBeat >> 8) & 0xff,
    microsecondsPerBeat & 0xff,
  );

  // Track name
  const trackName = "Chords";
  trackData.push(...writeVarLen(0)); // delta
  trackData.push(0xff, 0x03, trackName.length);
  for (let i = 0; i < trackName.length; i++) trackData.push(trackName.charCodeAt(i));

  // Program change (piano)
  trackData.push(...writeVarLen(0)); // delta
  trackData.push(0xc0, 0); // channel 0, piano

  // Generate notes for each chord
  for (const chord of chords) {
    const parsed = parseChordToMidi(chord.trim());
    if (!parsed) continue;

    // Note on events (delta 0 for simultaneous notes)
    for (let i = 0; i < parsed.notes.length; i++) {
      trackData.push(...writeVarLen(0)); // delta
      trackData.push(0x90, parsed.notes[i], velocity); // note on
    }

    // Note off events after chord duration
    for (let i = 0; i < parsed.notes.length; i++) {
      trackData.push(...writeVarLen(i === 0 ? chordDuration : 0)); // only first gets duration
      trackData.push(0x80, parsed.notes[i], 0); // note off
    }
  }

  // End of track
  trackData.push(...writeVarLen(0));
  trackData.push(0xff, 0x2f, 0x00);

  // Build MIDI file
  const midi: number[] = [];

  // Header chunk: MThd
  midi.push(0x4d, 0x54, 0x68, 0x64); // "MThd"
  midi.push(...writeInt32(6)); // header length
  midi.push(...writeInt16(0)); // format 0
  midi.push(...writeInt16(1)); // 1 track
  midi.push(...writeInt16(ticksPerBeat)); // ticks per beat

  // Track chunk: MTrk
  midi.push(0x4d, 0x54, 0x72, 0x6b); // "MTrk"
  midi.push(...writeInt32(trackData.length));
  midi.push(...trackData);

  return new Blob([new Uint8Array(midi)], { type: "audio/midi" });
}
