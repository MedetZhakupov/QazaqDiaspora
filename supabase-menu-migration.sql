-- Migration: Add menu/potluck system for events
-- This allows event organizers to create menu items and attendees to claim them

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu_claims table (tracks who is bringing what)
CREATE TABLE IF NOT EXISTS menu_claims (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  registration_id UUID REFERENCES event_registrations(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(menu_item_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_event ON menu_items(event_id);
CREATE INDEX IF NOT EXISTS idx_menu_claims_item ON menu_claims(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_claims_user ON menu_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_claims_registration ON menu_claims(registration_id);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_claims ENABLE ROW LEVEL SECURITY;

-- Policies for menu_items table
CREATE POLICY "Menu items are viewable by everyone"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Only event organizers can create menu items"
  ON menu_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = menu_items.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Only event organizers can update menu items"
  ON menu_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = menu_items.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Only event organizers can delete menu items"
  ON menu_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = menu_items.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Policies for menu_claims table
CREATE POLICY "Menu claims are viewable by everyone"
  ON menu_claims FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own menu claims"
  ON menu_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menu claims"
  ON menu_claims FOR DELETE
  USING (auth.uid() = user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Menu system migration completed successfully!';
  RAISE NOTICE '→ Event organizers can now add menu items when creating events';
  RAISE NOTICE '→ Attendees must select menu items before registering';
END $$;
