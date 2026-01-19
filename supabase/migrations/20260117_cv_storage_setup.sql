-- Create storage bucket for CVs
-- This migration sets up the storage bucket and policies for CV files

-- Create the CVs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own CVs
CREATE POLICY "Users can upload their own CVs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow authenticated users to view their own CVs
CREATE POLICY "Users can view their own CVs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow authenticated users to update their own CVs
CREATE POLICY "Users can update their own CVs" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow authenticated users to delete their own CVs
CREATE POLICY "Users can delete their own CVs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to CVs (for employers to view)
CREATE POLICY "Public can view CVs" ON storage.objects
FOR SELECT USING (bucket_id = 'cvs');

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;