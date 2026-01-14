# Fix - Erreur 403 (Accès Non Autorisé) Admin

## 🔴 Problème
```
Failed to load resource: the server responded with a status of 403 (Forbidden)
/api/admin/subscriptions/pending
```

## 🎯 Cause
Votre profil n'a pas `is_admin = true` dans la base de données.

## ✅ Solution Rapide

### Option 1 : Via SQL (Recommandé)

1. **Allez dans Supabase Dashboard → SQL Editor**

2. **Exécutez cette requête pour trouver votre email :**
```sql
SELECT id, email, is_admin 
FROM profiles 
ORDER BY created_at DESC;
```

3. **Copiez votre email exact**

4. **Donnez-vous les droits admin :**
```sql
-- Remplacez par VOTRE email exact
UPDATE profiles 
SET is_admin = true 
WHERE email = 'votre.email@example.com';
```

5. **Vérifiez :**
```sql
SELECT email, is_admin 
FROM profiles 
WHERE email = 'votre.email@example.com';
```

Résultat attendu : `is_admin = true` ✅

### Option 2 : Via API

1. **Ouvrez la console du navigateur (F12)**

2. **Exécutez ce code :**
```javascript
// Vérifier votre statut
fetch('/api/debug/check-admin')
  .then(r => r.json())
  .then(data => {
    console.log('Statut actuel:', data);
    if (!data.isAdmin) {
      console.log('Vous n\'êtes pas admin, correction...');
      // Vous donner les droits admin
      return fetch('/api/debug/make-admin', { method: 'POST' })
        .then(r => r.json());
    }
  })
  .then(console.log);
```

### Option 3 : Si Vous Ne Connaissez Pas Votre Email

```sql
-- Donner les droits au premier utilisateur créé
UPDATE profiles 
SET is_admin = true 
WHERE id = (
    SELECT id FROM profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- Vérifier qui est admin maintenant
SELECT email, is_admin FROM profiles WHERE is_admin = true;
```

## 🔄 Après la Correction

1. **Déconnectez-vous** de l'application
2. **Reconnectez-vous** (pour rafraîchir la session)
3. **Allez sur** `/admin/abonnements`
4. ✅ Ça devrait fonctionner !

## 🔍 Vérification

### Dans le Terminal Serveur

Après avoir corrigé et rechargé la page `/admin/abonnements`, vous devriez voir :

```
Admin check: {
  userId: 'xxx-xxx-xxx',
  userEmail: 'votre.email@example.com',
  profile: { is_admin: true },
  isAdmin: true
}
```

### Dans la Console Navigateur

Si vous voyez encore l'erreur 403, vérifiez la réponse :

```javascript
// Dans la console (F12)
fetch('/api/admin/subscriptions/pending')
  .then(r => r.json())
  .then(console.log)
```

**Si vous voyez :**
```json
{
  "error": "Accès non autorisé",
  "debug": {
    "hasProfile": true,
    "isAdmin": false,  // ← Le problème
    "userId": "xxx"
  }
}
```

→ Votre profil existe mais `is_admin = false`
→ Réexécutez la requête SQL UPDATE

**Si vous voyez :**
```json
{
  "error": "Accès non autorisé",
  "debug": {
    "hasProfile": false,  // ← Le problème
    "isAdmin": null,
    "userId": "xxx"
  }
}
```

→ Votre profil n'existe pas dans la table `profiles`
→ Créez-le avec :

```sql
INSERT INTO profiles (id, email, is_admin)
VALUES (
  'VOTRE_USER_ID',  -- Trouvez-le dans auth.users
  'votre.email@example.com',
  true
);
```

## 🆘 Dépannage Avancé

### Trouver Votre User ID

```sql
-- Dans auth.users
SELECT id, email FROM auth.users;
```

### Vérifier la Correspondance

```sql
-- Vérifier que le profil correspond à l'utilisateur auth
SELECT 
  u.id as user_id,
  u.email as user_email,
  p.id as profile_id,
  p.email as profile_email,
  p.is_admin
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'votre.email@example.com';
```

### Créer le Profil si Manquant

```sql
-- Si le profil n'existe pas
INSERT INTO profiles (id, email, full_name, is_admin)
SELECT 
  id,
  email,
  email as full_name,
  true as is_admin
FROM auth.users
WHERE email = 'votre.email@example.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```

## 📋 Checklist

- [ ] Requête SQL exécutée
- [ ] `is_admin = true` vérifié dans la DB
- [ ] Déconnexion / Reconnexion effectuée
- [ ] Logs serveur montrent `isAdmin: true`
- [ ] Page `/admin/abonnements` accessible
- [ ] Pas d'erreur 403

## 🎓 Comprendre le Problème

L'API vérifie :
```typescript
if (!profile || !profile.is_admin) {
  return 403  // Accès refusé
}
```

Donc il faut que :
1. ✅ Le profil existe (`profile` non null)
2. ✅ `profile.is_admin = true`

Si l'un des deux manque → 403 Forbidden

---

**Dans 99% des cas, exécuter `UPDATE profiles SET is_admin = true WHERE email = '...'` résout le problème !**
