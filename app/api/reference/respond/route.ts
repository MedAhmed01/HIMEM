import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notifyVerificationConfirmed, notifyVerificationRejected } from '@/lib/utils/notifications'

/**
 * Reference Response API
 * Allows reference engineers to confirm or reject verification requests
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const verificationId = formData.get('verificationId') as string
    const action = formData.get('action') as string
    const rejectionReason = formData.get('rejectionReason') as string | null

    if (!verificationId || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Verify user is a reference
    const { data: isReference } = await supabase
      .from('references_list')
      .select('id')
      .eq('engineer_id', user.id)
      .single()

    if (!isReference) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à répondre aux demandes' },
        { status: 403 }
      )
    }

    // Get verification request
    const { data: verification, error: fetchError } = await supabase
      .from('verifications')
      .select('*')
      .eq('id', verificationId)
      .eq('reference_id', user.id)
      .single()

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Demande de vérification non trouvée' },
        { status: 404 }
      )
    }

    if (verification.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cette demande a déjà été traitée' },
        { status: 400 }
      )
    }

    if (action === 'confirm') {
      // Confirm the verification
      const { error: updateVerificationError } = await supabase
        .from('verifications')
        .update({
          status: 'confirmed',
          responded_at: new Date().toISOString()
        })
        .eq('id', verificationId)

      if (updateVerificationError) {
        console.error('Update verification error:', updateVerificationError)
        return NextResponse.json(
          { error: 'Erreur lors de la confirmation' },
          { status: 500 }
        )
      }

      // Update applicant status to VALIDATED
      const { data: updatedProfile, error: updateProfileError } = await supabase
        .from('profiles')
        .update({ status: 'validated' })
        .eq('id', verification.applicant_id)
        .select('email, full_name')
        .single()

      if (updateProfileError) {
        console.error('Update profile error:', updateProfileError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du profil' },
          { status: 500 }
        )
      }

      // Send email notification to applicant
      if (updatedProfile?.email) {
        await notifyVerificationConfirmed(
          updatedProfile.email,
          updatedProfile.full_name
        )
      }

    } else if (action === 'reject') {
      // Reject the verification
      const { error: updateError } = await supabase
        .from('verifications')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
          rejection_reason: rejectionReason || 'Demande rejetée par le parrain'
        })
        .eq('id', verificationId)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors du rejet' },
          { status: 500 }
        )
      }

      // Get applicant info for notification
      const { data: applicant } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', verification.applicant_id)
        .single()

      // Send email notification to applicant with rejection reason
      if (applicant?.email) {
        await notifyVerificationRejected(
          applicant.email,
          applicant.full_name,
          rejectionReason || undefined
        )
      }

    } else {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      )
    }

    // Redirect back to parrainages page
    redirect('/parrainages')

  } catch (error) {
    console.error('Reference response error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
