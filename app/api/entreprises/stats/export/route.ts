import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { StatsService } from '@/lib/services/stats.service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Utiliser le client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get entreprise for this user
    const { data: entreprise, error: entrepriseError } = await supabaseAdmin
      .from('entreprises')
      .select('id, name')
      .eq('user_id', user.id)
      .single()

    if (entrepriseError || !entreprise) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    // Generate CSV
    const csv = await StatsService.exportToCSV(entreprise.id)

    // Return as downloadable file
    const filename = `statistiques-${entreprise.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des statistiques' },
      { status: 500 }
    )
  }
}
