# Supabase Rules

## Schema

- Tables: profiles, chord_sheets, sections, shares, tags, chord_sheet_tags, set_lists, set_list_items, sheet_versions, comments
- Naming: `snake_case`, English
- PKs: `id UUID DEFAULT gen_random_uuid()`
- Timestamps: `created_at`, `updated_at` with auto-trigger
- Soft deletes: `is_archived BOOLEAN` on chord_sheets

## Key Tables

- `chord_sheets` — title, artist, song_key, tempo, bpm, time_signature, youtube_url, owner_id, is_public
- `sections` — type (verse/chorus/bridge/...), label, sort_order, content (JSONB = TipTap JSON), sheet_id
- `shares` — token (unique), permission (read|comment|edit), expires_at, sheet_id

## RLS Policies

- `profiles`: SELECT/UPDATE own only
- `chord_sheets`: SELECT own + public, INSERT/UPDATE/DELETE own
- `sections`: access follows parent sheet ownership
- `shares`: CREATE/READ by owner; token-based bypass for shared access
- `tags`, `set_lists`: ownership checks

## Three Supabase Clients

```typescript
import { createClient } from "@/lib/supabase/client"; // Browser
import { createClient } from "@/lib/supabase/server"; // RSC/API
import { createAdminClient } from "@/lib/supabase/admin"; // Service role
```

## Migrations

8 migration files in `supabase/migrations/` (00001-00008).
Regenerate types after schema changes.
