/*
  # Add directory listings and resources tables

  1. New Tables
    - directory_listings (business and service index)
    - resources (videos, podcasts, devotionals)

  2. Security
    - Enable RLS and add basic policies
*/

CREATE TABLE directory_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  description text,
  logo text,
  email text,
  phone text,
  website text,
  address text,
  rating numeric DEFAULT 5.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text CHECK (type IN ('video', 'podcast', 'devotional')) NOT NULL,
  url text NOT NULL,
  cover_image text,
  description text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE directory_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Directory listings are viewable by everyone" ON directory_listings
  FOR SELECT USING (true);

CREATE POLICY "Resources are viewable by everyone" ON resources
  FOR SELECT USING (true);

-- Admin management policies
CREATE POLICY "Admins can manage directory listings" ON directory_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage resources" ON resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
