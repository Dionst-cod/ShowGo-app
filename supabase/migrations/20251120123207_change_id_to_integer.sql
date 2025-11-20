/*
  # Change Event IDs to Sequential Integers

  ## Overview
  This migration changes the events table ID column from UUID to auto-incrementing integers.
  
  ## Changes Made
  1. Create a new table with integer IDs
  2. Migrate existing data with sequential IDs (1-6)
  3. Drop the old table
  4. Rename the new table
  5. Recreate all indexes, policies, and constraints
  
  ## Security
  - Row Level Security (RLS) is maintained on the new table
  - Public read access policies are preserved
  - All existing security policies are recreated
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Events are publicly readable" ON events;
DROP POLICY IF EXISTS "Authenticated users can read events" ON events;

-- Create new events table with integer ID
CREATE TABLE IF NOT EXISTS events_new (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  location text NOT NULL,
  venue text NOT NULL,
  event_date date NOT NULL,
  event_time text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data from old table to new table
INSERT INTO events_new (name, description, image_url, location, venue, event_date, event_time, category, created_at, updated_at)
SELECT name, description, image_url, location, venue, event_date, event_time, category, created_at, updated_at
FROM events
ORDER BY created_at;

-- Drop old table
DROP TABLE events;

-- Rename new table to events
ALTER TABLE events_new RENAME TO events;

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Recreate policy for public read access
CREATE POLICY "Events are publicly readable"
  ON events
  FOR SELECT
  TO anon
  USING (true);

-- Recreate policy for authenticated users to read events
CREATE POLICY "Authenticated users can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
