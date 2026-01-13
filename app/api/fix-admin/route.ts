import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const adminClient = createAdminClient()
    
    // Update the profile to set is_admin = true
    const { data, error } = await adminClient
      .from('profiles')
      .update({ is_admin: true })
      .eq('email', 'MedAhmed01@omigec.mr')
      .select()

    if (error) {
      console.error('Error updating admin:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin status updated',
      profile: data 
    })
  } catch (err) {
    console.error('Fix admin error:', err)
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }
}
