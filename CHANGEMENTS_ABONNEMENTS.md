# Changements - Système de Paiement des Abonnements

## Problème Résolu

**Avant :** Quand une entreprise cliquait sur "Souscrire", l'abonnement devenait immédiatement actif sans paiement ni validation.

**Maintenant :** L'entreprise doit effectuer le paiement, joindre le reçu, et attendre la validation de l'admin avant que l'abonnement soit actif.

## Nouveau Flux

### Pour l'Entreprise

1. **Choisir un forfait** sur `/entreprise/abonnement`
2. **Cliquer sur "Souscrire"** → Un modal s'ouvre
3. **Voir les instructions de paiement** et le montant
4. **Effectuer le virement bancaire**
5. **Joindre le reçu de paiement** (optionnel mais recommandé)
6. **Confirmer** → L'abonnement est créé en attente
7. **Attendre la validation** de l'admin
8. **Recevoir la confirmation** → Peut maintenant publier des offres

### Pour l'Admin

1. **Accéder à** `/admin/abonnements`
2. **Voir la liste** des demandes en attente
3. **Consulter les détails** :
   - Nom de l'entreprise
   - Email et téléphone
   - Forfait choisi
   - Montant
   - Reçu de paiement (si fourni)
4. **Cliquer sur "Voir reçu"** pour vérifier le paiement
5. **Valider** ou **Rejeter** la demande
   - Si validé : L'abonnement devient actif
   - Si rejeté : L'entreprise doit refaire une demande

## Fichiers Modifiés

### Types et Services
- `lib/types/database.ts` - Ajout des champs payment_status, receipt_url, etc.
- `lib/services/subscription.service.ts` - Nouvelles méthodes pour validation admin

### APIs
- `app/api/entreprises/subscriptions/route.ts` - Accepte le reçu de paiement
- `app/api/upload/route.ts` - **NOUVEAU** - Upload de fichiers
- `app/api/admin/subscriptions/pending/route.ts` - **NOUVEAU** - Liste des demandes
- `app/api/admin/subscriptions/approve/route.ts` - **NOUVEAU** - Valider
- `app/api/admin/subscriptions/reject/route.ts` - **NOUVEAU** - Rejeter

### Pages
- `app/entreprise/abonnement/page.tsx` - Modal de paiement avec upload
- `app/admin/abonnements/page.tsx` - **NOUVEAU** - Gestion des abonnements
- `app/admin/layout.tsx` - Ajout du lien "Abonnements"

### Base de Données
- `supabase/migrations/add_subscription_payment_fields.sql` - **NOUVEAU** - Migration

### Documentation
- `docs/subscription-payment-flow.md` - **NOUVEAU** - Documentation complète
- `DEPLOYMENT_SUBSCRIPTION.md` - **NOUVEAU** - Guide de déploiement

## Nouveaux Champs dans la Base de Données

Table `entreprise_subscriptions` :
- `payment_status` : 'pending' | 'verified' | 'rejected'
- `receipt_url` : URL du reçu de paiement
- `admin_notes` : Notes de l'admin
- `verified_by` : ID de l'admin qui a validé/rejeté
- `verified_at` : Date de validation/rejet

## Sécurité

- ✅ Seules les entreprises validées peuvent souscrire
- ✅ Seuls les admins peuvent valider/rejeter
- ✅ Les fichiers sont limités à 5MB
- ✅ Types acceptés : JPG, PNG, PDF
- ✅ Storage sécurisé avec policies Supabase

## Instructions de Déploiement

1. **Exécuter la migration SQL** dans Supabase
2. **Vérifier que le bucket `receipts` existe**
3. **Déployer le code**
4. **Tester le flux complet**

Voir `DEPLOYMENT_SUBSCRIPTION.md` pour les détails.

## Impact sur les Abonnements Existants

Les abonnements déjà actifs seront automatiquement marqués comme `verified` lors de la migration. Aucune action manuelle nécessaire.

## Notes Importantes

- Le reçu de paiement est **optionnel** mais fortement recommandé
- L'admin peut ajouter des notes lors de la validation ou du rejet
- Les entreprises ne peuvent **pas publier d'offres** tant que l'abonnement n'est pas validé
- Le système affiche clairement le statut "en attente" à l'entreprise
