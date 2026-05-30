-- Add slug columns to tables
ALTER TABLE content ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create a function to generate slugs from names/titles
CREATE OR REPLACE FUNCTION generate_slug(text_value text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(text_value, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Backfill existing rows with generated slugs
UPDATE content SET slug = generate_slug(title) WHERE slug IS NULL;
UPDATE events SET slug = generate_slug(title) WHERE slug IS NULL;
UPDATE services SET slug = generate_slug(title) WHERE slug IS NULL;
