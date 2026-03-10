-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chord_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chord_sheet_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_list_items ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Chord Sheets: owner CRUD + public read
CREATE POLICY "sheets_select_own" ON public.chord_sheets
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "sheets_select_public" ON public.chord_sheets
  FOR SELECT USING (is_public = true);
CREATE POLICY "sheets_insert_own" ON public.chord_sheets
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "sheets_update_own" ON public.chord_sheets
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "sheets_delete_own" ON public.chord_sheets
  FOR DELETE USING (owner_id = auth.uid());

-- Sections: access follows parent sheet ownership
CREATE POLICY "sections_select" ON public.sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chord_sheets
      WHERE chord_sheets.id = sections.sheet_id
      AND (chord_sheets.owner_id = auth.uid() OR chord_sheets.is_public = true)
    )
  );
CREATE POLICY "sections_insert" ON public.sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chord_sheets
      WHERE chord_sheets.id = sections.sheet_id
      AND chord_sheets.owner_id = auth.uid()
    )
  );
CREATE POLICY "sections_update" ON public.sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chord_sheets
      WHERE chord_sheets.id = sections.sheet_id
      AND chord_sheets.owner_id = auth.uid()
    )
  );
CREATE POLICY "sections_delete" ON public.sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.chord_sheets
      WHERE chord_sheets.id = sections.sheet_id
      AND chord_sheets.owner_id = auth.uid()
    )
  );

-- Shares: owner of sheet manages, token-based access via admin client
CREATE POLICY "shares_select_own" ON public.shares
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "shares_insert_own" ON public.shares
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "shares_update_own" ON public.shares
  FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "shares_delete_own" ON public.shares
  FOR DELETE USING (created_by = auth.uid());

-- Tags: user owns their tags
CREATE POLICY "tags_select_own" ON public.tags
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "tags_insert_own" ON public.tags
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "tags_delete_own" ON public.tags
  FOR DELETE USING (owner_id = auth.uid());

-- Chord sheet tags: access follows sheet ownership
CREATE POLICY "sheet_tags_select" ON public.chord_sheet_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chord_sheets
      WHERE chord_sheets.id = chord_sheet_tags.sheet_id
      AND chord_sheets.owner_id = auth.uid()
    )
  );
CREATE POLICY "sheet_tags_insert" ON public.chord_sheet_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chord_sheets
      WHERE chord_sheets.id = chord_sheet_tags.sheet_id
      AND chord_sheets.owner_id = auth.uid()
    )
  );
CREATE POLICY "sheet_tags_delete" ON public.chord_sheet_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.chord_sheets
      WHERE chord_sheets.id = chord_sheet_tags.sheet_id
      AND chord_sheets.owner_id = auth.uid()
    )
  );

-- Set lists: owner CRUD
CREATE POLICY "set_lists_select_own" ON public.set_lists
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "set_lists_insert_own" ON public.set_lists
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "set_lists_update_own" ON public.set_lists
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "set_lists_delete_own" ON public.set_lists
  FOR DELETE USING (owner_id = auth.uid());

-- Set list items: access follows set list ownership
CREATE POLICY "set_list_items_select" ON public.set_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.set_lists
      WHERE set_lists.id = set_list_items.set_list_id
      AND set_lists.owner_id = auth.uid()
    )
  );
CREATE POLICY "set_list_items_insert" ON public.set_list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.set_lists
      WHERE set_lists.id = set_list_items.set_list_id
      AND set_lists.owner_id = auth.uid()
    )
  );
CREATE POLICY "set_list_items_delete" ON public.set_list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.set_lists
      WHERE set_lists.id = set_list_items.set_list_id
      AND set_lists.owner_id = auth.uid()
    )
  );
