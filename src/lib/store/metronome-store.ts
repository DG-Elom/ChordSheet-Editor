import { create } from "zustand";

interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  beatsPerMeasure: number;
  currentBeat: number;
  setPlaying: (playing: boolean) => void;
  setBpm: (bpm: number) => void;
  setBeatsPerMeasure: (beats: number) => void;
  setCurrentBeat: (beat: number) => void;
}

export const useMetronomeStore = create<MetronomeState>((set) => ({
  isPlaying: false,
  bpm: 120,
  beatsPerMeasure: 4,
  currentBeat: 0,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setBpm: (bpm) => set({ bpm }),
  setBeatsPerMeasure: (beatsPerMeasure) => set({ beatsPerMeasure }),
  setCurrentBeat: (currentBeat) => set({ currentBeat }),
}));
