import { SupabaseClient } from '@supabase/supabase-js'
import { SUBSCRIPTION_PLANS, SubscriptionPlan, EntrepriseSubscription } from '@/lib/types/database'

export class SubscriptionService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Créer une demande d'abonnement (sans paiement automatique)
   */
  async createSubscriptionRequest(entrepriseId: string, plan: SubscriptionPlan): Promise<EntrepriseSubscription> {
    // Vérifier que l'entreprise est validée
    const { data: entreprise, error: entError } = await this.supabase
      .from('entreprises')
      .select('status')
      .eq('id', entrepriseId)
      .single()

    if (entError || !entreprise) {
      throw new Error('Entreprise non trouvée')
    }

    if (entreprise.status !== 'valide') {
      throw new Error('L\'entreprise doit être validée pour demander un abonnement')
    }

    // Vérifier s'il y a déjà une demande en attente
    const { data: existingRequest } = await this.supabase
      .from('entreprise_subscriptions')
      .select('id')
      .eq('entreprise_id', entrepriseId)
      .eq('payment_status', 'pending')
      .eq('is_active', false)
      .single()

    if (existingRequest) {
      throw new Error('Une demande d\'abonnement est déjà en attente de validation')
    }

    // Désactiver les anciens abonnements actifs
    await this.supabase
      .from('entreprise_subscriptions')
      .update({ is_active: false })
      .eq('entreprise_id', entrepriseId)
      .eq('is_active', true)

    // Calculer la date d'expiration par défaut (l'admin pourra la modifier)
    const startsAt = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_PLANS[plan].duration)

    // Créer la demande d'abonnement
    const { data, error } = await this.supabase
      .from('entreprise_subscriptions')
      .insert({
        entreprise_id: entrepriseId,
        plan,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: false, // Pas actif jusqu'à validation admin
        payment_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw new Error('Erreur lors de la création de la demande: ' + error.message)
    }

    return data
  }

  /**
   * Obtenir l'abonnement actif d'une entreprise
   */
  async getActiveSubscription(entrepriseId: string): Promise<EntrepriseSubscription | null> {
    const { data, error } = await this.supabase
      .from('entreprise_subscriptions')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .eq('is_active', true)
      .eq('payment_status', 'verified')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return data
  }

  /**
   * Obtenir le quota restant d'une entreprise
   */
  async getRemainingQuota(entrepriseId: string): Promise<number> {
    const subscription = await this.getActiveSubscription(entrepriseId)
    
    if (!subscription) {
      return 0
    }

    const planConfig = SUBSCRIPTION_PLANS[subscription.plan]
    const maxOffers = planConfig.maxOffers

    // Compter les offres actives
    const { count, error } = await this.supabase
      .from('job_offers')
      .select('*', { count: 'exact', head: true })
      .eq('entreprise_id', entrepriseId)
      .eq('is_active', true)

    if (error) {
      throw new Error('Erreur lors du comptage des offres')
    }

    const currentOffers = count || 0
    return Math.max(0, maxOffers - currentOffers)
  }

  /**
   * Vérifier si une entreprise peut publier une nouvelle offre
   */
  async canPublishOffer(entrepriseId: string): Promise<{ canPublish: boolean; reason?: string }> {
    const subscription = await this.getActiveSubscription(entrepriseId)
    
    if (!subscription) {
      return { canPublish: false, reason: 'Aucun abonnement actif' }
    }

    const remainingQuota = await this.getRemainingQuota(entrepriseId)
    
    if (remainingQuota <= 0) {
      return { canPublish: false, reason: 'Quota d\'offres atteint' }
    }

    return { canPublish: true }
  }

  /**
   * Obtenir les jours restants sur l'abonnement
   */
  async getDaysRemaining(entrepriseId: string): Promise<number> {
    const subscription = await this.getActiveSubscription(entrepriseId)
    
    if (!subscription) {
      return 0
    }

    const expiresAt = new Date(subscription.expires_at)
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  /**
   * Obtenir l'historique des abonnements d'une entreprise
   */
  async getSubscriptionHistory(entrepriseId: string): Promise<EntrepriseSubscription[]> {
    const { data, error } = await this.supabase
      .from('entreprise_subscriptions')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Erreur lors de la récupération de l\'historique')
    }

    return data || []
  }

  /**
   * Obtenir les informations complètes de l'abonnement avec le plan
   */
  async getSubscriptionInfo(entrepriseId: string) {
    const subscription = await this.getActiveSubscription(entrepriseId)
    
    if (!subscription) {
      return null
    }

    const planConfig = SUBSCRIPTION_PLANS[subscription.plan]
    const remainingQuota = await this.getRemainingQuota(entrepriseId)
    const daysRemaining = await this.getDaysRemaining(entrepriseId)

    return {
      subscription,
      plan: {
        ...planConfig,
        key: subscription.plan
      },
      remainingQuota,
      daysRemaining,
      usedQuota: planConfig.maxOffers === Infinity ? 0 : planConfig.maxOffers - remainingQuota
    }
  }

  /**
   * Obtenir les demandes d'abonnement en attente (admin)
   */
  async getPendingSubscriptions(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('entreprise_subscriptions')
      .select(`
        id,
        plan,
        created_at,
        starts_at,
        expires_at,
        payment_status,
        entreprises (
          id,
          nom,
          email,
          telephone,
          status
        )
      `)
      .eq('payment_status', 'pending')
      .eq('is_active', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Erreur lors de la récupération des demandes: ' + error.message)
    }

    return data || []
  }

  /**
   * Activer manuellement un abonnement (admin)
   */
  async activateSubscription(
    subscriptionId: string, 
    adminId: string, 
    startDate: string, 
    endDate: string, 
    notes?: string
  ): Promise<void> {
    // Valider les dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      throw new Error('La date de fin doit être après la date de début')
    }

    // Obtenir l'abonnement
    const { data: subscription, error: subError } = await this.supabase
      .from('entreprise_subscriptions')
      .select('entreprise_id')
      .eq('id', subscriptionId)
      .eq('payment_status', 'pending')
      .eq('is_active', false)
      .single()

    if (subError || !subscription) {
      throw new Error('Abonnement non trouvé ou déjà traité')
    }

    // Désactiver tous les autres abonnements de cette entreprise
    await this.supabase
      .from('entreprise_subscriptions')
      .update({ is_active: false })
      .eq('entreprise_id', subscription.entreprise_id)
      .eq('is_active', true)

    // Activer l'abonnement
    const { error: updateError } = await this.supabase
      .from('entreprise_subscriptions')
      .update({
        is_active: true,
        payment_status: 'verified',
        starts_at: start.toISOString(),
        expires_at: end.toISOString(),
        verified_by: adminId,
        verified_at: new Date().toISOString(),
        admin_notes: notes || null
      })
      .eq('id', subscriptionId)

    if (updateError) {
      throw new Error('Erreur lors de l\'activation: ' + updateError.message)
    }
  }

  /**
   * Rejeter une demande d'abonnement (admin)
   */
  async rejectSubscription(subscriptionId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from('entreprise_subscriptions')
      .update({
        payment_status: 'rejected',
        admin_notes: `Rejeté: ${reason}`,
        verified_by: adminId,
        verified_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .eq('payment_status', 'pending')

    if (error) {
      throw new Error('Erreur lors du rejet: ' + error.message)
    }
  }

  /**
   * Désactiver un abonnement actif (admin)
   */
  async deactivateSubscription(subscriptionId: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from('entreprise_subscriptions')
      .update({
        is_active: false,
        admin_notes: `Désactivé: ${reason}`,
        expires_at: new Date().toISOString() // Expire immédiatement
      })
      .eq('id', subscriptionId)
      .eq('is_active', true)

    if (error) {
      throw new Error('Erreur lors de la désactivation: ' + error.message)
    }
  }

  /**
   * Valider un abonnement (admin) - Legacy method for compatibility
   */
  async approveSubscription(subscriptionId: string, adminId: string, notes?: string) {
    const { data, error } = await this.supabase
      .from('entreprise_subscriptions')
      .update({
        is_active: true,
        payment_status: 'verified',
        verified_by: adminId,
        verified_at: new Date().toISOString(),
        admin_notes: notes || null
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) {
      throw new Error('Erreur lors de la validation de l\'abonnement: ' + error.message)
    }

    return data
  }

  /**
   * Mettre à jour le reçu de paiement
   */
  async updateReceipt(subscriptionId: string, receiptUrl: string) {
    const { data, error } = await this.supabase
      .from('entreprise_subscriptions')
      .update({ receipt_url: receiptUrl })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) {
      throw new Error('Erreur lors de la mise à jour du reçu: ' + error.message)
    }

    return data
  }
}

/**
 * Formater le prix pour l'affichage
 */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} MRU`
}

/**
 * Calculer la date d'expiration
 */
export function calculateExpiryDate(days: number = 30): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}