# Match Image Upload Feature

## Overview
The create match overlay now supports optional image uploads, just like the create event overlay. Partners can upload images when creating or editing matches to make them more visually appealing.

## Changes Made

### 1. Updated CreateMatchOverlay Component
**File**: `components/partner/overlays/CreateMatchOverlay.tsx`

#### Added Features:
- **Image Upload UI**: File input with drag-and-drop style interface
- **Image Preview**: Shows selected image before upload with remove option
- **Image Validation**: 
  - Validates file type (JPEG, PNG, WebP, GIF only)
  - Validates file size (max 5MB)
- **Storage Integration**: Uploads images to Supabase storage bucket `matches-images`
- **Database Integration**: Updates match record with image URL after successful upload

#### New State Variables:
```typescript
const [selectedImage, setSelectedImage] = useState<File | null>(null)
const [imagePreview, setImagePreview] = useState<string | null>(null)
const [uploadingImage, setUploadingImage] = useState(false)
```

#### New Functions:
- `handleImageSelect()`: Handles file selection and validation
- `handleRemoveImage()`: Removes selected image
- `uploadImageToStorage()`: Uploads image to Supabase storage

#### Updated Functions:
- `handleSubmit()`: Now handles image upload after creating/updating match
- Form reset `useEffect`: Clears image state when overlay closes

### 2. Created Storage Bucket SQL Setup
**File**: `sql/create_match_image_storage.sql`

This SQL script sets up:
- Storage bucket `matches-images` with 5MB file size limit
- Public read access for all match images
- Partner-only upload/update/delete permissions
- Automatic validation of file types and sizes
- Helper functions for generating image URLs

## Supabase Setup Required

### Step 1: Run SQL Script
Execute the SQL file in your Supabase SQL editor:
```sql
-- File: sql/create_match_image_storage.sql
```

This will:
1. Add columns to `matches` table:
   - `image_url` (text) - Main match image URL
   - `additional_images` (text[]) - Array for future gallery support
   - `prize_pool` (numeric) - Prize pool amount (nullable)
   - `rules` (jsonb) - Match rules stored as JSON (nullable)
   - `requirements` (jsonb) - Match requirements stored as JSON (nullable)
2. Create storage bucket `matches-images`
3. Set up security policies for partner access control
4. Create validation triggers for file uploads
5. Add helper function `get_match_image_url()`

### Step 2: Verify Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Confirm `matches-images` bucket exists
3. Check that it's configured as **public**

### Step 3: Verify Database Columns
Check that the `matches` table has the new columns:
```sql
-- Should see all 5 new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND column_name IN ('image_url', 'additional_images', 'prize_pool', 'rules', 'requirements')
ORDER BY column_name;
```

## File Structure

### Storage Organization
Images are stored with the following path structure:
```
matches-images/
  {partner_id}/
    {match_id}/
      main.jpg (or .png, .webp, .gif)
```

### Example File Path
```
matches-images/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440001/main.jpg
```

## Usage

### Creating a Match with Image
1. Open the Create Match overlay
2. Fill in match details
3. (Optional) Click "Click to upload match image"
4. Select an image file (JPEG, PNG, WebP, or GIF, max 5MB)
5. Preview the image
6. Click "Create Match"
7. Image is uploaded and URL is stored in database

### Updating a Match Image
1. Edit an existing match
2. Upload a new image (replaces previous image if exists)
3. Click "Update Match"

### Image Validation
The system validates:
- **File Type**: Only JPEG, PNG, WebP, and GIF
- **File Size**: Maximum 5MB
- **Permissions**: Only the partner who owns the venue/match can upload

## Security

### Access Control
- **Upload**: Only authenticated partners can upload images to their own matches
- **Read**: Public access (anyone can view match images)
- **Update/Delete**: Only the partner who owns the match
- **Validation**: Automatic server-side validation of file size and type

### Storage Policies
The SQL script creates Row Level Security (RLS) policies that:
1. Verify partner ownership before allowing uploads
2. Check folder structure matches partner ID
3. Enforce public read-only access for viewing

## Error Handling

### Client-side Validation
- Invalid file type → Alert: "Please select a valid image file"
- File too large → Alert: "Image size must be less than 5MB"

### Server-side Errors
- Upload failure → Alert: "Failed to upload image. The match will be created without an image."
- The match is still created/updated even if image upload fails

## Testing Checklist

- [ ] Run SQL script in Supabase
- [ ] Verify `matches-images` bucket exists and is public
- [ ] Verify `matches.image_url` column exists (text)
- [ ] Verify `matches.additional_images` column exists (text[])
- [ ] Verify `matches.prize_pool` column exists (numeric)
- [ ] Verify `matches.rules` column exists (jsonb)
- [ ] Verify `matches.requirements` column exists (jsonb)
- [ ] Test creating match with image
- [ ] Test creating match without image
- [ ] Test updating match with new image
- [ ] Test image validation (wrong type - should reject)
- [ ] Test image validation (too large - should reject >5MB)
- [ ] Verify image displays correctly after upload
- [ ] Verify permissions (partners can only upload to their matches)
- [ ] Check image URLs are publicly accessible

## Future Enhancements

Potential improvements:
- Multiple image support
- Image cropping/editing before upload
- Image optimization (compression, resizing)
- Image gallery for matches
- Default placeholder images

## Related Files

- `components/partner/overlays/CreateMatchOverlay.tsx` - Match creation UI with image upload
- `components/partner/overlays/CreateEventOverlay.tsx` - Similar implementation for events
- `sql/create_match_image_storage.sql` - Storage bucket setup
- `sql/create_event_image_storage.sql` - Reference for events storage
- `lib/supabase/matches.ts` - Match database operations

