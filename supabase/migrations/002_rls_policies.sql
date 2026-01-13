-- Row Level Security Policies for OMIGEC Platform

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE references_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Public can view only NNI and status of active/paid engineers
CREATE POLICY "public_view_active_engineers" ON profiles
  FOR SELECT
  USING (
    status = 'validated' 
    AND subscription_expiry > NOW()
  );

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except admin and status fields)
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM profiles WHERE id = auth.uid())
  );

-- Users can insert their own profile during registration
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "admins_view_all_profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update all profiles
CREATE POLICY "admins_update_all_profiles" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================================
-- REFERENCES_LIST TABLE POLICIES
-- ============================================================================

-- Admins can manage references list
CREATE POLICY "admins_manage_references" ON references_list
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Engineers with pending_reference status can view references list
CREATE POLICY "pending_engineers_view_references" ON references_list
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND status = 'pending_reference'
    )
  );

-- ============================================================================
-- VERIFICATIONS TABLE POLICIES
-- ============================================================================

-- Applicants can view their own verification requests
CREATE POLICY "applicants_view_own_verifications" ON verifications
  FOR SELECT
  USING (applicant_id = auth.uid());

-- Applicants can create verification requests
CREATE POLICY "applicants_create_verifications" ON verifications
  FOR INSERT
  WITH CHECK (applicant_id = auth.uid());

-- Reference engineers can view verifications where they are the reference
CREATE POLICY "references_view_their_verifications" ON verifications
  FOR SELECT
  USING (reference_id = auth.uid());

-- Reference engineers can update verifications where they are the reference
CREATE POLICY "references_update_their_verifications" ON verifications
  FOR UPDATE
  USING (reference_id = auth.uid())
  WITH CHECK (reference_id = auth.uid());

-- Admins can view all verifications
CREATE POLICY "admins_view_all_verifications" ON verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update all verifications
CREATE POLICY "admins_update_all_verifications" ON verifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================================
-- JOBS TABLE POLICIES
-- ============================================================================

-- Active engineers can view jobs
CREATE POLICY "active_engineers_view_jobs" ON jobs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND status = 'validated'
      AND subscription_expiry > NOW()
    )
  );

-- Admins can manage all jobs
CREATE POLICY "admins_manage_jobs" ON jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Public can view job listings (but not full details - handled in application layer)
CREATE POLICY "public_view_job_listings" ON jobs
  FOR SELECT
  USING (is_active = TRUE);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if an engineer is active (validated + paid subscription)
CREATE OR REPLACE FUNCTION is_engineer_active(engineer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = engineer_id
    AND status = 'validated'
    AND subscription_expiry > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
