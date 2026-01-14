import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const applicationId = params.id
    const body = await request.json()
    const { status } = body

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get company profile
    const { data: company } = await supabase
      .from('entreprises')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Profil entreprise non trouvé' }, { status: 404 })
    }

    // Verify the application belongs to a job from this company
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select(`
        id,
        job_id,
        job_offers!inner (
          entreprise_id
        )
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 })
    }

    // @ts-ignore - Supabase typing issue with nested relations
    if (application.job_offers.entreprise_id !== company.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Error updating application:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/entreprises/applications/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
