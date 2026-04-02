# ChordSheet-Editor - Architecture

## Purpose

Web app for creating, editing, and sharing chord sheets for musicians. TipTap-based rich editor with custom chord/section extensions, multi-format import/export, offline support, and performance mode.

## Tech Stack

| Layer           | Technology                                                                             |
| --------------- | -------------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, RSC) + React 19 + TypeScript 5 (strict)                        |
| Editor          | TipTap 3 (ProseMirror) + custom ChordMark + SectionNode extensions                     |
| Styling         | TailwindCSS 4 + next-themes (dark/light)                                               |
| State           | Zustand (client: editor, user, performance, metronome, offline) + React Query (server) |
| Forms           | React Hook Form + Zod 4                                                                |
| Backend         | Supabase (PostgreSQL, Auth SSR, RLS)                                                   |
| Exports         | @react-pdf/renderer, docx, ChordPro, TXT, PNG, MIDI                                    |
| Offline         | Serwist (PWA) + idb (IndexedDB sync queue)                                             |
| DnD             | @dnd-kit                                                                               |
| i18n            | Custom dictionary system (en, fr, es, pt)                                              |
| LLM             | Claude, OpenAI, Gemini adapters (optional AI assistant)                                |
| Package Manager | npm                                                                                    |

## Folder Tree

```
src/
  app/
    (app)/                    # Authenticated routes
      dashboard/              # User dashboard
      settings/               # User preferences
      sheets/                 # Sheet CRUD, edit, favorites, setlists, import
    (auth)/                   # login, signup, callback
    (public)/share/[token]/   # Public shared sheet viewer
    api/
      sheets/                 # CRUD + sections management
      export/{pdf,docx}/      # Server-side export
      import/url/             # Import from URL
      share/                  # Share token management
      llm/analyze/            # AI chord/section detection
  extensions/
    chord-mark/               # TipTap Mark: inline chord notation
    section-node/             # TipTap Node: section blocks (verse, chorus...)
  components/
    ui/                       # Button, Dialog, Select
    editor/                   # ChordSheetEditor, Toolbar, MetadataBar, ChordPopover
    export/, import/, share/  # Feature-specific dialogs
    layout/                   # AppHeader, AppSidebar, ThemeToggle
    chords/, performance/, metronome/, tags/, setlist/, search/, youtube/, ai/, comments/, history/, collaboration/
  lib/
    chord-engine/             # parse, transpose, diagrams, autocomplete, key detection, capo
    export/                   # PDF, DOCX, TXT, ChordPro, PNG, MIDI generators
    import/                   # ChordPro + plaintext parsers, format detection
    supabase/                 # client.ts, server.ts, admin.ts, middleware.ts
    store/                    # Zustand: editor, user, performance, metronome, offline
    hooks/                    # use-chord-sheet, use-sections, use-autosave, use-export, use-share
    validators/               # Zod: sheet-schema, section-schema, share-schema
    i18n/                     # Dictionaries (en, fr, es, pt) + useT() hook
    llm/                      # Factory + providers (claude, openai, gemini)
  types/
    database.types.ts         # Supabase table types
    editor.types.ts           # ChordData, SectionConfig, ExportOptions
```

## Data Flow

```
User edits in TipTap → EditorStore.isDirty = true
  → use-autosave (2s debounce) → extract sections from TipTap JSON
  → PUT /api/sheets/[id]/sections → Supabase (RLS)
  → React Query invalidation → isDirty = false
```

## Key Decisions

- **Custom TipTap extensions** — ChordMark (inline) + SectionNode (block) for music notation
- **Autosave** — 2s debounce, silent retry, no save button
- **5 Zustand stores** — separated by concern (editor, user, performance, metronome, offline)
- **React Query** for server state — 60s staleness, auto-invalidation on mutations
- **PWA + IndexedDB** — offline queue for pending changes
- **Multi-notation** — Anglo-Saxon (C, D, E) and Latin (Do, Re, Mi) support
- **i18n** — 4 languages, dictionary-based with useT() hook
- **6 export formats** — PDF, DOCX, TXT, ChordPro, PNG, MIDI
