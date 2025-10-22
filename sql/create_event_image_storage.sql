-- =====================================================
-- EVENT & CLASS IMAGE STORAGE SETUP
-- =====================================================
-- This script creates storage buckets for event and class images
-- with proper validation, size limits, and access policies

-- =====================================================
-- 1. CREATE STORAGE BUCKET
-- =====================================================

-- Create the events-images bucket for storing event and class images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events-images',
  'events-images',
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
-- 2. STORAGE POLICIES FOR AUTHENTICATED USERS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Partners can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can update their event images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can delete their event images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view event images" ON storage.objects;

-- Helper function to check if user owns the partner account
CREATE OR REPLACE FUNCTION is_partner_owner(partner_id_to_check uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM partners
    WHERE id = partner_id_to_check
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow authenticated partners to upload images to their own folder
-- Folder structure: {partner_id}/{event_id}/{filename}
CREATE POLICY "Partners can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'events-images'
  AND is_partner_owner((storage.foldername(name))[1]::uuid)
);

-- Allow authenticated partners to update their own event images
CREATE POLICY "Partners can update their event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'events-images'
  AND is_partner_owner((storage.foldername(name))[1]::uuid)
)
WITH CHECK (
  bucket_id = 'events-images'
  AND is_partner_owner((storage.foldername(name))[1]::uuid)
);

-- Allow authenticated partners to delete their own event images
CREATE POLICY "Partners can delete their event images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'events-images'
  AND is_partner_owner((storage.foldername(name))[1]::uuid)
);

-- Allow public read access to all event images
CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'events-images');

-- =====================================================
-- 3. HELPER FUNCTION TO GENERATE IMAGE URL
-- =====================================================

-- Function to get the public URL for an event image
CREATE OR REPLACE FUNCTION get_event_image_url(bucket_name text, file_path text)
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
-- 4. VALIDATION FUNCTION FOR IMAGE UPLOADS
-- =====================================================

-- Function to validate event image uploads
CREATE OR REPLACE FUNCTION validate_event_image_upload()
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
DROP TRIGGER IF EXISTS validate_event_image_upload_trigger ON storage.objects;
CREATE TRIGGER validate_event_image_upload_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'events-images')
  EXECUTE FUNCTION validate_event_image_upload();

-- =====================================================
-- 5. USAGE EXAMPLES
-- =====================================================

-- Example: How to construct the file path for uploads
-- File path format: {partner_id}/{event_id}/main.jpg
-- or for additional images: {partner_id}/{event_id}/additional-1.jpg

-- Example query to update event with image URL after upload:
-- UPDATE events
-- SET image_url = get_event_image_url('events-images', '{partner_id}/{event_id}/main.jpg')
-- WHERE id = {event_id};

-- Example for additional images:
-- UPDATE events
-- SET additional_images = ARRAY[
--   get_event_image_url('events-images', '{partner_id}/{event_id}/additional-1.jpg'),
--   get_event_image_url('events-images', '{partner_id}/{event_id}/additional-2.jpg')
-- ]
-- WHERE id = {event_id};

COMMENT ON FUNCTION get_event_image_url IS 'Helper function to generate public URLs for event images stored in Supabase storage';
COMMENT ON FUNCTION validate_event_image_upload IS 'Validates event image uploads for file size and mime type restrictions';
