import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
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

    // Get pending documents count (engineers + companies)
    const { count: pendingEngineers } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_docs')

    const { count: pendingCompanies } = await adminClient
      .from('entreprises')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'en_attente')

    const pendingDocs = (pendingEngineers || 0) + (pendingCompanies || 0)

    // Get active engineers count (validated + subscription active)
    const { data: activeEngineersData } = await adminClient
      .from('profiles')
      .select('subscription_expiry')
      .eq('status', 'validated')

    const activeEngineers = activeEngineersData?.filter(profile => 
      profile.subscription_expiry && new Date(profile.subscription_expiry) > new Date()
    ).length || 0

    // Get references count
    const { count: references } = await adminClient
      .from('references_list')
      .select('*', { count: 'exact', head: true })

    // Get total engineers count
    const { count: totalEngineers } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      stats: {
        pendingDocs: pendingDocs,
        pendingEngineers: pendingEngineers || 0,
        pendingCompanies: pendingCompanies || 0,
        activeEngineers: activeEngineers || 0,
        references: references || 0,
        totalEngineers: totalEngineers || 0
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
