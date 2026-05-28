
CREATE TABLE public.anime_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  anime_id INTEGER NOT NULL,
  anime_title TEXT NOT NULL,
  anime_image TEXT,
  status TEXT NOT NULL CHECK (status IN ('watched','watching','planning','dropped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, anime_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.anime_status TO authenticated;
GRANT ALL ON public.anime_status TO service_role;

ALTER TABLE public.anime_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own status"   ON public.anime_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own status" ON public.anime_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own status" ON public.anime_status FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own status" ON public.anime_status FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_anime_status_updated_at
BEFORE UPDATE ON public.anime_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_anime_status_user ON public.anime_status(user_id, status);
