/*
  # Create Storage Bucket for Event Images

  1. Storage Setup
    - Create a public bucket named 'event-images' for storing event image files
    - Enable public access so images can be viewed without authentication
  
  2. Security
    - Set up storage policies to allow:
      - Anyone can read/view images (public access)
      - Anyone can upload images (for event creation)
      - Restrict file size and type through bucket configuration
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

CREATE POLICY "Anyone can upload event images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-images');
