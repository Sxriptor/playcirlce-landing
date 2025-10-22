-- =====================================================
-- MATCH IMAGE STORAGE SETUP
-- =====================================================
-- This script creates storage buckets for match images
-- with proper validation, size limits, and access policies

-- =====================================================
-- 1. ADD REQUIRED COLUMNS TO MATCHES TABLE
-- =====================================================

-- Add image_url column to matches table if it doesn't exist
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS image_url text;

-- Optional: Add column for multiple images (future enhancement)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS additional_images text[];

-- Add prize_pool column to matches table if it doesn't exist
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS prize_pool numeric(10,2);

-- Add rules column to matches table if it doesn't exist (stores match rules as JSON)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS rules jsonb;

-- Add requirements column to matches table if it doesn't exist (stores match requirements as JSON)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS requirements jsonb;

-- Add comment to document the columns
COMMENT ON COLUMN matches.image_url IS 'Main image URL for the match, stored in matches-images storage bucket';
COMMENT ON COLUMN matches.additional_images IS 'Array of additional image URLs for match gallery (future use)';
COMMENT ON COLUMN matches.prize_pool IS 'Prize pool amount for competitive matches (nullable, in dollars)';
COMMENT ON COLUMN matches.rules IS 'Match rules and regulations stored as JSONB (nullable)';
COMMENT ON COLUMN matches.requirements IS 'Match requirements and prerequisites stored as JSONB (nullable)';

-- =====================================================
-- 2. CREATE STORAGE BUCKET
-- =====================================================

-- Create the matches-images bucket for storing match images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'matches-images',
  'matches-images',
  true, -- Public bucket so images can be displayed without authentication
  5242880, -- 5MB file size limit (in bytes)
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- 3. STORAGE POLICIES FOR AUTHENTICATED USERS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Partners can upload match images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can update their match images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can delete their match images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view match images" ON storage.objects;

-- Helper function to check if user owns the partner account (reuses existing function)
-- Note: This function is already created by create_event_image_storage.sql
-- CREATE OR REPLACE FUNCTION is_partner_owner(partner_id_to_check uuid)
-- RETURNS boolean AS $$
-- BEGIN
--   RETURN EXISTS (
--     SELECT 1 FROM partners
--     WHERE id = partner_id_to_check
--     AND user_id = auth.uid()
--   );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow authenticated partners to upload images to their own folder
-- Folder structure: {partner_id}/{match_id}/{filename}
CREATE POLICY "Partners can upload match images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'matches-images'
  AND is_partner_owner((storage.foldername(name))[1]::uuid)
);

-- Allow authenticated partners to update their own match images
CREATE POLICY "Partners can update their match images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'matches-images'
  AND is_partner_owner((storage.foldername(name))[1]::uuid)
)
WITH CHECK (
  bucket_id = 'matches-images'
  AND is_partner_owner((storage.foldername(name))[1]::uuid)
);

-- Allow authenticated partners to delete their own match images
CREATE POLICY "Partners can delete their match images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'matches-images'
  AND is_partner_owner((storage.foldername(name))[1]::uuid)
);

-- Allow public read access to all match images
CREATE POLICY "Public can view match images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'matches-images');

-- =====================================================
-- 4. HELPER FUNCTION TO GENERATE IMAGE URL
-- =====================================================

-- Function to get the public URL for a match image
CREATE OR REPLACE FUNCTION get_match_image_url(bucket_name text, file_path text)
RETURNS text AS $$
DECLARE
  base_url text;
BEGIN
  -- Get the Supabase project URL (you'll need to replace this with your actual project URL)
  -- Format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
  base_url := current_setting('app.settings.supabase_url', true);

  IF base_url IS NULL THEN
    -- Fallback to a constructed URL if setting is not available
    RETURN format('/storage/v1/object/public/%s/%s', bucket_name, file_path);
  ELSE
    RETURN format('%s/storage/v1/object/public/%s/%s', base_url, bucket_name, file_path);
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 5. VALIDATION FUNCTION FOR IMAGE UPLOADS
-- =====================================================

-- Function to validate match image uploads
CREATE OR REPLACE FUNCTION validate_match_image_upload()
RETURNS trigger AS $$
BEGIN
  -- Check file size (5MB = 5242880 bytes)
  IF NEW.metadata->>'size' IS NOT NULL THEN
    IF (NEW.metadata->>'size')::bigint > 5242880 THEN
      RAISE EXCEPTION 'File size exceeds 5MB limit';
    END IF;
  END IF;

  -- Check mime type
  IF NEW.metadata->>'mimetype' IS NOT NULL THEN
    IF NEW.metadata->>'mimetype' NOT IN (
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ) THEN
      RAISE EXCEPTION 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate uploads
DROP TRIGGER IF EXISTS validate_match_image_upload_trigger ON storage.objects;
CREATE TRIGGER validate_match_image_upload_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'matches-images')
  EXECUTE FUNCTION validate_match_image_upload();

-- =====================================================
-- 6. USAGE EXAMPLES
-- =====================================================

-- Example: How to construct the file path for uploads
-- File path format: {partner_id}/{match_id}/main.jpg
-- or for additional images: {partner_id}/{match_id}/additional-1.jpg

-- Example query to update match with image URL after upload:
-- UPDATE matches
-- SET image_url = get_match_image_url('matches-images', '{partner_id}/{match_id}/main.jpg')
-- WHERE id = {match_id};

-- Example for additional images:
-- UPDATE matches
-- SET additional_images = ARRAY[
--   get_match_image_url('matches-images', '{partner_id}/{match_id}/additional-1.jpg'),
--   get_match_image_url('matches-images', '{partner_id}/{match_id}/additional-2.jpg')
-- ]
-- WHERE id = {match_id};

COMMENT ON FUNCTION get_match_image_url IS 'Helper function to generate public URLs for match images stored in Supabase storage';
COMMENT ON FUNCTION validate_match_image_upload IS 'Validates match image uploads for file size and mime type restrictions';

