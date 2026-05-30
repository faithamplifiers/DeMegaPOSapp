-- Add media URLs to content table
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS image_url text;

-- Create content_categories table
CREATE TABLE IF NOT EXISTS public.content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert initial categories
INSERT INTO public.content_categories (name, slug) VALUES
  ('General Blog', 'general-blog'),
  ('Spotlight', 'spotlight'),
  ('News', 'news'),
  ('Music', 'music'),
  ('Sermon', 'sermon'),
  ('Devotionals', 'devotionals'),
  ('Podcasts', 'podcasts'),
  ('Videos', 'videos')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.content_categories 
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON public.content_categories 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
