import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// POST - Valider une entreprise
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Vérifier l'authentification admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Créer un client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Valider l'entreprise
    const { data: entreprise, error } = await supabaseAdmin
      .from('entreprises')
      .update({ status: 'valide' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error('Erreur lors de la validation: ' + error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Entreprise validée',
      entreprise
    })

  } catch (error: any) {
    console.error('Validate entreprise error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
