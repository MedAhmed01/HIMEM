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

    // Fetch all engineers (inclut les admins qui sont aussi ingénieurs)
    const { data: engineersData, error } = await adminClient
      .from('profiles')
      .select(`
        *,
        parrain:profiles!parrain_id (
          full_name,
          phone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Flatten parrain information
    const engineers = engineersData?.map(eng => ({
      ...eng,
      parrain_name: eng.parrain?.full_name || null,
      parrain_phone: eng.parrain?.phone || null,
      parrain: undefined // Remove the nested parrain object
    }))

    return NextResponse.json({ engineers })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
