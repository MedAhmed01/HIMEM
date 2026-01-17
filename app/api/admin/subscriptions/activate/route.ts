import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { subscriptionId, startDate, endDate, notes } = body

    if (!subscriptionId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Valider les dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json({ error: 'La date de fin doit être après la date de début' }, { status: 400 })
    }

    // Utiliser le client admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Vérifier que l'abonnement existe et est en attente
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .select('*, entreprises(id, nom, status)')
      .eq('id', subscriptionId)
      .eq('payment_status', 'pending')
      .eq('is_active', false)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Abonnement non trouvé ou déjà traité' }, { status: 404 })
    }

    // Vérifier que l'entreprise est validée
    if (subscription.entreprises.status !== 'valide') {
      return NextResponse.json({ 
        error: 'L\'entreprise doit être validée avant d\'activer l\'abonnement' 
      }, { status: 400 })
    }

    // Désactiver tous les autres abonnements de cette entreprise
    await supabaseAdmin
      .from('entreprise_subscriptions')
      .update({ is_active: false })
      .eq('entreprise_id', subscription.entreprise_id)
      .eq('is_active', true)

    // Activer l'abonnement avec les nouvelles dates
    const { error: updateError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .update({
        is_active: true,
        payment_status: 'verified',
        starts_at: start.toISOString(),
        expires_at: end.toISOString(),
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        admin_notes: notes || null
      })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Activation error:', updateError)
      return NextResponse.json({ error: 'Erreur lors de l\'activation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Abonnement activé avec succès'
    })

  } catch (error) {
    console.error('Activate subscription error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}