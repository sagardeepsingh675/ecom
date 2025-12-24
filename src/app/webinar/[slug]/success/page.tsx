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
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>(orderId ? 'loading' : 'success')
    const [showConfetti, setShowConfetti] = useState(false)
    const [verifyError, setVerifyError] = useState('')

    useEffect(() => {
        if (status === 'success') {
            setShowConfetti(true)
            const timer = setTimeout(() => setShowConfetti(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [status])

    // Verify payment when redirected from Cashfree
    useEffect(() => {
        const verifyPayment = async () => {
            if (orderId && status === 'loading') {
                try {
                    const res = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ order_id: orderId })
                    })

                    const data = await res.json()

                    if (res.ok && data.success) {
                        setStatus('success')
                    } else {
                        setVerifyError(data.error || 'Payment verification failed')
                        setStatus('failed')
                    }
                } catch (error) {
                    console.error('Payment verification error:', error)
                    setVerifyError('Failed to verify payment')
                    setStatus('failed')
                }
            }
        }

        verifyPayment()
    }, [orderId, status])

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#0a0a0f] pt-20 flex items-center justify-center px-6">
                <div className="max-w-lg w-full text-center">
                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="py-12">
                            <div className="w-16 h-16 mx-auto mb-6 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                            <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h1>
                            <p className="text-white/60">Please do not close this window</p>
                        </div>
                    )}

                    {/* Failed State */}
                    {status === 'failed' && (
                        <div className="py-8 animate-slide-up">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                                <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">Payment Failed</h1>
                            <p className="text-white/60 mb-8 max-w-md mx-auto">
                                {verifyError || 'We could not verify your payment. If money was deducted, it will be refunded automatically.'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href={`/webinar/${slug}`} className="btn btn-secondary">
                                    Cancel
                                </Link>
                                <a href={`/webinar/${slug}/checkout`} className="btn btn-primary">
                                    Try Again
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <>
                            {/* Success Animation */}
                            <div className="relative mb-8 pt-8">
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
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
