import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nif, sector, email, phone, password, description } = body

    // Validation des champs requis
    if (!name || !nif || !sector || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Validation mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Créer un client admin pour bypasser RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Vérifier si le NIF existe déjà
    const { data: existingNif } = await supabaseAdmin
      .from('entreprises')
      .select('id')
      .eq('nif', nif)
      .single()

    if (existingNif) {
      return NextResponse.json(
        { error: 'Ce NIF est déjà enregistré' },
        { status: 409 }
      )
    }

    // Vérifier si l'email existe déjà
    const { data: existingEmail } = await supabaseAdmin
      .from('entreprises')
      .select('id')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Créer le compte utilisateur dans auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        type: 'entreprise',
        name: name
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte: ' + authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte utilisateur' },
        { status: 500 }
      )
    }

    // Créer le profil entreprise avec le client admin
    const { data: entreprise, error: entrepriseError } = await supabaseAdmin
      .from('entreprises')
      .insert({
        user_id: authData.user.id,
        nif,
        name,
        description: description || null,
        sector,
        email,
        phone,
        status: 'en_attente'
      })
      .select()
      .single()

    if (entrepriseError) {
      console.error('Entreprise creation error:', entrepriseError)
      // Supprimer le compte auth si la création du profil échoue
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil entreprise: ' + entrepriseError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie. Votre compte est en attente de validation.',
      entreprise: {
        id: entreprise.id,
        name: entreprise.name,
        status: entreprise.status
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Une erreur interne est survenue' },
      { status: 500 }
    )
  }
}
