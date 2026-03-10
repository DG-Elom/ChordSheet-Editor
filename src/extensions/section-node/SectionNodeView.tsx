"use client";

import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { ChevronDown, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import { SECTION_CONFIGS } from "@/types/editor.types";
import type { SectionType } from "@/types/database.types";
import { useCallback, useState } from "react";

const SECTION_TYPE_OPTIONS: SectionType[] = [
  "verse",
  "chorus",
  "bridge",
  "pre_chorus",
  "intro",
  "outro",
  "interlude",
  "tag",
  "custom",
];

export function SectionNodeView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { sectionType, label, collapsed } = node.attrs;
  const config = SECTION_CONFIGS[sectionType as SectionType] || SECTION_CONFIGS.custom;
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const toggleCollapse = useCallback(() => {
    updateAttributes({ collapsed: !collapsed });
  }, [collapsed, updateAttributes]);

  const handleTypeChange = useCallback(
    (type: SectionType) => {
      updateAttributes({ sectionType: type });
      setShowTypeMenu(false);
    },
    [updateAttributes],
  );

  return (
    <NodeViewWrapper
      className="section-node-wrapper my-3 rounded-lg border"
      style={{ borderColor: config.color + "40" }}
      data-drag-handle
    >
      {/* Section Header */}
      <div
        className="flex items-center gap-1 rounded-t-lg px-3 py-1.5"
        style={{ backgroundColor: config.color + "15" }}
        contentEditable={false}
      >
        <div className="cursor-grab text-muted-foreground" data-drag-handle>
          <GripVertical className="h-4 w-4" />
        </div>

        <button
          onClick={toggleCollapse}
          className="rounded p-0.5 text-muted-foreground hover:bg-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="rounded px-1.5 py-0.5 text-xs font-semibold"
            style={{ color: config.color }}
          >
            {config.label}
          </button>

          {showTypeMenu && (
            <div className="absolute left-0 top-full z-50 mt-1 rounded-md border border-border bg-popover py-1 shadow-md">
              {SECTION_TYPE_OPTIONS.map((type) => {
                const tc = SECTION_CONFIGS[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className="flex w-full items-center gap-2 px-3 py-1 text-left text-xs hover:bg-accent"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tc.color }} />
                    {tc.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <input
          value={label || ""}
          onChange={(e) => updateAttributes({ label: e.target.value })}
          placeholder={`${config.label} label...`}
          className="ml-1 flex-1 bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/50"
        />

        <button
          onClick={() => deleteNode()}
          className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 [div:hover>&]:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Section Content */}
      <div className={`px-4 py-2 ${collapsed ? "hidden" : ""}`}>
        <NodeViewContent className="section-content" />
      </div>
    </NodeViewWrapper>
  );
}
