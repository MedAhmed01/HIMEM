import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'articles'
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })
    }

    // Validate file type for images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non autorisé. Formats acceptés: JPEG, PNG, WebP, GIF' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Le fichier ne doit pas dépasser 5 MB' 
      }, { status: 400 })
    }

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '')}`
    const filePath = `${folder}/${fileName}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('public-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('public-files')
      .getPublicUrl(filePath)
    
    return NextResponse.json({ 
      url: publicUrlData.publicUrl,
      path: filePath 
    })
  } catch (error) {
    console.error('Upload exception:', error)
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 })
  }
}
