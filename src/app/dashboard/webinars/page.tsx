'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

interface WebinarRegistration {
    id: string
    payment_status: string
    amount_paid: number
    registered_at: string
    webinar: {
        id: string
        title: string
        slug: string
        webinar_date: string
        start_time: string
        host_name: string
        thumbnail_url: string | null
        meeting_link: string | null
    }
}

export default function MyWebinarsPage() {
    const { user } = useAuth()
    const [registrations, setRegistrations] = useState<WebinarRegistration[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!user) return

            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('webinar_registrations')
                    .select(`
                        id,
                        payment_status,
                        amount_paid,
                        registered_at,
                        webinar:webinars (
                            id,
                            title,
                            slug,
                            webinar_date,
                            start_time,
                            host_name,
                            thumbnail_url,
                            meeting_link
                        )
                    `)
                    .eq('user_id', user.id)
                    .in('payment_status', ['completed', 'free'])
                    .order('registered_at', { ascending: false })

                if (error) {
                    console.error('Error fetching registrations:', error)
                    throw error
                }

                console.log('Registered webinars:', data)
                setRegistrations((data as unknown as WebinarRegistration[]) || [])
            } catch (error) {
                console.error('Error fetching registrations:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRegistrations()
    }, [user])

    const isUpcoming = (dateStr: string) => {
        return new Date(dateStr) > new Date()
    }

    const upcomingWebinars = registrations.filter(r => r.webinar && isUpcoming(r.webinar.webinar_date))
    const pastWebinars = registrations.filter(r => r.webinar && !isUpcoming(r.webinar.webinar_date))

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Upcoming Webinars */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Upcoming Webinars
                </h2>

                {upcomingWebinars.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-white/50">No upcoming webinars registered</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingWebinars.map((reg) => (
                            <div key={reg.id} className="glass-card p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Thumbnail */}
                                    <div className="w-full md:w-48 h-28 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {reg.webinar.thumbnail_url ? (
                                            <img src={reg.webinar.thumbnail_url} alt={reg.webinar.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-2">{reg.webinar.title}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-4">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {formatDate(reg.webinar.webinar_date, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {formatTime(reg.webinar.start_time)} IST
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {reg.webinar.host_name}
                                            </span>
                                        </div>

                                        {/* Meeting Link */}
                                        <div className="flex flex-wrap gap-2">
                                            {reg.webinar.meeting_link ? (
                                                <a
                                                    href={reg.webinar.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    Join Webinar
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            ) : (
                                                <span className="badge badge-warning">Link will be shared before the session</span>
                                            )}
                                            <a
                                                href={`/api/invoice?registration_id=${reg.id}`}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                Download Invoice
                                            </a>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white">
                                            {reg.amount_paid === 0 ? 'FREE' : formatCurrency(reg.amount_paid)}
                                        </div>
                                        <div className="text-xs text-green-400">Confirmed</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Webinars */}
            {pastWebinars.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Past Webinars</h2>
                    <div className="space-y-4 opacity-60">
                        {pastWebinars.map((reg) => (
                            <div key={reg.id} className="glass-card p-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-14 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-white">{reg.webinar.title}</h3>
                                        <p className="text-sm text-white/40">
                                            {formatDate(reg.webinar.webinar_date, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <a
                                        href={`/api/invoice?registration_id=${reg.id}`}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        Invoice
                                    </a>
                                    <span className="badge badge-primary">Completed</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
