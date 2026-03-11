import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ImportPageClient } from "./import-page-client";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ImportPageClient />;
}
