-- ============================================
-- MIGRATION: Système de Validation des Abonnements
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Étape 1: Ajouter les colonnes si elles n'existent pas
DO $$ 
BEGIN
    -- payment_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='entreprise_subscriptions' AND column_name='payment_status') THEN
        ALTER TABLE entreprise_subscriptions ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;
    
    -- receipt_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='entreprise_subscriptions' AND column_name='receipt_url') THEN
        ALTER TABLE entreprise_subscriptions ADD COLUMN receipt_url TEXT;
    END IF;
    
    -- admin_notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='entreprise_subscriptions' AND column_name='admin_notes') THEN
        ALTER TABLE entreprise_subscriptions ADD COLUMN admin_notes TEXT;
    END IF;
    
    -- verified_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='entreprise_subscriptions' AND column_name='verified_by') THEN
        ALTER TABLE entreprise_subscriptions ADD COLUMN verified_by UUID;
    END IF;
    
    -- verified_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='entreprise_subscriptions' AND column_name='verified_at') THEN
        ALTER TABLE entreprise_subscriptions ADD COLUMN verified_at TIMESTAMPTZ;
    END IF;
END $$;

-- Étape 2: Ajouter la contrainte pour payment_status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'entreprise_subscriptions_payment_status_check') THEN
        ALTER TABLE entreprise_subscriptions 
        ADD CONSTRAINT entreprise_subscriptions_payment_status_check 
        CHECK (payment_status IN ('pending', 'verified', 'rejected'));
    END IF;
END $$;

-- Étape 3: Créer les index
CREATE INDEX IF NOT EXISTS idx_entreprise_subscriptions_payment_status 
ON entreprise_subscriptions(payment_status);

CREATE INDEX IF NOT EXISTS idx_entreprise_subscriptions_verified_by 
ON entreprise_subscriptions(verified_by);

-- Étape 4: Mettre à jour les abonnements existants
UPDATE entreprise_subscriptions 
SET payment_status = 'verified' 
WHERE is_active = true AND (payment_status IS NULL OR payment_status = 'pending');

-- Étape 5: Créer le bucket storage (si nécessaire)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Étape 6: Vérifier le résultat
SELECT 
    'Colonnes créées' as status,
    COUNT(*) as total_subscriptions,
    SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN payment_status = 'verified' THEN 1 ELSE 0 END) as verified_count
FROM entreprise_subscriptions;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
