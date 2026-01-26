import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    // Utiliser le client admin pour accéder aux données publiques sans restriction RLS si nécessaire
    // ou simplement pour garantir l'accès aux tables 
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let dbQuery = supabaseAdmin
      .from('entreprises')
      .select('id, name, sector, description, created_at, status')
      .eq('status', 'active') // Seulement les entreprises actives/validées
      .order('created_at', { ascending: false })

    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`)
    }

    const { data: entreprises, error } = await dbQuery

    if (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json({ error: 'Erreur lors de la récupération des entreprises' }, { status: 500 })
    }

    return NextResponse.json(entreprises)

  } catch (error) {
    console.error('Public companies API error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
