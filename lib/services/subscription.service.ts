import { SupabaseClient } from '@supabase/supabase-js'
import { SUBSCRIPTION_PLANS, SubscriptionPlan, EntrepriseSubscription } from '@/lib/types/database'

export class SubscriptionService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Créer un nouvel abonnement pour une entreprise
   */
  async createSubscription(entrepriseId: string, plan: SubscriptionPlan): Promise<EntrepriseSubscription> {
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
      throw new Error('L\'entreprise doit être validée pour souscrire à un abonnement')
    }

    // Désactiver les anciens abonnements actifs
    await this.supabase
      .from('entreprise_subscriptions')
      .update({ is_active: false })
      .eq('entreprise_id', entrepriseId)
      .eq('is_active', true)

    // Calculer la date d'expiration (30 jours)
    const startsAt = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_PLANS[plan].duration)

    // Créer le nouvel abonnement
    const { data, error } = await this.supabase
      .from('entreprise_subscriptions')
      .insert({
        entreprise_id: entrepriseId,
        plan,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw new Error('Erreur lors de la création de l\'abonnement: ' + error.message)
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
