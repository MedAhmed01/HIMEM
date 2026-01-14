import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services/subscription.service'

export async function POST(request: NextRequest) {
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
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { subscriptionId, notes } = body

    if (!subscriptionId) {
      return NextResponse.json({ error: 'ID d\'abonnement requis' }, { status: 400 })
    }

    // Utiliser le client admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const subscriptionService = new SubscriptionService(supabaseAdmin)
    const subscription = await subscriptionService.approveSubscription(
      subscriptionId,
      user.id,
      notes
    )

    return NextResponse.json({
      success: true,
      message: 'Abonnement validé avec succès',
      subscription
    })

  } catch (error: any) {
    console.error('Approve subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la validation' },
      { status: 500 }
    )
  }
}
