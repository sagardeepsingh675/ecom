'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
    totalWebinars: number
    totalServices: number
    totalUsers: number
    totalContacts: number
    totalBookings: number
    totalRevenue: number
    recentBookings: Array<{
        id: string
        amount_paid: number
        payment_status: string
        registered_at: string
        user_email: string
        webinar_title: string
    }>
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalWebinars: 0,
        totalServices: 0,
        totalUsers: 0,
        totalContacts: 0,
        totalBookings: 0,
        totalRevenue: 0,
        recentBookings: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const supabase = createClient()

                // Fetch counts
                const [webinars, services, users, contacts, bookings] = await Promise.all([
                    supabase.from('webinars').select('*', { count: 'exact', head: true }),
                    supabase.from('services').select('*', { count: 'exact', head: true }),
                    supabase.from('users').select('*', { count: 'exact', head: true }),
                    supabase.from('contact_leads').select('*', { count: 'exact', head: true }),
                    supabase.from('webinar_registrations').select('amount_paid').eq('payment_status', 'completed'),
                ])

                const { data: recentData } = await supabase
                    .from('webinar_registrations')
                    .select(`
            id,
            amount_paid,
            payment_status,
            registered_at,
            users (email),
            webinars (title)
          `)
                    .order('registered_at', { ascending: false })
                    .limit(5)

                const totalRevenue = (bookings.data as Array<{ amount_paid: number }> || []).reduce((sum, b) => sum + (b.amount_paid || 0), 0)

                setStats({
                    totalWebinars: webinars.count || 0,
                    totalServices: services.count || 0,
                    totalUsers: users.count || 0,
                    totalContacts: contacts.count || 0,
                    totalBookings: bookings.data?.length || 0,
                    totalRevenue,
                    recentBookings: (recentData || []).map((b: any) => ({
                        id: b.id,
                        amount_paid: b.amount_paid,
                        payment_status: b.payment_status,
                        registered_at: b.registered_at,
                        user_email: b.users?.email || 'N/A',
                        webinar_title: b.webinars?.title || 'N/A'
                    }))
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const statCards = [
        { title: 'Total Webinars', value: stats.totalWebinars, icon: '📹', color: 'from-indigo-500 to-purple-600', href: '/admin/webinars' },
        { title: 'Total Services', value: stats.totalServices, icon: '📦', color: 'from-green-500 to-emerald-600', href: '/admin/services' },
        { title: 'Total Bookings', value: stats.totalBookings, icon: '🎟️', color: 'from-blue-500 to-cyan-600', href: '/admin/bookings' },
        { title: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: '💰', color: 'from-orange-500 to-red-600', href: '/admin/bookings' },
        { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-pink-500 to-rose-600', href: '/admin/users' },
        { title: 'Contact Leads', value: stats.totalContacts, icon: '📧', color: 'from-yellow-500 to-amber-600', href: '/admin/contacts' },
    ]

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="glass-card p-6 border-l-4 border-red-500">
                <h2 className="text-xl font-semibold text-white mb-1">Welcome to Admin Dashboard</h2>
                <p className="text-white/50">Manage your webinars, services, and users from here.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <Link
                        key={index}
                        href={stat.href}
                        className="glass-card p-6 group cursor-pointer hover:border-white/20 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}>
                                {stat.icon}
                            </div>
                            <svg className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {loading ? (
                                <div className="w-16 h-8 bg-white/10 rounded animate-pulse" />
                            ) : (
                                stat.value
                            )}
                        </div>
                        <div className="text-white/50 text-sm">{stat.title}</div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        href="/admin/webinars/new"
                        className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center hover:bg-indigo-500/20 transition-colors"
                    >
                        <div className="text-2xl mb-2">➕</div>
                        <div className="text-sm text-white font-medium">Add Webinar</div>
                    </Link>
                    <Link
                        href="/admin/services/new"
                        className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center hover:bg-green-500/20 transition-colors"
                    >
                        <div className="text-2xl mb-2">📦</div>
                        <div className="text-sm text-white font-medium">Add Service</div>
                    </Link>
                    <Link
                        href="/admin/contacts"
                        className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center hover:bg-yellow-500/20 transition-colors"
                    >
                        <div className="text-2xl mb-2">📧</div>
                        <div className="text-sm text-white font-medium">View Leads</div>
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center hover:bg-purple-500/20 transition-colors"
                    >
                        <div className="text-2xl mb-2">⚙️</div>
                        <div className="text-sm text-white font-medium">Site Settings</div>
                    </Link>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
                    <Link href="/admin/bookings" className="text-sm text-indigo-400 hover:text-indigo-300">
                        View All →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-white/50 text-sm border-b border-white/10">
                                <th className="pb-3 font-medium">User</th>
                                <th className="pb-3 font-medium">Webinar</th>
                                <th className="pb-3 font-medium">Amount</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-white/50">Loading...</td>
                                </tr>
                            ) : stats.recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-white/50">No bookings yet</td>
                                </tr>
                            ) : (
                                stats.recentBookings.map((booking) => (
                                    <tr key={booking.id} className="border-b border-white/5">
                                        <td className="py-3 text-white">{booking.user_email}</td>
                                        <td className="py-3 text-white/70">{booking.webinar_title}</td>
                                        <td className="py-3 text-white">
                                            {booking.amount_paid === 0 ? 'Free' : formatCurrency(booking.amount_paid)}
                                        </td>
                                        <td className="py-3">
                                            <span className={`badge ${booking.payment_status === 'completed' ? 'badge-success' :
                                                booking.payment_status === 'free' ? 'badge-primary' :
                                                    booking.payment_status === 'pending' ? 'badge-warning' :
                                                        'badge-error'
                                                }`}>
                                                {booking.payment_status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-white/50">
                                            {new Date(booking.registered_at).toLocaleDateString('en-IN')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
