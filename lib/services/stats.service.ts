import { createClient } from '@/lib/supabase/server'

export interface JobViewStats {
  jobId: string
  jobTitle: string
  totalViews: number
  uniqueViews: number
}

export interface DailyViewStats {
  date: string
  views: number
}

export interface EntrepriseStats {
  totalJobs: number
  activeJobs: number
  totalViews: number
  uniqueViews: number
  viewsByJob: JobViewStats[]
  viewsOverTime: DailyViewStats[]
}

export class StatsService {
  /**
   * Get comprehensive statistics for an enterprise
   */
  static async getEntrepriseStats(entrepriseId: string): Promise<EntrepriseStats> {
    const supabase = await createClient()

    // Get all jobs for the enterprise
    const { data: jobs, error: jobsError } = await supabase
      .from('job_offers')
      .select('id, title, status')
      .eq('entreprise_id', entrepriseId)

    if (jobsError) {
      throw new Error(`Erreur lors de la récupération des offres: ${jobsError.message}`)
    }

    const jobIds = jobs?.map(j => j.id) || []
    const activeJobs = jobs?.filter(j => j.status === 'active').length || 0

    // Get views for all jobs
    let totalViews = 0
    let uniqueViews = 0
    const viewsByJob: JobViewStats[] = []

    if (jobIds.length > 0) {
      const { data: views, error: viewsError } = await supabase
        .from('job_views')
        .select('job_id, engineer_id, viewed_at')
        .in('job_id', jobIds)

      if (viewsError) {
        throw new Error(`Erreur lors de la récupération des vues: ${viewsError.message}`)
      }

      // Calculate stats per job
      const viewsMap = new Map<string, { total: number; unique: Set<string> }>()
      
      for (const view of views || []) {
        if (!viewsMap.has(view.job_id)) {
          viewsMap.set(view.job_id, { total: 0, unique: new Set() })
        }
        const stats = viewsMap.get(view.job_id)!
        stats.total++
        stats.unique.add(view.engineer_id)
      }

      // Build viewsByJob array
      for (const job of jobs || []) {
        const stats = viewsMap.get(job.id) || { total: 0, unique: new Set() }
        viewsByJob.push({
          jobId: job.id,
          jobTitle: job.title,
          totalViews: stats.total,
          uniqueViews: stats.unique.size
        })
        totalViews += stats.total
        uniqueViews += stats.unique.size
      }
    }

    // Get views over time (last 30 days)
    const viewsOverTime = await this.getViewsOverTime(entrepriseId, 30)

    return {
      totalJobs: jobs?.length || 0,
      activeJobs,
      totalViews,
      uniqueViews,
      viewsByJob,
      viewsOverTime
    }
  }

  /**
   * Get views over time for the last N days
   */
  static async getViewsOverTime(entrepriseId: string, days: number = 30): Promise<DailyViewStats[]> {
    const supabase = await createClient()

    // Get job IDs for this enterprise
    const { data: jobs } = await supabase
      .from('job_offers')
      .select('id')
      .eq('entreprise_id', entrepriseId)

    const jobIds = jobs?.map(j => j.id) || []
    
    if (jobIds.length === 0) {
      return this.generateEmptyDailyStats(days)
    }

    // Get views for the last N days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: views } = await supabase
      .from('job_views')
      .select('viewed_at')
      .in('job_id', jobIds)
      .gte('viewed_at', startDate.toISOString())

    // Group by date
    const viewsByDate = new Map<string, number>()
    
    for (const view of views || []) {
      const date = new Date(view.viewed_at).toISOString().split('T')[0]
      viewsByDate.set(date, (viewsByDate.get(date) || 0) + 1)
    }

    // Generate array for all days
    const result: DailyViewStats[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      result.push({
        date: dateStr,
        views: viewsByDate.get(dateStr) || 0
      })
    }

    return result
  }

  /**
   * Generate empty daily stats for N days
   */
  private static generateEmptyDailyStats(days: number): DailyViewStats[] {
    const result: DailyViewStats[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      result.push({
        date: date.toISOString().split('T')[0],
        views: 0
      })
    }
    return result
  }

  /**
   * Export statistics to CSV format
   */
  static async exportToCSV(entrepriseId: string): Promise<string> {
    const stats = await this.getEntrepriseStats(entrepriseId)

    const lines: string[] = []
    
    // Header
    lines.push('Statistiques des offres d\'emploi')
    lines.push(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`)
    lines.push('')
    
    // Summary
    lines.push('Résumé')
    lines.push(`Total offres,${stats.totalJobs}`)
    lines.push(`Offres actives,${stats.activeJobs}`)
    lines.push(`Total vues,${stats.totalViews}`)
    lines.push(`Vues uniques,${stats.uniqueViews}`)
    lines.push('')
    
    // Views by job
    lines.push('Vues par offre')
    lines.push('Titre,Vues totales,Vues uniques')
    for (const job of stats.viewsByJob) {
      lines.push(`"${job.jobTitle}",${job.totalViews},${job.uniqueViews}`)
    }
    lines.push('')
    
    // Views over time
    lines.push('Évolution des vues (30 derniers jours)')
    lines.push('Date,Vues')
    for (const day of stats.viewsOverTime) {
      lines.push(`${day.date},${day.views}`)
    }

    return lines.join('\n')
  }
}
