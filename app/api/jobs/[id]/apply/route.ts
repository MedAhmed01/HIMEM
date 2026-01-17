import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: jobId } = await params
    const body = await request.json()
    const { coverLetter } = body

    console.log('Job application request:', { jobId, userId: 'checking...' })

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('Authentication error:', authError)
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    console.log('User authenticated:', { userId: user.id, email: user.email })

    // Get engineer profile - check both profiles table and ensure it's an engineer
    const { data: engineer, error: engineerError } = await supabase
      .from('profiles')
      .select('id, status, subscription_expiry, user_type')
      .eq('id', user.id)
      .single()

    console.log('Profile lookup result:', { engineer, engineerError })

    if (engineerError || !engineer) {
      console.log('Profile not found or error:', engineerError)
      return NextResponse.json({ 
        error: 'Profil ingénieur non trouvé',
        debug: {
          userId: user.id,
          error: engineerError?.message
        }
      }, { status: 404 })
    }

    // Check if user is an engineer (not an enterprise)
    if (engineer.user_type === 'entreprise') {
      return NextResponse.json({ 
        error: 'Seuls les ingénieurs peuvent postuler aux offres' 
      }, { status: 403 })
    }

    // Verify job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('job_offers')
      .select('id, is_active, deadline')
      .eq('id', jobId)
      .single()

    console.log('Job lookup result:', { job, jobError })

    if (jobError || !job) {
      console.log('Job not found or error:', jobError)
      return NextResponse.json({ 
        error: 'Offre non trouvée',
        debug: {
          jobId,
          error: jobError?.message
        }
      }, { status: 404 })
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
      return NextResponse.json({ 
        error: 'Erreur lors de la création de la candidature',
        debug: insertError.message
      }, { status: 500 })
    }

    console.log('Application created successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/jobs/[id]/apply:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
