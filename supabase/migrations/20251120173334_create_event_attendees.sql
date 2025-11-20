/*
  # Create event attendees table

  1. New Tables
    - `event_attendees`
      - `id` (uuid, primary key) - Unique identifier for the attendance record
      - `event_id` (integer, foreign key) - References the event being attended
      - `user_id` (uuid, foreign key) - References the user attending
      - `created_at` (timestamptz) - When the user marked attendance
      - Unique constraint on (event_id, user_id) to prevent duplicate attendance

  2. Security
    - Enable RLS on `event_attendees` table
    - Add policy for authenticated users to view all attendees
    - Add policy for authenticated users to add their own attendance
    - Add policy for authenticated users to remove their own attendance

  3. Notes
    - Each user can only attend an event once
    - Users can remove their attendance at any time
    - All authenticated users can see who's attending events
*/

CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attendees"
  ON event_attendees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add their own attendance"
  ON event_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own attendance"
  ON event_attendees
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
