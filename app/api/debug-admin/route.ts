import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const adminClient = createAdminClient()
    
    // Get all profiles with full details
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('*')
    
    // Get documents table if it exists
    const { data: documents, error: docsError } = await adminClient
      .from('documents')
      .select('*')

    return NextResponse.json({ 
      profiles,
      profilesError,
      documents,
      docsError
    })
  } catch (err) {
    console.error('Debug error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
