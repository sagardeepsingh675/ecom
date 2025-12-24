'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Coupon {
    id: string
    code: string
    description: string | null
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    max_uses: number | null
    current_uses: number
    min_purchase_amount: number
    max_discount_amount: number | null
    valid_from: string
    valid_until: string | null
    applies_to: 'all' | 'webinar' | 'service'
    is_active: boolean
    created_at: string
}

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCoupons()
    }, [])

    const fetchCoupons = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setCoupons(data || [])
        } catch (error) {
            console.error('Error fetching coupons:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleCoupon = async (id: string, isActive: boolean) => {
        try {
            const supabase = createClient()
            await supabase
                .from('coupons')
                .update({ is_active: !isActive })
                .eq('id', id)

            setCoupons(coupons.map(c =>
                c.id === id ? { ...c, is_active: !isActive } : c
            ))
        } catch (error) {
            console.error('Error toggling coupon:', error)
        }
    }

    const deleteCoupon = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return

        try {
            const supabase = createClient()
            await supabase.from('coupons').delete().eq('id', id)
            setCoupons(coupons.filter(c => c.id !== id))
        } catch (error) {
            console.error('Error deleting coupon:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Coupons</h2>
                    <p className="text-white/50">Manage discount codes and promotions</p>
                </div>
                <Link href="/admin/coupons/new" className="btn btn-primary">
                    + Add Coupon
                </Link>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-white/50 text-sm border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 font-medium">Code</th>
                                <th className="px-6 py-4 font-medium">Discount</th>
                                <th className="px-6 py-4 font-medium">Uses</th>
                                <th className="px-6 py-4 font-medium">Valid Until</th>
                                <th className="px-6 py-4 font-medium">Applies To</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="w-8 h-8 mx-auto border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                                        No coupons found. Create your first coupon!
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-indigo-400">{coupon.code}</div>
                                            {coupon.description && (
                                                <div className="text-white/40 text-xs mt-1">{coupon.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-white">
                                            {coupon.discount_type === 'percentage'
                                                ? `${coupon.discount_value}%`
                                                : formatCurrency(coupon.discount_value)
                                            }
                                            {coupon.max_discount_amount && (
                                                <div className="text-white/40 text-xs">
                                                    Max: {formatCurrency(coupon.max_discount_amount)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-white">
                                            {coupon.current_uses} / {coupon.max_uses || '∞'}
                                        </td>
                                        <td className="px-6 py-4 text-white/70">
                                            {coupon.valid_until
                                                ? formatDate(coupon.valid_until, { month: 'short', day: 'numeric', year: 'numeric' })
                                                : 'No expiry'
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${coupon.applies_to === 'all' ? 'badge-primary' :
                                                    coupon.applies_to === 'webinar' ? 'badge-success' :
                                                        'badge-warning'
                                                }`}>
                                                {coupon.applies_to}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleCoupon(coupon.id, coupon.is_active)}
                                                className={`badge ${coupon.is_active ? 'badge-success' : 'badge-error'}`}
                                            >
                                                {coupon.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/coupons/${coupon.id}`}
                                                    className="text-indigo-400 hover:text-indigo-300"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => deleteCoupon(coupon.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    Delete
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
