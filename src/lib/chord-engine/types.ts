export type NoteName = string; // "C", "C#", "Db", "D", etc.

export interface Chord {
  root: NoteName;
  quality: string; // "maj", "min", "7", "maj7", "min7", "dim", "aug", "sus2", "sus4", "add9", etc.
  bass: NoteName | null; // for slash chords like C/E
}

export interface ChordToken {
  input: string; // original string e.g. "Am7/E"
  chord: Chord; // parsed chord
  display: string; // formatted display string
}
