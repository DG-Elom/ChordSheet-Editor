import type { LLMConfig, LLMProviderAdapter } from "./types";
import { GeminiAdapter } from "./providers/gemini";
import { ClaudeAdapter } from "./providers/claude";
import { OpenAIAdapter } from "./providers/openai";

export function createLLMAdapter(config: LLMConfig): LLMProviderAdapter {
  switch (config.provider) {
    case "gemini":
      return new GeminiAdapter(config.apiKey, config.model);
    case "claude":
      return new ClaudeAdapter(config.apiKey, config.model);
    case "openai":
      return new OpenAIAdapter(config.apiKey, config.model);
    default:
      throw new Error(`Unknown LLM provider: ${config.provider}`);
  }
}
