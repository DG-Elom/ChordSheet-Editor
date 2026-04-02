# Code Conventions

## TypeScript

- Strict mode, no `any`
- Path alias: `@/*` → `./src/*`
- Supabase types in `src/types/database.types.ts`
- Editor types in `src/types/editor.types.ts`
- Zod 4 schemas in `src/lib/validators/`

## Next.js Patterns

- **Server Components by default** — `'use client'` only when hooks/events needed
- **Route groups** — `(app)` authenticated, `(auth)` public, `(public)` shared
- **API routes** — REST in `/api/sheets/`, `/api/export/`, `/api/share/`
- **Middleware** — Supabase session refresh on every request

## Component Organization

- Feature-based folders in `src/components/`
- Reusable primitives in `src/components/ui/`
- One component per file, PascalCase naming
- Hooks: `use-*.ts` in `src/lib/hooks/`
- Stores: `*-store.ts` in `src/lib/store/`

## State Management Rules

- **React Query** for ALL server data (sheets, sections, shares)
- **Zustand** for client-only state (editor, preferences, performance)
- **Never mix** — don't put server data in Zustand stores
- **Persist** user preferences to localStorage via Zustand middleware

## Internationalization

- **No hardcoded UI strings** — always use `useT()` hook
- Translations in `src/lib/i18n/{locale}.ts`
- Keys: `"feature.action"` format (e.g., `"editor.placeholder"`)

## Styling

- TailwindCSS utilities only
- `cn()` helper from `src/lib/utils.ts` (clsx + tailwind-merge)
- Dark/light mode via `next-themes`
- No CSS modules, no styled-components

## Git

- Conventional commits enforced (commitlint + husky)
- Lint-staged: ESLint + Prettier on pre-commit
- Format: `prettier --write` on staged files
