"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useI18nStore } from "@/lib/i18n/i18n-store";
import { useLLMSettingsStore } from "@/lib/llm/settings-store";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/types";
import type { LLMProvider } from "@/lib/llm/types";

type NotationPreference = "anglo" | "latin";
type ThemePreference = "dark" | "light" | "system";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const t = useT();
  const { locale, setLocale } = useI18nStore();
  const llm = useLLMSettingsStore();

  const [displayName, setDisplayName] = useState("");
  const [notation, setNotation] = useState<NotationPreference>("anglo");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // LLM test connection state
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setDisplayName(user.user_metadata?.display_name || user.user_metadata?.full_name || "");
        setNotation(user.user_metadata?.notation_preference || "anglo");
      }
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        notation_preference: notation,
      },
    });

    if (error) {
      setMessage(t.settingsFailed);
    } else {
      setMessage(t.settingsSaved);
    }
    setSaving(false);
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestMessage("");

    try {
      const res = await fetch("/api/llm/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "test_connection",
          payload: {},
          config: {
            provider: llm.provider,
            apiKey: llm.apiKey,
            model: llm.model || undefined,
          },
        }),
      });

      if (res.ok) {
        setTestMessage(t.connectionSuccess);
      } else {
        setTestMessage(t.connectionFailed);
      }
    } catch {
      setTestMessage(t.connectionFailed);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t.settingsTitle}</h2>
        <p className="mt-1 text-muted-foreground">{t.managePreferences}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Display name */}
        <div className="space-y-2">
          <label htmlFor="displayName" className="block text-sm font-medium text-foreground">
            {t.displayName}
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t.yourName}
            className={cn(
              "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          />
        </div>

        {/* Notation preference */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t.notationPreference}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNotation("anglo")}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                notation === "anglo"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted",
              )}
            >
              Anglo-Saxon (C, D, E)
            </button>
            <button
              type="button"
              onClick={() => setNotation("latin")}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                notation === "latin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted",
              )}
            >
              Latin (Do, Re, Mi)
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{t.notationHelp}</p>
        </div>

        {/* Theme preference */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">{t.theme}</label>
          <div className="flex gap-2">
            {(["dark", "light", "system"] as ThemePreference[]).map((t_val) => (
              <button
                key={t_val}
                type="button"
                onClick={() => setTheme(t_val)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors",
                  theme === t_val
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted",
                )}
              >
                {t_val}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">{t.language}</label>
          <div className="flex gap-2">
            {(
              [
                { value: "en", label: "English" },
                { value: "fr", label: "Fran\u00e7ais" },
                { value: "es", label: "Espa\u00f1ol" },
                { value: "pt", label: "Portugu\u00eas" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLocale(value as Locale)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  locale === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t.languageHelp}</p>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
              "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            {saving ? t.saving : t.saveChanges}
          </button>
          {message && (
            <p
              className={cn(
                "text-sm",
                message === t.settingsFailed ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {message}
            </p>
          )}
        </div>
      </form>

      {/* AI Assistant section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t.aiAssistant}</h3>
        </div>

        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">{t.aiEnabled}</label>
          <button
            type="button"
            role="switch"
            aria-checked={llm.enabled}
            onClick={() => llm.setEnabled(!llm.enabled)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              llm.enabled ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                llm.enabled ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        {llm.enabled && (
          <div className="space-y-4">
            {/* Provider selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t.aiProvider}</label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "gemini", label: "Gemini" },
                    { value: "claude", label: "Claude" },
                    { value: "openai", label: "OpenAI" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => llm.setProvider(value as LLMProvider)}
                    className={cn(
                      "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      llm.provider === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-muted",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-medium text-foreground">
                {t.aiApiKey}
              </label>
              <input
                id="apiKey"
                type="password"
                value={llm.apiKey}
                onChange={(e) => llm.setApiKey(e.target.value)}
                placeholder="sk-..."
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              />
            </div>

            {/* Model override */}
            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-medium text-foreground">
                {t.aiModel}
              </label>
              <input
                id="model"
                type="text"
                value={llm.model}
                onChange={(e) => llm.setModel(e.target.value)}
                placeholder={
                  llm.provider === "gemini"
                    ? "gemini-2.0-flash"
                    : llm.provider === "claude"
                      ? "claude-sonnet-4-20250514"
                      : "gpt-4o-mini"
                }
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              />
            </div>

            {/* Test Connection */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !llm.apiKey}
                className={cn(
                  "rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors",
                  "hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                {testing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.loading}
                  </span>
                ) : (
                  t.testConnection
                )}
              </button>
              {testMessage && (
                <p
                  className={cn(
                    "text-sm",
                    testMessage === t.connectionSuccess ? "text-green-500" : "text-destructive",
                  )}
                >
                  {testMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
