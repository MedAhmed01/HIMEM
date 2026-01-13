import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyReferenceRequest } from '@/lib/utils/notifications'

/**
 * Reference Selection API
 * Allows engineers with pending_reference status to select a reference engineer
 */
export async function POST(request: NextRequest) {
  try {
    const { referenceId } = await request.json()

    if (!referenceId) {
      return NextResponse.json(
        { error: 'ID du parrain manquant' },
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

    // Verify user's profile status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, status, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    if (profile.status !== 'pending_reference') {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à sélectionner un parrain' },
        { status: 403 }
      )
    }

    // Verify reference exists and is in references_list
    const { data: reference, error: refError } = await supabase
      .from('references_list')
      .select(`
        id,
        engineer_id,
        profiles!references_list_engineer_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('engineer_id', referenceId)
      .single()

    if (refError || !reference) {
      return NextResponse.json(
        { error: 'Parrain non trouvé ou non disponible' },
        { status: 404 }
      )
    }

    // Check if user already has a pending verification request
    const { data: existingVerification } = await supabase
      .from('verifications')
      .select('id, status')
      .eq('applicant_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingVerification) {
      return NextResponse.json(
        { error: 'Vous avez déjà une demande de parrainage en cours' },
        { status: 409 }
      )
    }

    // Create verification request
    const { error: insertError } = await supabase
      .from('verifications')
      .insert({
        applicant_id: user.id,
        reference_id: referenceId,
        status: 'pending'
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la demande' },
        { status: 500 }
      )
    }

    // Send email notification to reference engineer
    const referenceProfile = reference.profiles as any
    if (referenceProfile?.email) {
      // Get applicant NNI for notification
      const { data: applicantProfile } = await supabase
        .from('profiles')
        .select('nni')
        .eq('id', user.id)
        .single()

      await notifyReferenceRequest(
        referenceProfile.email,
        referenceProfile.full_name,
        profile.full_name,
        applicantProfile?.nni || 'N/A'
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Demande de parrainage envoyée avec succès'
    })

  } catch (error) {
    console.error('Reference selection error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
