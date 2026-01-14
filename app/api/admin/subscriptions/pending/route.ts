import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services/subscription.service'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    console.log('Admin check:', {
      userId: user.id,
      userEmail: user.email,
      profile,
      profileError: profileError?.message,
      isAdmin: profile?.is_admin
    })

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ 
        error: 'Accès non autorisé',
        debug: {
          hasProfile: !!profile,
          isAdmin: profile?.is_admin,
          userId: user.id
        }
      }, { status: 403 })
    }

    // Utiliser le client admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const subscriptionService = new SubscriptionService(supabaseAdmin)
    const subscriptions = await subscriptionService.getPendingSubscriptions()

    return NextResponse.json({ subscriptions })

  } catch (error) {
    console.error('Get pending subscriptions error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
