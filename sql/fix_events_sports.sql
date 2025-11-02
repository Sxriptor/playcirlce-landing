-- Fix Events Table to Support All Sports (Padel, Basketball, Volleyball)
-- Run this in your Supabase SQL Editor

-- Drop the existing sport check constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_sport_check;

-- Add the new constraint with all sports included
ALTER TABLE events ADD CONSTRAINT events_sport_check
  CHECK (sport IN ('tennis', 'padel', 'pickleball', 'squash', 'racquetball', 'badminton', 'table_tennis', 'basketball', 'volleyball'));

-- Verify the constraint was added
SELECT
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'events'::regclass
  AND conname = 'events_sport_check';
