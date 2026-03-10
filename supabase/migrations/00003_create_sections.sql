CREATE TYPE section_type AS ENUM (
  'verse', 'chorus', 'bridge', 'pre_chorus',
  'intro', 'outro', 'interlude', 'tag', 'custom'
);

CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id UUID NOT NULL REFERENCES public.chord_sheets(id) ON DELETE CASCADE,
  type section_type NOT NULL DEFAULT 'verse',
  label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}',
  reference_section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  is_collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sections_sheet ON public.sections(sheet_id);
CREATE INDEX idx_sections_order ON public.sections(sheet_id, sort_order);

CREATE TRIGGER sections_updated_at
  BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
