-- Matricule OMIGEC : numéro d'ordre à 4 chiffres, unique et définitif.
-- Il est attribué séquentiellement (0001, 0002, ...) et sert aussi de critère
-- de recherche publique.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS matricule CHAR(4);

CREATE SEQUENCE IF NOT EXISTS profiles_matricule_seq START WITH 1;

-- Attribution manuelle demandée : le NNI 33455178 porte le matricule 0001.
UPDATE profiles SET matricule = '0001' WHERE nni = '33455178' AND matricule IS NULL;

-- Backfill des profils restants par ordre d'inscription.
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rang
  FROM profiles
  WHERE matricule IS NULL
)
UPDATE profiles p
SET matricule = LPAD((ordered.rang + COALESCE((SELECT COUNT(*) FROM profiles WHERE matricule IS NOT NULL), 0))::text, 4, '0')
FROM ordered
WHERE p.id = ordered.id;

-- La séquence repart après le plus grand matricule déjà attribué.
-- is_called = false : le prochain nextval() renvoie exactement cette valeur.
SELECT setval(
  'profiles_matricule_seq',
  COALESCE((SELECT MAX(matricule::int) FROM profiles), 0) + 1,
  false
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_matricule ON profiles(matricule);

-- Attribution automatique à chaque nouvelle inscription.
CREATE OR REPLACE FUNCTION assign_matricule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.matricule IS NULL THEN
    NEW.matricule := LPAD(nextval('profiles_matricule_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_matricule ON profiles;
CREATE TRIGGER trg_assign_matricule
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION assign_matricule();
