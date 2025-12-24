'use client'

import Link from 'next/link'
import { useFeaturedWebinar } from '@/hooks/useWebinars'
import { formatDate, formatTime, formatCurrency, calculateDiscount } from '@/lib/utils'
import CountdownTimer from '@/components/ui/CountdownTimer'

export default function HeroSection() {
    const { webinar, loading } = useFeaturedWebinar()

    // Calculate webinar date for countdown
    const webinarDateTime = webinar
        ? new Date(`${webinar.webinar_date}T${webinar.start_time}`)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
            {/* Background gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0f0f1a]" />

            {/* Animated orbs */}
            <div className="glow-orb glow-orb-primary w-96 h-96 -top-48 -left-48 animate-pulse-glow" />
            <div className="glow-orb glow-orb-secondary w-80 h-80 top-1/4 -right-40 animate-pulse-glow" style={{ animationDelay: '1s' }} />
            <div className="glow-orb glow-orb-accent w-64 h-64 bottom-20 left-1/4 animate-pulse-glow" style={{ animationDelay: '2s' }} />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
            }} />

            <div className="container mx-auto px-6 relative z-10 py-8">
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                )}

                {/* Main Content - Single Webinar Focus */}
                {!loading && webinar && (
                    <>
                        {/* Trust Badges - Above the fold */}
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8 animate-fade-in">
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>10,000+ Students Trained</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span>4.9/5 Average Rating</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Live & Interactive</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>100% Money Back Guarantee</span>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                            {/* Left Column - Content */}
                            <div className="text-center lg:text-left">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 badge badge-primary mb-4 animate-slide-up">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Only {webinar.available_slots} Slots Left!
                                </div>

                                {/* Main Heading */}
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 animate-slide-up delay-100">
                                    <span className="text-white">{webinar.title}</span>
                                </h1>

                                {/* Description */}
                                <p className="text-base md:text-lg text-white/60 mb-6 animate-slide-up delay-200">
                                    {webinar.short_description || webinar.description}
                                </p>

                                {/* Countdown Timer - Prominent placement */}
                                <div className="mb-6 animate-slide-up delay-300">
                                    <p className="text-white/50 text-xs uppercase tracking-wider mb-3">
                                        ⏰ Webinar Starts In
                                    </p>
                                    <CountdownTimer targetDate={webinarDateTime} />
                                </div>

                                {/* Host Info */}
                                <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start animate-slide-up delay-400">
                                    <div className="relative">
                                        {webinar.host_image_url ? (
                                            <img
                                                src={webinar.host_image_url}
                                                alt={webinar.host_name || 'Host'}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-2 border-indigo-500">
                                                {webinar.host_name?.charAt(0) || 'H'}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-[#0a0a0f] flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-white font-semibold">{webinar.host_name}</div>
                                        {webinar.host_title && (
                                            <div className="text-white/50 text-sm">{webinar.host_title}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Pricing & CTA */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-slide-up delay-500">
                                    {webinar.original_price && webinar.original_price > webinar.price && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl text-white/40 line-through">
                                                {formatCurrency(webinar.original_price)}
                                            </span>
                                            <span className="badge badge-success">
                                                {calculateDiscount(webinar.original_price, webinar.price)}% OFF
                                            </span>
                                        </div>
                                    )}
                                    <Link
                                        href={`/webinar/${webinar.slug}`}
                                        className="btn btn-primary btn-lg"
                                    >
                                        Reserve Your Spot - {webinar.price === 0 ? 'FREE' : formatCurrency(webinar.price)}
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column - Webinar Image & Details */}
                            <div className="relative animate-scale-in delay-200">
                                {/* Main Webinar Image */}
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                    {(webinar.thumbnail_url || webinar.banner_url) ? (
                                        <img
                                            src={webinar.banner_url ?? webinar.thumbnail_url ?? ''}
                                            alt={webinar.title}
                                            className="w-full aspect-video object-cover"
                                        />
                                    ) : (
                                        <div className="w-full aspect-video bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
                                            <div className="text-center text-white p-8">
                                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <div className="text-lg font-bold opacity-70">Live Webinar</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Live Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="badge badge-error px-3 py-1.5 text-xs">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
                                            UPCOMING LIVE
                                        </span>
                                    </div>

                                    {/* Platform Badge */}
                                    {webinar.meeting_platform && (
                                        <div className="absolute top-3 right-3">
                                            <span className="badge badge-primary px-3 py-1.5 text-xs">
                                                {webinar.meeting_platform === 'zoom' ? '📹 Zoom' : '🎥 Google Meet'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Info Cards - Below image */}
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    <div className="text-center p-3 glass-card">
                                        <div className="text-lg mb-0.5">📅</div>
                                        <div className="text-xs text-white/50">Date</div>
                                        <div className="font-semibold text-white text-xs">
                                            {formatDate(webinar.webinar_date, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="text-center p-3 glass-card">
                                        <div className="text-lg mb-0.5">⏰</div>
                                        <div className="text-xs text-white/50">Time</div>
                                        <div className="font-semibold text-white text-xs">{formatTime(webinar.start_time)}</div>
                                    </div>
                                    <div className="text-center p-3 glass-card">
                                        <div className="text-lg mb-0.5">🎟️</div>
                                        <div className="text-xs text-white/50">Slots</div>
                                        <div className="font-semibold text-green-400 text-xs">{webinar.available_slots} left</div>
                                    </div>
                                    <div className="text-center p-3 glass-card">
                                        <div className="text-lg mb-0.5">💰</div>
                                        <div className="text-xs text-white/50">Price</div>
                                        <div className="font-bold text-white text-xs">
                                            {webinar.price === 0 ? (
                                                <span className="text-green-400">FREE</span>
                                            ) : (
                                                formatCurrency(webinar.price)
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Decorative Elements */}
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl" />
                                <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20 blur-2xl" />
                            </div>
                        </div>
                    </>
                )}

                {/* No Webinar State */}
                {!loading && !webinar && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Coming Soon!</h2>
                        <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
                            We're preparing an amazing webinar for you. Stay tuned!
                        </p>
                        <Link href="#contact" className="btn btn-primary">
                            Get Notified
                        </Link>
                    </div>
                )}
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-float">
                <a href="#services" className="flex flex-col items-center gap-1 text-white/40 hover:text-white/60 transition-colors">
                    <span className="text-xs uppercase tracking-wider">Explore More</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </a>
            </div>
        </section>
    )
}
