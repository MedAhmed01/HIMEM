-- ============================================
-- FIX: Donner les droits admin
-- ============================================

-- Étape 1: Voir tous les profils avec leur statut admin
SELECT 
    id,
    email,
    full_name,
    is_admin,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Étape 2: Trouver votre profil (remplacez par votre email)
SELECT 
    id,
    email,
    full_name,
    is_admin
FROM profiles
WHERE email = 'VOTRE_EMAIL@example.com';  -- ← REMPLACEZ ICI

-- Étape 3: Donner les droits admin (remplacez par votre email)
UPDATE profiles 
SET is_admin = true 
WHERE email = 'VOTRE_EMAIL@example.com';  -- ← REMPLACEZ ICI

-- Étape 4: Vérifier que ça a fonctionné
SELECT 
    id,
    email,
    full_name,
    is_admin
FROM profiles
WHERE email = 'VOTRE_EMAIL@example.com';  -- ← REMPLACEZ ICI

-- Résultat attendu: is_admin = true

-- ============================================
-- Si vous ne connaissez pas votre email exact
-- ============================================

-- Voir tous les emails
SELECT email, is_admin FROM profiles;

-- Ou chercher par partie d'email
SELECT email, is_admin 
FROM profiles 
WHERE email LIKE '%admin%' OR email LIKE '%med%';

-- ============================================
-- Alternative: Donner les droits au premier utilisateur créé
-- ============================================

UPDATE profiles 
SET is_admin = true 
WHERE id = (
    SELECT id FROM profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- Vérifier
SELECT email, is_admin FROM profiles WHERE is_admin = true;
