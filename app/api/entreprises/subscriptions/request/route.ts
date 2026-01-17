import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from '@/lib/types/database'

// POST - Créer une demande d'abonnement (sans paiement)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body as { plan: SubscriptionPlan }

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
      .select('id, status, name')
      .eq('user_id', user.id)
      .single()

    if (entError || !entreprise) {
      // Check if it's a "not found" error vs other errors
      if (entError?.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Aucun compte entreprise trouvé. Veuillez d\'abord vous inscrire en tant qu\'entreprise.',
          action: 'register'
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération de votre compte entreprise.'
      }, { status: 500 })
    }

    // Vérifier que l'entreprise est validée
    if (entreprise.status !== 'valide') {
      return NextResponse.json({ 
        error: 'Votre entreprise doit être validée par l\'administrateur avant de pouvoir demander un abonnement' 
      }, { status: 403 })
    }

    // Vérifier s'il y a déjà une demande en attente
    const { data: existingRequest } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .select('id')
      .eq('entreprise_id', entreprise.id)
      .eq('payment_status', 'pending')
      .eq('is_active', false)
      .single()

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'Vous avez déjà une demande d\'abonnement en attente de validation' 
      }, { status: 400 })
    }

    // Désactiver les anciens abonnements actifs
    await supabaseAdmin
      .from('entreprise_subscriptions')
      .update({ is_active: false })
      .eq('entreprise_id', entreprise.id)
      .eq('is_active', true)

    // Calculer les dates (l'admin pourra les modifier)
    const startsAt = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_PLANS[plan].duration)

    // Créer la demande d'abonnement
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .insert({
        entreprise_id: entreprise.id,
        plan,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: false, // Pas actif jusqu'à validation admin
        payment_status: 'pending'
      })
      .select()
      .single()

    if (subError) {
      console.error('Subscription creation error:', subError)
      return NextResponse.json({ 
        error: 'Erreur lors de la création de la demande d\'abonnement' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Demande d\'abonnement créée avec succès. L\'administrateur l\'activera sous peu.',
      subscription
    })

  } catch (error) {
    console.error('Request subscription error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}