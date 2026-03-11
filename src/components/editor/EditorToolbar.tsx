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
  Download,
  Share2,
  Play,
  Music,
  Sparkles,
  MessageSquare,
  History,
  QrCode,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { useT } from "@/lib/i18n";

interface EditorToolbarProps {
  editor: Editor | null;
  onAddSection: () => void;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onExport: () => void;
  onShare: () => void;
  onPerformanceMode?: () => void;
  onMetronome?: () => void;
  onAIPanel?: () => void;
  onComments?: () => void;
  onVersionHistory?: () => void;
  onQRCode?: () => void;
}

export function EditorToolbar({
  editor,
  onAddSection,
  onTransposeUp,
  onTransposeDown,
  onExport,
  onShare,
  onPerformanceMode,
  onMetronome,
  onAIPanel,
  onComments,
  onVersionHistory,
  onQRCode,
}: EditorToolbarProps) {
  const { focusMode, toggleFocusMode, chordInsertMode, toggleChordInsertMode } = useEditorStore();
  const t = useT();

  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 border-b border-border bg-card px-2 py-1">
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
        title={t.undo + " (Ctrl+Z)"}
      >
        <Undo2 className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
        title={t.redo + " (Ctrl+Shift+Z)"}
      >
        <Redo2 className="h-4 w-4" />
      </button>

      <div className="mx-1 h-4 w-px bg-border" />

      <button
        onClick={toggleChordInsertMode}
        className={`rounded p-1.5 ${chordInsertMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
        title={t.insertChord + " (Ctrl+K)"}
      >
        <MousePointerClick className="h-4 w-4" />
      </button>

      <button
        onClick={onAddSection}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title={t.addSection + " (Ctrl+Enter)"}
      >
        <Plus className="h-4 w-4" />
      </button>

      <div className="mx-1 h-4 w-px bg-border" />

      <button
        onClick={onTransposeDown}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title={t.transposeDown + " (Ctrl+Down)"}
      >
        <ArrowDown className="h-4 w-4" />
      </button>

      <button
        onClick={onTransposeUp}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title={t.transposeUp + " (Ctrl+Up)"}
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      <div className="mx-1 h-4 w-px bg-border" />

      {onPerformanceMode && (
        <button
          onClick={onPerformanceMode}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          title={t.performanceMode}
        >
          <Play className="h-4 w-4" />
        </button>
      )}
      {onMetronome && (
        <button
          onClick={onMetronome}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          title={t.metronome}
        >
          <Music className="h-4 w-4" />
        </button>
      )}

      <div className="ml-auto flex items-center gap-1">
        {onAIPanel && (
          <button
            onClick={onAIPanel}
            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title={t.aiAssistant}
          >
            <Sparkles className="h-4 w-4" />
          </button>
        )}
        {onComments && (
          <button
            onClick={onComments}
            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title={t.comments}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        )}
        {onVersionHistory && (
          <button
            onClick={onVersionHistory}
            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title={t.versionHistory}
          >
            <History className="h-4 w-4" />
          </button>
        )}
        {onQRCode && (
          <button
            onClick={onQRCode}
            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title={t.qrCode}
          >
            <QrCode className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onShare}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          title={t.shareSheet}
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          onClick={onExport}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          title={t.exportSheet}
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={toggleFocusMode}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          title={t.focusMode}
        >
          {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
