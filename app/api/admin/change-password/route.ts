import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword, userType } = await request.json()

    if (!userId || !newPassword || !userType) {
      return NextResponse.json({ 
        error: 'ID utilisateur, nouveau mot de passe et type requis' 
      }, { status: 400 })
    }

    if (!['ingenieur', 'entreprise'].includes(userType)) {
      return NextResponse.json({ 
        error: 'Type d\'utilisateur invalide' 
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      }, { status: 400 })
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Get user email from the appropriate table to verify user exists
    let email: string | null = null
    let authUserId: string | null = null
    
    if (userType === 'ingenieur') {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('email, id')
        .eq('id', userId)
        .single()
      
      email = profile?.email
      authUserId = profile?.id
    } else if (userType === 'entreprise') {
      const { data: entreprise } = await adminClient
        .from('entreprises')
        .select('email, user_id')
        .eq('id', userId)
        .single()
      
      email = entreprise?.email
      authUserId = entreprise?.user_id
    }

    if (!email || !authUserId) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    // Update password using Supabase Auth Admin API
    const { data, error } = await adminClient.auth.admin.updateUserById(authUserId, {
      password: newPassword,
      email_confirm: true // S'assurer que l'email est confirmé
    })

    if (error) {
      console.error('Password update error:', error)
      return NextResponse.json({ 
        error: `Erreur lors de la modification du mot de passe: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Mot de passe modifié avec succès pour ${email}` 
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}