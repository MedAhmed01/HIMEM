-- OMIGEC Platform Initial Schema
-- This migration creates the core database structure for the platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE engineer_status AS ENUM (
  'pending_docs',
  'pending_reference',
  'validated',
  'suspended'
);

CREATE TYPE exercise_mode AS ENUM (
  'personne_physique',
  'personne_morale',
  'employe_public',
  'employe_prive'
);

CREATE TYPE verification_status AS ENUM (
  'pending',
  'confirmed',
  'rejected'
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nni VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  diploma VARCHAR(255),
  grad_year INTEGER,
  domain TEXT[] DEFAULT '{}',
  exercise_mode exercise_mode,
  status engineer_status DEFAULT 'pending_docs',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  diploma_file_path TEXT,
  cni_file_path TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- References list (approved engineers who can vouch)
CREATE TABLE references_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id),
  UNIQUE(engineer_id)
);

-- Verification requests
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reference_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status verification_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  description TEXT,
  contact_info TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_nni ON profiles(nni);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_subscription_expiry ON profiles(subscription_expiry);
CREATE INDEX idx_verifications_applicant ON verifications(applicant_id);
CREATE INDEX idx_verifications_reference ON verifications(reference_id);
CREATE INDEX idx_verifications_status ON verifications(status);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE profiles IS 'Engineer profiles with registration and subscription information';
COMMENT ON TABLE references_list IS 'List of approved engineers who can vouch for new applicants';
COMMENT ON TABLE verifications IS 'Verification requests linking applicants to reference engineers';
COMMENT ON TABLE jobs IS 'Job postings visible to active engineers';
