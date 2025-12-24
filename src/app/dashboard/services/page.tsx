'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'

interface ServicePurchase {
    id: string
    payment_status: string
    amount_paid: number
    purchased_at: string
    service: {
        id: string
        name: string
        slug: string
        short_description: string
        features: string[]
    }
}

export default function MyServicesPage() {
    const { user } = useAuth()
    const [purchases, setPurchases] = useState<ServicePurchase[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPurchases = async () => {
            if (!user) return

            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('service_purchases')
                    .select(`
                        id,
                        payment_status,
                        amount_paid,
                        purchased_at,
                        service:services (
                            id,
                            name,
                            slug,
                            short_description,
                            features
                        )
                    `)
                    .eq('user_id', user.id)
                    .eq('payment_status', 'completed')
                    .order('purchased_at', { ascending: false })

                if (error) {
                    console.error('Error fetching purchases:', error)
                    throw error
                }

                console.log('Service purchases:', data)
                setPurchases((data as unknown as ServicePurchase[]) || [])
            } catch (error) {
                console.error('Error fetching purchases:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPurchases()
    }, [user])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {purchases.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Services Purchased</h3>
                    <p className="text-white/50 mb-6">Explore our service packages to accelerate your business growth</p>
                    <a href="/#services" className="btn btn-primary">
                        View Services
                    </a>
                </div>
            ) : (
                <div className="grid gap-6">
                    {purchases.map((purchase) => (
                        <div key={purchase.id} className="glass-card p-6">
                            <div className="flex flex-col md:flex-row md:items-start gap-6">
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-semibold text-white">{purchase.service?.name || 'Service'}</h3>
                                        <span className="badge badge-success">Active</span>
                                    </div>
                                    <p className="text-white/50 mb-4">{purchase.service?.short_description || ''}</p>

                                    {/* Features */}
                                    {purchase.service?.features && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                            {(purchase.service.features as string[]).slice(0, 4).map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-white/60">
                                                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Purchase Info */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/40 pt-4 border-t border-white/10">
                                        <span>Purchased: {formatDate(purchase.purchased_at, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>{formatCurrency(purchase.amount_paid)}</span>
                                        <a
                                            href={`/api/invoice?purchase_id=${purchase.id}`}
                                            className="ml-auto btn btn-secondary btn-sm"
                                        >
                                            Download Invoice
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
