/*
  # Add INSERT Policy for Events Table

  1. Security Changes
    - Add policy to allow anyone to insert new events
    - This enables the public event creation feature
  
  2. Notes
    - Allows both anonymous and authenticated users to create events
    - Maintains existing SELECT policies for reading events
*/

CREATE POLICY "Anyone can create events"
  ON events
  FOR INSERT
  TO public
  WITH CHECK (true);
