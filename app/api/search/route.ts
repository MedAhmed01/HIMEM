import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Public Engineer Search API
 * Allows anyone to search for engineers by NNI or name
 * Returns engineer information if active
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || searchParams.get('nni')

    // Validate query parameter
    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Le terme de recherche est requis' },
        { status: 400 }
      )
    }

    const searchTerm = query.trim()
    const supabase = createAdminClient()

    // Search by NNI, name, or phone (case insensitive)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('nni, full_name, diploma, grad_year, university, country, domain, exercise_mode, status, subscription_expiry, profile_image_url, phone')
      .or(`nni.eq.${searchTerm},full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 })
    }

    // Filter only active engineers (validated + paid subscription)
    const activeEngineers = profiles?.filter(profile => 
      profile.status === 'validated' && 
      profile.subscription_expiry && 
      new Date(profile.subscription_expiry) > new Date()
    ) || []

    if (activeEngineers.length === 0) {
      return NextResponse.json({
        found: false,
        status: 'not_found',
        message: 'Non trouvé',
        engineers: []
      })
    }

    // Format domain labels
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
      'petrole_gaz': 'Pétrole & Gaz'
    }

    const exerciseModeLabels: Record<string, string> = {
      'personne_physique': 'Personne Physique',
      'personne_morale': 'Personne Morale'
    }

    const engineers = activeEngineers.map(eng => ({
      nni: eng.nni,
      full_name: eng.full_name,
      diploma: eng.diploma,
      grad_year: eng.grad_year,
      university: eng.university,
      country: eng.country,
      profile_image_url: eng.profile_image_url,
      domains: eng.domain?.map((d: string) => domainLabels[d] || d) || [],
      exercise_mode: exerciseModeLabels[eng.exercise_mode] || eng.exercise_mode
    }))

    return NextResponse.json({
      found: true,
      status: 'active',
      message: 'Ingénieur(s) Agréé(s)',
      engineers
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
