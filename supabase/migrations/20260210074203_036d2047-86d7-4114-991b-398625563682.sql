
-- Reports table for broken episodes and links
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  anime_id INTEGER,
  anime_title TEXT,
  episode_number INTEGER,
  report_type TEXT NOT NULL DEFAULT 'broken_link',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Anyone can submit reports (even anonymous)
CREATE POLICY "Anyone can create reports"
ON public.reports FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (auth.uid() = user_id);
