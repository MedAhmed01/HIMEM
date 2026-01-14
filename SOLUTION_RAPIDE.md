# Solution Rapide - Abonnements Pending Non Visibles

## 🎯 Problème
- Les reçus n'arrivent pas côté admin
- Les abonnements n'apparaissent pas comme "pending"

## ⚡ Solution en 3 Étapes

### Étape 1 : Exécuter la Migration SQL

1. Allez dans **Supabase Dashboard**
2. Cliquez sur **SQL Editor**
3. Créez une nouvelle query
4. Copiez-collez le contenu de `EXECUTE_THIS_SQL.sql`
5. Cliquez sur **Run**

**Résultat attendu :**
```
Colonnes créées | total_subscriptions | pending_count | verified_count
```

### Étape 2 : Vérifier que Vous Êtes Admin

Dans Supabase SQL Editor, exécutez :

```sql
-- Vérifier votre statut admin
SELECT id, email, is_admin 
FROM profiles 
WHERE email = 'VOTRE_EMAIL@example.com';
```

**Si `is_admin` = false, corrigez :**

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'VOTRE_EMAIL@example.com';
```

### Étape 3 : Redémarrer le Serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

## ✅ Test

### Test Entreprise

1. Connectez-vous en tant qu'entreprise
2. Allez sur `/entreprise/abonnement`
3. Cliquez "Souscrire" sur un forfait
4. Uploadez un reçu (JPG/PNG/PDF)
5. Cliquez "Confirmer"
6. **Vous devriez voir :** "Demande d'abonnement créée avec succès !"

### Test Admin

1. Connectez-vous en tant qu'admin
2. Allez sur `/admin/abonnements`
3. **Vous devriez voir :** La liste des abonnements en attente
4. Cliquez "Voir reçu" pour voir le fichier uploadé
5. Cliquez "Valider" pour activer l'abonnement

## 🔍 Diagnostic

Si ça ne marche toujours pas, visitez :

```
http://localhost:3000/api/debug/subscriptions
```

Cela vous montrera :
- Tous les abonnements récents
- Les abonnements pending
- Les erreurs éventuelles

## 📋 Vérifications Rapides

### Vérifier les Colonnes
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'entreprise_subscriptions'
AND column_name IN ('payment_status', 'receipt_url', 'admin_notes');
```

**Résultat attendu :** 3 lignes

### Vérifier le Bucket
```sql
SELECT * FROM storage.buckets WHERE id = 'receipts';
```

**Résultat attendu :** 1 ligne avec `public = true`

### Vérifier les Abonnements
```sql
SELECT 
  id,
  plan,
  payment_status,
  receipt_url,
  created_at
FROM entreprise_subscriptions
ORDER BY created_at DESC
LIMIT 5;
```

**Vérifiez que :**
- `payment_status` existe et = 'pending' ou 'verified'
- `receipt_url` contient une URL (si reçu uploadé)

## 🆘 Si Ça Ne Marche Toujours Pas

Consultez le guide complet : `DIAGNOSTIC_PENDING.md`

Ou partagez :
1. Les logs de la console navigateur
2. Les logs du terminal serveur
3. Le résultat de `/api/debug/subscriptions`
4. Le résultat des requêtes SQL ci-dessus

---

**Dans 99% des cas, le problème vient de la migration SQL non exécutée. Exécutez `EXECUTE_THIS_SQL.sql` et ça devrait fonctionner ! 🚀**
