import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Await params in Next.js 15
    const resolvedParams = await params
    const entrepriseId = resolvedParams.id

    if (!entrepriseId) {
      return NextResponse.json({ error: 'ID entreprise manquant' }, { status: 400 })
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

    // Vérifier que l'entreprise existe
    const { data: entreprise, error: entError } = await supabaseAdmin
      .from('entreprises')
      .select('id, name, user_id')
      .eq('id', entrepriseId)
      .single()

    if (entError || !entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    
    // 1. Get job offer IDs first
    const { data: jobOffers } = await supabaseAdmin
      .from('job_offers')
      .select('id')
      .eq('entreprise_id', entrepriseId)

    const jobOfferIds = jobOffers?.map(job => job.id) || []

    // 2. Supprimer les candidatures aux offres d'emploi
    if (jobOfferIds.length > 0) {
      await supabaseAdmin
        .from('job_applications')
        .delete()
        .in('job_id', jobOfferIds)
    }

    // 3. Supprimer les vues des offres d'emploi
    if (jobOfferIds.length > 0) {
      await supabaseAdmin
        .from('job_views')
        .delete()
        .in('job_id', jobOfferIds)
    }

    // 4. Supprimer les offres d'emploi
    await supabaseAdmin
      .from('job_offers')
      .delete()
      .eq('entreprise_id', entrepriseId)

    // 5. Supprimer les abonnements
    await supabaseAdmin
      .from('entreprise_subscriptions')
      .delete()
      .eq('entreprise_id', entrepriseId)

    // 6. Supprimer l'entreprise
    const { error: deleteError } = await supabaseAdmin
      .from('entreprises')
      .delete()
      .eq('id', entrepriseId)

    if (deleteError) {
      console.error('Delete entreprise error:', deleteError)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    // 7. Supprimer le profil utilisateur associé si nécessaire
    if (entreprise.user_id) {
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', entreprise.user_id)

      // Supprimer l'utilisateur auth (optionnel, peut être fait manuellement)
      // await supabaseAdmin.auth.admin.deleteUser(entreprise.user_id)
    }

    return NextResponse.json({
      success: true,
      message: `Entreprise ${entreprise.name} supprimée avec succès`
    })

  } catch (error) {
    console.error('Delete entreprise error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}