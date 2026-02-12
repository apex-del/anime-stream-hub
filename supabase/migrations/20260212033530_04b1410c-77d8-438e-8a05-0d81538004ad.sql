
-- Create comments table for anime discussions
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  anime_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Comments are viewable by everyone"
ON public.comments FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Users can create their own comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups by anime
CREATE INDEX idx_comments_anime_id ON public.comments (anime_id);
CREATE INDEX idx_comments_created_at ON public.comments (created_at DESC);
