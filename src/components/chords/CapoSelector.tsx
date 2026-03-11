"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { getCapoChords, suggestCapoPositions } from "@/lib/chord-engine/capo";
import type { Chord } from "@/lib/chord-engine/types";

interface CapoSelectorProps {
  chords: Chord[];
  songKey?: string;
  onCapoChange?: (capo: number) => void;
}

export function CapoSelector({ chords, songKey, onCapoChange }: CapoSelectorProps) {
  const t = useT();
  const [capo, setCapo] = useState(0);

  const suggestions = chords.length > 0 ? suggestCapoPositions(chords) : [];
  const capoChords = capo > 0 ? getCapoChords(chords, capo) : null;

  function handleCapoChange(newCapo: number) {
    setCapo(newCapo);
    onCapoChange?.(newCapo);
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{t.capo}</span>
        <span className="text-xs text-muted-foreground">
          {capo === 0 ? t.noCapo : `${t.capoFret} ${capo}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 13 }, (_, i) => (
          <button
            key={i}
            onClick={() => handleCapoChange(i)}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              capo === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {i === 0 ? "0" : i}
          </button>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground">Suggested:</span>
          <div className="flex gap-1">
            {suggestions
              .filter((s) => s.fret > 0)
              .slice(0, 3)
              .map((s) => (
                <button
                  key={s.fret}
                  onClick={() => handleCapoChange(s.fret)}
                  className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-accent"
                >
                  Capo {s.fret}
                </button>
              ))}
          </div>
        </div>
      )}

      {capoChords && (
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground">Play as:</span>
          <div className="flex flex-wrap gap-1">
            {capoChords.map((chord, i) => (
              <span
                key={i}
                className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
              >
                {chord.root}
                {chord.quality === "maj" ? "" : chord.quality}
              </span>
            ))}
          </div>
        </div>
      )}

      {songKey && capo > 0 && (
        <div className="text-[10px] text-muted-foreground">
          Sounding key: {songKey} (shapes in{" "}
          {getCapoChords([{ root: songKey, quality: "maj", bass: null }], capo)[0]?.root || songKey}
          )
        </div>
      )}
    </div>
  );
}
