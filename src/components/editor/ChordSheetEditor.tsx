"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useState } from "react";
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

export function ChordSheetEditor({ sheet, sections }: ChordSheetEditorProps) {
  const { setSheet, setSections, focusMode, chordInsertMode, toggleChordInsertMode } =
    useEditorStore();
  const [chordPopoverPos, setChordPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [chordSuggestions] = useState<string[]>(() => getChordSuggestions("", 20));

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
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none px-6 py-4 focus:outline-none min-h-[60vh]",
      },
      handleClick(view, pos) {
        if (!view.dom.closest("[data-chord-insert]")) return false;

        const coords = view.coordsAtPos(pos);
        setChordPopoverPos({ x: coords.left, y: coords.top });
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

  const handleChordSubmit = useCallback(
    (chordString: string) => {
      if (!editor) return;

      const parsed = parseChord(chordString);
      if (!parsed) return;

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

      setChordPopoverPos(null);
    },
    [editor],
  );

  const handleChordPopoverClose = useCallback(() => {
    setChordPopoverPos(null);
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
          editor={editor}
          position={chordPopoverPos}
          onClose={handleChordPopoverClose}
          onSubmit={handleChordSubmit}
          suggestions={chordSuggestions}
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
