import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data: sponsors, error } = await supabase
      .from('sponsors')
      .select('id, name, logo_url, website_url, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching sponsors:', error)
      return NextResponse.json({ sponsors: [] })
    }

    return NextResponse.json({ sponsors: sponsors || [] })
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json({ sponsors: [] })
  }
}
