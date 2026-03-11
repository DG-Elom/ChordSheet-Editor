import type { LLMProviderAdapter, LLMMessage, LLMResponse } from "../types";

export class OpenAIAdapter implements LLMProviderAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || "gpt-4o-mini";
  }

  async chat(
    messages: LLMMessage[],
    options?: { json?: boolean; maxTokens?: number },
  ): Promise<LLMResponse> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: options?.maxTokens || 4096,
    };

    if (options?.json) {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    return {
      content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
          }
        : undefined,
    };
  }
}
