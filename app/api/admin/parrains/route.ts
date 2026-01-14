import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Get references with engineer info
    const { data: references } = await adminClient
      .from('references_list')
      .select('id, engineer_id, added_at')
      .order('added_at', { ascending: false })

    // Get engineer details for references
    const refsWithEngineers = []
    for (const ref of references || []) {
      const { data: engineer } = await adminClient
        .from('profiles')
        .select('id, full_name, nni, email, grad_year')
        .eq('id', ref.engineer_id)
        .single()
      
      if (engineer) {
        refsWithEngineers.push({ ...ref, engineer })
      }
    }

    // Get validated engineers (inclut les admins qui sont aussi ingénieurs)
    const { data: validatedEngineers } = await adminClient
      .from('profiles')
      .select('id, full_name, nni, email, grad_year')
      .eq('status', 'validated')
      .order('full_name')

    // Filter out those already references
    const referenceIds = refsWithEngineers.map(r => r.engineer_id)
    const availableEngineers = validatedEngineers?.filter(e => !referenceIds.includes(e.id)) || []

    return NextResponse.json({ references: refsWithEngineers, availableEngineers })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, id } = await request.json()
    
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    if (action === 'add') {
      const { error } = await adminClient
        .from('references_list')
        .insert({ engineer_id: id })
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else if (action === 'remove') {
      const { error } = await adminClient
        .from('references_list')
        .delete()
        .eq('id', id)
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
