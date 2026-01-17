import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const entrepriseId = params.id

    if (!entrepriseId) {
      return NextResponse.json({ error: 'ID entreprise manquant' }, { status: 400 })
    }

    // Utiliser le client admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Vérifier que l'entreprise existe
    const { data: entreprise, error: entError } = await supabaseAdmin
      .from('entreprises')
      .select('id, nom, user_id')
      .eq('id', entrepriseId)
      .single()

    if (entError || !entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    
    // 1. Supprimer les vues d'offres d'emploi
    await supabaseAdmin
      .from('job_views')
      .delete()
      .in('job_id', 
        supabaseAdmin
          .from('job_offers')
          .select('id')
          .eq('entreprise_id', entrepriseId)
      )

    // 2. Supprimer les offres d'emploi
    await supabaseAdmin
      .from('job_offers')
      .delete()
      .eq('entreprise_id', entrepriseId)

    // 3. Supprimer les abonnements
    await supabaseAdmin
      .from('entreprise_subscriptions')
      .delete()
      .eq('entreprise_id', entrepriseId)

    // 4. Supprimer l'entreprise
    const { error: deleteEntError } = await supabaseAdmin
      .from('entreprises')
      .delete()
      .eq('id', entrepriseId)

    if (deleteEntError) {
      console.error('Delete entreprise error:', deleteEntError)
      return NextResponse.json({ error: 'Erreur lors de la suppression de l\'entreprise' }, { status: 500 })
    }

    // 5. Supprimer l'utilisateur auth (optionnel - peut être conservé)
    if (entreprise.user_id) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(entreprise.user_id)
      } catch (authDeleteError) {
        console.warn('Could not delete auth user:', authDeleteError)
        // Ne pas faire échouer la suppression si l'utilisateur auth ne peut pas être supprimé
      }
    }

    return NextResponse.json({
      success: true,
      message: `Entreprise ${entreprise.nom} supprimée avec succès`
    })

  } catch (error) {
    console.error('Delete entreprise error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}