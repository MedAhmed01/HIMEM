-- ============================================
-- Retirer les droits admin à abdelvetahamar@gmail.com
-- ============================================

-- Étape 1: Vérifier le profil actuel
SELECT 
    id,
    email,
    full_name,
    is_admin,
    created_at
FROM profiles
WHERE email = 'abdelvetahamar@gmail.com';

-- Étape 2: Retirer les droits admin
UPDATE profiles 
SET is_admin = false 
WHERE email = 'abdelvetahamar@gmail.com';

-- Étape 3: Vérifier que ça a fonctionné
SELECT 
    id,
    email,
    full_name,
    is_admin
FROM profiles
WHERE email = 'abdelvetahamar@gmail.com';

-- Résultat attendu: is_admin = true

-- Étape 4: Voir tous les admins
SELECT email, full_name, is_admin 
FROM profiles 
WHERE is_admin = true;
