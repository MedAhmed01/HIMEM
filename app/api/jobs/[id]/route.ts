import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { JobService } from '@/lib/services/job.service'

// GET - Obtenir une offre par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Utiliser le client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const jobService = new JobService(supabaseAdmin)
    
    const job = await jobService.getJobById(id)

    if (!job) {
      return NextResponse.json({ error: 'Offre non trouvée' }, { status: 404 })
    }

    // Vérifier si l'utilisateur est un ingénieur actif pour afficher les contacts
    const { data: { user } } = await supabase.auth.getUser()
    let showContacts = false
    let hasApplied = false

    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('status, subscription_expiry')
        .eq('id', user.id)
        .single()

      if (profile) {
        const isActive = profile.status === 'validated' && 
          profile.subscription_expiry && 
          new Date(profile.subscription_expiry) > new Date()
        showContacts = isActive
      }

      // Vérifier si l'ingénieur a déjà postulé
      const { data: application } = await supabaseAdmin
        .from('job_applications')
        .select('id')
        .eq('job_id', id)
        .eq('engineer_id', user.id)
        .single()

      hasApplied = !!application

      // Ou si c'est l'entreprise propriétaire
      const { data: entreprise } = await supabaseAdmin
        .from('entreprises')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (entreprise && entreprise.id === job.entreprise_id) {
        showContacts = true
      }
    }

    // Masquer les contacts si non autorisé
    if (!showContacts && job.entreprise) {
      job.entreprise = {
        ...job.entreprise,
        email: undefined,
        phone: undefined
      } as any
    }

    return NextResponse.json({ job, showContacts, hasApplied })

  } catch (error: any) {
    console.error('Get job error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Mettre à jour une offre
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { data: entreprise } = await supabaseAdmin
      .from('entreprises')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    const body = await request.json()
    const jobService = new JobService(supabaseAdmin)
    
    const job = await jobService.updateJob(id, entreprise.id, body)

    return NextResponse.json({
      success: true,
      message: 'Offre mise à jour',
      job
    })

  } catch (error: any) {
    console.error('Update job error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// DELETE - Supprimer une offre
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { data: entreprise } = await supabaseAdmin
      .from('entreprises')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    const jobService = new JobService(supabaseAdmin)
    await jobService.deleteJob(id, entreprise.id)

    return NextResponse.json({
      success: true,
      message: 'Offre supprimée'
    })

  } catch (error: any) {
    console.error('Delete job error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
