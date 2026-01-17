import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Await params in Next.js 15
    const resolvedParams = await params

    // Vérifier que l'utilisateur est admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    console.log('Admin check for activation:', {
      userId: user.id,
      userEmail: user.email,
      profile,
      profileError: profileError?.message,
      isAdmin: profile?.is_admin
    })

    // Special bypass for abdelvetahamar@gmail.com
    const isAbdelvetah = user.email === 'abdelvetahamar@gmail.com'
    
    if (!profile || (!profile.is_admin && !isAbdelvetah)) {
      return NextResponse.json({ 
        error: 'Accès non autorisé',
        debug: {
          hasProfile: !!profile,
          isAdmin: profile?.is_admin,
          userId: user.id,
          userEmail: user.email,
          isAbdelvetah
        }
      }, { status: 403 })
    }

    const entrepriseId = resolvedParams.id
    const body = await request.json()
    const { plan = 'business', duration = 30 } = body

    console.log('Activation request details:', {
      entrepriseId,
      resolvedParams,
      paramsId: resolvedParams?.id,
      url: request.url,
      method: request.method,
      body
    })

    if (!entrepriseId) {
      return NextResponse.json({ 
        error: 'ID entreprise manquant',
        debug: { 
          resolvedParams, 
          entrepriseId,
          paramsId: resolvedParams?.id,
          url: request.url
        }
      }, { status: 400 })
    }

    // Utiliser le client admin
    // const supabaseAdmin = createAdminClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // )

    // We already have supabaseAdmin from above

    // Vérifier que l'entreprise existe et est validée
    const { data: entreprise, error: entError } = await supabaseAdmin
      .from('entreprises')
      .select('id, name, status')
      .eq('id', entrepriseId)
      .single()

    if (entError || !entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    if (entreprise.status !== 'valide') {
      return NextResponse.json({ 
        error: 'L\'entreprise doit être validée avant d\'activer l\'abonnement' 
      }, { status: 400 })
    }

    // Désactiver tous les abonnements existants de cette entreprise
    await supabaseAdmin
      .from('entreprise_subscriptions')
      .update({ is_active: false })
      .eq('entreprise_id', entrepriseId)
      .eq('is_active', true)

    // Calculer les dates
    const startsAt = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + duration)

    // Créer un nouvel abonnement actif
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .insert({
        entreprise_id: entrepriseId,
        plan,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        payment_status: 'verified',
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        admin_notes: `Activé manuellement par admin (${duration} jours)`
      })
      .select()
      .single()

    if (subError) {
      console.error('Subscription creation error:', subError)
      return NextResponse.json({ error: 'Erreur lors de la création de l\'abonnement' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Abonnement ${plan} activé pour ${entreprise.name}`,
      subscription
    })

  } catch (error) {
    console.error('Activate subscription error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}