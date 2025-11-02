-- Fix Courts Table to Support Padel
-- Run this in your Supabase SQL Editor

-- Drop the existing sport_type check constraint
ALTER TABLE courts DROP CONSTRAINT IF EXISTS courts_sport_type_check;

-- Add the new constraint with padel included
ALTER TABLE courts ADD CONSTRAINT courts_sport_type_check
  CHECK (sport_type IN ('tennis', 'padel', 'pickleball', 'squash', 'racquetball', 'badminton', 'table_tennis'));

-- Verify the constraint was added
SELECT
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'courts'::regclass
  AND conname = 'courts_sport_type_check';
