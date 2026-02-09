import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const nni = searchParams.get('nni')

        if (!nni) {
            return NextResponse.json(
                { error: 'NNI parameter is required' },
                { status: 400 }
            )
        }

        const adminClient = createAdminClient()

        const { data: existingProfile, error } = await adminClient
            .from('profiles')
            .select('nni')
            .eq('nni', nni)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
            console.error('Error checking NNI:', error)
            return NextResponse.json(
                { error: 'Database error' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            exists: !!existingProfile,
            nni
        })

    } catch (error) {
        console.error('Check NNI error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
