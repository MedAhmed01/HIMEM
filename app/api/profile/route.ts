import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Domain, ExerciseMode } from '@/lib/types/database'

// GET - Récupérer le profil de l'ingénieur connecté
export async function GET() {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('Profile API: Auth failed', authError)
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    console.log('Profile API: User found', user.id)

    // Use admin client to bypass RLS issues
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Profile API: DB select error:', error)

      // If no profile found, we might want to return a more specific message
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          error: 'Profil non trouvé',
          code: 'NO_PROFILE'
        }, { status: 404 })
      }

      return NextResponse.json({
        error: 'Erreur lors du chargement du profil',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    // Compter les parrainages effectués (verifications confirmées où cet ingénieur est la référence)
    const { count: sponsorshipsCount, error: countError } = await adminClient
      .from('verifications')
      .select('*', { count: 'exact', head: true })
      .eq('reference_id', user.id)
      .eq('status', 'confirmed')

    if (countError) {
      console.error('Profile API: Count error:', countError)
    }

    console.log('Profile API: Success fetching profile for', profile?.full_name || 'Inconnu')

    return NextResponse.json({
      profile: {
        ...profile,
        sponsorships_count: sponsorshipsCount || 0
      }
    })
  } catch (error: any) {
    console.error('Profile API: Global catch error:', error)
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 })
  }
}

// PUT - Mettre à jour le profil de l'ingénieur connecté
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const {
      full_name,
      phone,
      domain,
      exercise_mode
    } = body

    // Validation des champs requis
    if (!full_name?.trim()) {
      return NextResponse.json({ error: 'Le nom complet est requis' }, { status: 400 })
    }

    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Le téléphone est requis' }, { status: 400 })
    }

    if (!domain || !Array.isArray(domain) || domain.length === 0) {
      return NextResponse.json({ error: 'Au moins un domaine doit être sélectionné' }, { status: 400 })
    }

    if (!exercise_mode || !Array.isArray(exercise_mode) || exercise_mode.length === 0) {
      return NextResponse.json({ error: 'Le mode d\'exercice est requis' }, { status: 400 })
    }

    // Validation des domaines
    const validDomains: Domain[] = ['infrastructure_transport', 'batiment_constructions', 'hydraulique_environnement']
    const invalidDomains = domain.filter((d: string) => !validDomains.includes(d as Domain))
    if (invalidDomains.length > 0) {
      return NextResponse.json({ error: 'Domaines invalides détectés' }, { status: 400 })
    }

    // Validation du mode d'exercice
    const validExerciseModes: ExerciseMode[] = ['personne_physique', 'personne_morale', 'employe_public', 'employe_prive']
    const invalidModes = exercise_mode.filter((m: string) => !validExerciseModes.includes(m as ExerciseMode))
    if (invalidModes.length > 0) {
      return NextResponse.json({ error: 'Modes d\'exercice invalides détectés' }, { status: 400 })
    }

    // Use admin client to bypass RLS issues
    const { data: updatedProfile, error } = await adminClient
      .from('profiles')
      .update({
        full_name: full_name.trim(),
        phone: phone.trim(),
        domain: domain,
        exercise_mode: exercise_mode,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
