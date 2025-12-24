import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // Test database connection by fetching site settings
        const { data: settings, error: settingsError } = await supabase
            .from('site_settings')
            .select('*')
            .single()

        if (settingsError) {
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch site settings',
                details: settingsError.message,
                hint: 'Make sure you have run the database migrations in Supabase SQL Editor'
            }, { status: 500 })
        }

        // Fetch webinars count
        const { count: webinarsCount, error: webinarsError } = await supabase
            .from('webinars')
            .select('*', { count: 'exact', head: true })

        // Fetch services count
        const { count: servicesCount, error: servicesError } = await supabase
            .from('services')
            .select('*', { count: 'exact', head: true })

        // Fetch contact leads count
        const { count: leadsCount, error: leadsError } = await supabase
            .from('contact_leads')
            .select('*', { count: 'exact', head: true })

        return NextResponse.json({
            success: true,
            message: 'Database connection successful!',
            data: {
                siteSettings: {
                    name: settings.site_name,
                    description: settings.site_description,
                    email: settings.email
                },
                counts: {
                    webinars: webinarsCount ?? 0,
                    services: servicesCount ?? 0,
                    contactLeads: leadsCount ?? 0
                },
                errors: {
                    webinars: webinarsError?.message,
                    services: servicesError?.message,
                    leads: leadsError?.message
                }
            }
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Database connection failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
