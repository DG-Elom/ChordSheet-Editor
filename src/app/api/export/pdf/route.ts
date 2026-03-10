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
    // Dynamic import to avoid bundling @react-pdf/renderer in the client
    const { generatePDF } = await import("@/lib/export/pdf-generator");
    const buffer = await generatePDF(sheet, sections ?? [], options);

    const filename = `${sheet.title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")}.pdf`;

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
