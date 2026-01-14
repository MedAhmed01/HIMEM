import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const jobId = params.id
    const body = await request.json()
    const { coverLetter } = body

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get engineer profile
    const { data: engineer, error: engineerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (engineerError || !engineer) {
      return NextResponse.json({ error: 'Profil ingénieur non trouvé' }, { status: 404 })
    }

    // Verify job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('job_offers')
      .select('id, is_active, deadline')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Offre non trouvée' }, { status: 404 })
    }

    if (!job.is_active) {
      return NextResponse.json({ error: 'Cette offre n\'est plus active' }, { status: 400 })
    }

    if (new Date(job.deadline) < new Date()) {
      return NextResponse.json({ error: 'Cette offre a expiré' }, { status: 400 })
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('engineer_id', engineer.id)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: 'Vous avez déjà postulé à cette offre' }, { status: 400 })
    }

    // Create application
    const { error: insertError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        engineer_id: engineer.id,
        cover_letter: coverLetter || null,
        status: 'pending'
      })

    if (insertError) {
      console.error('Error creating application:', insertError)
      return NextResponse.json({ error: 'Erreur lors de la création de la candidature' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/jobs/[id]/apply:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
