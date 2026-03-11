export type LLMProvider = "gemini" | "claude" | "openai";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export interface LLMProviderAdapter {
  chat(
    messages: LLMMessage[],
    options?: { json?: boolean; maxTokens?: number },
  ): Promise<LLMResponse>;
}
