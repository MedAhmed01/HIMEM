# Connexion par Numéro de Téléphone

## Vue d'ensemble
Les utilisateurs peuvent maintenant se connecter en utilisant soit leur email, soit leur numéro de téléphone.

## Fonctionnalités

### Interface de Connexion
- Champ unique acceptant email OU téléphone
- Label: "Email ou Téléphone"
- Placeholder: "votre@email.com ou 06XXXXXXXX"
- Détection automatique du type d'identifiant

### Logique de Connexion

1. **Détection du type d'identifiant**
   - Si l'identifiant contient `@` → traité comme email
   - Si l'identifiant ne contient pas `@` → traité comme numéro de téléphone

2. **Conversion téléphone → email**
   - Appel API: `POST /api/auth/phone-to-email`
   - Recherche dans la table appropriée selon le type d'utilisateur:
     - `profiles` pour les ingénieurs
     - `entreprises` pour les entreprises
   - Retourne l'email associé au numéro

3. **Authentification Supabase**
   - Utilise l'email (direct ou converti) pour l'authentification
   - Le reste du flux de connexion reste identique

## API Endpoint

### POST /api/auth/phone-to-email

**Request Body:**
```json
{
  "phone": "0612345678",
  "userType": "ingenieur" | "entreprise"
}
```

**Response Success (200):**
```json
{
  "email": "user@example.com"
}
```

**Response Error (404):**
```json
{
  "error": "Aucun ingénieur trouvé avec ce numéro de téléphone"
}
```

## Sécurité

- Utilise le client admin Supabase pour bypasser RLS
- Recherche exacte du numéro de téléphone
- Validation du type d'utilisateur
- Pas d'exposition des données sensibles

## Fichiers Modifiés

- `app/(auth)/connexion/page.tsx` - Interface de connexion
- `app/api/auth/phone-to-email/route.ts` - API de conversion téléphone → email

## Notes Techniques

- Le numéro de téléphone doit être stocké dans le même format dans la base de données
- Supabase Auth nécessite toujours un email pour l'authentification
- Le téléphone sert uniquement d'identifiant alternatif
