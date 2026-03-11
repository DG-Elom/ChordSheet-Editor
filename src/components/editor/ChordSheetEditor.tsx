"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { SheetMetadataBar } from "./SheetMetadataBar";
import { EditorToolbar } from "./EditorToolbar";
import { ChordPopover } from "./ChordPopover";
import { ChordMark } from "@/extensions/chord-mark";
import { createChordDecorationPlugin } from "@/extensions/chord-mark";
import { SectionNode } from "@/extensions/section-node";
import { getChordSuggestions } from "@/lib/chord-engine";
import { parseChord } from "@/lib/chord-engine";
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
  } = useEditorStore();
  const [chordPopoverPos, setChordPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [chordSuggestions] = useState<string[]>(() => getChordSuggestions("", 20));
  const [editingChord, setEditingChord] = useState<EditingChordState | null>(null);
  const [popoverKey, setPopoverKey] = useState(0);
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

  return (
    <div className={`flex flex-col ${focusMode ? "fixed inset-0 z-50 bg-background" : "h-full"}`}>
      <SheetMetadataBar />
      <EditorToolbar
        editor={editor}
        onAddSection={handleAddSection}
        onTransposeUp={handleTransposeUp}
        onTransposeDown={handleTransposeDown}
      />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
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
