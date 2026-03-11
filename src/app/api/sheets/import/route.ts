import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const sectionTypeEnum = z.enum([
  "verse",
  "chorus",
  "bridge",
  "pre_chorus",
  "intro",
  "outro",
  "interlude",
  "tag",
  "custom",
]);

const importSheetSchema = z.object({
  title: z.string().min(1).max(200).default("Untitled"),
  artist: z.string().max(200).optional(),
  song_key: z.string().max(10).optional(),
  tempo: z.string().max(50).optional(),
  bpm: z.number().int().min(1).max(399).optional(),
  youtube_url: z.string().url().optional(),
  sections: z.array(
    z.object({
      type: sectionTypeEnum.default("verse"),
      label: z.string().max(100).optional(),
      sort_order: z.number().int().min(0),
      content: z.record(z.string(), z.unknown()),
    }),
  ),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = importSheetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sections, ...sheetData } = parsed.data;

  // Create the sheet
  const { data: sheet, error: sheetError } = await supabase
    .from("chord_sheets")
    .insert({ ...sheetData, owner_id: user.id })
    .select()
    .single();

  if (sheetError || !sheet) {
    return NextResponse.json(
      { error: sheetError?.message || "Failed to create sheet" },
      { status: 500 },
    );
  }

  // Bulk insert sections
  if (sections.length > 0) {
    const sectionRows = sections.map((s) => ({
      sheet_id: sheet.id,
      type: s.type,
      label: s.label || null,
      sort_order: s.sort_order,
      content: s.content,
    }));

    const { error: sectionsError } = await supabase.from("sections").insert(sectionRows);

    if (sectionsError) {
      // Clean up the sheet if sections failed
      await supabase.from("chord_sheets").delete().eq("id", sheet.id);
      return NextResponse.json(
        { error: sectionsError.message || "Failed to create sections" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(sheet, { status: 201 });
}
