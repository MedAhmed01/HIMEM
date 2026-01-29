// Database types for OMIGEC Platform

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum types
export type EngineerStatus =
  | 'pending_docs'
  | 'pending_reference'
  | 'validated'
  | 'suspended'

export type ExerciseMode =
  | 'personne_physique'
  | 'personne_morale'
  | 'employe_public'
  | 'employe_prive'

export type VerificationStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'

export type Domain =
  | 'infrastructure_transport'
  | 'batiment_constructions'
  | 'hydraulique_environnement'

// Entreprise types
export type EntrepriseStatus =
  | 'en_attente'
  | 'valide'
  | 'suspendu'

export type SubscriptionPlan =
  | 'starter'
  | 'business'
  | 'premium'

export type ContractType =
  | 'cdi'
  | 'cdd'
  | 'stage'
  | 'freelance'
  | 'consultant'

// Table types
export interface Profile {
  id: string
  nni: string
  full_name: string
  phone: string | null
  email: string | null
  diploma: string | null
  grad_year: number | null
  domain: string[]
  exercise_mode: ExerciseMode[]
  status: EngineerStatus
  subscription_expiry: string | null
  diploma_file_path: string | null
  cni_file_path: string | null
  cv_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface ReferenceListItem {
  id: string
  engineer_id: string
  added_at: string
  added_by: string | null
}

export interface Verification {
  id: string
  applicant_id: string
  reference_id: string | null
  status: VerificationStatus
  created_at: string
  responded_at: string | null
  rejection_reason: string | null
}

export interface Job {
  id: string
  title: string
  company: string
  description: string | null
  contact_info: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Entreprise interfaces
export interface Entreprise {
  id: string
  user_id: string
  nif: string
  name: string
  description: string | null
  sector: string
  email: string
  phone: string
  logo_url: string | null
  status: EntrepriseStatus
  created_at: string
  updated_at: string
}

export interface EntrepriseSubscription {
  id: string
  entreprise_id: string
  plan: SubscriptionPlan
  starts_at: string
  expires_at: string
  is_active: boolean
  payment_status: 'pending' | 'verified' | 'rejected'
  receipt_url: string | null
  admin_notes: string | null
  verified_by: string | null
  verified_at: string | null
  created_at: string
}

export interface JobOffer {
  id: string
  entreprise_id: string
  title: string
  description: string
  domains: Domain[]
  contract_type: ContractType
  location: string
  salary_range: string | null
  deadline: string
  is_active: boolean
  views_count: number
  applications_count?: number
  created_at: string
  updated_at: string
}

export interface JobView {
  id: string
  job_id: string
  engineer_id: string
  viewed_at: string
}

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

// Database schema type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
          id: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      references_list: {
        Row: ReferenceListItem
        Insert: Omit<ReferenceListItem, 'id' | 'added_at'> & {
          id?: string
          added_at?: string
        }
        Update: Partial<Omit<ReferenceListItem, 'id' | 'added_at'>>
      }
      verifications: {
        Row: Verification
        Insert: Omit<Verification, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Verification, 'id' | 'created_at'>>
      }
      jobs: {
        Row: Job
        Insert: Omit<Job, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>
      }
      entreprises: {
        Row: Entreprise
        Insert: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>>
      }
      entreprise_subscriptions: {
        Row: EntrepriseSubscription
        Insert: Omit<EntrepriseSubscription, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<EntrepriseSubscription, 'id' | 'created_at'>>
      }
      job_offers: {
        Row: JobOffer
        Insert: Omit<JobOffer, 'id' | 'created_at' | 'updated_at' | 'views_count'> & {
          id?: string
          created_at?: string
          updated_at?: string
          views_count?: number
        }
        Update: Partial<Omit<JobOffer, 'id' | 'created_at' | 'updated_at'>>
      }
      job_views: {
        Row: JobView
        Insert: Omit<JobView, 'id' | 'viewed_at'> & {
          id?: string
          viewed_at?: string
        }
        Update: Partial<Omit<JobView, 'id' | 'viewed_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_engineer_active: {
        Args: { engineer_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_entreprise_subscription_active: {
        Args: { ent_id: string }
        Returns: boolean
      }
      get_entreprise_remaining_quota: {
        Args: { ent_id: string }
        Returns: number
      }
      get_entreprise_by_user: {
        Args: { uid: string }
        Returns: Entreprise
      }
    }
    Enums: {
      engineer_status: EngineerStatus
      exercise_mode: ExerciseMode[]
      verification_status: VerificationStatus
      entreprise_status: EntrepriseStatus
      subscription_plan: SubscriptionPlan
      contract_type: ContractType
    }
  }
}

// Helper types for API responses
export interface SearchResult {
  found: boolean
  status: 'active' | 'inactive' | 'not_found'
  message: string
}

export interface RegistrationData {
  fullName: string
  nni: string
  phone: string
  email: string
  diplomaTitle: string
  graduationYear: number
  domains: Domain[]
  exerciseMode: ExerciseMode
  diplomaFile: File
  cniFile: File
}

export interface ReferenceEngineer {
  id: string
  fullName: string
  nni: string
}

// Entreprise registration data
export interface EntrepriseRegistrationData {
  name: string
  nif: string
  sector: string
  email: string
  phone: string
  password: string
  description?: string
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 5000,
    maxOffers: 3,
    duration: 30
  },
  business: {
    name: 'Business',
    price: 12000,
    maxOffers: 10,
    duration: 30
  },
  premium: {
    name: 'Premium',
    price: 25000,
    maxOffers: Infinity,
    duration: 30
  }
} as const

// Job offer with entreprise info (for display)
export interface JobOfferWithEntreprise extends JobOffer {
  entreprise: Pick<Entreprise, 'id' | 'name' | 'logo_url' | 'email' | 'phone' | 'sector'>
}

// Job offer creation data
export interface CreateJobOfferData {
  title: string
  description: string
  domains: Domain[]
  contract_type: ContractType
  location: string
  salary_range?: string
  deadline: string
}
