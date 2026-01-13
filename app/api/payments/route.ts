import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Récupérer l'historique des paiements de l'ingénieur connecté
export async function GET() {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les paiements de l'utilisateur
    const { data: payments, error } = await adminClient
      .from('payments')
      .select('*')
      .eq('engineer_id', user.id)
      .order('payment_date', { ascending: false })

    if (error) {
      console.error('Payments fetch error:', error)
      // Si la table n'existe pas encore, retourner un tableau vide
      return NextResponse.json({ payments: [] })
    }

    return NextResponse.json({ payments: payments || [] })
  } catch (error) {
    console.error('Payments GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
