import { Mark, mergeAttributes } from "@tiptap/core";

export interface ChordMarkAttributes {
  root: string;
  quality: string;
  bass: string | null;
  id: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    chordMark: {
      setChord: (attrs: Partial<ChordMarkAttributes>) => ReturnType;
      unsetChord: () => ReturnType;
    };
  }
}

export const ChordMark = Mark.create({
  name: "chordMark",

  inclusive: false,
  excludes: "",
  spanning: false,

  addAttributes() {
    return {
      root: { default: "C" },
      quality: { default: "maj" },
      bass: { default: null },
      id: { default: () => crypto.randomUUID() },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-chord="true"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const display = formatChordDisplay(
      HTMLAttributes.root,
      HTMLAttributes.quality,
      HTMLAttributes.bass,
    );

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-chord": "true",
        "data-chord-root": HTMLAttributes.root,
        "data-chord-quality": HTMLAttributes.quality,
        "data-chord-bass": HTMLAttributes.bass || "",
        "data-chord-display": display,
        class: "chord-mark",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setChord:
        (attrs) =>
        ({ commands }) => {
          return commands.setMark(this.name, {
            ...attrs,
            id: attrs.id || crypto.randomUUID(),
          });
        },
      unsetChord:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        // Toggle chord insert mode via the editor store
        // The actual popover is handled by the ChordPopover component
        const storage = this.editor.storage as unknown as Record<string, Record<string, unknown>>;
        storage.chordMark.insertMode = !storage.chordMark.insertMode;
        // Dispatch a custom event for the React layer to handle
        this.editor.view.dom.dispatchEvent(
          new CustomEvent("chord-insert-toggle", {
            detail: { active: storage.chordMark.insertMode },
          }),
        );
        return true;
      },
    };
  },

  addStorage() {
    return {
      insertMode: false,
    };
  },
});

function formatChordDisplay(root: string, quality: string, bass: string | null): string {
  const qualityMap: Record<string, string> = {
    maj: "",
    min: "m",
    "7": "7",
    maj7: "maj7",
    min7: "m7",
    dim: "dim",
    aug: "aug",
    sus2: "sus2",
    sus4: "sus4",
    dim7: "dim7",
    m7b5: "m7b5",
    add9: "add9",
    "9": "9",
    "11": "11",
    "13": "13",
    "6": "6",
    m6: "m6",
    aug7: "aug7",
    "5": "5",
  };

  const suffix = quality in qualityMap ? qualityMap[quality] : quality;
  let display = root + suffix;
  if (bass) {
    display += "/" + bass;
  }
  return display;
}
