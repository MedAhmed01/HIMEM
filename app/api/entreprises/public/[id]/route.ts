import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Récupérer les détails de l'entreprise
        // Note: On filtre les champs sensibles si nécessaire. Ici on suppose que tout ce qui est dans 'entreprises' est public sauf peut-être admin notes
        const { data: entreprise, error: entError } = await supabaseAdmin
            .from('entreprises')
            .select('*')
            .eq('id', id)
            .single()

        if (entError) {
            return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
        }

        // Récupérer les projets du portfolio
        const { data: projects, error: projError } = await supabaseAdmin
            .from('company_projects')
            .select('*')
            .eq('entreprise_id', id)
            .order('created_at', { ascending: false })

        if (projError) {
            console.error('Error fetching projects:', projError)
            // On ne bloque pas si erreur projets, on renvoie une liste vide
        }

        // Combiner les données
        const fullProfile = {
            ...entreprise,
            projects: projects || []
        }

        return NextResponse.json(fullProfile)

    } catch (error) {
        console.error('Public company profile error:', error)
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
    }
}
