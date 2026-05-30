/*
  # Initial Database Setup

  1. Tables
    - profiles (user profiles)
    - content (articles/posts)
    - events (upcoming events)
    - services (professional services)
    - event_vendors (event service providers)

  2. Security
    - RLS policies for all tables
    - Triggers for timestamps
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS event_vendors CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  role text CHECK (role IN ('admin', 'content_creator', 'event_organizer', 'member')) DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content table
CREATE TABLE content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text,
  content text,
  category text NOT NULL,
  cover_image text,
  author_id uuid REFERENCES profiles(id),
  status text CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL,
  location text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  cover_image text,
  ticket_url text,
  livestream_url text,
  organizer_id uuid REFERENCES profiles(id),
  status text CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event vendors table
CREATE TABLE event_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  service text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price text NOT NULL,
  provider_id uuid REFERENCES profiles(id),
  portfolio_images text[],
  status text CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Published content is viewable by everyone" ON content
  FOR SELECT USING (status = 'published');

CREATE POLICY "Content creators can manage content" ON content
  FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage events" ON events
  FOR ALL USING (organizer_id = auth.uid());

CREATE POLICY "Event vendors are viewable by everyone" ON event_vendors
  FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage vendors" ON event_vendors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_vendors.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (status = 'active');

CREATE POLICY "Service providers can manage services" ON services
  FOR ALL USING (provider_id = auth.uid());

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();