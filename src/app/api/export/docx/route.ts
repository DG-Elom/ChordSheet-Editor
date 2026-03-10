import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ExportOptions } from "@/types/editor.types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sheetId: string; options: ExportOptions };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sheetId, options } = body;

  if (!sheetId || !options) {
    return NextResponse.json({ error: "Missing sheetId or options" }, { status: 400 });
  }

  // Fetch sheet
  const { data: sheet, error: sheetError } = await supabase
    .from("chord_sheets")
    .select("*")
    .eq("id", sheetId)
    .single();

  if (sheetError || !sheet) {
    return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
  }

  // Fetch sections
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .eq("sheet_id", sheetId)
    .order("sort_order", { ascending: true });

  if (sectionsError) {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }

  try {
    // Dynamic import to keep the docx package off the client bundle
    const { generateDOCX } = await import("@/lib/export/docx-generator");
    const buffer = await generateDOCX(sheet, sections ?? [], options);

    const filename = `${sheet.title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")}.docx`;

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err) {
    console.error("DOCX generation error:", err);
    return NextResponse.json({ error: "Failed to generate DOCX" }, { status: 500 });
  }
}
