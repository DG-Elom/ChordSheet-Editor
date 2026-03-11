"use client";

import { useState, useEffect } from "react";
import { X, Plus, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import type { Tag as TagType } from "@/types/database.types";

interface TagManagerProps {
  sheetId: string;
  compact?: boolean;
}

const TAG_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

export function TagManager({ sheetId, compact = false }: TagManagerProps) {
  const t = useT();
  const [tags, setTags] = useState<TagType[]>([]);
  const [sheetTagIds, setSheetTagIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: allTags } = await supabase.from("tags").select("*");
      setTags(allTags ?? []);
      const { data: sheetTags } = await supabase
        .from("sheet_tags")
        .select("tag_id")
        .eq("sheet_id", sheetId);
      setSheetTagIds(sheetTags?.map((st: { tag_id: string }) => st.tag_id) ?? []);
    })();
  }, [sheetId]);

  async function handleAddTag() {
    if (!newName.trim()) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newTag } = await supabase
      .from("tags")
      .insert({ name: newName, color: newColor, owner_id: user.id })
      .select()
      .single();
    if (newTag) {
      setTags((prev) => [...prev, newTag as unknown as TagType]);
      await supabase
        .from("sheet_tags")
        .insert({ sheet_id: sheetId, tag_id: (newTag as { id: string }).id });
      setSheetTagIds((prev) => [...prev, (newTag as { id: string }).id]);
      setNewName("");
      setShowAdd(false);
    }
  }

  async function toggleTag(tagId: string) {
    const supabase = createClient();
    if (sheetTagIds.includes(tagId)) {
      await supabase.from("sheet_tags").delete().eq("sheet_id", sheetId).eq("tag_id", tagId);
      setSheetTagIds((prev) => prev.filter((id) => id !== tagId));
    } else {
      await supabase.from("sheet_tags").insert({ sheet_id: sheetId, tag_id: tagId });
      setSheetTagIds((prev) => [...prev, tagId]);
    }
  }

  const activeTags = tags.filter((tag) => sheetTagIds.includes(tag.id));

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {activeTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: tag.color || "#6b7280" }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{t.tags}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const isActive = sheetTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity ${isActive ? "text-white" : "opacity-40 hover:opacity-70"}`}
              style={{ backgroundColor: tag.color || "#6b7280" }}
            >
              {tag.name}
              {isActive && <X className="h-3 w-3" />}
            </button>
          );
        })}
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent"
        >
          <Plus className="h-3 w-3" />
          {t.addTag}
        </button>
      </div>
      {showAdd && (
        <div className="flex items-center gap-2 rounded border border-border p-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t.tagName}
            className="flex-1 bg-transparent text-sm outline-none"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
          />
          <div className="flex gap-1">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`h-4 w-4 rounded-full ${newColor === c ? "ring-2 ring-primary ring-offset-1" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            onClick={handleAddTag}
            className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
          >
            {t.addTag}
          </button>
          <button onClick={() => setShowAdd(false)} className="text-xs text-muted-foreground">
            {t.cancel}
          </button>
        </div>
      )}
    </div>
  );
}
