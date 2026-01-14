# Diagnostic - Abonnements Pending Non Visibles

## 🔍 Problèmes Identifiés

1. Les reçus envoyés par les entreprises n'arrivent pas côté admin
2. Après avoir envoyé le reçu, l'abonnement n'apparaît pas comme "pending"

## ✅ Corrections Appliquées

### 1. Correction de la Vérification Admin
**Fichier :** `app/api/admin/subscriptions/pending/route.ts`

**Avant :**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')  // ❌ Colonne n'existe pas
```

**Après :**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')  // ✅ Correct
```

### 2. Ajout de Logs
- Logs dans la création d'abonnement
- Logs dans l'upload de reçu
- Message de succès après création

### 3. API de Debug
**Nouvelle route :** `/api/debug/subscriptions`

Cette route permet de voir :
- Tous les abonnements récents
- Les abonnements pending
- Les erreurs éventuelles

## 🧪 Étapes de Diagnostic

### Étape 1 : Vérifier que la Migration SQL a été Exécutée

Connectez-vous à Supabase et exécutez :

```sql
-- Vérifier que les colonnes existent
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entreprise_subscriptions';
```

Vous devriez voir :
- `payment_status` (text)
- `receipt_url` (text)
- `admin_notes` (text)
- `verified_by` (uuid)
- `verified_at` (timestamptz)

**Si ces colonnes n'existent pas :**
→ Exécutez la migration : `supabase/migrations/add_subscription_payment_fields_v2.sql`

### Étape 2 : Vérifier les Abonnements Créés

```sql
-- Voir tous les abonnements récents
SELECT 
  id,
  plan,
  is_active,
  payment_status,
  receipt_url,
  created_at
FROM entreprise_subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

**Vérifiez :**
- `payment_status` = 'pending' ✅
- `is_active` = false ✅
- `receipt_url` = URL du reçu (si uploadé) ✅

### Étape 3 : Tester la Création d'Abonnement

1. Connectez-vous en tant qu'entreprise
2. Allez sur `/entreprise/abonnement`
3. Cliquez "Souscrire"
4. Uploadez un reçu
5. Cliquez "Confirmer"
6. **Vérifiez la console :**

```javascript
// Logs attendus :
Uploading receipt: { name: "...", size: ..., type: "..." }
Upload success: { url: "https://...", path: "..." }
Subscription creation response: { 
  success: true, 
  message: "Demande d'abonnement créée...",
  subscription: { ... }
}
```

7. **Vérifiez l'alert :**
   - Message : "Demande d'abonnement créée avec succès !"

### Étape 4 : Utiliser l'API de Debug

Visitez : `http://localhost:3000/api/debug/subscriptions`

Vous verrez :
```json
{
  "user": { "id": "...", "email": "..." },
  "allSubscriptions": {
    "count": X,
    "data": [...]
  },
  "pendingSubscriptions": {
    "count": Y,
    "data": [...]
  }
}
```

**Vérifiez :**
- `allSubscriptions.count` > 0 ✅
- `pendingSubscriptions.count` > 0 ✅
- Les données contiennent `receipt_url` ✅

### Étape 5 : Vérifier Côté Admin

1. Connectez-vous en tant qu'admin
2. Allez sur `/admin/abonnements`
3. **Si la page est vide :**

**Ouvrez la console (F12) et vérifiez :**
```javascript
// Erreur possible :
"column profiles.role does not exist"
// → La correction a été appliquée, redémarrez le serveur

// Erreur possible :
"Accès non autorisé"
// → Vérifiez que l'utilisateur a is_admin = true
```

**Vérifiez dans la DB :**
```sql
SELECT id, email, is_admin 
FROM profiles 
WHERE email = 'votre_email_admin@example.com';
```

Si `is_admin` = false, corrigez :
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'votre_email_admin@example.com';
```

## 🔧 Solutions par Problème

### Problème : "Aucun abonnement en attente"

**Cause 1 : Migration non exécutée**
```sql
-- Exécuter la migration
-- Fichier: supabase/migrations/add_subscription_payment_fields_v2.sql
```

**Cause 2 : Abonnements créés avec ancien code**
```sql
-- Vérifier les abonnements existants
SELECT * FROM entreprise_subscriptions 
WHERE payment_status IS NULL;

-- Si des abonnements ont payment_status NULL, les mettre à jour
UPDATE entreprise_subscriptions 
SET payment_status = 'verified' 
WHERE is_active = true AND payment_status IS NULL;
```

**Cause 3 : Erreur dans l'API admin**
- Vérifiez les logs serveur
- Vérifiez que `is_admin` est utilisé (pas `role`)

### Problème : "Reçu non visible"

**Cause 1 : Upload échoué**
- Vérifiez les logs console : "Upload success"
- Vérifiez Supabase Storage > receipts

**Cause 2 : URL non sauvegardée**
```sql
-- Vérifier si l'URL est sauvegardée
SELECT id, receipt_url 
FROM entreprise_subscriptions 
WHERE payment_status = 'pending';
```

**Cause 3 : Bucket n'existe pas**
- Allez dans Supabase Dashboard > Storage
- Vérifiez que le bucket `receipts` existe
- Si non, exécutez la migration SQL

### Problème : "Erreur 403 Accès non autorisé"

**Solution :**
```sql
-- Vérifier et corriger is_admin
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@example.com';
```

## 📋 Checklist Complète

- [ ] Migration SQL exécutée
- [ ] Colonnes `payment_status`, `receipt_url` existent
- [ ] Bucket `receipts` existe
- [ ] Policies storage actives
- [ ] `SUPABASE_SERVICE_ROLE_KEY` définie
- [ ] Admin a `is_admin = true`
- [ ] API utilise `is_admin` (pas `role`)
- [ ] Logs visibles dans la console
- [ ] Message de succès après création
- [ ] Abonnement créé avec `payment_status = 'pending'`
- [ ] Reçu uploadé dans Storage
- [ ] URL du reçu sauvegardée dans DB
- [ ] Admin peut voir les abonnements pending

## 🚀 Test Complet

### 1. Entreprise
```bash
# 1. Connectez-vous en tant qu'entreprise
# 2. Allez sur /entreprise/abonnement
# 3. Cliquez "Souscrire"
# 4. Uploadez un reçu
# 5. Cliquez "Confirmer"
# 6. Vérifiez l'alert de succès
```

### 2. Vérification DB
```sql
SELECT 
  es.*,
  e.nom as entreprise_nom
FROM entreprise_subscriptions es
JOIN entreprises e ON e.id = es.entreprise_id
WHERE es.payment_status = 'pending'
ORDER BY es.created_at DESC;
```

### 3. Admin
```bash
# 1. Connectez-vous en tant qu'admin
# 2. Allez sur /admin/abonnements
# 3. Vérifiez que l'abonnement apparaît
# 4. Cliquez "Voir reçu"
# 5. Cliquez "Valider"
```

## 📞 Support

Si le problème persiste après toutes ces vérifications :

1. Partagez les logs console (navigateur)
2. Partagez les logs serveur (terminal)
3. Partagez le résultat de `/api/debug/subscriptions`
4. Partagez le résultat des requêtes SQL ci-dessus
