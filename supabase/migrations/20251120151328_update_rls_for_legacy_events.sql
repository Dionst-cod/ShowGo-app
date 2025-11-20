/*
  # Update RLS policies to handle legacy events

  ## Changes
  - Update UPDATE policy to allow authenticated users to modify events without user_id (legacy events)
  - Update DELETE policy to allow authenticated users to delete events without user_id (legacy events)
  
  ## Security
  - Users can still only modify/delete their own events (when user_id is set)
  - Legacy events (user_id IS NULL) can be modified/deleted by any authenticated user
  - This ensures backward compatibility with existing events
*/

-- Drop existing update and delete policies
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

-- Create updated policy for users to update their own events or legacy events
CREATE POLICY "Users can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create updated policy for users to delete their own events or legacy events
CREATE POLICY "Users can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);