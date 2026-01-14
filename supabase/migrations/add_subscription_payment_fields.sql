-- Add payment-related fields to entreprise_subscriptions table

-- Add payment_status column
ALTER TABLE entreprise_subscriptions 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected'));

-- Add receipt_url column
ALTER TABLE entreprise_subscriptions 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Add admin_notes column
ALTER TABLE entreprise_subscriptions 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add verified_by column (references admin user)
ALTER TABLE entreprise_subscriptions 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Add verified_at column
ALTER TABLE entreprise_subscriptions 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Create index for payment_status for faster queries
CREATE INDEX IF NOT EXISTS idx_entreprise_subscriptions_payment_status 
ON entreprise_subscriptions(payment_status);

-- Create index for verified_by
CREATE INDEX IF NOT EXISTS idx_entreprise_subscriptions_verified_by 
ON entreprise_subscriptions(verified_by);

-- Update existing subscriptions to have 'verified' status if they are active
UPDATE entreprise_subscriptions 
SET payment_status = 'verified' 
WHERE is_active = true AND payment_status = 'pending';

-- Create storage bucket for receipts if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for receipts bucket
CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Public can view receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');
