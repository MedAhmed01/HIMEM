-- Force admin access for abdelvetahamar@gmail.com
-- Run this in Supabase SQL Editor

-- First check current status
SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.is_admin,
  p.full_name,
  p.created_at as profile_created,
  u.created_at as user_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'abdelvetahamar@gmail.com';

-- Force update admin status
UPDATE profiles 
SET 
  is_admin = true,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'abdelvetahamar@gmail.com'
);

-- If profile doesn't exist, create it
INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  'Abdel Vetah Amar',
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'abdelvetahamar@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE id = u.id
);

-- Verify the result
SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.is_admin,
  p.full_name,
  p.updated_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'abdelvetahamar@gmail.com';

-- Also check if there are any other admin users
SELECT email, is_admin, full_name, updated_at
FROM profiles 
WHERE is_admin = true
ORDER BY updated_at DESC;