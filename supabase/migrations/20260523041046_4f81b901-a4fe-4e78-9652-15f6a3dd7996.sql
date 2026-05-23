
-- 1. Profiles: add bio + make publicly viewable
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- 2. Avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Anime cache tables
CREATE TABLE public.anime_cache (
  mal_id INTEGER PRIMARY KEY,
  data JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'jikan',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anime_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anime cache is viewable by everyone"
ON public.anime_cache FOR SELECT USING (true);

CREATE TABLE public.anime_episodes_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id INTEGER NOT NULL,
  page INTEGER NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(anime_id, page)
);
ALTER TABLE public.anime_episodes_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Episode cache is viewable by everyone"
ON public.anime_episodes_cache FOR SELECT USING (true);

CREATE TABLE public.anime_lists_cache (
  cache_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE public.anime_lists_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "List cache is viewable by everyone"
ON public.anime_lists_cache FOR SELECT USING (true);

CREATE INDEX idx_anime_cache_synced ON public.anime_cache(synced_at DESC);
CREATE INDEX idx_anime_episodes_anime ON public.anime_episodes_cache(anime_id);
