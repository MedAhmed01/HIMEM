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

    // Test basic query
    const { data: testQuery, error: testError } = await supabase
      .from('profiles')
      .select('id, user_type, status')
      .eq('id', user.id)
      .single()

    console.log('Profile query result:', { testQuery, testError: testError?.message })

    // Test job_applications table access
    const { data: appTest, error: appError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('engineer_id', user.id)
      .limit(1)

    console.log('Job applications query result:', { 
      canAccessTable: !appError, 
      appError: appError?.message,
      hasApplications: appTest?.length > 0
    })

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: testQuery,
      profileError: testError?.message,
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