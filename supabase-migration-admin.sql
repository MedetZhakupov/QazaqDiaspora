-- Migration: Add admin role system and update RLS policies
-- Run this if you already have the database set up

-- Add is_admin column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Drop old event policies
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Event organizers can update their events" ON events;
DROP POLICY IF EXISTS "Event organizers can delete their events" ON events;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new admin-only event policies
CREATE POLICY "Only admins can create events"
  ON events FOR INSERT
  WITH CHECK (
    auth.uid() = organizer_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can update their events"
  ON events FOR UPDATE
  USING (
    auth.uid() = organizer_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can delete their events"
  ON events FOR DELETE
  USING (
    auth.uid() = organizer_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Migration completed successfully!';
  RAISE NOTICE '→ Next step: Make your user an admin by running:';
  RAISE NOTICE '   UPDATE public.profiles SET is_admin = true WHERE id = ''YOUR_USER_ID'';';
END $$;
