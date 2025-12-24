'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
    upcomingWebinars: number
    purchasedServices: number
    totalSpent: number
}

export default function DashboardPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState<DashboardStats>({
        upcomingWebinars: 0,
        purchasedServices: 0,
        totalSpent: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return

            try {
                const supabase = createClient()

                // Fetch upcoming webinar registrations (only future dates with completed payment)
                const { data: webinarRegs, error: webinarError } = await supabase
                    .from('webinar_registrations')
                    .select(`
                        id,
                        amount_paid,
                        webinars (webinar_date)
                    `)
                    .eq('user_id', user.id)
                    .in('payment_status', ['completed', 'free'])

                if (webinarError) {
                    console.error('Error fetching webinars:', webinarError)
                }

                // Filter for upcoming webinars (future dates only)
                const today = new Date().toISOString().split('T')[0]
                const upcomingCount = webinarRegs?.filter(reg => {
                    const webinar = reg.webinars as any
                    return webinar && webinar.webinar_date >= today
                }).length || 0

                // Calculate total spent on webinars
                const webinarTotal = webinarRegs?.reduce((sum, r) => sum + (r.amount_paid || 0), 0) || 0

                // Fetch service purchases
                const { data: purchases, error: purchaseError } = await supabase
                    .from('service_purchases')
                    .select('id, amount_paid')
                    .eq('user_id', user.id)
                    .eq('payment_status', 'completed')

                if (purchaseError) {
                    console.error('Error fetching purchases:', purchaseError)
                }

                const serviceTotal = purchases?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0

                setStats({
                    upcomingWebinars: upcomingCount,
                    purchasedServices: purchases?.length || 0,
                    totalSpent: webinarTotal + serviceTotal
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [user])

    const statCards = [
        {
            title: 'Upcoming Webinars',
            value: stats.upcomingWebinars,
            icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
            color: 'from-indigo-500 to-purple-600',
            href: '/dashboard/webinars'
        },
        {
            title: 'Services Purchased',
            value: stats.purchasedServices,
            icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
            color: 'from-green-500 to-emerald-600',
            href: '/dashboard/services'
        },
        {
            title: 'Total Investment',
            value: `₹${stats.totalSpent.toLocaleString('en-IN')}`,
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'from-orange-500 to-red-600',
            href: '#'
        }
    ]

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="glass-card p-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
                        </h2>
                        <p className="text-white/50">
                            Here's what's happening with your learning journey
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <Link
                        key={index}
                        href={stat.href}
                        className="glass-card p-6 group cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                                </svg>
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
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/#webinars" className="glass-card p-6 flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">Book a Webinar</div>
                            <div className="text-sm text-white/50">Register for upcoming sessions</div>
                        </div>
                    </Link>

                    <Link href="/#services" className="glass-card p-6 flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-semibold text-white group-hover:text-green-400 transition-colors">Explore Services</div>
                            <div className="text-sm text-white/50">Boost your business growth</div>
                        </div>
                    </Link>

                    <Link href="/dashboard/profile" className="glass-card p-6 flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">Update Profile</div>
                            <div className="text-sm text-white/50">Manage your account settings</div>
                        </div>
                    </Link>

                    <Link href="/#contact" className="glass-card p-6 flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-semibold text-white group-hover:text-orange-400 transition-colors">Get Support</div>
                            <div className="text-sm text-white/50">Have questions? Contact us</div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Empty State */}
            {!loading && stats.upcomingWebinars === 0 && stats.purchasedServices === 0 && (
                <div className="glass-card p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Start Your Journey</h3>
                    <p className="text-white/50 mb-6 max-w-md mx-auto">
                        You haven't registered for any webinars yet. Explore our upcoming sessions and start learning from experts today!
                    </p>
                    <Link href="/" className="btn btn-primary">
                        Explore Webinars
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    )
}
