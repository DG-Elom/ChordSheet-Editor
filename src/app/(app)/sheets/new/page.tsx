import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewSheetPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sheet, error } = await supabase
    .from("chord_sheets")
    .insert({
      title: "Untitled",
      owner_id: user.id,
    })
    .select()
    .single();

  if (error || !sheet) {
    redirect("/dashboard");
  }

  // Create a default first section
  await supabase.from("sections").insert({
    sheet_id: sheet.id,
    type: "verse",
    label: "Verse 1",
    sort_order: 0,
    content: {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
  });

  redirect(`/sheets/${sheet.id}`);
}
