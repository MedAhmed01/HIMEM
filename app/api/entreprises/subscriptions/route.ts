import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services/subscription.service'
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from '@/lib/types/database'

// GET - Obtenir l'abonnement actif et les infos
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
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (entError || !entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    const subscriptionService = new SubscriptionService(supabaseAdmin)
    const subscriptionInfo = await subscriptionService.getSubscriptionInfo(entreprise.id)

    return NextResponse.json({
      hasActiveSubscription: !!subscriptionInfo,
      subscription: subscriptionInfo,
      availablePlans: Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
        key,
        ...plan
      }))
    })

  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// POST - Créer un nouvel abonnement
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, receiptUrl } = body as { plan: SubscriptionPlan; receiptUrl?: string }

    // Valider le plan
    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Utiliser le client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Obtenir l'entreprise de l'utilisateur
    const { data: entreprise, error: entError } = await supabaseAdmin
      .from('entreprises')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (entError || !entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    if (entreprise.status !== 'valide') {
      return NextResponse.json(
        { error: 'Votre compte doit être validé pour souscrire à un abonnement' },
        { status: 403 }
      )
    }

    const subscriptionService = new SubscriptionService(supabaseAdmin)
    const subscription = await subscriptionService.createSubscriptionRequest(entreprise.id, plan)

    return NextResponse.json({
      success: true,
      message: 'Demande d\'abonnement créée. En attente de validation après vérification du paiement.',
      subscription
    })

  } catch (error: any) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    )
  }
}
