import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { SectionNodeView } from "./SectionNodeView";

export interface SectionNodeAttributes {
  sectionId: string;
  sectionType: string;
  label: string;
  collapsed: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    sectionNode: {
      insertSection: (attrs?: Partial<SectionNodeAttributes>) => ReturnType;
      updateSectionAttrs: (sectionId: string, attrs: Partial<SectionNodeAttributes>) => ReturnType;
      removeSection: (sectionId: string) => ReturnType;
      toggleSectionCollapse: (sectionId: string) => ReturnType;
    };
  }
}

export const SectionNode = Node.create({
  name: "sectionNode",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      sectionId: {
        default: () => crypto.randomUUID(),
        parseHTML: (el) => el.getAttribute("data-section-id"),
        renderHTML: (attrs) => ({ "data-section-id": attrs.sectionId }),
      },
      sectionType: {
        default: "verse",
        parseHTML: (el) => el.getAttribute("data-section-type"),
        renderHTML: (attrs) => ({ "data-section-type": attrs.sectionType }),
      },
      label: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-section-label"),
        renderHTML: (attrs) => ({ "data-section-label": attrs.label }),
      },
      collapsed: {
        default: false,
        parseHTML: (el) => el.getAttribute("data-collapsed") === "true",
        renderHTML: (attrs) => ({
          "data-collapsed": attrs.collapsed ? "true" : "false",
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-section="true"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-section": "true",
        class: "section-node",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SectionNodeView);
  },

  addCommands() {
    return {
      insertSection:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              sectionId: crypto.randomUUID(),
              sectionType: attrs?.sectionType || "verse",
              label: attrs?.label || "",
              collapsed: false,
              ...attrs,
            },
            content: [{ type: "paragraph" }],
          });
        },

      updateSectionAttrs:
        (sectionId, attrs) =>
        ({ tr, state, dispatch }) => {
          let found = false;
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name && node.attrs.sectionId === sectionId) {
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  ...attrs,
                });
              }
              found = true;
              return false;
            }
          });
          return found;
        },

      removeSection:
        (sectionId) =>
        ({ tr, state, dispatch }) => {
          let found = false;
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name && node.attrs.sectionId === sectionId) {
              if (dispatch) {
                tr.delete(pos, pos + node.nodeSize);
              }
              found = true;
              return false;
            }
          });
          return found;
        },

      toggleSectionCollapse:
        (sectionId) =>
        ({ tr, state, dispatch }) => {
          let found = false;
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name && node.attrs.sectionId === sectionId) {
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  collapsed: !node.attrs.collapsed,
                });
              }
              found = true;
              return false;
            }
          });
          return found;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => {
        return this.editor.commands.insertSection();
      },
    };
  },
});
