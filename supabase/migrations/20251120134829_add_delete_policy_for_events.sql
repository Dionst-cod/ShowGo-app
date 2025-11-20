/*
  # Add DELETE Policy for Events Table

  ## Overview
  This migration adds a policy to allow users to delete events from the events table.

  ## Changes Made
  1. Add DELETE policy for events table
     - Allows all users (including anonymous) to delete any event
     - Required for the event deletion functionality in the application

  ## Security
  - Policy allows unrestricted deletes from events table
  - This is appropriate for the current application scope where events can be deleted by anyone
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can delete events" ON events;

-- Add policy for public delete access
CREATE POLICY "Anyone can delete events"
  ON events
  FOR DELETE
  TO anon, authenticated
  USING (true);