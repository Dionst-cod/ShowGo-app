/*
  # Create Events Table for ShowGo

  ## Overview
  This migration creates the core events table for the ShowGo music discovery platform.
  
  ## Tables Created
  
  ### `events`
  - `id` (uuid, primary key) - Unique identifier for each event
  - `name` (text, required) - Name of the music event
  - `description` (text, required) - Detailed description of the event
  - `image_url` (text, required) - URL to the event's promotional image
  - `location` (text, required) - City and state/country of the event
  - `venue` (text, required) - Specific venue name
  - `event_date` (date, required) - Date when the event occurs
  - `event_time` (text, required) - Time when the event starts
  - `category` (text, required) - Music genre/category (Rock, Jazz, Electronic, Indie, etc.)
  - `created_at` (timestamptz) - Timestamp when the record was created
  - `updated_at` (timestamptz) - Timestamp when the record was last updated
  
  ## Security
  - Row Level Security (RLS) is enabled on the events table
  - Public read access policy allows anyone to view events
  - This is appropriate for a public event discovery platform
  
  ## Notes
  - Events are publicly accessible for discovery purposes
  - Future migrations may add user-specific features (favorites, RSVPs, etc.)
  - Image URLs should point to valid, publicly accessible images
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Events are publicly readable"
  ON events
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users to read events
CREATE POLICY "Authenticated users can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on event_date for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- Insert sample events data
INSERT INTO events (name, description, image_url, location, venue, event_date, event_time, category)
VALUES
  (
    'Rock Concert',
    'An electrifying night of rock music with epic performances.',
    'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
    'New York, NY',
    'Madison Square Garden',
    '2025-08-25',
    '8:00 PM',
    'Rock'
  ),
  (
    'Jazz Night',
    'Join us for a smooth and soulful evening of jazz tunes.',
    'https://images.pexels.com/photos/7520391/pexels-photo-7520391.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Los Angeles, CA',
    'The Jazz Lounge',
    '2025-09-10',
    '7:30 PM',
    'Jazz'
  ),
  (
    'Electronic Party',
    'Get ready to dance to the hottest electronic beats in town.',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Chicago, IL',
    'Warehouse 21',
    '2025-09-18',
    '10:00 PM',
    'Electronic'
  ),
  (
    'Indie Showcase',
    'Experience the best indie bands and emerging artists live.',
    'https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg?auto=compress&cs=tinysrgb&w=800',
    'San Francisco, CA',
    'The Independent',
    '2025-10-05',
    '8:30 PM',
    'Indie'
  ),
  (
    'Hip Hop Festival',
    'The biggest hip hop acts performing back to back all night.',
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Atlanta, GA',
    'State Farm Arena',
    '2025-10-20',
    '7:00 PM',
    'Hip Hop'
  ),
  (
    'Country Music Night',
    'A heartfelt evening of country music under the stars.',
    'https://images.pexels.com/photos/1624504/pexels-photo-1624504.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Nashville, TN',
    'Grand Ole Opry',
    '2025-11-02',
    '8:00 PM',
    'Country'
  )
ON CONFLICT DO NOTHING;