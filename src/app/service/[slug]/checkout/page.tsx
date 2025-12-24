'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useService } from '@/hooks/useServices'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CouponInput from '@/components/checkout/CouponInput'

declare global {
    interface Window {
        Cashfree: any
    }
}

export default function ServiceCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const { service, loading: serviceLoading } = useService(slug)
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')

    // Coupon state
    const [discount, setDiscount] = useState(0)
    const [couponId, setCouponId] = useState<string | null>(null)
    const [couponCode, setCouponCode] = useState<string | null>(null)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?redirect=/service/${slug}/checkout`)
        }
    }, [user, authLoading, router, slug])

    const handleCouponApply = (discountAmount: number, id: string, code: string) => {
        setDiscount(discountAmount)
        setCouponId(id)
        setCouponCode(code)
    }

    const handleCouponRemove = () => {
        setDiscount(0)
        setCouponId(null)
        setCouponCode(null)
    }

    const finalAmount = service ? Math.max(0, service.price - discount) : 0

    const handlePayment = async () => {
        if (!service || !user) return

        setProcessing(true)
        setError('')

        try {
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'service',
                    item_id: service.id,
                    amount: finalAmount,
                    original_amount: service.price,
                    coupon_id: couponId,
                    coupon_code: couponCode,
                    discount_amount: discount,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Payment initialization failed')
            }

            // Demo mode
            if (data.demo_mode) {
                await new Promise(resolve => setTimeout(resolve, 2000))

                const completeRes = await fetch('/api/payment/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        purchase_id: data.purchase_id,
                        order_id: data.order_id,
                    }),
                })

                if (completeRes.ok) {
                    router.push(`/service/${slug}/success?purchase_id=${data.purchase_id}`)
                } else {
                    throw new Error('Payment verification failed')
                }
            } else {
                // Cashfree payment
                if (data.payment_session_id && window.Cashfree) {
                    const cashfree = window.Cashfree({
                        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox'
                    })
                    await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: '_self' })
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
            setProcessing(false)
        }
    }

    if (serviceLoading || authLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        )
    }

    if (!service) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center pt-20">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Service Not Found</h1>
                        <Link href="/#services" className="btn btn-primary mt-4">Browse Services</Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    const features = service.features || []

    return (
        <>
            <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" />

            <Header />
            <main className="min-h-screen bg-[#0a0a0f] pt-20 pb-12">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Complete Your Purchase</h1>
                            <p className="text-white/60">Unlock premium features and services</p>
                        </div>

                        <div className="grid md:grid-cols-5 gap-8">
                            {/* Order Summary */}
                            <div className="md:col-span-3">
                                <div className="glass-card p-6">
                                    <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

                                    {/* Service Details */}
                                    <div className="flex gap-4 pb-6 border-b border-white/10">
                                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-1">{service.name}</h3>
                                            <p className="text-sm text-white/50">{service.short_description}</p>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    {features.length > 0 && (
                                        <div className="py-6 border-b border-white/10">
                                            <h3 className="text-sm font-medium text-white/70 mb-4">Included:</h3>
                                            <ul className="space-y-2">
                                                {features.slice(0, 5).map((feature: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                                                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        {feature}
                                                    </li>
                                                ))}
                                                {features.length > 5 && (
                                                    <li className="text-sm text-white/40">+{features.length - 5} more features</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Coupon Section */}
                                    <div className="py-6 border-b border-white/10">
                                        <h3 className="text-sm font-medium text-white/70 mb-4">Have a coupon?</h3>
                                        <CouponInput
                                            itemType="service"
                                            itemId={service.id}
                                            amount={service.price}
                                            onApply={handleCouponApply}
                                            onRemove={handleCouponRemove}
                                        />
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="py-6 space-y-3">
                                        <div className="flex justify-between text-white/70">
                                            <span>Service Price</span>
                                            <span>{formatCurrency(service.original_price || service.price)}</span>
                                        </div>
                                        {service.original_price && service.original_price > service.price && (
                                            <div className="flex justify-between text-green-400">
                                                <span>Sale Discount</span>
                                                <span>- {formatCurrency(service.original_price - service.price)}</span>
                                            </div>
                                        )}
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-400">
                                                <span>Coupon ({couponCode})</span>
                                                <span>- {formatCurrency(discount)}</span>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-white/10 flex justify-between text-lg font-semibold">
                                            <span className="text-white">Total</span>
                                            <span className="text-white">{formatCurrency(finalAmount)}</span>
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="pt-6 border-t border-white/10">
                                        <h3 className="font-medium text-white mb-4">Purchasing as</h3>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {user?.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{user?.user_metadata?.full_name || 'User'}</div>
                                                <div className="text-sm text-white/50">{user?.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="md:col-span-2">
                                <div className="glass-card p-6 sticky top-28">
                                    <h2 className="text-xl font-semibold text-white mb-6">Payment</h2>

                                    {/* Secure Badge */}
                                    <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="text-green-400 text-sm">Secure Payment</span>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-center mb-6 p-4 rounded-lg bg-white/5">
                                        <div className="text-white/50 text-sm mb-1">Amount to Pay</div>
                                        <div className="text-3xl font-bold text-white">{formatCurrency(finalAmount)}</div>
                                        {discount > 0 && (
                                            <div className="text-green-400 text-sm mt-1">
                                                You save {formatCurrency(discount)}!
                                            </div>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePayment}
                                        disabled={processing}
                                        className="btn btn-primary btn-lg w-full mb-4"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay {formatCurrency(finalAmount)}
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </>
                                        )}
                                    </button>

                                    {/* Payment Methods */}
                                    <div className="text-center">
                                        <p className="text-white/40 text-xs mb-3">Powered by Cashfree</p>
                                        <div className="flex justify-center gap-2">
                                            <div className="px-3 py-1 rounded bg-white/10 text-xs text-white/50">UPI</div>
                                            <div className="px-3 py-1 rounded bg-white/10 text-xs text-white/50">Cards</div>
                                            <div className="px-3 py-1 rounded bg-white/10 text-xs text-white/50">Net Banking</div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                        <Link href={`/service/${slug}`} className="text-white/50 hover:text-white text-sm transition-colors">
                                            ← Cancel and go back
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
