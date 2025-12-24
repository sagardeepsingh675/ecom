'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils'
import type { Webinar } from '@/types/database'

export default function AdminSendLinks() {
    const [webinars, setWebinars] = useState<Webinar[]>([])
    const [selectedWebinar, setSelectedWebinar] = useState<string>('')
    const [meetingLink, setMeetingLink] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
    const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({})

    useEffect(() => {
        const fetchWebinars = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('webinars')
                    .select('*')
                    .eq('status', 'published')
                    .order('webinar_date', { ascending: true })

                if (error) throw error
                setWebinars(data || [])

                // Fetch actual registration counts for each webinar
                if (data && data.length > 0) {
                    const counts: Record<string, number> = {}
                    for (const webinar of data) {
                        const { count } = await supabase
                            .from('webinar_registrations')
                            .select('*', { count: 'exact', head: true })
                            .eq('webinar_id', webinar.id)
                            .in('payment_status', ['completed', 'free'])
                        counts[webinar.id] = count || 0
                    }
                    setRegistrationCounts(counts)
                }
            } catch (error) {
                console.error('Error fetching webinars:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchWebinars()
    }, [])

    const handleSendLinks = async () => {
        if (!selectedWebinar || !meetingLink) {
            setResult({ success: false, message: 'Please select a webinar and enter a meeting link' })
            return
        }

        setSending(true)
        setResult(null)

        try {
            const res = await fetch('/api/admin/send-meeting-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    webinar_id: selectedWebinar,
                    meeting_link: meetingLink,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send links')
            }

            setResult({
                success: true,
                message: data.message
            })

            // Reset form
            setMeetingLink('')
        } catch (err) {
            setResult({
                success: false,
                message: err instanceof Error ? err.message : 'Something went wrong'
            })
        } finally {
            setSending(false)
        }
    }

    const selectedWebinarDetails = webinars.find(w => w.id === selectedWebinar)

    return (
        <div className="max-w-3xl space-y-6">
            <div className="mb-6">
                <Link href="/admin/bookings" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Bookings
                </Link>
            </div>

            <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Send Meeting Links</h2>
                <p className="text-white/50 mb-6">Send meeting links to all registered participants for a webinar</p>

                <div className="space-y-6">
                    {/* Select Webinar */}
                    <div className="form-group">
                        <label className="form-label">Select Webinar</label>
                        <select
                            value={selectedWebinar}
                            onChange={(e) => setSelectedWebinar(e.target.value)}
                            className="form-input"
                            disabled={loading}
                        >
                            <option value="">Choose a webinar...</option>
                            {webinars.map((webinar) => (
                                <option key={webinar.id} value={webinar.id}>
                                    {webinar.title} - {formatDate(webinar.webinar_date, { month: 'short', day: 'numeric' })}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Webinar Details */}
                    {selectedWebinarDetails && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="font-semibold text-white mb-2">{selectedWebinarDetails.title}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-white/50">
                                    Date: <span className="text-white">{formatDate(selectedWebinarDetails.webinar_date, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="text-white/50">
                                    Time: <span className="text-white">{formatTime(selectedWebinarDetails.start_time)} IST</span>
                                </div>
                                <div className="text-white/50">
                                    Platform: <span className="text-white capitalize">{selectedWebinarDetails.meeting_platform}</span>
                                </div>
                                <div className="text-white/50">
                                    Registered: <span className="text-white">{registrationCounts[selectedWebinarDetails.id] ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Meeting Link Input */}
                    <div className="form-group">
                        <label className="form-label">Meeting Link</label>
                        <input
                            type="url"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                            className="form-input"
                        />
                        <p className="text-white/30 text-xs mt-1">
                            This link will be saved and sent to all registered participants
                        </p>
                    </div>

                    {/* Result Message */}
                    {result && (
                        <div className={`p-4 rounded-lg ${result.success
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                            }`}>
                            <div className="flex items-center gap-2">
                                {result.success ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                {result.message}
                            </div>
                        </div>
                    )}

                    {/* Send Button */}
                    <button
                        onClick={handleSendLinks}
                        disabled={sending || !selectedWebinar || !meetingLink}
                        className="btn btn-primary w-full"
                    >
                        {sending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sending Emails...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Send Meeting Links to All Participants
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className="glass-card p-6 border-l-4 border-yellow-500">
                <h3 className="font-semibold text-yellow-400 mb-2">📧 Email Configuration</h3>
                <p className="text-white/60 text-sm">
                    Make sure you have configured <code className="px-1 py-0.5 rounded bg-white/10">SMTP_USER</code> and <code className="px-1 py-0.5 rounded bg-white/10">SMTP_PASS</code> in your environment variables
                    to enable email sending. Emails are sent using SMTP (Zoho/Gmail).
                </p>
            </div>
        </div>
    )
}
