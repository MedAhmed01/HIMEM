-- SQL Script to set abdelvetahamar@gmail.com as admin
-- Run this script in your Supabase SQL editor or database console

-- Update the profiles table to set is_admin = true for the specified email
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'abdelvetahamar@gmail.com'
);

-- Verify the update was successful
SELECT 
  u.email,
  p.full_name,
  p.is_admin,
  p.status,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'abdelvetahamar@gmail.com';

-- Show all current admins for verification
SELECT 
  u.email,
  p.full_name,
  p.is_admin,
  p.status
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.is_admin = true
ORDER BY p.created_at;