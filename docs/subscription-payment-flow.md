# Flux de Paiement des Abonnements

## Vue d'ensemble

Le système d'abonnement nécessite maintenant une validation manuelle par l'administrateur après le paiement. Cela garantit que seules les entreprises ayant effectué un paiement valide peuvent activer leur abonnement.

## Flux Complet

### 1. Entreprise - Choix de l'abonnement
- L'entreprise accède à `/entreprise/abonnement`
- Elle consulte les différents forfaits disponibles (Starter, Business, Premium)
- Elle clique sur "Souscrire" pour le forfait souhaité

### 2. Entreprise - Paiement et soumission
- Un modal s'ouvre avec :
  - Le montant à payer
  - Les instructions de paiement
  - Un champ pour uploader le reçu de paiement (optionnel)
- L'entreprise effectue le virement bancaire
- Elle peut joindre le reçu de paiement (image ou PDF)
- Elle clique sur "Confirmer"

### 3. Système - Création de l'abonnement en attente
- L'abonnement est créé avec :
  - `is_active: false` (pas encore actif)
  - `payment_status: 'pending'` (en attente de validation)
  - `receipt_url: <url>` (si fourni)
- L'entreprise voit un message : "Demande d'abonnement créée. En attente de validation après vérification du paiement."

### 4. Admin - Vérification
- L'admin accède à `/admin/abonnements`
- Il voit la liste des abonnements en attente
- Pour chaque demande, il peut :
  - Voir les informations de l'entreprise
  - Consulter le reçu de paiement (si fourni)
  - Valider l'abonnement
  - Rejeter l'abonnement avec une raison

### 5. Admin - Validation
- L'admin clique sur "Valider"
- Le système met à jour l'abonnement :
  - `is_active: true` (maintenant actif)
  - `payment_status: 'verified'` (vérifié)
  - `verified_by: <admin_id>`
  - `verified_at: <timestamp>`
- L'entreprise peut maintenant publier des offres

### 6. Admin - Rejet (optionnel)
- L'admin clique sur "Rejeter"
- Il saisit une raison
- Le système met à jour l'abonnement :
  - `is_active: false`
  - `payment_status: 'rejected'`
  - `admin_notes: <raison>`
- L'entreprise doit soumettre une nouvelle demande

## Statuts des Abonnements

### payment_status
- `pending` : En attente de validation admin
- `verified` : Validé par l'admin, abonnement actif
- `rejected` : Rejeté par l'admin

### is_active
- `false` : Abonnement non actif (en attente ou rejeté)
- `true` : Abonnement actif (après validation admin)

## Champs de la Base de Données

### Nouveaux champs dans `entreprise_subscriptions`
```sql
payment_status TEXT DEFAULT 'pending'  -- 'pending' | 'verified' | 'rejected'
receipt_url TEXT                       -- URL du reçu de paiement
admin_notes TEXT                       -- Notes de l'admin (raison de rejet, etc.)
verified_by UUID                       -- ID de l'admin qui a validé/rejeté
verified_at TIMESTAMPTZ               -- Date de validation/rejet
```

## APIs

### Entreprise
- `POST /api/entreprises/subscriptions` - Créer une demande d'abonnement
  - Body: `{ plan: string, receiptUrl?: string }`
  - Crée un abonnement avec `payment_status: 'pending'` et `is_active: false`

### Admin
- `GET /api/admin/subscriptions/pending` - Liste des abonnements en attente
- `POST /api/admin/subscriptions/approve` - Valider un abonnement
  - Body: `{ subscriptionId: string, notes?: string }`
- `POST /api/admin/subscriptions/reject` - Rejeter un abonnement
  - Body: `{ subscriptionId: string, reason: string }`

### Upload
- `POST /api/upload` - Upload de fichiers (reçus)
  - FormData: `{ file: File, type: string }`
  - Stocke dans Supabase Storage bucket `receipts`

## Sécurité

### Storage Policies
- Les entreprises peuvent uploader leurs propres reçus
- Les entreprises peuvent voir leurs propres reçus
- Les admins peuvent voir tous les reçus
- Les reçus sont publics (pour permettre la consultation par l'admin)

### Validation
- Seules les entreprises avec `status: 'valide'` peuvent souscrire
- Seuls les admins peuvent valider/rejeter les abonnements
- Les fichiers sont limités à 5MB
- Types de fichiers acceptés : JPG, PNG, PDF

## Migration

Pour appliquer les changements à la base de données :

```bash
# Exécuter le script SQL dans Supabase
supabase db push
```

Ou exécuter manuellement le fichier :
`supabase/migrations/add_subscription_payment_fields.sql`

## Notes Importantes

1. Les abonnements existants sont automatiquement marqués comme `verified` lors de la migration
2. Le reçu de paiement est optionnel mais recommandé
3. L'admin peut ajouter des notes lors de la validation ou du rejet
4. Les entreprises ne peuvent pas publier d'offres tant que leur abonnement n'est pas validé
