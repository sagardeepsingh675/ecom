'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useWebinar } from '@/hooks/useWebinars'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, formatTime, formatCurrency, calculateDiscount, getTimeRemaining } from '@/lib/utils'
import CountdownTimer from '@/components/ui/CountdownTimer'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function WebinarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const { webinar, loading, error } = useWebinar(slug)
    const { user } = useAuth()
    const router = useRouter()
    const [registering, setRegistering] = useState(false)
    const [registerError, setRegisterError] = useState('')

    const handleRegister = async () => {
        if (!user) {
            router.push(`/login?redirect=/webinar/${slug}`)
            return
        }

        if (!webinar) return

        // If free webinar, register directly
        if (webinar.price === 0) {
            setRegistering(true)
            setRegisterError('')

            try {
                const res = await fetch('/api/webinar/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ webinar_id: webinar.id }),
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || 'Registration failed')
                }

                router.push(`/webinar/${slug}/success?registration_id=${data.registration_id}`)
            } catch (err) {
                setRegisterError(err instanceof Error ? err.message : 'Something went wrong')
            } finally {
                setRegistering(false)
            }
        } else {
            // Paid webinar - redirect to checkout
            router.push(`/webinar/${slug}/checkout`)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !webinar) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Webinar Not Found</h1>
                        <p className="text-white/50 mb-6">The webinar you're looking for doesn't exist or has been removed.</p>
                        <Link href="/" className="btn btn-primary">
                            Back to Home
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    const webinarDateTime = new Date(`${webinar.webinar_date}T${webinar.start_time}`)
    const timeRemaining = getTimeRemaining(webinarDateTime)
    const isUpcoming = timeRemaining.total > 0

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#0a0a0f] pt-20">
                {/* Hero Section */}
                <section className="relative py-16 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 to-transparent" />
                    <div className="glow-orb glow-orb-primary w-96 h-96 -top-48 -right-48 opacity-30" />

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            {/* Left - Content */}
                            <div>
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {webinar.is_featured && (
                                        <span className="badge badge-warning">🔥 Featured</span>
                                    )}
                                    {isUpcoming ? (
                                        <span className="badge badge-success">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1" />
                                            Upcoming
                                        </span>
                                    ) : (
                                        <span className="badge badge-primary">Completed</span>
                                    )}
                                    {webinar.available_slots <= 10 && webinar.available_slots > 0 && (
                                        <span className="badge badge-error">Only {webinar.available_slots} spots left!</span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                                    {webinar.title}
                                </h1>

                                {/* Description */}
                                <p className="text-lg text-white/60 mb-8">
                                    {webinar.description || webinar.short_description}
                                </p>

                                {/* Host */}
                                <div className="flex items-center gap-4 mb-8 p-4 glass-card">
                                    {webinar.host_image_url ? (
                                        <img
                                            src={webinar.host_image_url}
                                            alt={webinar.host_name || 'Host'}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {webinar.host_name?.charAt(0) || 'H'}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-white font-semibold text-lg">{webinar.host_name}</div>
                                        {webinar.host_title && (
                                            <div className="text-white/50">{webinar.host_title}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="glass-card p-4">
                                        <div className="text-white/50 text-sm mb-1">📅 Date</div>
                                        <div className="text-white font-semibold">
                                            {formatDate(webinar.webinar_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="glass-card p-4">
                                        <div className="text-white/50 text-sm mb-1">⏰ Time</div>
                                        <div className="text-white font-semibold">{formatTime(webinar.start_time)} IST</div>
                                    </div>
                                    <div className="glass-card p-4">
                                        <div className="text-white/50 text-sm mb-1">⏱️ Duration</div>
                                        <div className="text-white font-semibold">{webinar.duration_minutes} minutes</div>
                                    </div>
                                    <div className="glass-card p-4">
                                        <div className="text-white/50 text-sm mb-1">📍 Platform</div>
                                        <div className="text-white font-semibold capitalize">
                                            {webinar.meeting_platform || 'Online'}
                                        </div>
                                    </div>
                                </div>

                                {/* What You'll Learn */}
                                {webinar.what_youll_learn && (webinar.what_youll_learn as string[]).length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-xl font-semibold text-white mb-4">What You'll Learn</h3>
                                        <ul className="space-y-3">
                                            {(webinar.what_youll_learn as string[]).map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-white/70">
                                                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Right - Sticky Card */}
                            <div className="lg:sticky lg:top-28">
                                <div className="glass-card overflow-hidden">
                                    {/* Image */}
                                    <div className="relative aspect-video bg-gradient-to-br from-indigo-600 to-purple-700">
                                        {(webinar.thumbnail_url || webinar.banner_url) ? (
                                            <img
                                                src={webinar.banner_url ?? webinar.thumbnail_url ?? ''}
                                                alt={webinar.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-20 h-20 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        {isUpcoming && (
                                            <div className="absolute top-4 left-4">
                                                <span className="badge badge-error px-3 py-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
                                                    LIVE
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Countdown */}
                                        {isUpcoming && (
                                            <div className="mb-6">
                                                <p className="text-white/50 text-sm text-center mb-3">Starts In</p>
                                                <CountdownTimer targetDate={webinarDateTime} />
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="text-center mb-6 pb-6 border-b border-white/10">
                                            {webinar.price === 0 ? (
                                                <div className="text-4xl font-bold text-green-400">FREE</div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center justify-center gap-3">
                                                        <span className="text-4xl font-bold text-white">
                                                            {formatCurrency(webinar.price)}
                                                        </span>
                                                        {webinar.original_price && webinar.original_price > webinar.price && (
                                                            <span className="text-xl text-white/40 line-through">
                                                                {formatCurrency(webinar.original_price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {webinar.original_price && webinar.original_price > webinar.price && (
                                                        <span className="badge badge-success mt-2">
                                                            Save {calculateDiscount(webinar.original_price, webinar.price)}%
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Slots */}
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-white/50">Available Slots</span>
                                            <span className="text-white font-semibold">
                                                {webinar.available_slots} / {webinar.total_slots}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                                style={{ width: `${((webinar.total_slots - webinar.available_slots) / webinar.total_slots) * 100}%` }}
                                            />
                                        </div>

                                        {/* Error */}
                                        {registerError && (
                                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                                                {registerError}
                                            </div>
                                        )}

                                        {/* CTA Button */}
                                        {isUpcoming && webinar.available_slots > 0 ? (
                                            <button
                                                onClick={handleRegister}
                                                disabled={registering}
                                                className="btn btn-primary btn-lg w-full"
                                            >
                                                {registering ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        {webinar.price === 0 ? 'Register for Free' : 'Book Your Spot'}
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        ) : webinar.available_slots === 0 ? (
                                            <button disabled className="btn btn-secondary btn-lg w-full opacity-50 cursor-not-allowed">
                                                Sold Out
                                            </button>
                                        ) : (
                                            <button disabled className="btn btn-secondary btn-lg w-full opacity-50 cursor-not-allowed">
                                                Event Ended
                                            </button>
                                        )}

                                        {/* Trust Badges */}
                                        <div className="flex items-center justify-center gap-4 mt-6 text-white/40 text-xs">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Secure Payment
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Money Back Guarantee
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
