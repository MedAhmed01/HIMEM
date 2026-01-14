import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Upload - Auth check:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message 
    })
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Non authentifié',
        details: authError?.message 
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    console.log('Upload - File info:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      type,
      fileConstructor: file?.constructor?.name
    })

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier que c'est bien un File
    if (!(file instanceof File)) {
      return NextResponse.json({ 
        error: 'Le fichier reçu n\'est pas valide',
        details: `Type reçu: ${typeof file}`
      }, { status: 400 })
    }

    // Valider le type de fichier (plus permissif)
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg',
      'image/png', 
      'image/webp',
      'application/pdf'
    ]
    
    // Vérifier aussi par extension si le type MIME est vide
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf']
    
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension || '')
    
    if (!isValidType) {
      return NextResponse.json(
        { 
          error: 'Type de fichier non autorisé. Utilisez JPG, PNG, WEBP ou PDF.',
          details: `Type reçu: ${file.type}, Extension: ${fileExtension}`
        },
        { status: 400 }
      )
    }

    // Valider la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { 
          error: 'Fichier trop volumineux. Maximum 5MB.',
          details: `Taille: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 400 }
      )
    }

    // Générer un nom de fichier unique
    const fileName = `${user.id}/${type}/${Date.now()}.${fileExtension || 'jpg'}`

    console.log('Upload - Attempting upload:', { fileName, fileSize: file.size })

    // Utiliser le client admin pour l'upload (bypass RLS)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Convertir le File en ArrayBuffer puis en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('Upload - Buffer created:', { bufferSize: buffer.length })

    // Upload vers Supabase Storage avec le client admin
    const { data, error } = await supabaseAdmin.storage
      .from('receipts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload du fichier', details: error.message },
        { status: 500 }
      )
    }

    console.log('Upload - Success:', { path: data.path })

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('receipts')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload', details: error.message },
      { status: 500 }
    )
  }
}
