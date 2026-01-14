import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'Non authentifié',
        details: authError?.message 
      })
    }

    // Vérifier le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, is_admin, full_name')
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
      isAdmin: profile?.is_admin || false,
      canAccessAdminPanel: profile?.is_admin === true
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur interne',
      details: error.message 
    }, { status: 500 })
  }
}
