"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { Editor } from "@tiptap/react";
import { X, Trash2 } from "lucide-react";

interface ChordPopoverProps {
  editor: Editor;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSubmit: (chordString: string) => void;
  onDelete?: () => void;
  suggestions?: string[];
  initialValue?: string;
  isEditing?: boolean;
}

export function ChordPopover({
  editor,
  position,
  onClose,
  onSubmit,
  onDelete,
  suggestions = [],
  initialValue = "",
  isEditing = false,
}: ChordPopoverProps) {
  const [value, setValue] = useState(initialValue);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = useMemo(() => {
    if (value.length === 0) return [];
    return suggestions.filter((s) => s.toLowerCase().startsWith(value.toLowerCase())).slice(0, 8);
  }, [value, suggestions]);

  // Focus input when component mounts (popover opens)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        editor.commands.focus();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const chordStr =
          filteredSuggestions.length > 0 ? filteredSuggestions[selectedIndex] : value;
        if (chordStr) {
          onSubmit(chordStr);
          setValue("");
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Tab" && filteredSuggestions.length > 0) {
        e.preventDefault();
        setValue(filteredSuggestions[selectedIndex]);
        return;
      }
      if (e.key === "Backspace" && value === "" && isEditing && onDelete) {
        e.preventDefault();
        onDelete();
        return;
      }
    },
    [filteredSuggestions, selectedIndex, value, onSubmit, onClose, onDelete, isEditing, editor],
  );

  if (!position) return null;

  return (
    <div
      className="fixed z-50 rounded-lg border border-border bg-popover p-2 shadow-lg"
      style={{ left: position.x, top: position.y - 40 }}
    >
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isEditing ? "Edit chord..." : "Chord (e.g. Am7)"}
          className="w-32 rounded bg-background px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        {isEditing && onDelete && (
          <button
            onClick={onDelete}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Remove chord"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
        <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent">
          <X className="h-3 w-3" />
        </button>
      </div>
      {filteredSuggestions.length > 0 && (
        <div className="mt-1 max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion, i) => (
            <button
              key={suggestion}
              onClick={() => {
                onSubmit(suggestion);
                setValue("");
              }}
              className={`block w-full rounded px-2 py-1 text-left text-sm ${
                i === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "text-popover-foreground hover:bg-accent/50"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
