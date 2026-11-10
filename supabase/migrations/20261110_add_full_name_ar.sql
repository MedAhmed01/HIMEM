-- Nom complet en arabe, affiché sur la carte professionnelle bilingue.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name_ar TEXT;
