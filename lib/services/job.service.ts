import { SupabaseClient } from '@supabase/supabase-js'
import { JobOffer, CreateJobOfferData, Domain, JobOfferWithEntreprise } from '@/lib/types/database'
import { SubscriptionService } from './subscription.service'

export class JobService {
  private subscriptionService: SubscriptionService

  constructor(private supabase: SupabaseClient) {
    this.subscriptionService = new SubscriptionService(supabase)
  }

  /**
   * Créer une nouvelle offre d'emploi
   */
  async createJob(entrepriseId: string, data: CreateJobOfferData): Promise<JobOffer> {
    // Vérifier si l'entreprise peut publier
    const canPublish = await this.subscriptionService.canPublishOffer(entrepriseId)
    if (!canPublish.canPublish) {
      throw new Error(canPublish.reason || 'Impossible de publier une offre')
    }

    // Valider les champs obligatoires
    this.validateJobData(data)

    // Créer l'offre
    const { data: job, error } = await this.supabase
      .from('job_offers')
      .insert({
        entreprise_id: entrepriseId,
        title: data.title,
        description: data.description,
        domains: data.domains,
        contract_type: data.contract_type,
        location: data.location,
        salary_range: data.salary_range || null,
        deadline: data.deadline,
        is_active: true,
        views_count: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error('Erreur lors de la création de l\'offre: ' + error.message)
    }

    return job
  }

  /**
   * Mettre à jour une offre d'emploi
   */
  async updateJob(jobId: string, entrepriseId: string, data: Partial<CreateJobOfferData>): Promise<JobOffer> {
    // Vérifier que l'offre appartient à l'entreprise
    const { data: existingJob } = await this.supabase
      .from('job_offers')
      .select('entreprise_id')
      .eq('id', jobId)
      .single()

    if (!existingJob || existingJob.entreprise_id !== entrepriseId) {
      throw new Error('Offre non trouvée ou non autorisée')
    }

    const updateData: any = {}
    if (data.title) updateData.title = data.title
    if (data.description) updateData.description = data.description
    if (data.domains) updateData.domains = data.domains
    if (data.contract_type) updateData.contract_type = data.contract_type
    if (data.location) updateData.location = data.location
    if (data.salary_range !== undefined) updateData.salary_range = data.salary_range
    if (data.deadline) updateData.deadline = data.deadline

    const { data: job, error } = await this.supabase
      .from('job_offers')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single()

    if (error) {
      throw new Error('Erreur lors de la mise à jour: ' + error.message)
    }

    return job
  }

  /**
   * Supprimer (désactiver) une offre d'emploi
   */
  async deleteJob(jobId: string, entrepriseId: string): Promise<void> {
    const { data: existingJob } = await this.supabase
      .from('job_offers')
      .select('entreprise_id')
      .eq('id', jobId)
      .single()

    if (!existingJob || existingJob.entreprise_id !== entrepriseId) {
      throw new Error('Offre non trouvée ou non autorisée')
    }

    const { error } = await this.supabase
      .from('job_offers')
      .update({ is_active: false })
      .eq('id', jobId)

    if (error) {
      throw new Error('Erreur lors de la suppression: ' + error.message)
    }
  }

  /**
   * Obtenir les offres actives (pour les ingénieurs)
   */
  async getActiveJobs(options?: {
    domains?: Domain[]
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ jobs: JobOfferWithEntreprise[]; total: number }> {
    let query = this.supabase
      .from('job_offers')
      .select(`
        *,
        entreprise:entreprises(id, name, logo_url, email, phone, sector)
      `, { count: 'exact' })
      .eq('is_active', true)
      .gte('deadline', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })

    // Filtrer par domaines
    if (options?.domains && options.domains.length > 0) {
      query = query.overlaps('domains', options.domains)
    }

    // Recherche par mot-clé
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    // Pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error('Erreur lors de la récupération des offres')
    }

    return {
      jobs: data || [],
      total: count || 0
    }
  }

  /**
   * Obtenir les offres d'une entreprise
   */
  async getEntrepriseJobs(entrepriseId: string, includeInactive = false): Promise<JobOffer[]> {
    let query = this.supabase
      .from('job_offers')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('created_at', { ascending: false })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error('Erreur lors de la récupération des offres')
    }

    return data || []
  }

  /**
   * Obtenir une offre par ID
   */
  async getJobById(jobId: string): Promise<JobOfferWithEntreprise | null> {
    const { data, error } = await this.supabase
      .from('job_offers')
      .select(`
        *,
        entreprise:entreprises(id, name, logo_url, email, phone, sector)
      `)
      .eq('id', jobId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  }

  /**
   * Valider les données d'une offre
   */
  private validateJobData(data: CreateJobOfferData): void {
    const errors: string[] = []

    if (!data.title?.trim()) errors.push('titre')
    if (!data.description?.trim()) errors.push('description')
    if (!data.domains || data.domains.length === 0) errors.push('domaines')
    if (!data.contract_type) errors.push('type de contrat')
    if (!data.location?.trim()) errors.push('localisation')
    if (!data.deadline) errors.push('date limite')

    if (errors.length > 0) {
      throw new Error(`Champs requis manquants: ${errors.join(', ')}`)
    }

    // Vérifier que la date limite est dans le futur
    const deadline = new Date(data.deadline)
    if (deadline <= new Date()) {
      throw new Error('La date limite doit être dans le futur')
    }
  }
}
