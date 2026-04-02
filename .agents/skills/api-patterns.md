# Skill: API Patterns

## REST API Structure

```
GET    /api/sheets                    # List user's sheets
POST   /api/sheets                    # Create sheet
GET    /api/sheets/[sheetId]          # Get sheet
PUT    /api/sheets/[sheetId]          # Update metadata
DELETE /api/sheets/[sheetId]          # Archive sheet

GET    /api/sheets/[sheetId]/sections     # Get sections
POST   /api/sheets/[sheetId]/sections     # Create section
PUT    /api/sheets/[sheetId]/sections     # Reorder sections
PUT    /api/sheets/[sheetId]/sections/[sectionId]  # Update section
DELETE /api/sheets/[sheetId]/sections/[sectionId]  # Delete section

POST   /api/export/pdf               # Generate PDF
POST   /api/export/docx              # Generate DOCX
POST   /api/import/url               # Import from URL
POST   /api/share                    # Create share link
GET    /api/share/[token]            # Get share metadata
POST   /api/llm/analyze              # AI chord detection
```

## Route Handler Pattern

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { schema } from "@/lib/validators/sheet-schema";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await supabase
    .from("chord_sheets")
    .insert({
      ...parsed.data,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

## React Query Hooks

```typescript
// src/lib/hooks/use-chord-sheet.ts
export function useChordSheets() {
  return useQuery({ queryKey: ["sheets"], queryFn: fetchSheets });
}

export function useCreateSheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSheet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sheets"] }),
  });
}
```

## Autosave Flow

`use-autosave.ts`: watches `isDirty` → 2s debounce → extract sections → PUT each → reset dirty flag.
