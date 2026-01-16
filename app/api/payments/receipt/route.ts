import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const receipt = formData.get('receipt') as File
    const paymentId = formData.get('paymentId') as string

    if (!receipt || !paymentId) {
      return NextResponse.json(
        { error: 'Fichier et ID de paiement requis' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!receipt.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (receipt.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'L\'image ne doit pas dépasser 5MB' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Verify payment belongs to user
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('engineer_id')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment || payment.engineer_id !== user.id) {
      return NextResponse.json(
        { error: 'Paiement non trouvé' },
        { status: 404 }
      )
    }

    // Upload to Supabase Storage
    const fileExt = receipt.name.split('.').pop()
    const fileName = `${user.id}/${paymentId}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('receipts')
      .upload(fileName, receipt, {
        contentType: receipt.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Erreur lors du téléchargement' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('receipts')
      .getPublicUrl(fileName)

    // Update payment with receipt URL
    const { error: updateError } = await supabase
      .from('payments')
      .update({ receipt_url: publicUrl })
      .eq('id', paymentId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      receiptUrl: publicUrl
    })

  } catch (error) {
    console.error('Receipt upload error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
