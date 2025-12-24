'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
    overview: {
        totalRevenue: number
        totalWebinarRevenue: number
        totalServiceRevenue: number
        totalUsers: number
        totalWebinars: number
        newUsersThisPeriod: number
        pendingContacts: number
        registrationsCount: number
        purchasesCount: number
    }
    chartData: Array<{
        date: string
        webinar: number
        service: number
        total: number
    }>
    topWebinars: Array<{
        title: string
        revenue: number
        count: number
    }>
}

export default function AdminAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30')

    useEffect(() => {
        fetchAnalytics()
    }, [period])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/analytics?period=${period}`)
            const json = await res.json()
            if (res.ok) {
                setData(json)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDateLabel = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="text-center py-12 text-white/50">
                Failed to load analytics
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Analytics</h2>
                    <p className="text-white/50">Revenue and performance insights</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="form-input w-auto"
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-6">
                    <div className="text-white/50 text-sm mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(data.overview.totalRevenue)}</div>
                    <div className="text-xs text-green-400 mt-1">
                        {data.overview.registrationsCount + data.overview.purchasesCount} transactions
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-white/50 text-sm mb-1">Webinar Revenue</div>
                    <div className="text-2xl font-bold text-indigo-400">{formatCurrency(data.overview.totalWebinarRevenue)}</div>
                    <div className="text-xs text-white/40 mt-1">{data.overview.registrationsCount} registrations</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-white/50 text-sm mb-1">Service Revenue</div>
                    <div className="text-2xl font-bold text-purple-400">{formatCurrency(data.overview.totalServiceRevenue)}</div>
                    <div className="text-xs text-white/40 mt-1">{data.overview.purchasesCount} purchases</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-white/50 text-sm mb-1">New Users</div>
                    <div className="text-2xl font-bold text-emerald-400">{data.overview.newUsersThisPeriod}</div>
                    <div className="text-xs text-white/40 mt-1">of {data.overview.totalUsers} total</div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Revenue Trend</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.chartData}>
                            <defs>
                                <linearGradient id="colorWebinar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDateLabel}
                                stroke="#ffffff50"
                                fontSize={12}
                            />
                            <YAxis
                                stroke="#ffffff50"
                                fontSize={12}
                                tickFormatter={(value) => `₹${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a2e',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                }}
                                labelStyle={{ color: '#fff' }}
                                formatter={(value: number | undefined) => [formatCurrency(value ?? 0), '']}
                                labelFormatter={formatDateLabel}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="webinar"
                                name="Webinars"
                                stroke="#6366f1"
                                fillOpacity={1}
                                fill="url(#colorWebinar)"
                            />
                            <Area
                                type="monotone"
                                dataKey="service"
                                name="Services"
                                stroke="#a855f7"
                                fillOpacity={1}
                                fill="url(#colorService)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Webinars & Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Top Webinars */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Performing Webinars</h3>
                    {data.topWebinars.length === 0 ? (
                        <p className="text-white/50 text-sm">No data available</p>
                    ) : (
                        <div className="space-y-4">
                            {data.topWebinars.map((webinar, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm line-clamp-1">{webinar.title}</div>
                                            <div className="text-white/40 text-xs">{webinar.count} registrations</div>
                                        </div>
                                    </div>
                                    <div className="text-indigo-400 font-semibold">
                                        {formatCurrency(webinar.revenue)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/admin/webinars/new" className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-white font-medium">Create Webinar</div>
                                    <div className="text-white/40 text-xs">Add a new webinar</div>
                                </div>
                            </div>
                        </Link>
                        <Link href="/admin/bookings/send-links" className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-white font-medium">Send Meeting Links</div>
                                    <div className="text-white/40 text-xs">Email links to registrants</div>
                                </div>
                            </div>
                        </Link>
                        {data.overview.pendingContacts > 0 && (
                            <Link href="/admin/contacts" className="block p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors border border-amber-500/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Pending Contacts</div>
                                        <div className="text-amber-400 text-xs">{data.overview.pendingContacts} unread messages</div>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
