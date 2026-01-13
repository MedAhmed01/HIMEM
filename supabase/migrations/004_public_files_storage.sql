-- Public Files Storage Setup
-- This migration creates a public storage bucket for articles, sponsors, and other public content

-- Create public-files bucket for public content (articles, sponsors, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-files', 'public-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public-files bucket

-- Allow admins to upload public files
CREATE POLICY "admins_upload_public_files" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public-files'
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Allow everyone to view public files
CREATE POLICY "public_view_public_files" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'public-files');

-- Allow admins to update public files
CREATE POLICY "admins_update_public_files" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public-files'
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Allow admins to delete public files
CREATE POLICY "admins_delete_public_files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public-files'
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );