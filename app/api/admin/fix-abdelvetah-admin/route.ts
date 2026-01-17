import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Use admin client to directly update the user
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, try to find the user by email
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des utilisateurs',
        details: usersError.message 
      }, { status: 500 })
    }

    const targetUser = users.users.find(u => u.email === 'abdelvetahamar@gmail.com')
    
    if (!targetUser) {
      return NextResponse.json({ 
        error: 'Utilisateur abdelvetahamar@gmail.com non trouvé' 
      }, { status: 404 })
    }

    // Update the profile to set is_admin = true
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', targetUser.id)
      .select()

    if (profileError) {
      // If profile doesn't exist, create it
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: targetUser.id,
          email: targetUser.email,
          full_name: 'Abdel Vetah Amar',
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (insertError) {
        return NextResponse.json({ 
          error: 'Erreur lors de la création du profil',
          details: insertError.message 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Profil admin créé pour abdelvetahamar@gmail.com',
        profile: insertData[0],
        userId: targetUser.id
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Statut admin mis à jour pour abdelvetahamar@gmail.com',
      profile: profileData[0],
      userId: targetUser.id
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur interne',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check current status
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', 'abdelvetahamar@gmail.com')
      .single()

    return NextResponse.json({
      profile: profile || null,
      profileError: profileError?.message,
      isAdmin: profile?.is_admin || false
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur interne',
      details: error.message 
    }, { status: 500 })
  }
}