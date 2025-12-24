import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .maybeSingle()

        if (error) {
            console.error('Settings fetch error:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ settings: data })
    } catch (error) {
        console.error('Settings GET error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin role
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!userData || userData.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const body = await request.json()
        const { id, ...settingsData } = body

        // Use service client to bypass RLS (await the async function!)
        const serviceClient = await createServiceClient()

        if (id) {
            // Update existing settings
            const { data, error } = await serviceClient
                .from('site_settings')
                .update(settingsData)
                .eq('id', id)
                .select()
                .single()

            if (error) {
                console.error('Settings update error:', error)
                return NextResponse.json({ error: error.message }, { status: 400 })
            }

            return NextResponse.json({ settings: data, message: 'Settings updated' })
        } else {
            // Insert new settings
            const { data, error } = await serviceClient
                .from('site_settings')
                .insert(settingsData)
                .select()
                .single()

            if (error) {
                console.error('Settings insert error:', error)
                return NextResponse.json({ error: error.message }, { status: 400 })
            }

            return NextResponse.json({ settings: data, message: 'Settings created' })
        }
    } catch (error) {
        console.error('Settings PUT error:', error)
        return NextResponse.json(
            { error: 'Failed to save settings' },
            { status: 500 }
        )
    }
}
