import { createClient } from "@/lib/supabase/server";
import { updateSectionSchema } from "@/lib/validators/section-schema";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sheetId: string; sectionId: string }> },
) {
  const { sheetId, sectionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user owns the sheet
  const { data: sheet } = await supabase
    .from("chord_sheets")
    .select("id")
    .eq("id", sheetId)
    .eq("owner_id", user.id)
    .single();

  if (!sheet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSectionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sections")
    .update(parsed.data)
    .eq("id", sectionId)
    .eq("sheet_id", sheetId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sheetId: string; sectionId: string }> },
) {
  const { sheetId, sectionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", sectionId)
    .eq("sheet_id", sheetId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
