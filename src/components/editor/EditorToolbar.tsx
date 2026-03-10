"use client";

import { useEditorStore } from "@/lib/store/editor-store";
import {
  Maximize2,
  Minimize2,
  Plus,
  MousePointerClick,
  ArrowUp,
  ArrowDown,
  Undo2,
  Redo2,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor | null;
  onAddSection: () => void;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
}

export function EditorToolbar({
  editor,
  onAddSection,
  onTransposeUp,
  onTransposeDown,
}: EditorToolbarProps) {
  const { focusMode, toggleFocusMode, chordInsertMode, toggleChordInsertMode } = useEditorStore();

  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 border-b border-border bg-card px-2 py-1">
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </button>

      <div className="mx-1 h-4 w-px bg-border" />

      <button
        onClick={toggleChordInsertMode}
        className={`rounded p-1.5 ${chordInsertMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
        title="Insert Chord (Ctrl+K)"
      >
        <MousePointerClick className="h-4 w-4" />
      </button>

      <button
        onClick={onAddSection}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Add Section (Ctrl+Enter)"
      >
        <Plus className="h-4 w-4" />
      </button>

      <div className="mx-1 h-4 w-px bg-border" />

      <button
        onClick={onTransposeDown}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Transpose Down (Ctrl+Down)"
      >
        <ArrowDown className="h-4 w-4" />
      </button>

      <button
        onClick={onTransposeUp}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Transpose Up (Ctrl+Up)"
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      <div className="ml-auto">
        <button
          onClick={toggleFocusMode}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Toggle Focus Mode"
        >
          {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
