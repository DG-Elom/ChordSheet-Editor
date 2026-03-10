import { createClient } from "@/lib/supabase/server";
import { createSectionSchema, reorderSectionsSchema } from "@/lib/validators/section-schema";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ sheetId: string }> }) {
  const { sheetId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("sheet_id", sheetId)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ sheetId: string }> }) {
  const { sheetId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSectionSchema.safeParse({ ...body, sheet_id: sheetId });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase.from("sections").insert(parsed.data).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ sheetId: string }> }) {
  const { sheetId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Handle batch reorder
  const parsed = reorderSectionsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates = parsed.data.section_ids.map((id, index) =>
    supabase.from("sections").update({ sort_order: index }).eq("id", id).eq("sheet_id", sheetId),
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return NextResponse.json({ error: "Failed to reorder sections" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
