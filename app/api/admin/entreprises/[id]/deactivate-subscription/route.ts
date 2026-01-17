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

    console.log('Admin check for deactivation:', {
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
    const { reason = 'Désactivé par admin' } = body

    console.log('Deactivation request details:', {
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

    // Vérifier que l'entreprise existe
    const { data: entreprise, error: entError } = await supabaseAdmin
      .from('entreprises')
      .select('id, name')
      .eq('id', entrepriseId)
      .single()

    if (entError || !entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    // Désactiver tous les abonnements actifs de cette entreprise
    const { error: updateError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .update({
        is_active: false,
        admin_notes: reason,
        expires_at: new Date().toISOString() // Expire immédiatement
      })
      .eq('entreprise_id', entrepriseId)
      .eq('is_active', true)

    if (updateError) {
      console.error('Deactivation error:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la désactivation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Abonnement désactivé pour ${entreprise.name}`
    })

  } catch (error) {
    console.error('Deactivate subscription error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}