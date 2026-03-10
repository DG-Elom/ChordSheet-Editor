"use client";

import Link from "next/link";
import { Plus, FileMusic, Clock, Trash2 } from "lucide-react";
import { useDeleteSheet } from "@/lib/hooks/use-chord-sheet";
import type { ChordSheet } from "@/types/database.types";

interface SheetListClientProps {
  sheets: ChordSheet[];
}

export function SheetListClient({ sheets }: SheetListClientProps) {
  const deleteSheet = useDeleteSheet();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Sheets</h1>
        <Link
          href="/sheets/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Sheet
        </Link>
      </div>

      {sheets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <FileMusic className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium">No chord sheets yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first chord sheet to get started
          </p>
          <Link
            href="/sheets/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Sheet
          </Link>
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm("Delete this sheet?")) {
                      deleteSheet.mutate(sheet.id);
                    }
                  }}
                  className="rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
