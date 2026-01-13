import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { JobService } from '@/lib/services/job.service'
import { Domain } from '@/lib/types/database'

// GET - Liste des offres actives (pour ingénieurs)
export async function GET(request: NextRequest) {
  try {
    // Utiliser le client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { searchParams } = new URL(request.url)
    
    const domains = searchParams.get('domains')?.split(',').filter(Boolean) as Domain[] | undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const jobService = new JobService(supabaseAdmin)
    const result = await jobService.getActiveJobs({
      domains,
      search,
      limit,
      offset
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Get jobs error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Créer une offre (pour entreprises)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Utiliser le client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Obtenir l'entreprise
    const { data: entreprise, error: entError } = await supabaseAdmin
      .from('entreprises')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (entError || !entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    if (entreprise.status !== 'valide') {
      return NextResponse.json(
        { error: 'Votre compte doit être validé pour publier des offres' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const jobService = new JobService(supabaseAdmin)
    
    const job = await jobService.createJob(entreprise.id, body)

    return NextResponse.json({
      success: true,
      message: 'Offre créée avec succès',
      job
    })

  } catch (error: any) {
    console.error('Create job error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'offre' },
      { status: 400 }
    )
  }
}
