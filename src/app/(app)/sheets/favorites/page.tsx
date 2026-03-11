import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FavoritesPageClient } from "./favorites-client";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: favorites } = await supabase
    .from("favorites")
    .select("sheet_id")
    .eq("owner_id", user.id);

  const sheetIds = favorites?.map((f: { sheet_id: string }) => f.sheet_id) ?? [];

  let sheets: Array<{
    id: string;
    title: string;
    artist: string | null;
    song_key: string | null;
    bpm: number | null;
    updated_at: string;
  }> = [];

  if (sheetIds.length > 0) {
    const { data } = await supabase
      .from("chord_sheets")
      .select("id, title, artist, song_key, bpm, updated_at")
      .in("id", sheetIds)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false });
    sheets = data ?? [];
  }

  return <FavoritesPageClient sheets={sheets} />;
}
