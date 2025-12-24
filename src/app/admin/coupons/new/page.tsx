'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewCouponPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: '',
        max_uses: '',
        max_uses_per_user: '1',
        min_purchase_amount: '0',
        max_discount_amount: '',
        valid_until: '',
        applies_to: 'all' as 'all' | 'webinar' | 'service',
        is_active: true
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const supabase = createClient()

            const { error: insertError } = await supabase
                .from('coupons')
                .insert({
                    code: formData.code.toUpperCase(),
                    description: formData.description || null,
                    discount_type: formData.discount_type,
                    discount_value: parseFloat(formData.discount_value),
                    max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                    max_uses_per_user: parseInt(formData.max_uses_per_user),
                    min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
                    max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                    valid_until: formData.valid_until || null,
                    applies_to: formData.applies_to,
                    is_active: formData.is_active
                })

            if (insertError) throw insertError

            router.push('/admin/coupons')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create coupon')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <Link href="/admin/coupons" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Coupons
                </Link>
            </div>

            <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create Coupon</h2>
                <p className="text-white/50 mb-6">Add a new discount code</p>

                {error && (
                    <div className="p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Code */}
                    <div className="form-group">
                        <label className="form-label">Coupon Code *</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="SAVE20"
                            className="form-input font-mono uppercase"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="20% off on all webinars"
                            className="form-input"
                        />
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Discount Type *</label>
                            <select
                                value={formData.discount_type}
                                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                                className="form-input"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Discount Value *</label>
                            <input
                                type="number"
                                value={formData.discount_value}
                                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                                className="form-input"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    {/* Max Discount (for percentage) */}
                    {formData.discount_type === 'percentage' && (
                        <div className="form-group">
                            <label className="form-label">Maximum Discount Amount (₹)</label>
                            <input
                                type="number"
                                value={formData.max_discount_amount}
                                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                placeholder="Leave empty for no limit"
                                className="form-input"
                                min="0"
                            />
                        </div>
                    )}

                    {/* Usage Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Max Total Uses</label>
                            <input
                                type="number"
                                value={formData.max_uses}
                                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                placeholder="Unlimited"
                                className="form-input"
                                min="1"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Uses Per User</label>
                            <input
                                type="number"
                                value={formData.max_uses_per_user}
                                onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                                className="form-input"
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Min Purchase & Validity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Minimum Purchase (₹)</label>
                            <input
                                type="number"
                                value={formData.min_purchase_amount}
                                onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                                className="form-input"
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Valid Until</label>
                            <input
                                type="datetime-local"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Applies To */}
                    <div className="form-group">
                        <label className="form-label">Applies To</label>
                        <select
                            value={formData.applies_to}
                            onChange={(e) => setFormData({ ...formData, applies_to: e.target.value as 'all' | 'webinar' | 'service' })}
                            className="form-input"
                        >
                            <option value="all">All Products</option>
                            <option value="webinar">Webinars Only</option>
                            <option value="service">Services Only</option>
                        </select>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 rounded bg-white/10 border-white/20"
                        />
                        <label htmlFor="is_active" className="text-white">Active (can be used immediately)</label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex-1"
                        >
                            {loading ? 'Creating...' : 'Create Coupon'}
                        </button>
                        <Link href="/admin/coupons" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
