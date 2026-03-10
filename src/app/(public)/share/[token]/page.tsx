import { createAdminClient } from "@/lib/supabase/admin";
import { SECTION_CONFIGS } from "@/types/editor.types";
import type { Metadata } from "next";
import type { ChordSheet, Section } from "@/types/database.types";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// TipTap JSON types for rendering
// ---------------------------------------------------------------------------

interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TipTapTextNode {
  type: "text";
  text: string;
  marks?: TipTapMark[];
}

interface TipTapParagraphNode {
  type: "paragraph";
  content?: TipTapTextNode[];
}

interface TipTapDoc {
  type: "doc";
  content?: TipTapParagraphNode[];
}

// ---------------------------------------------------------------------------
// Chord formatting
// ---------------------------------------------------------------------------

function formatChord(attrs: Record<string, unknown>): string {
  const root = (attrs.root as string) || "";
  const quality = (attrs.quality as string) || "";
  const bass = attrs.bass as string | null;

  const qualityMap: Record<string, string> = {
    maj: "",
    min: "m",
    dim: "dim",
    aug: "aug",
    sus2: "sus2",
    sus4: "sus4",
    "7": "7",
    maj7: "maj7",
    min7: "m7",
    dim7: "dim7",
    aug7: "aug7",
    add9: "add9",
    "9": "9",
    "6": "6",
    min6: "m6",
    "11": "11",
    "13": "13",
  };

  const qualityDisplay = qualityMap[quality] ?? quality;
  let chord = `${root}${qualityDisplay}`;
  if (bass) chord += `/${bass}`;
  return chord;
}

// ---------------------------------------------------------------------------
// Fetch shared data (server-side)
// ---------------------------------------------------------------------------

async function fetchSharedSheet(token: string): Promise<{
  sheet: ChordSheet;
  sections: Section[];
  permission: string;
} | null> {
  const supabase = createAdminClient();

  const { data: share, error: shareError } = await supabase
    .from("shares")
    .select("*")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (shareError || !share) return null;

  // Check expiration
  if (share.expires_at && new Date(share.expires_at) < new Date()) return null;

  const { data: sheet, error: sheetError } = await supabase
    .from("chord_sheets")
    .select("*")
    .eq("id", share.sheet_id)
    .single();

  if (sheetError || !sheet) return null;

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("sheet_id", share.sheet_id)
    .order("sort_order", { ascending: true });

  return {
    sheet: sheet as ChordSheet,
    sections: (sections ?? []) as Section[],
    permission: share.permission,
  };
}

// ---------------------------------------------------------------------------
// Dynamic OG metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const data = await fetchSharedSheet(token);

  if (!data) {
    return {
      title: "Shared Chord Sheet - Not Found",
      description: "This shared chord sheet could not be found or has expired.",
    };
  }

  const { sheet } = data;
  const description = [
    sheet.artist && `by ${sheet.artist}`,
    sheet.song_key && `Key: ${sheet.song_key}`,
    sheet.bpm && `${sheet.bpm} BPM`,
  ]
    .filter(Boolean)
    .join(" | ");

  return {
    title: `${sheet.title} - ChordSheet Editor`,
    description: description || `Chord sheet for ${sheet.title}`,
    openGraph: {
      title: sheet.title,
      description: description || `Chord sheet for ${sheet.title}`,
      type: "article",
    },
  };
}

// ---------------------------------------------------------------------------
// Section renderer (server component)
// ---------------------------------------------------------------------------

function SectionRenderer({ section }: { section: Section }) {
  const config = SECTION_CONFIGS[section.type];
  const doc = section.content as unknown as TipTapDoc;
  const paragraphs = doc?.content ?? [];

  return (
    <div className="mb-6">
      <div
        className="mb-2 inline-block rounded px-2 py-0.5 text-sm font-bold"
        style={{ color: config.color }}
      >
        [{section.label || config.label}]
      </div>

      {paragraphs.map((para, paraIdx) => {
        if (para.type !== "paragraph") return null;

        if (!para.content || para.content.length === 0) {
          return <div key={paraIdx} className="h-4" />;
        }

        // Check if paragraph has any chords
        const hasChords = para.content.some(
          (node) => node.type === "text" && node.marks?.some((m) => m.type === "chord"),
        );

        // Build chord and lyric strings
        let chordLine = "";
        let lyricLine = "";

        for (const node of para.content) {
          if (node.type !== "text") continue;
          const chordMark = node.marks?.find((m) => m.type === "chord");
          const textLen = node.text.length;

          if (chordMark?.attrs) {
            const chordStr = formatChord(chordMark.attrs);
            chordLine += chordStr + " ".repeat(Math.max(0, textLen - chordStr.length + 1));
          } else {
            chordLine += " ".repeat(textLen);
          }
          lyricLine += node.text;
        }

        return (
          <div key={paraIdx}>
            {hasChords && (
              <pre
                className="font-mono text-sm font-bold leading-tight"
                style={{ color: "var(--chord-color)" }}
              >
                {chordLine.trimEnd()}
              </pre>
            )}
            <pre className="font-mono text-sm leading-tight text-foreground">{lyricLine}</pre>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component (server component)
// ---------------------------------------------------------------------------

export default async function SharedSheetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await fetchSharedSheet(token);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Sheet Not Found</h1>
          <p className="text-muted-foreground">
            This shared chord sheet could not be found, has expired, or has been deactivated.
          </p>
        </div>
      </div>
    );
  }

  const { sheet, sections, permission } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Shared ({permission})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">{sheet.title}</h1>
          {sheet.artist && <p className="mt-1 text-muted-foreground">{sheet.artist}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {sheet.song_key && <span>Key: {sheet.song_key}</span>}
            {sheet.tempo && <span>Tempo: {sheet.tempo}</span>}
            {sheet.bpm && <span>BPM: {sheet.bpm}</span>}
            {sheet.time_signature && <span>Time: {sheet.time_signature}</span>}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {sections.length === 0 ? (
          <p className="text-center text-muted-foreground">This chord sheet has no sections yet.</p>
        ) : (
          sections.map((section) => <SectionRenderer key={section.id} section={section} />)
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Shared via ChordSheet Editor
      </footer>
    </div>
  );
}
