'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useWebinar } from '@/hooks/useWebinars'
import { formatDate, formatTime } from '@/lib/utils'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function SuccessPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const searchParams = useSearchParams()
    const registrationId = searchParams.get('registration_id')
    const orderId = searchParams.get('order_id')
    const { webinar } = useWebinar(slug)
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
                    // Call the webhook verify endpoint to complete the payment
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
                        🎉 You're In!
                    </h1>

                    <p className="text-xl text-white/60 mb-8 animate-slide-up delay-100">
                        Your spot has been reserved successfully
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

                    {/* Webinar Details Card */}
                    {webinar && (
                        <div className="glass-card p-6 text-left mb-8 animate-slide-up delay-200">
                            <h2 className="text-xl font-semibold text-white mb-4">{webinar.title}</h2>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-white/70">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">
                                            {formatDate(webinar.webinar_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-sm text-white/50">{formatTime(webinar.start_time)} IST</div>
                                    </div>
                                </div>

                                {webinar.host_name && (
                                    <div className="flex items-center gap-3 text-white/70">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{webinar.host_name}</div>
                                            <div className="text-sm text-white/50">{webinar.host_title}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                Check your email for confirmation details
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Meeting link will be shared 1 hour before the session
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Add to calendar so you don't miss it!
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-400">
                        <Link href="/dashboard/webinars" className="btn btn-primary flex-1">
                            View My Webinars
                        </Link>
                        {registrationId && (
                            <a
                                href={`/api/invoice?registration_id=${registrationId}`}
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
