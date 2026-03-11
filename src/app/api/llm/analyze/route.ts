import { createClient } from "@/lib/supabase/server";
import { createLLMAdapter } from "@/lib/llm/factory";
import { buildSectionDetectionPrompt, buildChordSuggestionPrompt } from "@/lib/llm/prompts";
import {
  buildLyricsGenerationPrompt,
  buildHarmonizationPrompt,
  buildHarmonicAnalysisPrompt,
} from "@/lib/llm/prompts-extended";
import type { LLMProvider } from "@/lib/llm/types";
import { NextResponse } from "next/server";

type TaskType =
  | "detect_sections"
  | "suggest_chords"
  | "test_connection"
  | "generate_lyrics"
  | "harmonize"
  | "analyze_harmony";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { task, payload, content, key, config } = body as {
    task: TaskType;
    payload?: string;
    content?: string;
    key?: string;
    config?: { provider: LLMProvider; apiKey: string; model?: string };
  };

  // Config can come from body or from user's stored settings
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
      try {
        return NextResponse.json(JSON.parse(response.content));
      } catch {
        return NextResponse.json({ content: response.content });
      }
    }

    if (task === "suggest_chords") {
      const text = content || payload || "";
      const messages = buildChordSuggestionPrompt(text, key);
      const response = await adapter.chat(messages, { json: true, maxTokens: 4096 });
      try {
        return NextResponse.json({ result: JSON.parse(response.content) });
      } catch {
        return NextResponse.json({ result: response.content });
      }
    }

    if (task === "generate_lyrics") {
      const theme = content || payload || "";
      const messages = buildLyricsGenerationPrompt(theme, undefined, key);
      const response = await adapter.chat(messages, { json: true, maxTokens: 4096 });
      try {
        return NextResponse.json({ result: JSON.parse(response.content) });
      } catch {
        return NextResponse.json({ result: response.content });
      }
    }

    if (task === "harmonize") {
      const text = content || payload || "";
      const chords = text.split(/[\s,]+/).filter(Boolean);
      const messages = buildHarmonizationPrompt(chords, key);
      const response = await adapter.chat(messages, { json: true, maxTokens: 4096 });
      try {
        return NextResponse.json({ result: JSON.parse(response.content) });
      } catch {
        return NextResponse.json({ result: response.content });
      }
    }

    if (task === "analyze_harmony") {
      const text = content || payload || "";
      const messages = buildHarmonicAnalysisPrompt(text, key);
      const response = await adapter.chat(messages, { json: true, maxTokens: 4096 });
      try {
        return NextResponse.json({ result: JSON.parse(response.content) });
      } catch {
        return NextResponse.json({ result: response.content });
      }
    }

    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
