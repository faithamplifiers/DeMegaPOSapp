CREATE TABLE IF NOT EXISTS event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON event_categories
  FOR SELECT USING (true);

CREATE POLICY "Categories can be created by admins" ON event_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Categories can be updated by admins" ON event_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Categories can be deleted by admins" ON event_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert initial categories
INSERT INTO event_categories (name, slug) VALUES
  ('Concert', 'concert'),
  ('Wedding', 'wedding'),
  ('Burial', 'burial'),
  ('Workshop', 'workshop'),
  ('Other', 'other')
ON CONFLICT (slug) DO NOTHING;
