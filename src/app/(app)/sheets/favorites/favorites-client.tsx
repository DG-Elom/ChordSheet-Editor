"use client";

import Link from "next/link";
import { Star, FileMusic, Clock } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { useT } from "@/lib/i18n";

interface FavoritesPageClientProps {
  sheets: Array<{
    id: string;
    title: string;
    artist: string | null;
    song_key: string | null;
    bpm: number | null;
    updated_at: string;
  }>;
}

export function FavoritesPageClient({ sheets }: FavoritesPageClientProps) {
  const t = useT();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-2">
        <Star className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">{t.favorites}</h1>
      </div>

      {sheets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Star className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium">{t.noResults}</p>
          <p className="text-sm text-muted-foreground">{t.addToFavorites}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sheets.map((sheet) => (
            <Link
              key={sheet.id}
              href={`/sheets/${sheet.id}`}
              className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <FileMusic className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{sheet.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {sheet.artist && <span>{sheet.artist}</span>}
                    {sheet.song_key && (
                      <span className="rounded bg-secondary px-1.5 py-0.5">{sheet.song_key}</span>
                    )}
                    {sheet.bpm && <span>{sheet.bpm} BPM</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(sheet.updated_at).toLocaleDateString()}
                </span>
                <FavoriteButton sheetId={sheet.id} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
