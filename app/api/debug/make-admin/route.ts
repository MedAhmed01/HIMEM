import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Non authentifié' 
      }, { status: 401 })
    }

    // Utiliser le client admin pour modifier is_admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Mettre à jour le profil
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Vous êtes maintenant admin !',
      profile: data
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur interne',
      details: error.message 
    }, { status: 500 })
  }
}
