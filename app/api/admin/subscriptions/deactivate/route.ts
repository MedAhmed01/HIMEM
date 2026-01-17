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
    const { subscriptionId, reason } = body

    if (!subscriptionId || !reason) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Utiliser le client admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Vérifier que l'abonnement existe et est actif
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .select('*, entreprises(id, nom)')
      .eq('id', subscriptionId)
      .eq('is_active', true)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Abonnement non trouvé ou déjà inactif' }, { status: 404 })
    }

    // Désactiver l'abonnement
    const { error: updateError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .update({
        is_active: false,
        admin_notes: `Désactivé par admin: ${reason}`,
        expires_at: new Date().toISOString() // Expire immédiatement
      })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Deactivation error:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la désactivation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Abonnement désactivé avec succès'
    })

  } catch (error) {
    console.error('Deactivate subscription error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}