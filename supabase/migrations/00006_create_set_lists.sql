CREATE TABLE public.set_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.set_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_list_id UUID NOT NULL REFERENCES public.set_lists(id) ON DELETE CASCADE,
  sheet_id UUID NOT NULL REFERENCES public.chord_sheets(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  custom_key TEXT,
  notes TEXT
);

CREATE TRIGGER set_lists_updated_at
  BEFORE UPDATE ON public.set_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
