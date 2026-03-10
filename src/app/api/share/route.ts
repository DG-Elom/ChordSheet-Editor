import { createClient } from "@/lib/supabase/server";
import { createShareSchema } from "@/lib/validators/share-schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createShareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sheet_id, permission, expires_at } = parsed.data;

  // Verify the user owns the sheet
  const { data: sheet, error: sheetError } = await supabase
    .from("chord_sheets")
    .select("id")
    .eq("id", sheet_id)
    .eq("owner_id", user.id)
    .single();

  if (sheetError || !sheet) {
    return NextResponse.json({ error: "Sheet not found or access denied" }, { status: 404 });
  }

  // Generate a cryptographically random token
  const tokenBytes = new Uint8Array(24);
  crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 32);

  const { data: share, error: shareError } = await supabase
    .from("shares")
    .insert({
      sheet_id,
      token,
      permission,
      created_by: user.id,
      expires_at: expires_at ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (shareError) {
    console.error("Share creation error:", shareError);
    return NextResponse.json({ error: "Failed to create share" }, { status: 500 });
  }

  return NextResponse.json(share, { status: 201 });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sheetId = searchParams.get("sheet_id");

  if (!sheetId) {
    return NextResponse.json({ error: "Missing sheet_id parameter" }, { status: 400 });
  }

  const { data: shares, error } = await supabase
    .from("shares")
    .select("*")
    .eq("sheet_id", sheetId)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(shares);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get("id");

  if (!shareId) {
    return NextResponse.json({ error: "Missing share id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("shares")
    .delete()
    .eq("id", shareId)
    .eq("created_by", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
