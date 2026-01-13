import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * One-time setup route to create admin user
 * DELETE THIS FILE AFTER USE for security
 */
export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient()

    const adminEmail = 'MedAhmed01@omigec.mr'
    const adminPassword = 'Medahmed28233'
    const adminName = 'Admin OMIGEC'
    const adminNNI = 'ADMIN001'

    // Create auth user with admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: adminName,
        nni: adminNNI
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: `Erreur création utilisateur: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Utilisateur non créé' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // Create admin profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        nni: adminNNI,
        full_name: adminName,
        email: adminEmail,
        phone: null,
        diploma: null,
        grad_year: null,
        domain: [],
        exercise_mode: null,
        status: 'validated',
        is_admin: true,
        subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Clean up auth user
      await adminClient.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: `Erreur création profil: ${profileError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin créé avec succès!',
      credentials: {
        email: adminEmail,
        password: '********' // Don't expose password in response
      }
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
