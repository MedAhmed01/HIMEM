import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get engineer profile (user.id is the engineer_id in profiles table)
    const engineer_id = user.id

    // Fetch applications with job and company details
    const { data: applications, error: appsError } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_offers (
          id,
          title,
          location,
          contract_type,
          deadline,
          entreprise:entreprises (
            name,
            logo_url
          )
        )
      `)
      .eq('engineer_id', engineer_id)
      .order('created_at', { ascending: false })

    if (appsError) {
      console.error('Error fetching applications:', appsError)
      return NextResponse.json({ error: 'Erreur lors du chargement des candidatures' }, { status: 500 })
    }

    return NextResponse.json({ applications: applications || [] })
  } catch (error) {
    console.error('Error in GET /api/engineers/applications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
