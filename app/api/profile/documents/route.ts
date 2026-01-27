import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateFilePath } from '@/lib/supabase/storage'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const type = formData.get('type') as string // 'diploma', 'cni', 'payment'

        if (!file || !type) {
            return NextResponse.json({ error: 'Fichier ou type manquant' }, { status: 400 })
        }

        // Validate type
        const validTypes = ['diploma', 'cni', 'payment']
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: 'Type de document invalide' }, { status: 400 })
        }

        // Validate file
        const validMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        if (!validMimeTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Format non supporté (PDF ou Images uniquement)' }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 })
        }

        const adminClient = createAdminClient()
        const filePath = generateFilePath(user.id, type, file.name)

        // Convert to buffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to storage
        const { error: uploadError } = await adminClient.storage
            .from('documents')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
        }

        // Determine column to update
        const columnMap: Record<string, string> = {
            'diploma': 'diploma_file_path',
            'cni': 'cni_file_path',
            'payment': 'payment_receipt_path'
        }

        const updateData: any = {
            [columnMap[type]]: filePath,
            status: 'pending_docs', // Reset status for re-verification
            updated_at: new Date().toISOString()
        }

        // Update profile
        const { error: updateError } = await adminClient
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)

        if (updateError) {
            console.error('Profile update error:', updateError)
            return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Document mis à jour avec succès',
            filePath
        })

    } catch (error: any) {
        console.error('Document upload API error:', error)
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 })
    }
}
