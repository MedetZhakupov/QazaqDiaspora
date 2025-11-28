-- Add English translation fields to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Rename existing columns to make language explicit
ALTER TABLE events
RENAME COLUMN title TO title_kk;

ALTER TABLE events
RENAME COLUMN description TO description_kk;

-- Add English name field to menu items
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Rename existing name column
ALTER TABLE menu_items
RENAME COLUMN name TO name_kk;

-- Add comments for clarity
COMMENT ON COLUMN events.title_kk IS 'Event title in Kazakh';
COMMENT ON COLUMN events.title_en IS 'Event title in English';
COMMENT ON COLUMN events.description_kk IS 'Event description in Kazakh';
COMMENT ON COLUMN events.description_en IS 'Event description in English';
COMMENT ON COLUMN menu_items.name_kk IS 'Menu item name in Kazakh';
COMMENT ON COLUMN menu_items.name_en IS 'Menu item name in English';
