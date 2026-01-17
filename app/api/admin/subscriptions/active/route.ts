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

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Utiliser le client admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Récupérer tous les abonnements actifs
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .select(`
        id,
        plan,
        starts_at,
        expires_at,
        is_active,
        created_at,
        admin_notes,
        entreprises (
          id,
          nom,
          email,
          telephone,
          status
        )
      `)
      .eq('is_active', true)
      .eq('payment_status', 'verified')
      .order('expires_at', { ascending: true })

    if (subsError) {
      console.error('Fetch active subscriptions error:', subsError)
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
    }

    return NextResponse.json({
      subscriptions: subscriptions || []
    })

  } catch (error) {
    console.error('Get active subscriptions error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}