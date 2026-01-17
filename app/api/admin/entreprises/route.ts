import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// GET - Liste des entreprises (admin)
export async function GET(request: NextRequest) {
  try {
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

    // Filtres
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('entreprises')
      .select(`
        *,
        entreprise_subscriptions!inner (
          id,
          plan,
          starts_at,
          expires_at,
          is_active,
          payment_status,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: entreprises, error } = await query

    if (error) {
      console.error('Query error:', error)
      // Fallback to basic query without subscriptions
      const { data: basicEntreprises, error: basicError } = await supabaseAdmin
        .from('entreprises')
        .select('*')
        .order('created_at', { ascending: false })

      if (basicError) {
        throw new Error('Erreur lors de la récupération des entreprises')
      }

      return NextResponse.json({ entreprises: basicEntreprises })
    }

    // Process subscription data to get the most relevant subscription for each entreprise
    const processedEntreprises = entreprises.map(entreprise => {
      const subscriptions = entreprise.entreprise_subscriptions || []
      
      // Find active subscription first, then most recent
      const activeSubscription = subscriptions.find(sub => sub.is_active && sub.payment_status === 'verified')
      const mostRecentSubscription = subscriptions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
      
      const currentSubscription = activeSubscription || mostRecentSubscription || null

      return {
        ...entreprise,
        currentSubscription,
        hasActiveSubscription: !!activeSubscription
      }
    })

    return NextResponse.json({ entreprises: processedEntreprises })

  } catch (error: any) {
    console.error('Get entreprises error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
