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

    // Utiliser le client admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Récupérer TOUS les abonnements (pour debug)
    const { data: allSubscriptions, error: allError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .select(`
        *,
        entreprises (
          id,
          nom,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Récupérer les abonnements pending
    const { data: pendingSubscriptions, error: pendingError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .select(`
        *,
        entreprises (
          id,
          nom,
          email
        )
      `)
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false })

    // Vérifier la structure de la table
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'entreprise_subscriptions' })
      .catch(() => ({ data: null, error: 'RPC not available' }))

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      allSubscriptions: {
        count: allSubscriptions?.length || 0,
        data: allSubscriptions,
        error: allError?.message
      },
      pendingSubscriptions: {
        count: pendingSubscriptions?.length || 0,
        data: pendingSubscriptions,
        error: pendingError?.message
      },
      tableInfo: {
        data: tableInfo,
        error: tableError
      }
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Erreur interne',
      details: error.message 
    }, { status: 500 })
  }
}
