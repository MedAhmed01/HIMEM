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
    const file = formData.get('profileImage') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'L\'image ne doit pas dépasser 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/profile-${Date.now()}.${fileExtension}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Erreur lors du téléchargement de l\'image' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('profile-images')
      .getPublicUrl(fileName)

    // Update profile with image URL
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ 
        profile_image_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Try to delete the uploaded file if profile update fails
      await adminClient.storage.from('profile-images').remove([fileName])
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      imageUrl: publicUrl,
      message: 'Photo de profil mise à jour avec succès'
    })

  } catch (error) {
    console.error('Profile image upload error:', error)
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

    // Get current profile to find image path
    const { data: profile } = await adminClient
      .from('profiles')
      .select('profile_image_url')
      .eq('id', user.id)
      .single()

    if (profile?.profile_image_url) {
      // Extract filename from URL
      const url = new URL(profile.profile_image_url)
      const fileName = url.pathname.split('/').pop()
      
      if (fileName) {
        // Delete from storage
        await adminClient.storage
          .from('profile-images')
          .remove([`${user.id}/${fileName}`])
      }
    }

    // Remove image URL from profile
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ 
        profile_image_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la suppression de l\'image' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Photo de profil supprimée avec succès'
    })

  } catch (error) {
    console.error('Profile image delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}