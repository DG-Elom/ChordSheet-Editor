import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SheetEditorClient } from "./sheet-editor-client";

export default async function SheetEditorPage({
  params,
}: {
  params: Promise<{ sheetId: string }>;
}) {
  const { sheetId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sheet, error: sheetError } = await supabase
    .from("chord_sheets")
    .select("*")
    .eq("id", sheetId)
    .single();

  if (sheetError || !sheet) redirect("/dashboard");

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("sheet_id", sheetId)
    .order("sort_order", { ascending: true });

  return <SheetEditorClient sheet={sheet} sections={sections ?? []} />;
}
