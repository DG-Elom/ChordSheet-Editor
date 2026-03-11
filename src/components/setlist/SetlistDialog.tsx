"use client";

import { useState, useEffect } from "react";
import { X, Plus, ListMusic, GripVertical, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import type { SetList, SetListItem, ChordSheet } from "@/types/database.types";

interface SetlistDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectSheet?: (sheetId: string) => void;
}

export function SetlistDialog({ open, onClose, onSelectSheet }: SetlistDialogProps) {
  const t = useT();
  const [setlists, setSetlists] = useState<SetList[]>([]);
  const [selectedSetlist, setSelectedSetlist] = useState<SetList | null>(null);
  const [items, setItems] = useState<(SetListItem & { sheet?: ChordSheet })[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("set_lists")
        .select("*")
        .order("updated_at", { ascending: false });
      setSetlists(data ?? []);
    })();
  }, [open]);

  async function loadItems(setlist: SetList) {
    setSelectedSetlist(setlist);
    const supabase = createClient();
    const { data: slItems } = await supabase
      .from("set_list_items")
      .select("*")
      .eq("set_list_id", setlist.id)
      .order("sort_order");
    if (!slItems?.length) {
      setItems([]);
      return;
    }
    const sheetIds = slItems.map((i: SetListItem) => i.sheet_id);
    const { data: sheets } = await supabase.from("chord_sheets").select("*").in("id", sheetIds);
    const sheetMap = new Map((sheets ?? []).map((s: ChordSheet) => [s.id, s]));
    setItems(slItems.map((i: SetListItem) => ({ ...i, sheet: sheetMap.get(i.sheet_id) })));
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("set_lists")
      .insert({ title: newName, description: newDesc || null, owner_id: user.id })
      .select()
      .single();
    if (data) {
      setSetlists((prev) => [data as unknown as SetList, ...prev]);
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    }
  }

  async function removeItem(itemId: string) {
    const supabase = createClient();
    await supabase.from("set_list_items").delete().eq("id", itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function deleteSetlist(id: string) {
    const supabase = createClient();
    await supabase.from("set_list_items").delete().eq("set_list_id", id);
    await supabase.from("set_lists").delete().eq("id", id);
    setSetlists((prev) => prev.filter((s) => s.id !== id));
    if (selectedSetlist?.id === id) {
      setSelectedSetlist(null);
      setItems([]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ListMusic className="h-5 w-5" />
            {t.setlists}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        {selectedSetlist ? (
          <div>
            <button
              onClick={() => {
                setSelectedSetlist(null);
                setItems([]);
              }}
              className="mb-3 text-sm text-primary hover:underline"
            >
              &larr; {t.setlists}
            </button>
            <h3 className="mb-1 text-base font-semibold">{selectedSetlist.title}</h3>
            {selectedSetlist.description && (
              <p className="mb-3 text-sm text-muted-foreground">{selectedSetlist.description}</p>
            )}
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t.setlistEmpty}</p>
            ) : (
              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded border border-border px-3 py-2"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                    <button
                      onClick={() => onSelectSheet?.(item.sheet_id)}
                      className="flex-1 text-left text-sm font-medium hover:text-primary"
                    >
                      {item.sheet?.title || "Untitled"}
                    </button>
                    {item.custom_key && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {item.custom_key}
                      </span>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-3 flex justify-end">
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.createSetlist}
              </button>
            </div>
            {showCreate && (
              <div className="mb-3 space-y-2 rounded border border-border p-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t.setlistName}
                  className="w-full bg-transparent text-sm outline-none"
                  autoFocus
                />
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={t.setlistDescription}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground"
                  >
                    {t.createSetlist}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="text-xs text-muted-foreground"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
            {setlists.length === 0 && !showCreate ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t.setlistEmpty}</p>
            ) : (
              <div className="space-y-1">
                {setlists.map((sl) => (
                  <div
                    key={sl.id}
                    className="flex items-center gap-2 rounded border border-border px-3 py-2"
                  >
                    <button onClick={() => loadItems(sl)} className="flex-1 text-left">
                      <div className="text-sm font-medium">{sl.title}</div>
                      {sl.description && (
                        <div className="text-xs text-muted-foreground">{sl.description}</div>
                      )}
                    </button>
                    <button
                      onClick={() => deleteSetlist(sl.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
