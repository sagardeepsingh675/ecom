'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useWebinar } from '@/hooks/useWebinars'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CouponInput from '@/components/checkout/CouponInput'

declare global {
    interface Window {
        Cashfree: any
    }
}

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const { webinar, loading: webinarLoading } = useWebinar(slug)
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')
    const [cashfreeLoaded, setCashfreeLoaded] = useState(false)

    // Coupon state
    const [discount, setDiscount] = useState(0)
    const [couponId, setCouponId] = useState<string | null>(null)
    const [couponCode, setCouponCode] = useState<string | null>(null)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?redirect=/webinar/${slug}/checkout`)
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

    const finalAmount = webinar ? Math.max(0, webinar.price - discount) : 0

    const initializeCashfreePayment = useCallback(async (paymentSessionId: string) => {
        if (!window.Cashfree) {
            console.error('Cashfree SDK not loaded')
            return
        }

        try {
            const cashfree = window.Cashfree({
                mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox'
            })

            const checkoutOptions = {
                paymentSessionId,
                redirectTarget: '_self'
            }

            await cashfree.checkout(checkoutOptions)
        } catch (err) {
            console.error('Cashfree checkout error:', err)
            setError('Payment initialization failed. Please try again.')
            setProcessing(false)
        }
    }, [])

    const handlePayment = async () => {
        if (!webinar || !user) return

        setProcessing(true)
        setError('')

        try {
            // Create registration and initiate payment
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'webinar',
                    item_id: webinar.id,
                    amount: finalAmount,
                    original_amount: webinar.price,
                    coupon_id: couponId,
                    coupon_code: couponCode,
                    discount_amount: discount,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Payment initialization failed')
            }

            // For demo mode, simulate successful payment
            if (data.demo_mode) {
                // Simulate payment processing
                await new Promise(resolve => setTimeout(resolve, 2000))

                // Mark payment as completed
                const completeRes = await fetch('/api/payment/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        registration_id: data.registration_id,
                        order_id: data.order_id,
                    }),
                })

                if (completeRes.ok) {
                    router.push(`/webinar/${slug}/success?registration_id=${data.registration_id}`)
                } else {
                    throw new Error('Payment verification failed')
                }
            } else {
                // Use Cashfree checkout
                if (data.payment_session_id) {
                    await initializeCashfreePayment(data.payment_session_id)
                } else {
                    throw new Error('No payment session received')
                }
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
            setProcessing(false)
        }
    }

    if (webinarLoading || authLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        )
    }

    if (!webinar) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center pt-20">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Webinar Not Found</h1>
                        <Link href="/" className="btn btn-primary mt-4">Back to Home</Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    return (
        <>
            {/* Cashfree SDK */}
            <Script
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                onLoad={() => setCashfreeLoaded(true)}
            />

            <Header />
            <main className="min-h-screen bg-[#0a0a0f] pt-20 pb-12">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Complete Your Purchase</h1>
                            <p className="text-white/60">Secure your spot in this exclusive webinar</p>
                        </div>

                        <div className="grid md:grid-cols-5 gap-8">
                            {/* Order Summary */}
                            <div className="md:col-span-3">
                                <div className="glass-card p-6">
                                    <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

                                    {/* Webinar Details */}
                                    <div className="flex gap-4 pb-6 border-b border-white/10">
                                        <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex-shrink-0 overflow-hidden">
                                            {webinar.thumbnail_url ? (
                                                <img src={webinar.thumbnail_url} alt={webinar.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-1">{webinar.title}</h3>
                                            <p className="text-sm text-white/50">
                                                {formatDate(webinar.webinar_date, { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime(webinar.start_time)}
                                            </p>
                                            <p className="text-sm text-white/50">Host: {webinar.host_name}</p>
                                        </div>
                                    </div>

                                    {/* Coupon Section */}
                                    <div className="py-6 border-b border-white/10">
                                        <h3 className="text-sm font-medium text-white/70 mb-4">Have a coupon?</h3>
                                        <CouponInput
                                            itemType="webinar"
                                            itemId={webinar.id}
                                            amount={webinar.price}
                                            onApply={handleCouponApply}
                                            onRemove={handleCouponRemove}
                                        />
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="py-6 space-y-3">
                                        <div className="flex justify-between text-white/70">
                                            <span>Webinar Price</span>
                                            <span>{formatCurrency(webinar.original_price || webinar.price)}</span>
                                        </div>
                                        {webinar.original_price && webinar.original_price > webinar.price && (
                                            <div className="flex justify-between text-green-400">
                                                <span>Sale Discount</span>
                                                <span>- {formatCurrency(webinar.original_price - webinar.price)}</span>
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
                                        <h3 className="font-medium text-white mb-4">Booking for</h3>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {user?.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">
                                                    {user?.user_metadata?.full_name || 'User'}
                                                </div>
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

                                    {/* Secure Payment Badge */}
                                    <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="text-green-400 text-sm">Secure 256-bit SSL Encryption</span>
                                    </div>

                                    {/* Amount to Pay */}
                                    <div className="text-center mb-6 p-4 rounded-lg bg-white/5">
                                        <div className="text-white/50 text-sm mb-1">Amount to Pay</div>
                                        <div className="text-3xl font-bold text-white">{formatCurrency(finalAmount)}</div>
                                        {discount > 0 && (
                                            <div className="text-green-400 text-sm mt-1">
                                                You save {formatCurrency(discount)}!
                                            </div>
                                        )}
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                                            {error}
                                        </div>
                                    )}

                                    {/* Pay Button */}
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
                                            <div className="px-3 py-1 rounded bg-white/10 text-xs text-white/50">Wallet</div>
                                        </div>
                                    </div>

                                    {/* Cancel */}
                                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                        <Link href={`/webinar/${slug}`} className="text-white/50 hover:text-white text-sm transition-colors">
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
