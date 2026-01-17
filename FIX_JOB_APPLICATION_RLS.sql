-- Fix job application RLS policies
-- Run this in Supabase SQL Editor if there are still issues

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'job_applications';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'job_applications';

-- Test if auth.uid() works correctly
SELECT auth.uid() as current_user_id;

-- Check if there are any job applications
SELECT COUNT(*) as total_applications FROM job_applications;

-- Check profiles table structure
SELECT id, user_type, status, email 
FROM profiles 
WHERE id = auth.uid();

-- Test inserting a job application (replace with actual job_id)
-- INSERT INTO job_applications (job_id, engineer_id, status, cover_letter)
-- VALUES ('your-job-id-here', auth.uid(), 'pending', 'Test application');

-- If RLS policies are causing issues, temporarily disable them for testing:
-- ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing:
-- ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Check if user has the correct permissions
SELECT 
  p.id as profile_id,
  p.user_type,
  p.status,
  p.email,
  u.id as auth_id,
  u.email as auth_email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.id = auth.uid();