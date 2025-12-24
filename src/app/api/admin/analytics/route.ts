import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30' // days

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        // Get revenue data
        const { data: registrations } = await supabase
            .from('webinar_registrations')
            .select('amount_paid, registered_at, payment_status')
            .gte('registered_at', startDate.toISOString())
            .in('payment_status', ['completed', 'free'])

        const { data: purchases } = await supabase
            .from('service_purchases')
            .select('amount_paid, purchased_at, payment_status')
            .gte('purchased_at', startDate.toISOString())
            .eq('payment_status', 'completed')

        // Calculate totals
        const totalWebinarRevenue = (registrations || []).reduce((sum, r) => sum + (r.amount_paid || 0), 0)
        const totalServiceRevenue = (purchases || []).reduce((sum, p) => sum + (p.amount_paid || 0), 0)
        const totalRevenue = totalWebinarRevenue + totalServiceRevenue

        // Calculate daily revenue for chart
        const revenueByDay: Record<string, { webinar: number; service: number; date: string }> = {}
        const days = parseInt(period)

        for (let i = 0; i < days; i++) {
            const date = new Date()
            date.setDate(date.getDate() - (days - 1 - i))
            const dateStr = date.toISOString().split('T')[0]
            revenueByDay[dateStr] = { webinar: 0, service: 0, date: dateStr }
        }

        (registrations || []).forEach(r => {
            const dateStr = new Date(r.registered_at).toISOString().split('T')[0]
            if (revenueByDay[dateStr]) {
                revenueByDay[dateStr].webinar += r.amount_paid || 0
            }
        });

        (purchases || []).forEach(p => {
            const dateStr = new Date(p.purchased_at).toISOString().split('T')[0]
            if (revenueByDay[dateStr]) {
                revenueByDay[dateStr].service += p.amount_paid || 0
            }
        })

        const chartData = Object.values(revenueByDay).map(d => ({
            ...d,
            total: d.webinar + d.service
        }))

        // Get counts
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })

        const { count: totalWebinars } = await supabase
            .from('webinars')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')

        const { count: newUsersThisPeriod } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate.toISOString())

        const { count: pendingContacts } = await supabase
            .from('contact_leads')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)

        // Get top webinars
        const { data: topWebinars } = await supabase
            .from('webinar_registrations')
            .select('webinar_id, amount_paid, webinars(title)')
            .in('payment_status', ['completed', 'free'])
            .gte('registered_at', startDate.toISOString())

        const webinarStats: Record<string, { title: string; revenue: number; count: number }> = {}
            ; (topWebinars || []).forEach((r: any) => {
                const id = r.webinar_id
                if (!webinarStats[id]) {
                    webinarStats[id] = { title: r.webinars?.title || 'Unknown', revenue: 0, count: 0 }
                }
                webinarStats[id].revenue += r.amount_paid || 0
                webinarStats[id].count += 1
            })

        const topWebinarsList = Object.values(webinarStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        return NextResponse.json({
            overview: {
                totalRevenue,
                totalWebinarRevenue,
                totalServiceRevenue,
                totalUsers: totalUsers || 0,
                totalWebinars: totalWebinars || 0,
                newUsersThisPeriod: newUsersThisPeriod || 0,
                pendingContacts: pendingContacts || 0,
                registrationsCount: registrations?.length || 0,
                purchasesCount: purchases?.length || 0,
            },
            chartData,
            topWebinars: topWebinarsList,
        })

    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
