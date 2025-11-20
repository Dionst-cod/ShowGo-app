/*
  # Fix Security Issues

  1. Performance Optimizations
    - Add index on event_attendees.user_id for foreign key
    - Optimize all RLS policies to use (select auth.uid()) instead of auth.uid()
    - Fix function search_path for update_updated_at_column

  2. Policy Cleanup
    - Remove duplicate permissive policies on events table
    - Keep only the user-owned policies for authenticated users
    - Remove the overly permissive "Anyone can X" policies

  3. Index Cleanup
    - Remove unused indexes that were created but never used

  4. Notes
    - This migration fixes all security warnings from Supabase Advisor
    - Improves query performance at scale with optimized RLS policies
    - Leaked password protection must be enabled via Supabase Dashboard
*/

-- Add missing index for event_attendees.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);

-- Drop the overly permissive policies that conflict with user-owned policies
DROP POLICY IF EXISTS "Anyone can create events" ON events;
DROP POLICY IF EXISTS "Anyone can update events" ON events;
DROP POLICY IF EXISTS "Anyone can delete events" ON events;

-- Drop and recreate profiles policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Drop and recreate events policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

CREATE POLICY "Authenticated users can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate event_attendees policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can add their own attendance" ON event_attendees;
DROP POLICY IF EXISTS "Users can remove their own attendance" ON event_attendees;

CREATE POLICY "Users can add their own attendance"
  ON event_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove their own attendance"
  ON event_attendees
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Fix function search_path for update_updated_at_column
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop unused indexes
DROP INDEX IF EXISTS idx_events_event_date;
DROP INDEX IF EXISTS idx_events_category;
DROP INDEX IF EXISTS idx_events_user_id;
