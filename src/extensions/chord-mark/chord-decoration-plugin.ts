import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const chordDecorationPluginKey = new PluginKey("chordDecorations");

export function createChordDecorationPlugin() {
  return new Plugin({
    key: chordDecorationPluginKey,

    state: {
      init(_, state) {
        return buildDecorations(state.doc);
      },
      apply(tr, oldDecorationSet) {
        if (tr.docChanged) {
          return buildDecorations(tr.doc);
        }
        return oldDecorationSet.map(tr.mapping, tr.doc);
      },
    },

    props: {
      decorations(state) {
        return this.getState(state) ?? DecorationSet.empty;
      },
    },
  });
}

function buildDecorations(doc: Parameters<typeof DecorationSet.create>[0]) {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (!node.isInline || !node.marks.length) return;

    for (const mark of node.marks) {
      if (mark.type.name === "chordMark") {
        const display = formatDisplay(mark.attrs.root, mark.attrs.quality, mark.attrs.bass);

        const widget = createChordWidget(display, mark.attrs.id);
        decorations.push(Decoration.widget(pos, widget, { side: -1 }));
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

function createChordWidget(display: string, chordId: string): HTMLElement {
  const widget = document.createElement("span");
  widget.className = "chord-label";
  widget.textContent = display;
  widget.dataset.chordId = chordId;
  widget.setAttribute("contenteditable", "false");
  widget.setAttribute("role", "img");
  widget.setAttribute("aria-label", `Chord: ${display}`);
  return widget;
}

function formatDisplay(root: string, quality: string, bass: string | null): string {
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
