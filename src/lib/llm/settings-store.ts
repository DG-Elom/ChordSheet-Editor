import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LLMProvider } from "./types";

interface LLMSettingsState {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  enabled: boolean;
  setProvider: (provider: LLMProvider) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setEnabled: (enabled: boolean) => void;
}

export const useLLMSettingsStore = create<LLMSettingsState>()(
  persist(
    (set) => ({
      provider: "gemini",
      apiKey: "",
      model: "",
      enabled: false,
      setProvider: (provider) => set({ provider }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: "chordsheet-llm-settings" },
  ),
);
