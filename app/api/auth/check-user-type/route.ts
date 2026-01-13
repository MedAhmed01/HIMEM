import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET - Vérifier le type d'utilisateur connecté
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Utiliser le client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Vérifier si c'est une entreprise
    const { data: entreprise } = await supabaseAdmin
      .from('entreprises')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (entreprise) {
      return NextResponse.json({
        type: 'entreprise',
        status: entreprise.status,
        id: entreprise.id
      })
    }

    // Vérifier si c'est un ingénieur/admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, is_admin, status')
      .eq('id', user.id)
      .single()

    if (profile) {
      return NextResponse.json({
        type: profile.is_admin ? 'admin' : 'ingenieur',
        status: profile.status,
        id: profile.id,
        isAdmin: profile.is_admin
      })
    }

    return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })

  } catch (error: any) {
    console.error('Check user type error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
