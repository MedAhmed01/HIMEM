-- Create table for company projects (portfolio)
CREATE TABLE IF NOT EXISTS company_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_projects ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can view projects of active companies (assuming we filter by company status in the query, but RLS on projects usually check parent company status or just public)
-- For simplicity, public read.
CREATE POLICY "Public projects are viewable by everyone" 
ON company_projects FOR SELECT 
USING (true);

-- Companies can manage their own projects
CREATE POLICY "Companies can insert their own projects" 
ON company_projects FOR INSERT 
TO authenticated 
WITH CHECK (
  entreprise_id IN (
    SELECT id FROM entreprises WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Companies can update their own projects" 
ON company_projects FOR UPDATE 
TO authenticated 
USING (
  entreprise_id IN (
    SELECT id FROM entreprises WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Companies can delete their own projects" 
ON company_projects FOR DELETE 
TO authenticated 
USING (
  entreprise_id IN (
    SELECT id FROM entreprises WHERE user_id = auth.uid()
  )
);

-- Add index for performance
CREATE INDEX idx_company_projects_entreprise_id ON company_projects(entreprise_id);
