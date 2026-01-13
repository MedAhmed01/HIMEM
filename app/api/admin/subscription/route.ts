import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { engineerId, action } = await request.json()

    if (!engineerId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    let updateData: { subscription_expiry: string | null; status?: string }

    if (action === 'activate') {
      // Set subscription to 1 year from now and validate the engineer
      updateData = {
        subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'validated'
      }
    } else if (action === 'deactivate') {
      // Set subscription to null (deactivated)
      updateData = {
        subscription_expiry: null
      }
    } else {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    const { error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', engineerId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
