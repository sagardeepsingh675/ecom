'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Booking {
    id: string
    payment_status: string
    amount_paid: number
    payment_id: string | null
    registered_at: string
    user: { email: string; full_name: string | null }
    webinar: { title: string; webinar_date: string; meeting_link: string | null }
}

export default function AdminBookings() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const supabase = createClient()
                let query = supabase
                    .from('webinar_registrations')
                    .select(`
            id,
            payment_status,
            amount_paid,
            payment_id,
            registered_at,
            user:users (email, full_name),
            webinar:webinars (title, webinar_date, meeting_link)
          `)
                    .order('registered_at', { ascending: false })

                if (filter !== 'all') {
                    query = query.eq('payment_status', filter)
                }

                const { data, error } = await query

                if (error) throw error
                setBookings((data as unknown as Booking[]) || [])
            } catch (error) {
                console.error('Error fetching bookings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBookings()
    }, [filter])



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Bookings</h2>
                    <p className="text-white/50">Manage webinar registrations and meeting links</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/admin/bookings/send-links" className="btn btn-primary">
                        📧 Send Meeting Links
                    </Link>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="form-input w-auto"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="free">Free</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-white/50 text-sm border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Webinar</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Meeting Link</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="w-8 h-8 mx-auto border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-white">{booking.user?.full_name || 'User'}</div>
                                                <div className="text-white/50 text-xs">{booking.user?.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">{booking.webinar?.title}</div>
                                            <div className="text-white/50 text-xs">
                                                {formatDate(booking.webinar?.webinar_date || '', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white">
                                            {booking.amount_paid === 0 ? 'Free' : formatCurrency(booking.amount_paid)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${booking.payment_status === 'completed' ? 'badge-success' :
                                                booking.payment_status === 'free' ? 'badge-primary' :
                                                    booking.payment_status === 'pending' ? 'badge-warning' :
                                                        'badge-error'
                                                }`}>
                                                {booking.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.webinar?.meeting_link ? (
                                                <a
                                                    href={booking.webinar.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-400 hover:text-indigo-300 text-xs truncate block max-w-48"
                                                >
                                                    {booking.webinar.meeting_link}
                                                </a>
                                            ) : (
                                                <span className="text-white/30 text-xs">Not set</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-white/50">
                                            {formatDate(booking.registered_at, { month: 'short', day: 'numeric', year: 'numeric' })}
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
