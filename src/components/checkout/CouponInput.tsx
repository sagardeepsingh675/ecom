'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface CouponInputProps {
    itemType: 'webinar' | 'service'
    itemId: string
    amount: number
    onApply: (discount: number, couponId: string, couponCode: string) => void
    onRemove: () => void
}

interface AppliedCoupon {
    id: string
    code: string
    discountAmount: number
}

export default function CouponInput({ itemType, itemId, amount, onApply, onRemove }: CouponInputProps) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

    const validateCoupon = async () => {
        if (!code.trim()) return

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/coupon/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code.trim().toUpperCase(),
                    item_type: itemType,
                    item_id: itemId,
                    amount
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Invalid coupon')
            }

            if (data.valid) {
                setAppliedCoupon({
                    id: data.coupon.id,
                    code: data.coupon.code,
                    discountAmount: data.discount_amount
                })
                onApply(data.discount_amount, data.coupon.id, data.coupon.code)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to validate coupon')
        } finally {
            setLoading(false)
        }
    }

    const removeCoupon = () => {
        setAppliedCoupon(null)
        setCode('')
        setError('')
        onRemove()
    }

    if (appliedCoupon) {
        return (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-400 font-mono font-medium">{appliedCoupon.code}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-green-400 font-medium">-{formatCurrency(appliedCoupon.discountAmount)}</span>
                        <button
                            onClick={removeCoupon}
                            className="text-white/50 hover:text-white text-sm"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="form-input flex-1 text-sm font-mono uppercase"
                    onKeyDown={(e) => e.key === 'Enter' && validateCoupon()}
                />
                <button
                    onClick={validateCoupon}
                    disabled={loading || !code.trim()}
                    className="btn btn-secondary text-sm px-4"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Apply'
                    )}
                </button>
            </div>
            {error && (
                <p className="text-red-400 text-sm">{error}</p>
            )}
        </div>
    )
}
