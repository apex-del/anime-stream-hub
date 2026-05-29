CREATE POLICY "Anime status is viewable by everyone"
ON public.anime_status FOR SELECT USING (true);

CREATE POLICY "Favorites are viewable by everyone"
ON public.favorites FOR SELECT USING (true);

GRANT SELECT ON public.anime_status TO anon;
GRANT SELECT ON public.favorites TO anon;