'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useService } from '@/hooks/useServices'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ServiceSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const searchParams = useSearchParams()
    const purchaseId = searchParams.get('purchase_id')
    const orderId = searchParams.get('order_id')
    const { service } = useService(slug)
    const [showConfetti, setShowConfetti] = useState(true)
    const [verifying, setVerifying] = useState(false)
    const [verified, setVerified] = useState(false)
    const [verifyError, setVerifyError] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000)
        return () => clearTimeout(timer)
    }, [])

    // Verify payment when redirected from Cashfree
    useEffect(() => {
        const verifyPayment = async () => {
            // If we have an order_id, this is a redirect from Cashfree - verify the payment
            if (orderId && !verified && !verifying) {
                setVerifying(true)
                try {
                    const res = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ order_id: orderId })
                    })

                    const data = await res.json()

                    if (res.ok && data.success) {
                        setVerified(true)
                        console.log('Payment verified successfully')
                    } else {
                        setVerifyError(data.error || 'Payment verification failed')
                    }
                } catch (error) {
                    console.error('Payment verification error:', error)
                    setVerifyError('Failed to verify payment')
                } finally {
                    setVerifying(false)
                }
            }
        }

        verifyPayment()
    }, [orderId, verified, verifying])

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#0a0a0f] pt-20 flex items-center justify-center px-6">
                <div className="max-w-lg w-full text-center">
                    {/* Success Animation */}
                    <div className="relative mb-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-scale-in">
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        {showConfetti && (
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full animate-float"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
                                            animationDelay: `${Math.random() * 2}s`,
                                            animationDuration: `${2 + Math.random() * 2}s`
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-up">
                        🎉 Purchase Complete!
                    </h1>

                    <p className="text-xl text-white/60 mb-8 animate-slide-up delay-100">
                        Thank you for your purchase
                    </p>

                    {/* Verification Status */}
                    {verifying && (
                        <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                            Verifying your payment...
                        </div>
                    )}

                    {verifyError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {verifyError}
                        </div>
                    )}

                    {/* Service Details Card */}
                    {service && (
                        <div className="glass-card p-6 text-left mb-8 animate-slide-up delay-200">
                            <h2 className="text-xl font-semibold text-white mb-4">{service.name}</h2>
                            <p className="text-white/60 mb-4">{service.short_description}</p>

                            {service.features && service.features.length > 0 && (
                                <ul className="space-y-2">
                                    {(service.features as string[]).slice(0, 3).map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* What's Next */}
                    <div className="glass-card p-6 text-left mb-8 animate-slide-up delay-300">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-xl">📬</span> What's Next?
                        </h3>
                        <ul className="space-y-3 text-white/70 text-sm">
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Check your email for confirmation and details
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Our team will reach out within 24 hours
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                View your purchase history in your dashboard
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-400">
                        <Link href="/dashboard/services" className="btn btn-primary flex-1">
                            View My Services
                        </Link>
                        {purchaseId && (
                            <a
                                href={`/api/invoice?purchase_id=${purchaseId}`}
                                className="btn btn-secondary flex-1"
                                download
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Invoice
                            </a>
                        )}
                    </div>
                    <div className="mt-4">
                        <Link href="/" className="text-white/50 hover:text-white transition-colors text-sm">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
