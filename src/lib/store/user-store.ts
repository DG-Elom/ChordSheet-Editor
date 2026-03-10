import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotationPreference, ThemePreference } from "@/types/database.types";

interface UserState {
  notation: NotationPreference;
  theme: ThemePreference;
  setNotation: (notation: NotationPreference) => void;
  setTheme: (theme: ThemePreference) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      notation: "anglo_saxon",
      theme: "dark",
      setNotation: (notation) => set({ notation }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "chordsheet-user-preferences" },
  ),
);
