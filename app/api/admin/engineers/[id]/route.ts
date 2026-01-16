import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Delete an engineer completely from the database
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: engineerId } = await params

    if (!engineerId) {
      return NextResponse.json({ error: 'ID ingénieur manquant' }, { status: 400 })
    }

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

    // Prevent admin from deleting themselves
    if (engineerId === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 })
    }

    // Check if engineer exists
    const { data: engineer, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, full_name, is_admin')
      .eq('id', engineerId)
      .single()

    if (fetchError || !engineer) {
      return NextResponse.json({ error: 'Ingénieur non trouvé' }, { status: 404 })
    }

    // Prevent deleting other admins
    if (engineer.is_admin) {
      return NextResponse.json({ error: 'Impossible de supprimer un administrateur' }, { status: 400 })
    }

    // Delete related records first (to avoid foreign key constraints)
    // Delete from references_list if they are a reference
    await adminClient
      .from('references_list')
      .delete()
      .eq('engineer_id', engineerId)

    // Delete verifications where they are the applicant
    await adminClient
      .from('verifications')
      .delete()
      .eq('applicant_id', engineerId)

    // Delete job applications
    await adminClient
      .from('job_applications')
      .delete()
      .eq('engineer_id', engineerId)

    // Delete the profile
    const { error: deleteProfileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', engineerId)

    if (deleteProfileError) {
      console.error('Error deleting profile:', deleteProfileError)
      return NextResponse.json({ error: 'Erreur lors de la suppression du profil' }, { status: 500 })
    }

    // Delete the auth user using admin API
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(engineerId)

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      // Profile is already deleted, so we return partial success
      return NextResponse.json({ 
        success: true, 
        warning: 'Profil supprimé mais erreur lors de la suppression du compte auth'
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Ingénieur ${engineer.full_name} supprimé avec succès`
    })

  } catch (error) {
    console.error('Error deleting engineer:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
