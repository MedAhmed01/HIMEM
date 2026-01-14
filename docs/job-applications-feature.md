# Fonctionnalité de Candidature aux Offres d'Emploi

## Vue d'ensemble

Cette fonctionnalité permet aux ingénieurs de postuler directement aux offres d'emploi publiées par les entreprises, et aux entreprises de gérer les candidatures reçues.

## Fonctionnalités ajoutées

### Pour les Ingénieurs

1. **Postuler à une offre**
   - Bouton "Postuler" sur la page de détail d'une offre (`/emplois/[id]`)
   - Modal de candidature avec lettre de motivation optionnelle
   - Indication si déjà postulé
   - Profil complet automatiquement envoyé avec la candidature

2. **Suivre ses candidatures**
   - Page dédiée `/mes-candidatures`
   - Statistiques : en attente, acceptées, refusées
   - Liste complète des candidatures avec statut
   - Lien vers l'offre depuis chaque candidature
   - Accès rapide depuis le tableau de bord

### Pour les Entreprises

1. **Voir les candidatures par offre**
   - Page `/entreprise/offres/[id]/candidatures`
   - Bouton "Candidatures" sur chaque offre
   - Badge avec nombre de candidatures sur la liste des offres

2. **Gérer les candidatures**
   - Voir les détails complets du candidat (nom, email, téléphone, spécialisation, expérience)
   - Lire la lettre de motivation
   - Télécharger le CV
   - Accepter ou refuser une candidature
   - Statistiques : en attente, acceptées, refusées

## Structure de la base de données

### Table `job_applications`

```sql
- id: UUID (PK)
- job_id: UUID (FK -> job_offers)
- engineer_id: UUID (FK -> profiles) -- profiles.id correspond à auth.uid()
- status: TEXT ('pending', 'accepted', 'rejected')
- cover_letter: TEXT (nullable)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- UNIQUE(job_id, engineer_id) -- Un ingénieur ne peut postuler qu'une fois par offre
```

**Note importante** : `engineer_id` référence directement `profiles.id` qui est égal à `auth.uid()`. Il n'y a pas de table `engineers` séparée dans ce schéma.

### Colonne ajoutée à `job_offers`

```sql
- applications_count: INTEGER (default 0)
```

Mise à jour automatiquement via trigger lors de l'ajout/suppression de candidatures.

## APIs créées

### Pour les Ingénieurs

- `POST /api/jobs/[id]/apply` - Postuler à une offre
- `GET /api/engineers/applications` - Récupérer ses candidatures

### Pour les Entreprises

- `GET /api/entreprises/jobs/[id]/applications` - Récupérer les candidatures d'une offre
- `PATCH /api/entreprises/applications/[id]` - Mettre à jour le statut d'une candidature

### Modification

- `GET /api/jobs/[id]` - Ajout du champ `hasApplied` pour indiquer si l'ingénieur a déjà postulé

## Politiques RLS (Row Level Security)

Les politiques suivantes ont été créées :

1. **Ingénieurs** :
   - Peuvent voir leurs propres candidatures
   - Peuvent créer des candidatures
   - Peuvent modifier leurs candidatures en attente

2. **Entreprises** :
   - Peuvent voir les candidatures pour leurs offres
   - Peuvent mettre à jour le statut des candidatures pour leurs offres

## Migration

Fichier : `supabase/migrations/20260114_job_applications.sql`

Pour appliquer la migration :
```bash
# Si vous utilisez Supabase CLI
supabase db push

# Ou exécutez le fichier SQL directement dans Supabase Studio
```

## Types TypeScript

Nouveaux types ajoutés dans `lib/types/database.ts` :

```typescript
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export interface JobApplication {
  id: string
  job_id: string
  engineer_id: string
  status: ApplicationStatus
  cover_letter: string | null
  created_at: string
  updated_at: string
}
```

## Pages créées

1. `/app/entreprise/offres/[id]/candidatures/page.tsx` - Gestion des candidatures (entreprise)
2. `/app/(protected)/mes-candidatures/page.tsx` - Suivi des candidatures (ingénieur)

## Composants modifiés

1. `/app/entreprise/offres/page.tsx` - Ajout du bouton "Candidatures" et badge de compteur
2. `/app/(protected)/emplois/[id]/page.tsx` - Ajout du bouton "Postuler" et modal
3. `/app/(protected)/tableau-de-bord/page.tsx` - Ajout du lien "Mes candidatures"

## Prochaines améliorations possibles

- Notifications par email lors d'une nouvelle candidature
- Notifications lors du changement de statut d'une candidature
- Filtres et recherche dans les candidatures
- Export des candidatures en CSV
- Messages entre entreprise et candidat
- Historique des modifications de statut
