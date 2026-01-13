import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSignedUrl } from '@/lib/supabase/storage'

/**
 * Admin Document Download API
 * Provides signed URLs for viewing engineer documents
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ engineerId: string; docType: string }> }
) {
  try {
    const { engineerId, docType } = await params

    if (!engineerId || !docType) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    if (docType !== 'diploma' && docType !== 'cni' && docType !== 'payment') {
      return NextResponse.json(
        { error: 'Type de document invalide' },
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

    // Get engineer profile to get document path (using admin client)
    const { data: engineer, error: fetchError } = await adminClient
      .from('profiles')
      .select('diploma_file_path, cni_file_path, payment_receipt_path')
      .eq('id', engineerId)
      .single()

    if (fetchError || !engineer) {
      return NextResponse.json(
        { error: 'Ingénieur non trouvé' },
        { status: 404 }
      )
    }

    const filePath = docType === 'diploma' 
      ? engineer.diploma_file_path 
      : docType === 'cni'
      ? engineer.cni_file_path
      : engineer.payment_receipt_path

    if (!filePath) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    // Get signed URL for the document
    const signedUrl = await getSignedUrl('documents', filePath, 3600)

    if (!signedUrl) {
      return NextResponse.json(
        { error: 'Erreur lors de la génération du lien' },
        { status: 500 }
      )
    }

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl)

  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
