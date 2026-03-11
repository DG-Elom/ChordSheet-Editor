"use client";

import { useI18nStore } from "./i18n-store";
import { en } from "./en";
import { fr } from "./fr";
import type { Dictionary } from "./types";

const dictionaries: Record<string, Dictionary> = { en, fr };

export function useT(): Dictionary {
  const locale = useI18nStore((s) => s.locale);
  return dictionaries[locale] ?? en;
}
