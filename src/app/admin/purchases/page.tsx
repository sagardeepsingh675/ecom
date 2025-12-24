'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'

interface ServicePurchase {
    id: string
    amount_paid: number
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
    payment_id: string | null
    fulfillment_status: 'pending' | 'in_progress' | 'completed'
    fulfillment_notes: string | null
    purchased_at: string
    user: { email: string; full_name: string | null; phone: string | null }
    service: { name: string; slug: string }
}

export default function AdminServicePurchases() {
    const [purchases, setPurchases] = useState<ServicePurchase[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedPurchase, setSelectedPurchase] = useState<ServicePurchase | null>(null)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        fetchPurchases()
    }, [filter])

    const fetchPurchases = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase
                .from('service_purchases')
                .select(`
                    id,
                    amount_paid,
                    payment_status,
                    payment_id,
                    fulfillment_status,
                    fulfillment_notes,
                    purchased_at,
                    user:users (email, full_name, phone),
                    service:services (name, slug)
                `)
                .order('purchased_at', { ascending: false })

            if (filter !== 'all') {
                query = query.eq('fulfillment_status', filter)
            }

            const { data, error } = await query

            if (error) throw error
            setPurchases((data as unknown as ServicePurchase[]) || [])
        } catch (error) {
            console.error('Error fetching purchases:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateFulfillmentStatus = async (id: string, status: string, notes?: string) => {
        setUpdating(true)
        try {
            const supabase = createClient()
            const updateData: { fulfillment_status: string; fulfillment_notes?: string } = {
                fulfillment_status: status
            }
            if (notes !== undefined) {
                updateData.fulfillment_notes = notes
            }

            const { error } = await supabase
                .from('service_purchases')
                .update(updateData)
                .eq('id', id)

            if (error) throw error

            // Update local state
            setPurchases(purchases.map(p =>
                p.id === id
                    ? { ...p, fulfillment_status: status as ServicePurchase['fulfillment_status'], fulfillment_notes: notes ?? p.fulfillment_notes }
                    : p
            ))
            if (selectedPurchase?.id === id) {
                setSelectedPurchase({
                    ...selectedPurchase,
                    fulfillment_status: status as ServicePurchase['fulfillment_status'],
                    fulfillment_notes: notes ?? selectedPurchase.fulfillment_notes
                })
            }
        } catch (error) {
            console.error('Error updating fulfillment status:', error)
            alert('Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    const getFulfillmentBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return 'badge-success'
            case 'in_progress':
                return 'badge-warning'
            default:
                return 'badge-error'
        }
    }

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return 'badge-success'
            case 'pending':
                return 'badge-warning'
            case 'refunded':
                return 'badge-primary'
            default:
                return 'badge-error'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Service Purchases</h2>
                    <p className="text-white/50">View and manage service orders</p>
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="form-input w-auto"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Purchases List */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-white/50 text-sm border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Service</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Fulfillment</th>
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
                                ) : purchases.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                                            No service purchases found
                                        </td>
                                    </tr>
                                ) : (
                                    purchases.map((purchase) => (
                                        <tr
                                            key={purchase.id}
                                            onClick={() => setSelectedPurchase(purchase)}
                                            className={`border-b border-white/5 cursor-pointer transition-colors ${selectedPurchase?.id === purchase.id
                                                    ? 'bg-indigo-500/10'
                                                    : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-white">{purchase.user?.full_name || 'User'}</div>
                                                    <div className="text-white/50 text-xs">{purchase.user?.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-white">{purchase.service?.name}</div>
                                                <div className="text-white/40 text-xs">{purchase.service?.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 text-white">
                                                {formatCurrency(purchase.amount_paid)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getPaymentBadge(purchase.payment_status)}`}>
                                                    {purchase.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getFulfillmentBadge(purchase.fulfillment_status)}`}>
                                                    {purchase.fulfillment_status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/50">
                                                {formatDate(purchase.purchased_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="glass-card p-6">
                    {selectedPurchase ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Purchase Details</h3>
                                <p className="text-white/40 text-sm">Manage this service order</p>
                            </div>

                            {/* Customer Info */}
                            <div className="space-y-3 p-4 rounded-xl bg-white/5">
                                <div className="text-white/50 text-xs uppercase">Customer</div>
                                <div className="text-white font-medium">{selectedPurchase.user?.full_name || 'N/A'}</div>
                                <div className="flex items-center gap-2 text-white/70 text-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {selectedPurchase.user?.email}
                                </div>
                                {selectedPurchase.user?.phone && (
                                    <div className="flex items-center gap-2 text-white/70 text-sm">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {selectedPurchase.user?.phone}
                                    </div>
                                )}
                            </div>

                            {/* Service Info */}
                            <div className="space-y-2 p-4 rounded-xl bg-white/5">
                                <div className="text-white/50 text-xs uppercase">Service</div>
                                <div className="text-white font-medium">{selectedPurchase.service?.name}</div>
                                <div className="text-2xl font-bold text-indigo-400">{formatCurrency(selectedPurchase.amount_paid)}</div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-2 p-4 rounded-xl bg-white/5">
                                <div className="text-white/50 text-xs uppercase">Payment</div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">Status</span>
                                    <span className={`badge ${getPaymentBadge(selectedPurchase.payment_status)}`}>
                                        {selectedPurchase.payment_status}
                                    </span>
                                </div>
                                {selectedPurchase.payment_id && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/70">Transaction ID</span>
                                        <span className="text-white/50 text-xs font-mono">{selectedPurchase.payment_id}</span>
                                    </div>
                                )}
                            </div>

                            {/* Fulfillment Status */}
                            <div className="space-y-3">
                                <label className="text-white/50 text-xs uppercase block">Fulfillment Status</label>
                                <select
                                    value={selectedPurchase.fulfillment_status}
                                    onChange={(e) => updateFulfillmentStatus(selectedPurchase.id, e.target.value)}
                                    disabled={updating}
                                    className="form-input w-full"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Fulfillment Notes */}
                            <div className="space-y-3">
                                <label className="text-white/50 text-xs uppercase block">Fulfillment Notes</label>
                                <textarea
                                    value={selectedPurchase.fulfillment_notes || ''}
                                    onChange={(e) => {
                                        setSelectedPurchase({
                                            ...selectedPurchase,
                                            fulfillment_notes: e.target.value
                                        })
                                    }}
                                    placeholder="Add notes about fulfillment..."
                                    rows={3}
                                    className="form-input w-full resize-none"
                                />
                                <button
                                    onClick={() => updateFulfillmentStatus(
                                        selectedPurchase.id,
                                        selectedPurchase.fulfillment_status,
                                        selectedPurchase.fulfillment_notes || ''
                                    )}
                                    disabled={updating}
                                    className="btn btn-secondary btn-sm w-full"
                                >
                                    {updating ? 'Saving...' : 'Save Notes'}
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-4 border-t border-white/10">
                                <a
                                    href={`mailto:${selectedPurchase.user?.email}`}
                                    className="btn btn-primary btn-sm flex-1"
                                >
                                    Email Customer
                                </a>
                                {selectedPurchase.user?.phone && (
                                    <a
                                        href={`tel:${selectedPurchase.user?.phone}`}
                                        className="btn btn-secondary btn-sm flex-1"
                                    >
                                        Call
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-white/40 py-12">
                            Select a purchase to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
