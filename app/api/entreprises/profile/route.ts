import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Utiliser le client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Obtenir l'entreprise de l'utilisateur
    const { data: entreprise, error: entError } = await supabaseAdmin
      .from('entreprises')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (entError) {
      if (entError.code === 'PGRST116') {
        return NextResponse.json({ 
          hasEntreprise: false,
          message: 'Aucun compte entreprise trouvé'
        })
      }
      
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération du profil entreprise',
        details: entError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      hasEntreprise: true,
      entreprise: {
        id: entreprise.id,
        name: entreprise.name,
        nif: entreprise.nif,
        sector: entreprise.sector,
        email: entreprise.email,
        phone: entreprise.phone,
        status: entreprise.status,
        created_at: entreprise.created_at
      }
    })

  } catch (error) {
    console.error('Get entreprise profile error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}