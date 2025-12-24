import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// API to sync available_slots based on actual registration count
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if admin
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }

        // Get all webinars
        const { data: webinars, error: webinarsError } = await supabase
            .from('webinars')
            .select('id, total_slots')

        if (webinarsError) {
            return NextResponse.json(
                { error: 'Failed to fetch webinars' },
                { status: 500 }
            )
        }

        // For each webinar, count actual registrations and update available_slots
        let syncedCount = 0
        for (const webinar of webinars || []) {
            // Count confirmed registrations
            const { count } = await supabase
                .from('webinar_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('webinar_id', webinar.id)
                .in('payment_status', ['completed', 'free'])

            const actualRegistrations = count || 0
            const correctAvailableSlots = Math.max(0, webinar.total_slots - actualRegistrations)

            // Update available_slots
            const { error: updateError } = await supabase
                .from('webinars')
                .update({ available_slots: correctAvailableSlots })
                .eq('id', webinar.id)

            if (!updateError) {
                syncedCount++
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced available slots for ${syncedCount} webinars`,
            webinarsSynced: syncedCount
        })

    } catch (error) {
        console.error('Sync slots error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
