-- Simple SQL script to set abdelvetahamar@gmail.com as admin
-- This version only uses existing columns

-- Set admin status
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'abdelvetahamar@gmail.com'
);

-- Verify the change
SELECT 
  u.email,
  p.full_name,
  p.is_admin,
  p.status,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'abdelvetahamar@gmail.com';