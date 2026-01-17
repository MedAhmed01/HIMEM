import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'Non authentifié',
        authError: authError?.message
      })
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile || null,
      profileError: profileError?.message,
      hasProfile: !!profile,
      userType: profile?.user_type || 'unknown',
      status: profile?.status || 'unknown'
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur interne',
      details: error.message 
    }, { status: 500 })
  }
}