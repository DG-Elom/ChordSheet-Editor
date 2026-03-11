import { create } from "zustand";

interface PerformanceState {
  isActive: boolean;
  scrollSpeed: number;
  fontSize: number;
  setActive: (active: boolean) => void;
  setScrollSpeed: (speed: number) => void;
  setFontSize: (size: number) => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  isActive: false,
  scrollSpeed: 30,
  fontSize: 1,
  setActive: (isActive) => set({ isActive }),
  setScrollSpeed: (scrollSpeed) => set({ scrollSpeed }),
  setFontSize: (fontSize) => set({ fontSize }),
}));
