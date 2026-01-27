import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status using adminClient to bypass RLS
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id, type } = await params

    // Get engineer data from profiles table (typo fixed)
    const { data: engineer, error: engineerError } = await adminClient
      .from('profiles')
      .select('diploma_file_path, cni_file_path, payment_receipt_path')
      .eq('id', id)
      .single()

    if (engineerError || !engineer) {
      return NextResponse.json({ error: 'Engineer profile not found' }, { status: 404 })
    }

    // Determine file path based on type
    let filePath: string | null = null
    let fileName: string = ''

    switch (type) {
      case 'diploma':
        filePath = engineer.diploma_file_path
        fileName = 'diploma'
        break
      case 'cni':
        filePath = engineer.cni_file_path
        fileName = 'cni'
        break
      case 'payment':
        filePath = engineer.payment_receipt_path
        fileName = 'payment_receipt'
        break
      default:
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    if (!filePath) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Download file from Supabase Storage using adminClient
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from('documents')
      .download(filePath)

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError)
      return NextResponse.json({ error: 'Failed to download document' }, { status: 500 })
    }

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer()

    // Get correct extension from file path
    const extension = filePath.split('.').pop() || 'pdf'
    const finalFileName = `${fileName}.${extension}`

    // Return file with appropriate headers
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': fileData.type || 'application/pdf',
        'Content-Disposition': `inline; filename="${finalFileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })

  } catch (error) {
    console.error('Document API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}