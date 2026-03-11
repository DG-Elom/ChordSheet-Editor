import { createClient } from "@/lib/supabase/server";
import { createLLMAdapter } from "@/lib/llm/factory";
import { buildSectionDetectionPrompt, buildChordSuggestionPrompt } from "@/lib/llm/prompts";
import type { LLMProvider } from "@/lib/llm/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { task, payload, config } = body as {
    task: "detect_sections" | "suggest_chords" | "test_connection";
    payload?: string;
    config: { provider: LLMProvider; apiKey: string; model?: string };
  };

  if (!config?.provider || !config?.apiKey) {
    return NextResponse.json({ error: "LLM configuration required" }, { status: 400 });
  }

  try {
    const adapter = createLLMAdapter({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
    });

    if (task === "test_connection") {
      const response = await adapter.chat([{ role: "user", content: "Reply with exactly: OK" }], {
        maxTokens: 10,
      });
      return NextResponse.json({ success: true, content: response.content });
    }

    if (task === "detect_sections" && payload) {
      const messages = buildSectionDetectionPrompt(payload);
      const response = await adapter.chat(messages, { json: true, maxTokens: 4096 });

      // Try to parse the JSON response
      try {
        const parsed = JSON.parse(response.content);
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({ content: response.content });
      }
    }

    if (task === "suggest_chords" && payload) {
      const { lyrics, key } = JSON.parse(payload);
      const messages = buildChordSuggestionPrompt(lyrics, key);
      const response = await adapter.chat(messages, { json: true, maxTokens: 4096 });

      try {
        const parsed = JSON.parse(response.content);
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({ content: response.content });
      }
    }

    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
