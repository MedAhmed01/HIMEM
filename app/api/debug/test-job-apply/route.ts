import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { jobId } = body

    console.log('=== DEBUG JOB APPLICATION TEST ===')
    console.log('Job ID:', jobId)

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check:', { user: user?.id, email: user?.email, authError: authError?.message })

    if (authError || !user) {
      return NextResponse.json({ 
        step: 'auth',
        success: false,
        error: 'Non authentifié',
        authError: authError?.message
      })
    }

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Profile check:', { profile, profileError: profileError?.message })

    if (profileError || !profile) {
      return NextResponse.json({
        step: 'profile',
        success: false,
        error: 'Profil non trouvé',
        profileError: profileError?.message,
        userId: user.id
      })
    }

    // Check job
    const { data: job, error: jobError } = await supabase
      .from('job_offers')
      .select('*')
      .eq('id', jobId)
      .single()

    console.log('Job check:', { job: job?.id, jobError: jobError?.message })

    if (jobError || !job) {
      return NextResponse.json({
        step: 'job',
        success: false,
        error: 'Offre non trouvée',
        jobError: jobError?.message,
        jobId
      })
    }

    // Check existing application
    const { data: existingApp, error: appError } = await supabase
      .from('job_applications')
      .select('*')
      .eq('job_id', jobId)
      .eq('engineer_id', user.id)
      .single()

    console.log('Existing application check:', { existingApp: existingApp?.id, appError: appError?.message })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: {
        id: profile.id,
        user_type: profile.user_type,
        status: profile.status,
        subscription_expiry: profile.subscription_expiry
      },
      job: {
        id: job.id,
        title: job.title,
        is_active: job.is_active,
        deadline: job.deadline
      },
      hasExistingApplication: !!existingApp,
      canApply: !existingApp && job.is_active && new Date(job.deadline) > new Date()
    })

  } catch (error: any) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 })
  }
}