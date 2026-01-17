import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Non authentifié',
        authenticated: false 
      }, { status: 401 })
    }

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Use admin client to check database structure
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if subscription tables exist
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['entreprise_subscriptions', 'entreprises', 'profiles'])

    // Check if there are any subscriptions in the database
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('entreprise_subscriptions')
      .select('id, plan, payment_status, is_active')
      .limit(5)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile || null,
      profileError: profileError?.message,
      isAdmin: profile?.is_admin || false,
      database: {
        tables: tables?.map(t => t.table_name) || [],
        tablesError: tablesError?.message,
        sampleSubscriptions: subscriptions || [],
        subscriptionsError: subsError?.message
      },
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur interne',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Non authentifié' 
      }, { status: 401 })
    }

    // Use admin client to make user admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id)
      .select()

    if (error) {
      // If update fails, try to find by email and update
      const { data: profileByEmail, error: emailError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single()

      if (profileByEmail) {
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', profileByEmail.id)
          .select()

        if (updateError) {
          return NextResponse.json({ 
            error: 'Erreur lors de la mise à jour par email',
            details: updateError.message 
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Utilisateur défini comme admin (via email)',
          profile: updateData[0]
        })
      }

      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur défini comme admin',
      profile: data[0]
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur interne',
      details: error.message 
    }, { status: 500 })
  }
}