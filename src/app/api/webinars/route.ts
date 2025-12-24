import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Webinar } from '@/types/database'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('webinars')
            .select('*')
            .eq('status', 'published')
            .order('webinar_date', { ascending: true })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ webinars: data as Webinar[] })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch webinars' },
            { status: 500 }
        )
    }
}
