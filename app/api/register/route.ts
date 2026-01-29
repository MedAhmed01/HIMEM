import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateFilePath } from '@/lib/supabase/storage'

/**
 * Engineer Registration API
 * Handles new engineer registration with document upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const fullName = formData.get('fullName') as string
    const nni = formData.get('nni') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const diplomaTitle = formData.get('diplomaTitle') as string
    const university = formData.get('university') as string
    const country = formData.get('country') as string
    const graduationYear = parseInt(formData.get('graduationYear') as string)
    const domains = JSON.parse(formData.get('domains') as string)
    const exerciseModes = JSON.parse(formData.get('exerciseModes') as string || '[]')
    const parrainId = formData.get('parrainId') as string
    const diplomaFile = formData.get('diplomaFile') as File
    const cniFile = formData.get('cniFile') as File
    const paymentReceiptFile = formData.get('paymentReceiptFile') as File

    console.log('Registration - Data extracted:', {
      fullName, nni, email,
      hasDiploma: !!diplomaFile,
      hasCni: !!cniFile,
      hasReceipt: !!paymentReceiptFile,
      parrainId
    })

    // Validate required fields
    if (!fullName || !nni || !email || !password || !diplomaFile || !cniFile || !parrainId) {
      console.error('Registration - Missing required fields:', {
        fullName: !!fullName,
        nni: !!nni,
        email: !!email,
        password: !!password,
        hasDiploma: !!diplomaFile,
        hasCni: !!cniFile,
        hasParrain: !!parrainId
      })
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if NNI already exists
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('nni')
      .eq('nni', nni)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Ce NNI est déjà enregistré' },
        { status: 409 }
      )
    }

    // Check if email already exists in auth
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    const emailExists = existingUsers?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase())

    if (emailExists) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Create auth user using admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        nni: nni
      }
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      )
    }

    const userId = authData.user.id
    console.log('User created:', { userId })

    // Upload documents to storage
    const diplomaPath = generateFilePath(userId, 'diploma', diplomaFile.name)
    const cniPath = generateFilePath(userId, 'cni', cniFile.name)
    const paymentPath = paymentReceiptFile ? generateFilePath(userId, 'payment', paymentReceiptFile.name) : null

    console.log('Uploading documents:', { diplomaPath, cniPath, paymentPath })

    // Helper to upload with Buffer conversion
    const uploadFile = async (path: string, file: File) => {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      return adminClient.storage
        .from('documents')
        .upload(path, buffer, {
          contentType: file.type || 'application/pdf',
          upsert: false
        })
    }

    // Upload diploma
    console.log(`Uploading diploma: ${diplomaFile.name} (${diplomaFile.size} bytes)`)
    const { error: diplomaUploadError } = await uploadFile(diplomaPath, diplomaFile)

    if (diplomaUploadError) {
      console.error('Diploma upload error:', diplomaUploadError)
      await adminClient.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: `Erreur lors du téléchargement du diplôme: ${diplomaUploadError.message}` },
        { status: 500 }
      )
    }

    // Upload CNI
    console.log(`Uploading CNI: ${cniFile.name} (${cniFile.size} bytes)`)
    const { error: cniUploadError } = await uploadFile(cniPath, cniFile)

    if (cniUploadError) {
      console.error('CNI upload error:', cniUploadError)
      await adminClient.auth.admin.deleteUser(userId)
      await adminClient.storage.from('documents').remove([diplomaPath])
      return NextResponse.json(
        { error: `Erreur lors du téléchargement de la CNI: ${cniUploadError.message}` },
        { status: 500 }
      )
    }

    // Upload payment receipt (if provided)
    if (paymentReceiptFile && paymentPath) {
      console.log(`Uploading receipt: ${paymentReceiptFile.name} (${paymentReceiptFile.size} bytes)`)
      const { error: paymentUploadError } = await uploadFile(paymentPath, paymentReceiptFile)

      if (paymentUploadError) {
        console.error('Payment receipt upload error:', paymentUploadError)
        await adminClient.auth.admin.deleteUser(userId)
        await adminClient.storage.from('documents').remove([diplomaPath, cniPath])
        return NextResponse.json(
          { error: `Erreur lors du téléchargement du reçu de paiement: ${paymentUploadError.message}` },
          { status: 500 }
        )
      }
    } else {
      console.log('No payment receipt provided, skipping upload')
    }

    console.log('All documents uploaded successfully')

    // Create profile with PENDING_DOCS status
    const profileData = {
      id: userId,
      nni,
      full_name: fullName,
      phone: phone || null,
      email,
      diploma: diplomaTitle || null,
      university: university || null,
      country: country || null,
      grad_year: graduationYear || null,
      domain: domains || [],
      exercise_mode: exerciseModes || [],
      status: 'pending_docs' as const,
      diploma_file_path: diplomaPath,
      cni_file_path: cniPath,
      payment_receipt_path: paymentPath,
      parrain_id: parrainId
    }

    console.log('Creating profile:', profileData)

    const { error: profileError } = await adminClient
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      console.error('Profile creation error:', profileError)
      await adminClient.auth.admin.deleteUser(userId)
      const filesToRemove = [diplomaPath, cniPath]
      if (paymentPath) filesToRemove.push(paymentPath)
      await adminClient.storage.from('documents').remove(filesToRemove)
      return NextResponse.json(
        { error: `Erreur lors de la création du profil: ${profileError.message}` },
        { status: 500 }
      )
    }

    console.log('Profile created successfully')

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie. Vos documents sont en cours de vérification.',
      userId
    })

  } catch (error: any) {
    console.error('Registration global catch error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      raw: error
    })
    return NextResponse.json(
      {
        error: 'Une erreur est survenue lors de l\'inscription',
        details: error?.message || 'Erreur inconnue',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
