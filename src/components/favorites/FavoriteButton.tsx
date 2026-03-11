"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FavoriteButtonProps {
  sheetId: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ sheetId, size = "md" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("sheet_id", sheetId)
        .eq("owner_id", user.id)
        .maybeSingle();
      setIsFavorite(!!data);
    })();
  }, [sheetId]);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("sheet_id", sheetId).eq("owner_id", user.id);
      setIsFavorite(false);
    } else {
      await supabase.from("favorites").insert({ sheet_id: sheetId, owner_id: user.id });
      setIsFavorite(true);
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`rounded p-1 transition-colors ${isFavorite ? "text-yellow-500 hover:text-yellow-400" : "text-muted-foreground hover:text-yellow-500"}`}
    >
      <Star
        className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}
        fill={isFavorite ? "currentColor" : "none"}
      />
    </button>
  );
}
