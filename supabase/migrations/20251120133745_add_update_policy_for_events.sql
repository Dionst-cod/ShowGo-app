/*
  # Add UPDATE Policy for Events Table

  ## Overview
  This migration adds a policy to allow public users to update events in the events table.

  ## Changes Made
  1. Add UPDATE policy for events table
     - Allows all users (including anonymous) to update any event
     - Required for the event editing functionality in the application

  ## Security
  - Policy allows unrestricted updates to events table
  - This is appropriate for the current application scope where events can be edited by anyone
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can update events" ON events;

-- Add policy for public update access
CREATE POLICY "Anyone can update events"
  ON events
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);