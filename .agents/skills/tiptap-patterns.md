# Skill: TipTap Editor Patterns

## Editor Setup

Main component: `src/components/editor/ChordSheetEditor.tsx`

StarterKit with limited features:

- Enabled: bold, italic, code, paragraph, hardBreak, history
- Disabled: headings, code blocks, blockquotes, lists, horizontal rules
- Placeholder: "Start typing your lyrics..."

## Custom Extensions

### ChordMark (Mark type) — `src/extensions/chord-mark/`

Inline chord annotation on text:

```typescript
// Attributes
{ root: "C", quality: "maj7", bass: "G" | null, id: UUID }

// Keyboard shortcut
Mod-K → toggle chord insert mode

// Decoration plugin renders chord labels ABOVE lyrics
```

### SectionNode (Node type) — `src/extensions/section-node/`

Block-level section container:

```typescript
// Attributes
{ sectionId: UUID, sectionType: "verse"|"chorus"|"bridge"|..., label: string, collapsed: boolean }

// Commands
editor.commands.insertSection(attrs?)
editor.commands.updateSectionAttrs(sectionId, attrs)
editor.commands.removeSection(sectionId)
editor.commands.toggleSectionCollapse(sectionId)
```

React NodeView: `SectionNodeView.tsx` — header with type badge, collapse toggle, editable label.

## Extracting Data from Editor

Autosave extracts sections from TipTap JSON:

```typescript
// use-autosave.ts
const sections = extractSectionsFromContent(editor.getJSON());
// Each section → API call (POST if new, PUT if exists)
```

## Adding a New Extension

1. Create folder in `src/extensions/new-extension/`
2. Define Mark or Node with attributes
3. Add to editor extensions array in ChordSheetEditor.tsx
4. If Node: create ReactNodeViewRenderer component
5. If visual: add decoration plugin
