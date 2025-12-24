import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Service } from '@/types/database'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ services: data as Service[] })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch services' },
            { status: 500 }
        )
    }
}
