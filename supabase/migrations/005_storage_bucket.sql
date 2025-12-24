-- =============================================
-- CREATE STORAGE BUCKET FOR IMAGES
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- Create the images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to upload (but we'll use service role in API)
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images');
