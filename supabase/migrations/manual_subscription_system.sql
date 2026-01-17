-- Migration: Manual Subscription System for Enterprises
-- Remove automatic payment processing and make everything admin-controlled

-- Update entreprise_subscriptions table to support manual admin management
ALTER TABLE entreprise_subscriptions 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entreprise_subscriptions_payment_status 
ON entreprise_subscriptions(payment_status);

CREATE INDEX IF NOT EXISTS idx_entreprise_subscriptions_verified_by 
ON entreprise_subscriptions(verified_by);

CREATE INDEX IF NOT EXISTS idx_entreprise_subscriptions_active_expires 
ON entreprise_subscriptions(is_active, expires_at);

-- Update RLS policies for entreprise_subscriptions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Entreprises can view their own subscriptions" ON entreprise_subscriptions;
DROP POLICY IF EXISTS "Entreprises can create subscriptions" ON entreprise_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON entreprise_subscriptions;

-- Create new RLS policies
CREATE POLICY "Entreprises can view their own subscriptions"
ON entreprise_subscriptions FOR SELECT
TO authenticated
USING (
  entreprise_id IN (
    SELECT id FROM entreprises WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Entreprises can create subscription requests"
ON entreprise_subscriptions FOR INSERT
TO authenticated
WITH CHECK (
  entreprise_id IN (
    SELECT id FROM entreprises WHERE user_id = auth.uid() AND status = 'valide'
  )
  AND payment_status = 'pending'
  AND is_active = false
);

CREATE POLICY "Admins can manage all subscriptions"
ON entreprise_subscriptions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Update job_offers policies to check for active subscription
DROP POLICY IF EXISTS "Entreprises can manage their job offers" ON job_offers;

CREATE POLICY "Entreprises can view their job offers"
ON job_offers FOR SELECT
TO authenticated
USING (
  entreprise_id IN (
    SELECT id FROM entreprises WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Entreprises can create job offers with active subscription"
ON job_offers FOR INSERT
TO authenticated
WITH CHECK (
  entreprise_id IN (
    SELECT e.id FROM entreprises e
    INNER JOIN entreprise_subscriptions es ON e.id = es.entreprise_id
    WHERE e.user_id = auth.uid() 
    AND e.status = 'valide'
    AND es.is_active = true 
    AND es.payment_status = 'verified'
    AND es.expires_at > NOW()
  )
);

CREATE POLICY "Entreprises can update their job offers with active subscription"
ON job_offers FOR UPDATE
TO authenticated
USING (
  entreprise_id IN (
    SELECT e.id FROM entreprises e
    INNER JOIN entreprise_subscriptions es ON e.id = es.entreprise_id
    WHERE e.user_id = auth.uid() 
    AND e.status = 'valide'
    AND es.is_active = true 
    AND es.payment_status = 'verified'
    AND es.expires_at > NOW()
  )
);

CREATE POLICY "Entreprises can delete their job offers"
ON job_offers FOR DELETE
TO authenticated
USING (
  entreprise_id IN (
    SELECT id FROM entreprises WHERE user_id = auth.uid()
  )
);

-- Create function to check subscription quota
CREATE OR REPLACE FUNCTION check_job_offer_quota()
RETURNS TRIGGER AS $$
DECLARE
  current_offers INTEGER;
  max_offers INTEGER;
  subscription_plan TEXT;
BEGIN
  -- Get current subscription plan
  SELECT es.plan INTO subscription_plan
  FROM entreprise_subscriptions es
  WHERE es.entreprise_id = NEW.entreprise_id
  AND es.is_active = true
  AND es.payment_status = 'verified'
  AND es.expires_at > NOW()
  LIMIT 1;

  -- Get max offers for the plan
  max_offers := CASE subscription_plan
    WHEN 'starter' THEN 3
    WHEN 'business' THEN 10
    WHEN 'premium' THEN 999999 -- Unlimited
    ELSE 0
  END;

  -- Count current active offers
  SELECT COUNT(*) INTO current_offers
  FROM job_offers
  WHERE entreprise_id = NEW.entreprise_id
  AND is_active = true;

  -- Check quota (only for INSERT operations)
  IF TG_OP = 'INSERT' AND current_offers >= max_offers THEN
    RAISE EXCEPTION 'Quota d''offres d''emploi atteint pour ce plan d''abonnement';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quota checking
DROP TRIGGER IF EXISTS trigger_check_job_offer_quota ON job_offers;
CREATE TRIGGER trigger_check_job_offer_quota
  BEFORE INSERT ON job_offers
  FOR EACH ROW
  EXECUTE FUNCTION check_job_offer_quota();

-- Create function to get subscription info
CREATE OR REPLACE FUNCTION get_entreprise_subscription_info(entreprise_uuid UUID)
RETURNS TABLE (
  has_active_subscription BOOLEAN,
  plan TEXT,
  expires_at TIMESTAMPTZ,
  remaining_quota INTEGER,
  used_quota INTEGER
) AS $$
DECLARE
  active_sub RECORD;
  max_offers INTEGER;
  current_offers INTEGER;
BEGIN
  -- Get active subscription
  SELECT * INTO active_sub
  FROM entreprise_subscriptions es
  WHERE es.entreprise_id = entreprise_uuid
  AND es.is_active = true
  AND es.payment_status = 'verified'
  AND es.expires_at > NOW()
  LIMIT 1;

  IF active_sub IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TIMESTAMPTZ, 0, 0;
    RETURN;
  END IF;

  -- Get max offers for the plan
  max_offers := CASE active_sub.plan
    WHEN 'starter' THEN 3
    WHEN 'business' THEN 10
    WHEN 'premium' THEN 999999
    ELSE 0
  END;

  -- Count current active offers
  SELECT COUNT(*) INTO current_offers
  FROM job_offers
  WHERE entreprise_id = entreprise_uuid
  AND is_active = true;

  RETURN QUERY SELECT 
    true,
    active_sub.plan,
    active_sub.expires_at,
    GREATEST(0, max_offers - current_offers),
    current_offers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_entreprise_subscription_info(UUID) TO authenticated;