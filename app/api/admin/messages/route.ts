import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Utiliser le client admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Récupérer tous les messages
    const { data: messages, error } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 })
    }

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
