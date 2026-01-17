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
      .select('id, status, subscription_expiry, is_admin, full_name')
      .eq('id', user.id)
      .single()

    console.log('Profile check:', { profile, profileError: profileError?.message })

    // Check if user is an enterprise instead
    const { data: enterprise, error: enterpriseError } = await supabase
      .from('entreprises')
      .select('id, nom, status')
      .eq('user_id', user.id)
      .single()

    console.log('Enterprise check:', { enterprise, enterpriseError: enterpriseError?.message })

    let userType = 'unknown'
    if (profile) userType = 'engineer'
    else if (enterprise) userType = 'enterprise'

    if (!profile && !enterprise) {
      return NextResponse.json({
        step: 'profile',
        success: false,
        error: 'Aucun profil trouvé',
        profileError: profileError?.message,
        enterpriseError: enterpriseError?.message,
        userId: user.id
      })
    }

    if (enterprise && !profile) {
      return NextResponse.json({
        step: 'user_type',
        success: false,
        error: 'Les entreprises ne peuvent pas postuler',
        userType: 'enterprise',
        enterpriseName: enterprise.nom
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
      userType,
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile ? {
        id: profile.id,
        status: profile.status,
        isAdmin: profile.is_admin,
        subscriptionExpiry: profile.subscription_expiry,
        fullName: profile.full_name
      } : null,
      enterprise: enterprise ? {
        id: enterprise.id,
        nom: enterprise.nom,
        status: enterprise.status
      } : null,
      job: {
        id: job.id,
        title: job.title,
        is_active: job.is_active,
        deadline: job.deadline
      },
      hasExistingApplication: !!existingApp,
      canApply: !existingApp && job.is_active && new Date(job.deadline) > new Date() && userType === 'engineer'
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