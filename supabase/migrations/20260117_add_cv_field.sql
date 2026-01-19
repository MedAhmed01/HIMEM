-- Add CV field to profiles table
-- This migration adds support for CV upload functionality

-- Add cv_url field to profiles table
ALTER TABLE profiles ADD COLUMN cv_url TEXT;

-- Add index for better query performance
CREATE INDEX idx_profiles_cv_url ON profiles(cv_url);

-- Add comment for documentation
COMMENT ON COLUMN profiles.cv_url IS 'URL to the engineer CV PDF file stored in Supabase Storage';