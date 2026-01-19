import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('cv') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Le fichier doit être un PDF' }, { status: 400 })
    }

    // Validate file size (max 10MB for PDF)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le CV ne doit pas dépasser 10MB' }, { status: 400 })
    }

    // Generate unique filename
    const fileName = `${user.id}/cv-${Date.now()}.pdf`

    // Delete existing CV if any
    const { data: profile } = await adminClient
      .from('profiles')
      .select('cv_url')
      .eq('id', user.id)
      .single()

    if (profile?.cv_url) {
      // Extract filename from URL and delete old file
      try {
        const url = new URL(profile.cv_url)
        const oldFileName = url.pathname.split('/').slice(-2).join('/') // Get user_id/filename
        await adminClient.storage.from('cvs').remove([oldFileName])
      } catch (error) {
        console.log('Could not delete old CV file:', error)
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('cvs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Erreur lors du téléchargement du CV' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('cvs')
      .getPublicUrl(fileName)

    // Update profile with CV URL
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ 
        cv_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Try to delete the uploaded file if profile update fails
      await adminClient.storage.from('cvs').remove([fileName])
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      cvUrl: publicUrl,
      message: 'CV téléchargé avec succès'
    })

  } catch (error) {
    console.error('CV upload error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get current profile to find CV path
    const { data: profile } = await adminClient
      .from('profiles')
      .select('cv_url')
      .eq('id', user.id)
      .single()

    if (profile?.cv_url) {
      // Extract filename from URL
      try {
        const url = new URL(profile.cv_url)
        const fileName = url.pathname.split('/').slice(-2).join('/') // Get user_id/filename
        
        // Delete from storage
        await adminClient.storage
          .from('cvs')
          .remove([fileName])
      } catch (error) {
        console.log('Could not delete CV file:', error)
      }
    }

    // Remove CV URL from profile
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ 
        cv_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la suppression du CV' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'CV supprimé avec succès'
    })

  } catch (error) {
    console.error('CV delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}