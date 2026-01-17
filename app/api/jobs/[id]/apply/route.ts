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

    console.log('=== JOB APPLICATION REQUEST ===')
    console.log('Job ID:', jobId)

    // Step 1: Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Step 1 - Auth:', { userId: user?.id, email: user?.email, authError: authError?.message })

    if (authError || !user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ 
        error: 'Non authentifié',
        step: 'authentication',
        debug: { authError: authError?.message }
      }, { status: 401 })
    }

    // Step 2: Check if user profile exists and is an engineer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_type, status, subscription_expiry')
      .eq('id', user.id)
      .single()

    console.log('Step 2 - Profile:', { profile, profileError: profileError?.message })

    if (profileError || !profile) {
      console.log('❌ Profile lookup failed')
      return NextResponse.json({ 
        error: 'Profil ingénieur non trouvé',
        step: 'profile',
        debug: { 
          profileError: profileError?.message,
          userId: user.id 
        }
      }, { status: 404 })
    }

    // Step 3: Verify user is an engineer
    if (profile.user_type === 'entreprise') {
      console.log('❌ User is enterprise, not engineer')
      return NextResponse.json({ 
        error: 'Seuls les ingénieurs peuvent postuler aux offres',
        step: 'user_type',
        debug: { userType: profile.user_type }
      }, { status: 403 })
    }

    // Step 4: Verify job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('job_offers')
      .select('id, title, is_active, deadline')
      .eq('id', jobId)
      .single()

    console.log('Step 4 - Job:', { job, jobError: jobError?.message })

    if (jobError || !job) {
      console.log('❌ Job lookup failed')
      return NextResponse.json({ 
        error: 'Offre non trouvée',
        step: 'job',
        debug: { 
          jobError: jobError?.message,
          jobId 
        }
      }, { status: 404 })
    }

    if (!job.is_active) {
      console.log('❌ Job is not active')
      return NextResponse.json({ 
        error: 'Cette offre n\'est plus active',
        step: 'job_active',
        debug: { isActive: job.is_active }
      }, { status: 400 })
    }

    if (new Date(job.deadline) < new Date()) {
      console.log('❌ Job has expired')
      return NextResponse.json({ 
        error: 'Cette offre a expiré',
        step: 'job_deadline',
        debug: { deadline: job.deadline, now: new Date().toISOString() }
      }, { status: 400 })
    }

    // Step 5: Check if already applied
    const { data: existingApplication, error: existingError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('engineer_id', user.id)
      .single()

    console.log('Step 5 - Existing application:', { 
      existingApplication, 
      existingError: existingError?.message 
    })

    if (existingApplication) {
      console.log('❌ Already applied')
      return NextResponse.json({ 
        error: 'Vous avez déjà postulé à cette offre',
        step: 'duplicate',
        debug: { existingApplicationId: existingApplication.id }
      }, { status: 400 })
    }

    // Step 6: Create application
    console.log('Step 6 - Creating application...')
    const { data: newApplication, error: insertError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        engineer_id: user.id,
        cover_letter: coverLetter || null,
        status: 'pending'
      })
      .select()
      .single()

    console.log('Step 6 - Insert result:', { newApplication, insertError: insertError?.message })

    if (insertError) {
      console.log('❌ Insert failed')
      return NextResponse.json({ 
        error: 'Erreur lors de la création de la candidature',
        step: 'insert',
        debug: {
          insertError: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        }
      }, { status: 500 })
    }

    console.log('✅ Application created successfully')
    return NextResponse.json({ 
      success: true,
      applicationId: newApplication?.id
    })

  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      step: 'server_error',
      debug: { 
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
