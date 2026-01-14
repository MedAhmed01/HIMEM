# Guide de Déploiement - Système de Paiement des Abonnements

## Étapes de Déploiement

### 1. Mise à jour de la Base de Données

Exécutez le script SQL dans votre console Supabase :

```bash
# Option 1 : Via Supabase CLI
supabase db push

# Option 2 : Manuellement
# Copiez le contenu de supabase/migrations/add_subscription_payment_fields.sql
# Collez-le dans l'éditeur SQL de Supabase Dashboard
# Exécutez le script
```

### 2. Créer le Bucket Storage

Si le bucket n'est pas créé automatiquement par le script SQL :

1. Allez dans Supabase Dashboard > Storage
2. Créez un nouveau bucket nommé `receipts`
3. Configurez-le comme public
4. Les policies seront créées par le script SQL

### 3. Vérifier les Variables d'Environnement

Assurez-vous que ces variables sont définies dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Déployer le Code

```bash
# Installer les dépendances (si nécessaire)
npm install

# Build
npm run build

# Démarrer
npm start
```

### 5. Tester le Flux

#### Test Entreprise :
1. Connectez-vous en tant qu'entreprise validée
2. Allez sur `/entreprise/abonnement`
3. Cliquez sur "Souscrire" pour un forfait
4. Uploadez un reçu de test (optionnel)
5. Confirmez la souscription
6. Vérifiez que l'abonnement apparaît comme "en attente"

#### Test Admin :
1. Connectez-vous en tant qu'admin
2. Allez sur `/admin/abonnements`
3. Vérifiez que la demande apparaît
4. Cliquez sur "Voir reçu" si un reçu a été uploadé
5. Validez l'abonnement
6. Vérifiez que l'entreprise peut maintenant publier des offres

### 6. Migration des Abonnements Existants

Les abonnements existants qui sont actifs seront automatiquement marqués comme `verified` par le script de migration. Aucune action manuelle n'est nécessaire.

## Vérifications Post-Déploiement

- [ ] Le bucket `receipts` existe dans Supabase Storage
- [ ] Les nouvelles colonnes existent dans `entreprise_subscriptions`
- [ ] Les policies de storage sont actives
- [ ] Les entreprises peuvent uploader des reçus
- [ ] Les admins peuvent voir les demandes en attente
- [ ] Les admins peuvent valider/rejeter les abonnements
- [ ] Les entreprises ne peuvent pas publier sans abonnement validé

## Rollback (si nécessaire)

Si vous devez revenir en arrière :

```sql
-- Supprimer les nouvelles colonnes
ALTER TABLE entreprise_subscriptions 
DROP COLUMN IF EXISTS payment_status,
DROP COLUMN IF EXISTS receipt_url,
DROP COLUMN IF EXISTS admin_notes,
DROP COLUMN IF EXISTS verified_by,
DROP COLUMN IF EXISTS verified_at;

-- Supprimer les index
DROP INDEX IF EXISTS idx_entreprise_subscriptions_payment_status;
DROP INDEX IF EXISTS idx_entreprise_subscriptions_verified_by;

-- Supprimer le bucket (attention : supprime tous les reçus)
-- À faire manuellement dans Supabase Dashboard
```

## Support

Pour toute question ou problème, consultez :
- Documentation : `docs/subscription-payment-flow.md`
- Logs Supabase : Dashboard > Logs
- Logs Application : Console du navigateur ou logs serveur
