import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = await createClient()
        const adminClient = createAdminClient()

        // 1. Verify admin access
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const { data: adminProfile } = await adminClient
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!adminProfile?.is_admin) {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
        }

        // 2. Fetch Recent Activities

        // A. New Engineer Registrations (pending_docs)
        const { data: newEngineers } = await adminClient
            .from('profiles')
            .select('id, full_name, created_at, status')
            .order('created_at', { ascending: false })
            .limit(5)

        // B. New Company Registrations (en_attente)
        const { data: newCompanies } = await adminClient
            .from('entreprises')
            .select('id, name, created_at, status')
            .order('created_at', { ascending: false })
            .limit(5)

        // C. New Job Offers
        const { data: newJobs } = await adminClient
            .from('job_offers')
            .select('id, title, created_at, is_active')
            .order('created_at', { ascending: false })
            .limit(5)

        // D. Recent Verifications
        const { data: recentVerifications } = await adminClient
            .from('verifications')
            .select('id, applicant_id, status, created_at, profiles(full_name)')
            .order('created_at', { ascending: false })
            .limit(5)

        // 3. Format and Combine Activities
        const activities: any[] = []

        // Format Engineers
        newEngineers?.forEach(eng => {
            activities.push({
                id: `eng-${eng.id}`,
                user: eng.full_name,
                action: eng.status === 'pending_docs'
                    ? 'A soumis ses documents pour inscription.'
                    : eng.status === 'validated'
                        ? 'A été validé comme Ingénieur.'
                        : `Profil mis à jour (Status: ${eng.status}).`,
                time: eng.created_at,
                status: eng.status === 'validated' ? 'approved' : 'pending',
                type: 'engineer'
            })
        })

        // Format Companies
        newCompanies?.forEach(comp => {
            activities.push({
                id: `comp-${comp.id}`,
                user: comp.name,
                action: 'Nouvelle entreprise enregistrée.',
                time: comp.created_at,
                status: comp.status === 'valide' ? 'approved' : 'pending',
                type: 'company'
            })
        })

        // Format Jobs
        newJobs?.forEach(job => {
            activities.push({
                id: `job-${job.id}`,
                user: 'Entreprise',
                action: `Nouvelle offre d'emploi : "${job.title}".`,
                time: job.created_at,
                status: 'approved',
                type: 'job'
            })
        })

        // Sort by timestamp (descending)
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

        // Limit to top 10
        const finalActivities = activities.slice(0, 10)

        return NextResponse.json({ activities: finalActivities })
    } catch (error) {
        console.error('Error fetching admin activities:', error)
        return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
    }
}
