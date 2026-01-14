import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: jobId } = await params

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Verify the job belongs to this company
    const { data: job, error: jobError } = await supabase
      .from('job_offers')
      .select('entreprise_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Offre non trouvée' }, { status: 404 })
    }

    // Get company profile
    const { data: company } = await supabase
      .from('entreprises')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!company || company.id !== job.entreprise_id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Fetch applications with engineer details
    const { data: applications, error: appsError } = await supabase
      .from('job_applications')
      .select(`
        *,
        engineer:profiles (
          full_name,
          email,
          phone,
          domain,
          grad_year
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (appsError) {
      console.error('Error fetching applications:', appsError)
      return NextResponse.json({ error: 'Erreur lors du chargement des candidatures' }, { status: 500 })
    }

    return NextResponse.json({ applications: applications || [] })
  } catch (error) {
    console.error('Error in GET /api/entreprises/jobs/[id]/applications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
