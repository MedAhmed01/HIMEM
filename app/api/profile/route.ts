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
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Use admin client to bypass RLS issues
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return NextResponse.json({ error: `Erreur lors du chargement du profil: ${error.message}` }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
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
      diploma,
      university,
      country,
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

    if (!diploma?.trim()) {
      return NextResponse.json({ error: 'Le diplôme est requis' }, { status: 400 })
    }

    if (!domain || !Array.isArray(domain) || domain.length === 0) {
      return NextResponse.json({ error: 'Au moins un domaine doit être sélectionné' }, { status: 400 })
    }

    if (!exercise_mode) {
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
    if (!validExerciseModes.includes(exercise_mode as ExerciseMode)) {
      return NextResponse.json({ error: 'Mode d\'exercice invalide' }, { status: 400 })
    }

    // Validation du pays (optionnel)
    const validCountries = [
      'Mauritanie', 'Maroc', 'Algérie', 'Tunisie', 'Libye', 'Égypte', 'Soudan', 'Mali', 'Niger', 'Tchad',
      'Sénégal', 'Burkina Faso', 'Côte d\'Ivoire', 'Ghana', 'Nigeria', 'France', 'Espagne', 'Allemagne',
      'Royaume-Uni', 'Canada', 'États-Unis', 'Jordanie', 'Liban', 'Syrie', 'Irak', 'Arabie Saoudite'
    ]
    
    if (country && !validCountries.includes(country.trim())) {
      return NextResponse.json({ error: 'Pays non valide' }, { status: 400 })
    }

    // Use admin client to bypass RLS issues
    const { data: updatedProfile, error } = await adminClient
      .from('profiles')
      .update({
        full_name: full_name.trim(),
        phone: phone.trim(),
        diploma: diploma.trim(),
        university: university?.trim() || null,
        country: country?.trim() || null,
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