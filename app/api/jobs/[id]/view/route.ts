import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// POST - Enregistrer une vue sur une offre
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params
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

    // Vérifier que c'est un ingénieur (pas une entreprise)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil ingénieur non trouvé' }, { status: 403 })
    }

    // Vérifier que l'offre existe
    const { data: job } = await supabaseAdmin
      .from('job_offers')
      .select('id')
      .eq('id', jobId)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Offre non trouvée' }, { status: 404 })
    }

    // Enregistrer la vue (upsert pour éviter les doublons)
    const { error: viewError } = await supabaseAdmin
      .from('job_views')
      .upsert(
        { job_id: jobId, engineer_id: user.id },
        { onConflict: 'job_id,engineer_id' }
      )

    if (viewError) {
      console.error('View error:', viewError)
      // Ignorer l'erreur si c'est un doublon
    }

    // Incrémenter le compteur de vues (seulement si nouvelle vue)
    const { data: existingView } = await supabaseAdmin
      .from('job_views')
      .select('id')
      .eq('job_id', jobId)
      .eq('engineer_id', user.id)
      .single()

    if (existingView) {
      // Mettre à jour le compteur
      await supabaseAdmin.rpc('increment_job_views', { job_id: jobId })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Record view error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
