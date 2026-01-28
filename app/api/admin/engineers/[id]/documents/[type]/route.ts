import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, type: string }> }
) {
    try {
        const supabase = await createClient()
        const adminClient = createAdminClient()

        // Verify admin access
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
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

        const { id: engineerId, type } = await params

        // Get engineer profile
        const { data: profile, error: profileError } = await adminClient
            .from('profiles')
            .select('diploma_file_path, cni_file_path, payment_receipt_path')
            .eq('id', engineerId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
        }

        // Determine file path based on type
        let filePath: string | null = null
        let fileName: string = ''

        switch (type) {
            case 'diploma':
                filePath = profile.diploma_file_path
                fileName = 'diploma'
                break
            case 'cni':
                filePath = profile.cni_file_path
                fileName = 'cni'
                break
            case 'payment':
                filePath = profile.payment_receipt_path
                fileName = 'payment_receipt'
                break
            default:
                return NextResponse.json({ error: 'Type de document invalide' }, { status: 400 })
        }

        if (!filePath) {
            return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
        }

        // Download file from Supabase Storage using adminClient
        const { data: fileData, error: downloadError } = await adminClient.storage
            .from('documents')
            .download(filePath)

        if (downloadError || !fileData) {
            console.error('Download error:', downloadError)
            return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
        }

        // Convert blob to array buffer
        const arrayBuffer = await fileData.arrayBuffer()

        // Get correct extension from file path
        const extension = filePath.split('.').pop() || 'pdf'
        const finalFileName = `${fileName}_${engineerId}.${extension}`

        // Return file with appropriate headers
        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': fileData.type || 'application/pdf',
                'Content-Disposition': `inline; filename="${finalFileName}"`,
                'Cache-Control': 'private, max-age=3600',
            },
        })

    } catch (error) {
        console.error('Admin Documents API error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
