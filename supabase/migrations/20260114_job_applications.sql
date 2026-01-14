-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  cover_letter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, engineer_id)
);

-- Create index for faster queries
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_engineer_id ON job_applications(engineer_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Engineers can view their own applications
CREATE POLICY "Engineers can view their own applications"
  ON job_applications
  FOR SELECT
  USING (engineer_id = auth.uid());

-- Engineers can create applications
CREATE POLICY "Engineers can create applications"
  ON job_applications
  FOR INSERT
  WITH CHECK (engineer_id = auth.uid());

-- Engineers can update their own pending applications
CREATE POLICY "Engineers can update their own pending applications"
  ON job_applications
  FOR UPDATE
  USING (engineer_id = auth.uid() AND status = 'pending');

-- Companies can view applications for their jobs
CREATE POLICY "Companies can view applications for their jobs"
  ON job_applications
  FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM job_offers 
      WHERE entreprise_id IN (
        SELECT id FROM entreprises WHERE user_id = auth.uid()
      )
    )
  );

-- Companies can update applications for their jobs
CREATE POLICY "Companies can update applications for their jobs"
  ON job_applications
  FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM job_offers 
      WHERE entreprise_id IN (
        SELECT id FROM entreprises WHERE user_id = auth.uid()
      )
    )
  );

-- Add applications_count to job_offers for tracking
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0;

-- Function to update applications count
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_offers 
    SET applications_count = applications_count + 1 
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_offers 
    SET applications_count = GREATEST(applications_count - 1, 0)
    WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update applications count
CREATE TRIGGER trigger_update_job_applications_count
AFTER INSERT OR DELETE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION update_job_applications_count();
