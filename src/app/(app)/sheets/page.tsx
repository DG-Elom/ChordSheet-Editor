import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SheetListClient } from "./sheet-list-client";

export default async function SheetsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sheets } = await supabase
    .from("chord_sheets")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  return <SheetListClient sheets={sheets ?? []} />;
}
