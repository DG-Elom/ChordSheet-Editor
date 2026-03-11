import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SetlistsPageClient } from "./setlists-client";

export const dynamic = "force-dynamic";

export default async function SetlistsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <SetlistsPageClient />;
}
