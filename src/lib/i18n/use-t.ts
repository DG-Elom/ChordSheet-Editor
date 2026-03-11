"use client";

import { useI18nStore } from "./i18n-store";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { pt } from "./pt";
import type { Dictionary } from "./types";

const dictionaries: Record<string, Dictionary> = { en, fr, es, pt };

export function useT(): Dictionary {
  const locale = useI18nStore((s) => s.locale);
  return dictionaries[locale] ?? en;
}
