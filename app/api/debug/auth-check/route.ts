import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    console.log('=== AUTH CHECK DEBUG ===')
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      email: user?.email, 
      authError: authError?.message 
    })

    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: 'Non authentifié',
        authError: authError?.message
      })
    }

    // Test basic query - check both profiles and entreprises tables
    const { data: engineerProfile, error: engineerError } = await supabase
      .from('profiles')
      .select('id, status, is_admin, full_name, subscription_expiry')
      .eq('id', user.id)
      .single()

    const { data: enterpriseProfile, error: enterpriseError } = await supabase
      .from('entreprises')
      .select('id, nom, status, email')
      .eq('user_id', user.id)
      .single()

    console.log('Profile queries:', { 
      engineerProfile, 
      engineerError: engineerError?.message,
      enterpriseProfile,
      enterpriseError: enterpriseError?.message
    })

    let userType = 'unknown'
    if (engineerProfile) userType = 'engineer'
    else if (enterpriseProfile) userType = 'enterprise'

    // Test job_applications table access
    const { data: appTest, error: appError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('engineer_id', user.id)
      .limit(1)

    console.log('Job applications query result:', { 
      canAccessTable: !appError, 
      appError: appError?.message,
      hasApplications: (appTest?.length || 0) > 0
    })

    return NextResponse.json({
      authenticated: true,
      userType,
      user: {
        id: user.id,
        email: user.email
      },
      engineerProfile: engineerProfile || null,
      enterpriseProfile: enterpriseProfile || null,
      engineerError: engineerError?.message,
      enterpriseError: enterpriseError?.message,
      canAccessJobApplications: !appError,
      jobApplicationsError: appError?.message,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 })
  }
}