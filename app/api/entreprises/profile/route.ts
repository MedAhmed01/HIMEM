import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// GET - Obtenir le profil de l'entreprise connectée
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Utiliser le client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: entreprise, error } = await supabaseAdmin
      .from('entreprises')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ entreprise })

  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Mettre à jour le profil
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Utiliser le client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { name, description, sector, phone, logo_url } = body

    // Vérifier que l'entreprise existe
    const { data: existing } = await supabaseAdmin
      .from('entreprises')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (sector) updateData.sector = sector
    if (phone) updateData.phone = phone
    if (logo_url !== undefined) updateData.logo_url = logo_url

    const { data: entreprise, error } = await supabaseAdmin
      .from('entreprises')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error('Erreur lors de la mise à jour: ' + error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour',
      entreprise
    })

  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
