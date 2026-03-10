"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NotationPreference = "anglo" | "latin";
type ThemePreference = "dark" | "light" | "system";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [notation, setNotation] = useState<NotationPreference>("anglo");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
      setMessage("Failed to save settings. Please try again.");
    } else {
      setMessage("Settings saved successfully.");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="mt-1 text-muted-foreground">Manage your account preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Display name */}
        <div className="space-y-2">
          <label htmlFor="displayName" className="block text-sm font-medium text-foreground">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className={cn(
              "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          />
        </div>

        {/* Notation preference */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Notation Preference</label>
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
          <p className="text-xs text-muted-foreground">Choose how chord names are displayed.</p>
        </div>

        {/* Theme preference */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Theme</label>
          <div className="flex gap-2">
            {(["dark", "light", "system"] as ThemePreference[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors",
                  theme === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && (
            <p
              className={cn(
                "text-sm",
                message.includes("Failed") ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
