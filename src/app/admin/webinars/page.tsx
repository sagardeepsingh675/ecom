'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Webinar } from '@/types/database'

export default function AdminWebinars() {
    const [webinars, setWebinars] = useState<Webinar[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchWebinars = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('webinars')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setWebinars(data || [])
        } catch (error) {
            console.error('Error fetching webinars:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWebinars()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this webinar?')) return

        setDeleting(id)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('webinars')
                .delete()
                .eq('id', id)

            if (error) throw error
            setWebinars(webinars.filter(w => w.id !== id))
        } catch (error) {
            console.error('Error deleting webinar:', error)
            alert('Failed to delete webinar')
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Manage Webinars</h2>
                    <p className="text-white/50">Create and manage your webinar sessions</p>
                </div>
                <Link href="/admin/webinars/new" className="btn btn-primary">
                    + Add Webinar
                </Link>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-white/50 text-sm border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 font-medium">Webinar</th>
                                <th className="px-6 py-4 font-medium">Date & Time</th>
                                <th className="px-6 py-4 font-medium">Host</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Slots</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                                        <div className="w-8 h-8 mx-auto border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                    </td>
                                </tr>
                            ) : webinars.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                                        No webinars found. Create your first webinar!
                                    </td>
                                </tr>
                            ) : (
                                webinars.map((webinar) => (
                                    <tr key={webinar.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-8 rounded bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                                                    {webinar.thumbnail_url ? (
                                                        <img src={webinar.thumbnail_url} alt="" className="w-full h-full object-cover rounded" />
                                                    ) : (
                                                        <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{webinar.title}</div>
                                                    <div className="text-white/40 text-xs">{webinar.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">{formatDate(webinar.webinar_date, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            <div className="text-white/40 text-xs">{webinar.start_time}</div>
                                        </td>
                                        <td className="px-6 py-4 text-white/70">{webinar.host_name}</td>
                                        <td className="px-6 py-4">
                                            {webinar.price === 0 ? (
                                                <span className="text-green-400">Free</span>
                                            ) : (
                                                <span className="text-white">{formatCurrency(webinar.price)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white">{webinar.available_slots}</span>
                                            <span className="text-white/40">/{webinar.total_slots}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <span className={`badge ${webinar.status === 'published' ? 'badge-success' :
                                                        webinar.status === 'draft' ? 'badge-warning' :
                                                            'badge-error'
                                                    }`}>
                                                    {webinar.status}
                                                </span>
                                                {webinar.is_featured && (
                                                    <span className="badge badge-primary">Featured</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/webinars/${webinar.id}/edit`}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(webinar.id)}
                                                    disabled={deleting === webinar.id}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors disabled:opacity-50"
                                                >
                                                    {deleting === webinar.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
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
