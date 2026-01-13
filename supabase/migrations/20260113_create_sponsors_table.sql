-- Create sponsors table
CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  logo_path TEXT NOT NULL,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sponsors_order ON public.sponsors(display_order);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON public.sponsors(is_active);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active sponsors
CREATE POLICY "Anyone can view active sponsors"
ON public.sponsors FOR SELECT
USING (is_active = true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Authenticated users can manage sponsors"
ON public.sponsors FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create storage bucket for sponsor logos (run this in Supabase Dashboard SQL Editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('sponsors', 'sponsors', true) ON CONFLICT DO NOTHING;

-- Storage policies (run in Supabase Dashboard)
-- CREATE POLICY "Public can view sponsor logos" ON storage.objects FOR SELECT USING (bucket_id = 'sponsors');
-- CREATE POLICY "Authenticated can upload sponsor logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sponsors');
-- CREATE POLICY "Authenticated can delete sponsor logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'sponsors');
