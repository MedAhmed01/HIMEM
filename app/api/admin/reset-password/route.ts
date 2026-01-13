import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, userType } = await request.json()

    if (!userId || !userType) {
      return NextResponse.json({ 
        error: 'ID utilisateur et type requis' 
      }, { status: 400 })
    }

    if (!['ingenieur', 'entreprise'].includes(userType)) {
      return NextResponse.json({ 
        error: 'Type d\'utilisateur invalide' 
      }, { status: 400 })
    }

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user email from the appropriate table
    let email: string | null = null
    
    if (userType === 'ingenieur') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()
      
      email = profile?.email
    } else if (userType === 'entreprise') {
      const { data: entreprise } = await supabase
        .from('entreprises')
        .select('email')
        .eq('id', userId)
        .single()
      
      email = entreprise?.email
    }

    if (!email) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    // Send password reset email using Supabase Auth Admin API
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`
      }
    })

    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json({ 
        error: 'Erreur lors de l\'envoi de l\'email de réinitialisation' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Email de réinitialisation envoyé à ${email}` 
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}