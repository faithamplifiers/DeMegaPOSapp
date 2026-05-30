CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON service_categories
  FOR SELECT USING (true);

CREATE POLICY "Categories can be created by admins" ON service_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Categories can be updated by admins" ON service_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Categories can be deleted by admins" ON service_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert initial categories
INSERT INTO service_categories (name, slug) VALUES
  ('Livestreaming', 'livestreaming'),
  ('Graphics Design', 'graphics_design'),
  ('Video Coverage', 'video_coverage'),
  ('Event Production', 'event_production')
ON CONFLICT (slug) DO NOTHING;
