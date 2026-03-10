import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Look up the share by token
  const { data: share, error: shareError } = await supabase
    .from("shares")
    .select("*")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (shareError || !share) {
    return NextResponse.json({ error: "Share not found or inactive" }, { status: 404 });
  }

  // Check expiration
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return NextResponse.json({ error: "Share link has expired" }, { status: 410 });
  }

  // Fetch the sheet
  const { data: sheet, error: sheetError } = await supabase
    .from("chord_sheets")
    .select("*")
    .eq("id", share.sheet_id)
    .single();

  if (sheetError || !sheet) {
    return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
  }

  // Fetch sections
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .eq("sheet_id", share.sheet_id)
    .order("sort_order", { ascending: true });

  if (sectionsError) {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }

  return NextResponse.json({
    share: {
      permission: share.permission,
      expires_at: share.expires_at,
    },
    sheet,
    sections: sections ?? [],
  });
}
