"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";

interface Collaborator {
  userId: string;
  displayName: string;
  color: string;
}

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899"];

interface CollaborationIndicatorProps {
  sheetId: string;
}

export function CollaborationIndicator({ sheetId }: CollaborationIndicatorProps) {
  const t = useT();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`sheet:${sheetId}`);

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      const displayName =
        (profile as { display_name: string } | null)?.display_name || user.email || "Anonymous";

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const users: Collaborator[] = [];
          for (const key of Object.keys(state)) {
            const presences = state[key] as unknown as { userId: string; displayName: string }[];
            for (const presence of presences) {
              if (presence.userId !== user.id) {
                users.push({
                  userId: presence.userId,
                  displayName: presence.displayName,
                  color: COLORS[users.length % COLORS.length],
                });
              }
            }
          }
          setCollaborators(users);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ userId: user.id, displayName });
          }
        });
    })();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sheetId]);

  if (collaborators.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5" title={`${collaborators.length} ${t.collaborators}`}>
      <Users className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex -space-x-1.5">
        {collaborators.slice(0, 5).map((c) => (
          <div
            key={c.userId}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card text-[10px] font-bold text-white"
            style={{ backgroundColor: c.color }}
            title={c.displayName}
          >
            {c.displayName.charAt(0).toUpperCase()}
          </div>
        ))}
        {collaborators.length > 5 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
            +{collaborators.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
