/*
  # Add user_id to events table and update RLS policies

  ## Changes
  1. Add user_id column to events table
    - `user_id` (uuid, references auth.users) - The user who created the event
    - Nullable for backward compatibility with existing events
  
  2. Update RLS Policies
    - Keep public read access for all events
    - Restrict INSERT to authenticated users only
    - Users can only UPDATE their own events
    - Users can only DELETE their own events
  
  ## Security
  - Only authenticated users can create events
  - Users can only modify/delete their own events
  - All events remain publicly readable for discovery
*/

-- Add user_id column to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE events ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
  END IF;
END $$;

-- Drop existing insert, update, and delete policies if they exist
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

-- Create policy for authenticated users to insert events
CREATE POLICY "Authenticated users can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own events
CREATE POLICY "Users can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own events
CREATE POLICY "Users can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);