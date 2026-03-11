"use client";

import { useRouter } from "next/navigation";
import { SetlistDialog } from "@/components/setlist/SetlistDialog";

export function SetlistsPageClient() {
  const router = useRouter();

  return (
    <SetlistDialog
      open={true}
      onClose={() => router.push("/sheets")}
      onSelectSheet={(sheetId) => router.push(`/sheets/${sheetId}`)}
    />
  );
}
