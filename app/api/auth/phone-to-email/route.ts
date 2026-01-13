import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Normaliser le numéro de téléphone (enlever espaces, tirets, etc.)
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, '')
}

// POST - Convertir un numéro de téléphone en email
export async function POST(request: NextRequest) {
  try {
    const { phone, userType } = await request.json()

    if (!phone || !userType) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et type d\'utilisateur requis' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()
    const normalizedPhone = normalizePhone(phone)

    if (userType === 'entreprise') {
      // Chercher dans la table entreprises avec recherche flexible
      const { data: entreprises, error } = await supabaseAdmin
        .from('entreprises')
        .select('email, phone')

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Erreur lors de la recherche' },
          { status: 500 }
        )
      }

      // Recherche flexible en normalisant les numéros
      const entreprise = entreprises?.find(e => 
        normalizePhone(e.phone || '') === normalizedPhone
      )

      if (!entreprise) {
        return NextResponse.json(
          { error: 'Aucune entreprise trouvée avec ce numéro de téléphone' },
          { status: 404 }
        )
      }

      return NextResponse.json({ email: entreprise.email })
    } else {
      // Chercher dans la table profiles (ingénieurs) avec recherche flexible
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('email, phone')

      if (error) {
        console.error('Database error fetching profiles:', error)
        return NextResponse.json(
          { error: `Erreur base de données: ${error.message}` },
          { status: 500 }
        )
      }

      console.log('Searching for phone:', normalizedPhone)
      console.log('Found profiles:', profiles?.length)

      // Recherche flexible en normalisant les numéros
      const profile = profiles?.find(p => {
        const dbPhone = normalizePhone(p.phone || '')
        console.log('Comparing:', dbPhone, 'with', normalizedPhone)
        return dbPhone === normalizedPhone
      })

      if (!profile) {
        console.log('No profile found with phone:', normalizedPhone)
        return NextResponse.json(
          { error: 'Aucun ingénieur trouvé avec ce numéro de téléphone' },
          { status: 404 }
        )
      }

      console.log('Found profile with email:', profile.email)
      return NextResponse.json({ email: profile.email })
    }
  } catch (error: any) {
    console.error('Phone to email error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche du numéro de téléphone' },
      { status: 500 }
    )
  }
}
