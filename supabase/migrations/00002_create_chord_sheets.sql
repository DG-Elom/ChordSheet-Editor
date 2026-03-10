CREATE TABLE public.chord_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled',
  artist TEXT,
  song_key TEXT,
  tempo TEXT,
  bpm INTEGER CHECK (bpm IS NULL OR (bpm > 0 AND bpm < 400)),
  time_signature TEXT DEFAULT '4/4',
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chord_sheets_owner ON public.chord_sheets(owner_id);
CREATE INDEX idx_chord_sheets_updated ON public.chord_sheets(updated_at DESC);

CREATE TRIGGER chord_sheets_updated_at
  BEFORE UPDATE ON public.chord_sheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
