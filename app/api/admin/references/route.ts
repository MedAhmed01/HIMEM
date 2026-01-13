import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Admin References Management API
 * Handles adding and removing engineers from the references list
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const action = formData.get('action') as string
    const engineerId = formData.get('engineerId') as string | null
    const referenceId = formData.get('referenceId') as string | null

    if (!action) {
      return NextResponse.json(
        { error: 'Action manquante' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminProfile?.is_admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    if (action === 'add') {
      if (!engineerId) {
        return NextResponse.json(
          { error: 'ID ingénieur manquant' },
          { status: 400 }
        )
      }

      // Verify engineer exists and is validated
      const { data: engineer, error: fetchError } = await supabase
        .from('profiles')
        .select('id, status')
        .eq('id', engineerId)
        .single()

      if (fetchError || !engineer) {
        return NextResponse.json(
          { error: 'Ingénieur non trouvé' },
          { status: 404 }
        )
      }

      if (engineer.status !== 'validated') {
        return NextResponse.json(
          { error: 'Seuls les ingénieurs validés peuvent devenir parrains' },
          { status: 400 }
        )
      }

      // Check if already a reference
      const { data: existing } = await supabase
        .from('references_list')
        .select('id')
        .eq('engineer_id', engineerId)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'Cet ingénieur est déjà parrain' },
          { status: 409 }
        )
      }

      // Add to references list
      const { error: insertError } = await supabase
        .from('references_list')
        .insert({
          engineer_id: engineerId,
          added_by: user.id
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { error: 'Erreur lors de l\'ajout' },
          { status: 500 }
        )
      }

      // TODO: Send notification to engineer

    } else if (action === 'remove') {
      if (!referenceId) {
        return NextResponse.json(
          { error: 'ID référence manquant' },
          { status: 400 }
        )
      }

      // Remove from references list
      const { error: deleteError } = await supabase
        .from('references_list')
        .delete()
        .eq('id', referenceId)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return NextResponse.json(
          { error: 'Erreur lors de la suppression' },
          { status: 500 }
        )
      }

      // TODO: Send notification to engineer

    } else {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      )
    }

    // Redirect back to parrains page
    redirect('/admin/parrains')

  } catch (error) {
    console.error('References management error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
