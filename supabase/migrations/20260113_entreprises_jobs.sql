-- Migration: Module Emploi Entreprises
-- Créer les tables pour les entreprises, abonnements, offres d'emploi et vues

-- Table entreprises
CREATE TABLE IF NOT EXISTS entreprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nif VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sector VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  logo_url TEXT,
  status VARCHAR(20) DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'valide', 'suspendu')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table abonnements entreprises
CREATE TABLE IF NOT EXISTS entreprise_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID REFERENCES entreprises(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('starter', 'business', 'premium')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table offres d'emploi
CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID REFERENCES entreprises(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  domains TEXT[] NOT NULL,
  contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('cdi', 'cdd', 'stage', 'freelance', 'consultant')),
  location VARCHAR(255) NOT NULL,
  salary_range VARCHAR(100),
  deadline DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table vues d'offres
CREATE TABLE IF NOT EXISTS job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_offers(id) ON DELETE CASCADE,
  engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, engineer_id)
);


-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_entreprises_status ON entreprises(status);
CREATE INDEX IF NOT EXISTS idx_entreprises_user_id ON entreprises(user_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_entreprise ON job_offers(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_active ON job_offers(is_active, deadline);
CREATE INDEX IF NOT EXISTS idx_job_views_job ON job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_entreprise ON entreprise_subscriptions(entreprise_id, is_active);

-- Trigger pour updated_at sur entreprises
CREATE OR REPLACE FUNCTION update_entreprises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_entreprises_updated_at
  BEFORE UPDATE ON entreprises
  FOR EACH ROW
  EXECUTE FUNCTION update_entreprises_updated_at();

-- Trigger pour updated_at sur job_offers
CREATE OR REPLACE FUNCTION update_job_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_job_offers_updated_at
  BEFORE UPDATE ON job_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_job_offers_updated_at();

-- Fonction: Vérifier si une entreprise a un abonnement actif
CREATE OR REPLACE FUNCTION is_entreprise_subscription_active(ent_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM entreprise_subscriptions
    WHERE entreprise_id = ent_id
    AND is_active = true
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction: Obtenir le quota restant d'une entreprise
CREATE OR REPLACE FUNCTION get_entreprise_remaining_quota(ent_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_plan VARCHAR(20);
  max_offers INTEGER;
  current_offers INTEGER;
BEGIN
  SELECT plan INTO current_plan
  FROM entreprise_subscriptions
  WHERE entreprise_id = ent_id AND is_active = true AND expires_at > NOW()
  ORDER BY created_at DESC LIMIT 1;
  
  IF current_plan IS NULL THEN
    RETURN 0;
  END IF;
  
  max_offers := CASE current_plan
    WHEN 'starter' THEN 3
    WHEN 'business' THEN 10
    WHEN 'premium' THEN 999999
  END;
  
  SELECT COUNT(*) INTO current_offers
  FROM job_offers
  WHERE entreprise_id = ent_id AND is_active = true;
  
  RETURN max_offers - current_offers;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Obtenir l'entreprise par user_id
CREATE OR REPLACE FUNCTION get_entreprise_by_user(uid UUID)
RETURNS entreprises AS $$
DECLARE
  ent entreprises;
BEGIN
  SELECT * INTO ent FROM entreprises WHERE user_id = uid LIMIT 1;
  RETURN ent;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies pour entreprises
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entreprises visibles publiquement si validées"
  ON entreprises FOR SELECT
  USING (status = 'valide' OR auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Entreprise peut modifier son propre profil"
  ON entreprises FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Insertion entreprise lors inscription"
  ON entreprises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies pour entreprise_subscriptions
ALTER TABLE entreprise_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Abonnements visibles par l'entreprise ou admin"
  ON entreprise_subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM entreprises WHERE id = entreprise_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Création abonnement par entreprise validée"
  ON entreprise_subscriptions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM entreprises WHERE id = entreprise_id AND user_id = auth.uid() AND status = 'valide')
  );

-- RLS Policies pour job_offers
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Offres actives visibles par ingénieurs actifs"
  ON job_offers FOR SELECT
  USING (
    (is_active = true AND deadline >= CURRENT_DATE)
    OR EXISTS (SELECT 1 FROM entreprises WHERE id = entreprise_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Entreprise peut créer ses offres"
  ON job_offers FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM entreprises WHERE id = entreprise_id AND user_id = auth.uid())
  );

CREATE POLICY "Entreprise peut modifier ses offres"
  ON job_offers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM entreprises WHERE id = entreprise_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM entreprises WHERE id = entreprise_id AND user_id = auth.uid()));

CREATE POLICY "Entreprise peut supprimer ses offres"
  ON job_offers FOR DELETE
  USING (EXISTS (SELECT 1 FROM entreprises WHERE id = entreprise_id AND user_id = auth.uid()));

-- RLS Policies pour job_views
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vues visibles par entreprise propriétaire"
  ON job_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_offers jo
      JOIN entreprises e ON jo.entreprise_id = e.id
      WHERE jo.id = job_id AND e.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Ingénieur peut enregistrer une vue"
  ON job_views FOR INSERT
  WITH CHECK (engineer_id = auth.uid());
