import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyDocumentVerification } from '@/lib/utils/notifications'

/**
 * Admin Document Verification API
 * Handles approval and rejection of engineer documents
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const engineerId = formData.get('engineerId') as string
    const action = formData.get('action') as string
    const rejectionReason = formData.get('rejectionReason') as string | null

    if (!engineerId || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Use admin client to check admin status (bypass RLS)
    const { data: adminProfile } = await adminClient
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

    // Get engineer profile (using admin client)
    const { data: engineer, error: fetchError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', engineerId)
      .single()

    if (fetchError || !engineer) {
      return NextResponse.json(
        { error: 'Ingénieur non trouvé' },
        { status: 404 }
      )
    }

    if (engineer.status !== 'pending_docs') {
      return NextResponse.json(
        { error: 'Les documents ont déjà été vérifiés' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Approve documents - change status to validated (process complete)
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ 
          status: 'validated',
          subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year subscription
        })
        .eq('id', engineerId)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de l\'approbation' },
          { status: 500 }
        )
      }

      // Send email notification to engineer
      if (engineer.email) {
        await notifyDocumentVerification(
          engineer.email,
          engineer.full_name,
          true
        )
      }

    } else if (action === 'reject') {
      // Reject documents - keep status as pending_docs
      // Send email notification with rejection reason
      if (engineer.email) {
        await notifyDocumentVerification(
          engineer.email,
          engineer.full_name,
          false,
          rejectionReason || undefined
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Documents rejetés. L\'ingénieur a été notifié.'
      })
    } else {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      )
    }

    // Return success and redirect
    return NextResponse.redirect(new URL('/admin/verifications', request.url))

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
