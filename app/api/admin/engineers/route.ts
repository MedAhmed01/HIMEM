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
        parrain_details:profiles!parrain_id (
          full_name,
          phone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('API Admin Engineers - Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Flatten parrain information
    const engineers = (engineersData as any[])?.map(eng => {
      // Supabase might return parrain_details as an object or an array of size 1
      const parrain = Array.isArray(eng.parrain_details) ? eng.parrain_details[0] : eng.parrain_details
      return {
        ...eng,
        parrain_name: parrain?.full_name || null,
        parrain_phone: parrain?.phone || null,
        parrain_details: undefined // Remove the nested object
      }
    })

    return NextResponse.json({ engineers })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
