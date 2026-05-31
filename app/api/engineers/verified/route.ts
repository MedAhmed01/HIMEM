import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Public Paginated Verified Engineers API
 * Returns all engineers with status === 'validated'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '6', 10)
    
    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: 'Page invalide' }, { status: 400 })
    }
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json({ error: 'Limite invalide' }, { status: 400 })
    }

    const offset = (page - 1) * limit
    const supabase = createAdminClient()

    // Count all verified/validated profiles (excluding admins, except NNI 33455178 and 6105905561)
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'validated')
      .or('is_admin.is.null,is_admin.eq.false,nni.eq.33455178,nni.eq.6105905561')

    if (countError) {
      console.error('Error counting verified profiles:', countError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    // Fetch the paginated profiles (excluding admins, except NNI 33455178 and 6105905561)
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('nni, full_name, diploma, grad_year, university, country, domain, exercise_mode, profile_image_url, subscription_expiry')
      .eq('status', 'validated')
      .or('is_admin.is.null,is_admin.eq.false,nni.eq.33455178,nni.eq.6105905561')
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (fetchError) {
      console.error('Error fetching verified profiles:', fetchError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de la liste' },
        { status: 500 }
      )
    }

    // Domain translation mapping
    const domainLabels: Record<string, string> = {
      'batiment_constructions': 'Bâtiment & Constructions',
      'genie_civil': 'Génie Civil',
      'electricite': 'Électricité',
      'mecanique': 'Mécanique',
      'informatique': 'Informatique',
      'telecommunications': 'Télécommunications',
      'energie': 'Énergie',
      'environnement': 'Environnement',
      'mines': 'Mines',
      'petrole_gaz': 'Pétrole & Gaz',
      'hydraulique_environnement': 'Hydraulique et Environnement',
      'infrastructure_transport': 'Infrastructure de transport'
    }

    const exerciseModeLabels: Record<string, string> = {
      'personne_physique': 'Personne Physique',
      'personne_morale': 'Personne Morale',
      'salarie': 'Salarié',
      'independant': 'Indépendant',
      'public': 'Secteur Public'
    }

    const engineers = (profiles || []).map((eng) => {
      // Parse domains safely
      let domains: string[] = []
      if (Array.isArray(eng.domain)) {
        domains = eng.domain.map((d: string) => domainLabels[d] || d)
      } else if (typeof eng.domain === 'string') {
        try {
          const parsed = JSON.parse(eng.domain)
          domains = Array.isArray(parsed) ? parsed.map((d: string) => domainLabels[d] || d) : [domainLabels[eng.domain] || eng.domain]
        } catch {
          domains = [domainLabels[eng.domain] || eng.domain]
        }
      }

      // Parse exercise modes safely
      let exerciseModes: string[] = []
      if (Array.isArray(eng.exercise_mode)) {
        exerciseModes = eng.exercise_mode.map((m: string) => exerciseModeLabels[m] || m)
      } else if (typeof eng.exercise_mode === 'string') {
        try {
          const parsed = JSON.parse(eng.exercise_mode)
          exerciseModes = Array.isArray(parsed) ? parsed.map((m: string) => exerciseModeLabels[m] || m) : [exerciseModeLabels[eng.exercise_mode] || eng.exercise_mode]
        } catch {
          exerciseModes = [exerciseModeLabels[eng.exercise_mode] || eng.exercise_mode]
        }
      }

      // Check subscription validity
      const isSubscriptionActive = eng.subscription_expiry 
        ? new Date(eng.subscription_expiry) > new Date()
        : false

      return {
        nni: eng.nni,
        full_name: eng.full_name,
        diploma: eng.diploma,
        grad_year: eng.grad_year,
        university: eng.university,
        country: eng.country,
        profile_image_url: eng.profile_image_url,
        subscription_expiry: eng.subscription_expiry,
        is_subscription_active: isSubscriptionActive,
        domains,
        exercise_modes: exerciseModes
      }
    })

    // Sort Abdelvetah Amar (NNI: 6105905561) to the very beginning of the list
    engineers.sort((a, b) => {
      if (a.nni === '6105905561') return -1
      if (b.nni === '6105905561') return 1
      return 0
    })

    return NextResponse.json({
      engineers,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    })
  } catch (error) {
    console.error('Verified engineers GET error:', error)
    return NextResponse.json(
      { error: 'Une erreur interne est survenue' },
      { status: 500 }
    )
  }
}
