"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import type { Comment } from "@/types/database.types";

interface CommentsPanelProps {
  sheetId: string;
  sectionId?: string;
}

export function CommentsPanel({ sheetId, sectionId }: CommentsPanelProps) {
  const t = useT();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      let query = supabase.from("comments").select("*").eq("sheet_id", sheetId);
      if (sectionId) query = query.eq("section_id", sectionId);
      else query = query.is("section_id", null);
      const { data } = await query.order("created_at", { ascending: true });
      setComments(data ?? []);
      setLoading(false);
    })();
  }, [sheetId, sectionId]);

  async function handleSubmit() {
    if (!newComment.trim()) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const { data } = await supabase
      .from("comments")
      .insert({
        sheet_id: sheetId,
        section_id: sectionId ?? null,
        author_id: user.id,
        author_name:
          (profile as { display_name: string } | null)?.display_name || user.email || "Anonymous",
        content: newComment,
      })
      .select()
      .single();

    if (data) {
      setComments((prev) => [...prev, data as unknown as Comment]);
      setNewComment("");
    }
  }

  async function handleDelete(commentId: string) {
    const supabase = createClient();
    await supabase.from("comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <MessageSquare className="h-4 w-4" />
        {t.comments} ({comments.length})
      </h3>

      {loading ? (
        <div className="py-4 text-center text-sm text-muted-foreground">{t.loading}</div>
      ) : comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">{t.noComments}</p>
      ) : (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded border border-border p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium">{comment.author_name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(comment.created_at)}
                  </span>
                  {comment.author_id === userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t.commentPlaceholder}
          className="flex-1 rounded border border-border bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          className="rounded bg-primary p-1.5 text-primary-foreground disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
