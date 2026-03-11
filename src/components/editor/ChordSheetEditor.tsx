"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { usePerformanceStore } from "@/lib/store/performance-store";
import { SheetMetadataBar } from "./SheetMetadataBar";
import { EditorToolbar } from "./EditorToolbar";
import { ChordPopover } from "./ChordPopover";
import { ExportDialog } from "@/components/export/ExportDialog";
import { ShareDialog } from "@/components/share/ShareDialog";
import { QRCodeDialog } from "@/components/share/QRCodeDialog";
import { PerformanceMode } from "@/components/performance/PerformanceMode";
import { Metronome } from "@/components/metronome/Metronome";
import { AIAssistantPanel } from "@/components/ai/AIAssistantPanel";
import { CommentsPanel } from "@/components/comments/CommentsPanel";
import { VersionHistory } from "@/components/history/VersionHistory";
import { YouTubePlayer } from "@/components/youtube/YouTubePlayer";
import { CollaborationIndicator } from "@/components/collaboration/CollaborationIndicator";
import { ChordDiagram } from "@/components/chords/ChordDiagram";
import { CapoSelector } from "@/components/chords/CapoSelector";
import { TagManager } from "@/components/tags/TagManager";
import { SetlistDialog } from "@/components/setlist/SetlistDialog";
import { ChordMark } from "@/extensions/chord-mark";
import { createChordDecorationPlugin } from "@/extensions/chord-mark";
import { SectionNode } from "@/extensions/section-node";
import { getChordSuggestions } from "@/lib/chord-engine";
import { parseChord } from "@/lib/chord-engine";
import { parsePlainText, parsedSheetToTipTap } from "@/lib/import";
import { transpose } from "@/lib/chord-engine";
import type { ChordSheet, Section } from "@/types/database.types";
import type { JSONContent } from "@tiptap/react";

interface ChordSheetEditorProps {
  sheet: ChordSheet;
  sections: Section[];
}

// Editing state for an existing chord
interface EditingChordState {
  from: number;
  to: number;
  chordId: string;
  displayString: string;
}

export function ChordSheetEditor({ sheet, sections }: ChordSheetEditorProps) {
  const {
    setSheet,
    setSections,
    setEditorContent,
    setDirty,
    focusMode,
    chordInsertMode,
    toggleChordInsertMode,
    editorContent,
  } = useEditorStore();
  const [chordPopoverPos, setChordPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [chordSuggestions] = useState<string[]>(() => getChordSuggestions("", 20));
  const [editingChord, setEditingChord] = useState<EditingChordState | null>(null);
  const [popoverKey, setPopoverKey] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const { isActive: performanceMode, setActive: setPerformanceMode } = usePerformanceStore();
  const [showMetronome, setShowMetronome] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showChordDiagrams, setShowChordDiagrams] = useState(false);
  const [showCapo, setShowCapo] = useState(false);
  const [setlistOpen, setSetlistOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(100);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSheet(sheet);
    setSections(sections);
  }, [sheet, sections, setSheet, setSections]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Placeholder.configure({
        placeholder: "Start typing your lyrics here... Press Ctrl+Enter to add a section.",
      }),
      ChordMark,
      SectionNode,
    ],
    content: buildEditorContent(sections),
    onUpdate({ editor: ed }) {
      // Debounce content extraction to avoid excessive store updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        const json = ed.getJSON();
        setEditorContent(json);
        setDirty(true);
      }, 300);
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none px-6 py-4 focus:outline-none min-h-[60vh]",
      },
      handleClick(view, pos) {
        if (!view.dom.closest("[data-chord-insert]")) return false;

        const coords = view.coordsAtPos(pos);
        setChordPopoverPos({ x: coords.left, y: coords.top });
        setEditingChord(null);
        setPopoverKey((k) => k + 1);
        return true;
      },
    },
  });

  // Register the chord decoration plugin after editor is created
  useEffect(() => {
    if (editor) {
      const plugin = createChordDecorationPlugin();
      const existingPlugin = editor.state.plugins.find(
        (p) => (p.spec.key as { key?: string })?.key === "chordDecorations$",
      );
      if (!existingPlugin) {
        editor.registerPlugin(plugin);
      }
    }
  }, [editor]);

  // Sync chordInsertMode to a data attribute for handleClick detection
  useEffect(() => {
    if (!editor) return;
    if (chordInsertMode) {
      editor.view.dom.setAttribute("data-chord-insert", "true");
    } else {
      editor.view.dom.removeAttribute("data-chord-insert");
    }
  }, [editor, chordInsertMode]);

  // Listen for chord-insert-toggle custom events from the ChordMark extension
  useEffect(() => {
    if (!editor) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.active !== chordInsertMode) {
        toggleChordInsertMode();
      }
    };
    editor.view.dom.addEventListener("chord-insert-toggle", handler);
    return () => editor.view.dom.removeEventListener("chord-insert-toggle", handler);
  }, [editor, chordInsertMode, toggleChordInsertMode]);

  // Listen for chord-edit custom events from chord widget clicks
  useEffect(() => {
    if (!editor) return;

    const handler = (e: Event) => {
      const { chordId } = (e as CustomEvent).detail;

      // Find the chord mark in the document by its ID
      let foundPos = -1;
      let foundNodeSize = 0;
      let foundAttrs: Record<string, unknown> = {};
      editor.state.doc.descendants((node, pos) => {
        if (foundPos >= 0) return false;
        if (!node.isInline || !node.marks.length) return;
        for (const mark of node.marks) {
          if (mark.type.name === "chordMark" && mark.attrs.id === chordId) {
            foundPos = pos;
            foundNodeSize = node.nodeSize;
            foundAttrs = mark.attrs as Record<string, unknown>;
            return false;
          }
        }
      });

      if (foundPos >= 0) {
        const coords = editor.view.coordsAtPos(foundPos);

        // Build display string for initial value
        const qualityMap: Record<string, string> = {
          maj: "",
          min: "m",
          dim: "dim",
          aug: "aug",
          sus2: "sus2",
          sus4: "sus4",
          "7": "7",
          maj7: "maj7",
          min7: "m7",
          dim7: "dim7",
          aug7: "aug7",
          add9: "add9",
          "9": "9",
          "6": "6",
          min6: "m6",
          "11": "11",
          "13": "13",
        };
        const quality = (foundAttrs.quality as string) || "";
        const suffix = qualityMap[quality] ?? quality;
        let display = (foundAttrs.root as string) + suffix;
        if (foundAttrs.bass) display += "/" + (foundAttrs.bass as string);

        setEditingChord({
          from: foundPos,
          to: foundPos + foundNodeSize,
          chordId: chordId as string,
          displayString: display,
        });
        setChordPopoverPos({ x: coords.left, y: coords.top });
        setPopoverKey((k) => k + 1);
      }
    };

    editor.view.dom.addEventListener("chord-edit", handler);
    return () => editor.view.dom.removeEventListener("chord-edit", handler);
  }, [editor]);

  // Handle chord submission (new or edit)
  const handleChordSubmit = useCallback(
    (chordString: string) => {
      if (!editor) return;

      const parsed = parseChord(chordString);
      if (!parsed) return;

      if (editingChord) {
        // Editing existing chord: update the mark at the known range
        editor
          .chain()
          .focus()
          .setTextSelection({ from: editingChord.from, to: editingChord.to })
          .setChord({
            root: parsed.root,
            quality: parsed.quality,
            bass: parsed.bass,
          })
          .setTextSelection(editingChord.to)
          .run();
      } else {
        // New chord insertion
        const { from, to } = editor.state.selection;
        if (from === to) {
          const end = Math.min(from + 1, editor.state.doc.content.size);
          editor
            .chain()
            .focus()
            .setTextSelection({ from, to: end })
            .setChord({
              root: parsed.root,
              quality: parsed.quality,
              bass: parsed.bass,
            })
            .setTextSelection(end)
            .run();
        } else {
          editor
            .chain()
            .focus()
            .setChord({
              root: parsed.root,
              quality: parsed.quality,
              bass: parsed.bass,
            })
            .run();
        }
      }

      setChordPopoverPos(null);
      setEditingChord(null);
    },
    [editor, editingChord],
  );

  // Handle chord deletion
  const handleChordDelete = useCallback(() => {
    if (!editor || !editingChord) return;

    editor
      .chain()
      .focus()
      .setTextSelection({ from: editingChord.from, to: editingChord.to })
      .unsetChord()
      .setTextSelection(editingChord.to)
      .run();

    setChordPopoverPos(null);
    setEditingChord(null);
  }, [editor, editingChord]);

  const handleChordPopoverClose = useCallback(() => {
    setChordPopoverPos(null);
    setEditingChord(null);
    editor?.commands.focus();
  }, [editor]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Shift+P: Performance mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setPerformanceMode(true);
      }
      // Ctrl+Shift+M: Toggle metronome
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "M") {
        e.preventDefault();
        setShowMetronome((p) => !p);
      }
      // Ctrl+= / Ctrl+-: Zoom in/out
      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setEditorFontSize((p) => Math.min(200, p + 10));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setEditorFontSize((p) => Math.max(50, p - 10));
      }
      // Ctrl+0: Reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setEditorFontSize(100);
      }
      // Ctrl+Shift+D: Toggle chord diagrams
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setShowChordDiagrams((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setPerformanceMode]);

  const handleAddSection = useCallback(() => {
    if (!editor) return;
    editor.commands.insertSection({ sectionType: "verse" });
  }, [editor]);

  const handleTransposeUp = useCallback(() => {
    if (!editor) return;
    transposeAllChords(editor, 1);
  }, [editor]);

  const handleTransposeDown = useCallback(() => {
    if (!editor) return;
    transposeAllChords(editor, -1);
  }, [editor]);

  if (performanceMode) {
    return <PerformanceMode />;
  }

  return (
    <div className={`flex flex-col ${focusMode ? "fixed inset-0 z-50 bg-background" : "h-full"}`}>
      <div className="flex items-center justify-between">
        <SheetMetadataBar />
        <div className="flex items-center gap-2 pr-2">
          <CollaborationIndicator sheetId={sheet.id} />
        </div>
      </div>
      <EditorToolbar
        editor={editor}
        onAddSection={handleAddSection}
        onTransposeUp={handleTransposeUp}
        onTransposeDown={handleTransposeDown}
        onExport={() => setExportOpen(true)}
        onShare={() => setShareOpen(true)}
        onPerformanceMode={() => setPerformanceMode(true)}
        onMetronome={() => setShowMetronome(!showMetronome)}
        onAIPanel={() => setShowAIPanel(!showAIPanel)}
        onComments={() => setShowComments(!showComments)}
        onVersionHistory={() => setVersionHistoryOpen(true)}
        onQRCode={() => setQrOpen(true)}
        onCapo={() => setShowCapo((p) => !p)}
        onSetlist={() => setSetlistOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ fontSize: `${editorFontSize}%` }}>
          <EditorContent editor={editor} />
          {showChordDiagrams && <ChordDiagramsPanel editorContent={editorContent} />}
        </div>
        {(showMetronome || showAIPanel || showComments || showCapo || sheet.youtube_url) && (
          <div className="w-80 space-y-3 overflow-y-auto border-l border-border p-3">
            <TagManager sheetId={sheet.id} />
            {showCapo && (
              <CapoSelector
                chords={extractChordsFromContent(editorContent)}
                songKey={sheet.song_key || undefined}
              />
            )}
            {showMetronome && (
              <Metronome initialBpm={sheet.bpm || 120} onClose={() => setShowMetronome(false)} />
            )}
            {sheet.youtube_url && <YouTubePlayer url={sheet.youtube_url} />}
            {showAIPanel && (
              <AIAssistantPanel
                sheetContent={editor?.getText()}
                songKey={sheet.song_key || undefined}
                onInsertContent={(content) => {
                  const parsed = parsePlainText(content);
                  const tiptapDoc = parsedSheetToTipTap(parsed);
                  if (tiptapDoc.content) {
                    editor?.commands.insertContent(tiptapDoc.content);
                  }
                }}
              />
            )}
            {showComments && <CommentsPanel sheetId={sheet.id} />}
          </div>
        )}
      </div>
      <ExportDialog sheetId={sheet.id} open={exportOpen} onClose={() => setExportOpen(false)} />
      <ShareDialog sheetId={sheet.id} open={shareOpen} onClose={() => setShareOpen(false)} />
      <QRCodeDialog sheetId={sheet.id} open={qrOpen} onClose={() => setQrOpen(false)} />
      <VersionHistory
        sheetId={sheet.id}
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
      />
      <SetlistDialog open={setlistOpen} onClose={() => setSetlistOpen(false)} />
      {editor && (
        <ChordPopover
          key={popoverKey}
          editor={editor}
          position={chordPopoverPos}
          onClose={handleChordPopoverClose}
          onSubmit={handleChordSubmit}
          onDelete={editingChord ? handleChordDelete : undefined}
          suggestions={chordSuggestions}
          initialValue={editingChord?.displayString ?? ""}
          isEditing={!!editingChord}
        />
      )}
    </div>
  );
}

function extractChordsFromContent(
  content: JSONContent | null,
): { root: string; quality: string; bass: string | null }[] {
  const chords: { root: string; quality: string; bass: string | null }[] = [];
  if (!content?.content) return chords;
  for (const section of content.content) {
    if (!section.content) continue;
    for (const p of section.content) {
      if (!p.content) continue;
      for (const inline of p.content) {
        const marks = inline.marks as
          | Array<{ type: string; attrs?: Record<string, string> }>
          | undefined;
        if (!marks) continue;
        for (const mark of marks) {
          if (mark.type === "chordMark" && mark.attrs) {
            chords.push({
              root: mark.attrs.root,
              quality: mark.attrs.quality,
              bass: mark.attrs.bass || null,
            });
          }
        }
      }
    }
  }
  return chords;
}

function transposeAllChords(editor: import("@tiptap/react").Editor, semitones: number) {
  const { tr } = editor.state;
  let modified = false;

  editor.state.doc.descendants((node, pos) => {
    if (!node.isInline || !node.marks.length) return;
    for (const mark of node.marks) {
      if (mark.type.name === "chordMark") {
        const chord = {
          root: mark.attrs.root,
          quality: mark.attrs.quality,
          bass: mark.attrs.bass,
        };
        const transposed = transpose(chord, semitones);
        const newMark = mark.type.create({
          ...mark.attrs,
          root: transposed.root,
          quality: transposed.quality,
          bass: transposed.bass,
        });
        tr.removeMark(pos, pos + node.nodeSize, mark);
        tr.addMark(pos, pos + node.nodeSize, newMark);
        modified = true;
      }
    }
  });

  if (modified) {
    editor.view.dispatch(tr);
  }
}

function ChordDiagramsPanel({ editorContent }: { editorContent: JSONContent | null }) {
  // Extract unique chords from editor content
  const chords = new Map<string, { root: string; quality: string }>();
  if (editorContent?.content) {
    for (const section of editorContent.content) {
      if (!section.content) continue;
      for (const p of section.content) {
        if (!p.content) continue;
        for (const inline of p.content) {
          const marks = inline.marks as
            | Array<{ type: string; attrs?: Record<string, string> }>
            | undefined;
          if (!marks) continue;
          for (const mark of marks) {
            if (mark.type === "chordMark" && mark.attrs) {
              const key = `${mark.attrs.root}${mark.attrs.quality}`;
              if (!chords.has(key)) {
                chords.set(key, { root: mark.attrs.root, quality: mark.attrs.quality });
              }
            }
          }
        }
      }
    }
  }

  if (chords.size === 0) return null;

  return (
    <div className="border-t border-border bg-card/50 px-6 py-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Chord Diagrams
      </h4>
      <div className="flex flex-wrap gap-4">
        {Array.from(chords.values()).map(({ root, quality }) => (
          <div key={`${root}${quality}`} className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-foreground">
              {root}
              {quality === "maj" ? "" : quality}
            </span>
            <ChordDiagram root={root} quality={quality} instrument="guitar" size={60} />
          </div>
        ))}
      </div>
    </div>
  );
}

function buildEditorContent(sections: Section[]): JSONContent {
  if (sections.length === 0) {
    return {
      type: "doc",
      content: [
        {
          type: "sectionNode",
          attrs: {
            sectionId: crypto.randomUUID(),
            sectionType: "verse",
            label: "",
            collapsed: false,
          },
          content: [{ type: "paragraph" }],
        },
      ],
    };
  }

  return {
    type: "doc",
    content: sections
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((section) => {
        if (section.content && typeof section.content === "object") {
          const content = section.content as Record<string, unknown>;
          if (content.type === "sectionNode") {
            return content as unknown as JSONContent;
          }
          if (content.type === "doc" && Array.isArray(content.content)) {
            return {
              type: "sectionNode",
              attrs: {
                sectionId: section.id,
                sectionType: section.type,
                label: section.label || "",
                collapsed: false,
              },
              content: content.content as JSONContent[],
            };
          }
        }

        return {
          type: "sectionNode",
          attrs: {
            sectionId: section.id,
            sectionType: section.type,
            label: section.label || "",
            collapsed: false,
          },
          content: [{ type: "paragraph" }],
        };
      }),
  };
}
