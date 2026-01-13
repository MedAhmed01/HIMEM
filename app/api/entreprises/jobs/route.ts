import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { JobService } from '@/lib/services/job.service'

// GET - Obtenir les offres de l'entreprise connectée
export async function GET() {
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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (entError || !entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    const jobService = new JobService(supabaseAdmin)
    const jobs = await jobService.getEntrepriseJobs(entreprise.id, true)

    return NextResponse.json({ jobs })

  } catch (error: any) {
    console.error('Get entreprise jobs error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
