import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Public API to get list of parrains for registration
export async function GET() {
  try {
    const adminClient = createAdminClient()

    // Get all references with engineer info
    const { data: references } = await adminClient
      .from('references_list')
      .select('engineer_id')

    if (!references || references.length === 0) {
      return NextResponse.json({ parrains: [] })
    }

    const engineerIds = references.map(r => r.engineer_id)

    // Get engineer details
    const { data: parrains } = await adminClient
      .from('profiles')
      .select('id, full_name, nni')
      .in('id', engineerIds)
      .order('full_name')

    return NextResponse.json({ parrains: parrains || [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
