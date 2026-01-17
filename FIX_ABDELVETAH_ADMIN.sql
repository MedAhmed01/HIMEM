-- Fix admin status for abdelvetahamar@gmail.com
-- Run this SQL in your Supabase SQL editor

-- First, check current status
SELECT id, email, is_admin, full_name 
FROM profiles 
WHERE email = 'abdelvetahamar@gmail.com';

-- Update to admin (if profile exists)
UPDATE profiles 
SET is_admin = true, updated_at = NOW()
WHERE email = 'abdelvetahamar@gmail.com';

-- If no rows were updated, the profile might not exist
-- Check auth.users table
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'abdelvetahamar@gmail.com';

-- If user exists in auth.users but not in profiles, create the profile
INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
SELECT 
  id, 
  email, 
  'Abdel Vetah Amar', 
  true, 
  NOW(), 
  NOW()
FROM auth.users 
WHERE email = 'abdelvetahamar@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'abdelvetahamar@gmail.com'
);

-- Verify the fix
SELECT id, email, is_admin, full_name, created_at, updated_at
FROM profiles 
WHERE email = 'abdelvetahamar@gmail.com';

-- Also check if there are any other admin users
SELECT id, email, is_admin, full_name 
FROM profiles 
WHERE is_admin = true;