import type { LLMProviderAdapter, LLMMessage, LLMResponse } from "../types";

export class ClaudeAdapter implements LLMProviderAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || "claude-sonnet-4-20250514";
  }

  async chat(
    messages: LLMMessage[],
    options?: { json?: boolean; maxTokens?: number },
  ): Promise<LLMResponse> {
    const systemMsg = messages.find((m) => m.role === "system");
    const otherMsgs = messages.filter((m) => m.role !== "system");

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      messages: otherMsgs.map((m) => ({ role: m.role, content: m.content })),
    };

    if (systemMsg) {
      body.system = systemMsg.content;
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    const content = data.content?.[0]?.text || "";

    return {
      content,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens || 0,
            completionTokens: data.usage.output_tokens || 0,
          }
        : undefined,
    };
  }
}
