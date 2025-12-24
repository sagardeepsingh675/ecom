'use client'

import Link from 'next/link'
import { useWebinars } from '@/hooks/useWebinars'
import { formatDate, formatTime, formatCurrency, calculateDiscount } from '@/lib/utils'

export default function WebinarsSection() {
    const { webinars, loading, error } = useWebinars()

    return (
        <section id="webinars" className="section relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="badge badge-primary mb-4">📚 Upcoming Webinars</span>
                    <h2 className="section-title">
                        Learn From The <span className="gradient-text">Best</span>
                    </h2>
                    <p className="section-subtitle">
                        Join our upcoming live sessions and transform your skills with expert guidance
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-400">Failed to load webinars. Please try again later.</p>
                    </div>
                )}

                {/* Webinars Grid */}
                {!loading && !error && webinars.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {webinars.map((webinar, index) => (
                            <div
                                key={webinar.id}
                                className="glass-card overflow-hidden group animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Image/Banner */}
                                <div className="relative h-48 bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden">
                                    {webinar.thumbnail_url ? (
                                        <img
                                            src={webinar.thumbnail_url}
                                            alt={webinar.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {webinar.is_featured && (
                                            <span className="badge badge-warning text-xs">🔥 Featured</span>
                                        )}
                                        {webinar.available_slots <= 10 && webinar.available_slots > 0 && (
                                            <span className="badge badge-error text-xs">Few Spots Left!</span>
                                        )}
                                    </div>

                                    {/* Discount Badge */}
                                    {webinar.original_price && webinar.original_price > webinar.price && (
                                        <div className="absolute top-4 right-4">
                                            <span className="badge badge-success text-xs">
                                                {calculateDiscount(webinar.original_price, webinar.price)}% OFF
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Date & Time */}
                                    <div className="flex items-center gap-4 mb-3 text-sm">
                                        <div className="flex items-center gap-1.5 text-white/60">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {formatDate(webinar.webinar_date, { month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-white/60">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formatTime(webinar.start_time)}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                        {webinar.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-white/50 text-sm mb-4 line-clamp-2">
                                        {webinar.short_description}
                                    </p>

                                    {/* Host */}
                                    {webinar.host_name && (
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                {webinar.host_name.charAt(0)}
                                            </div>
                                            <div className="text-sm">
                                                <div className="text-white font-medium">{webinar.host_name}</div>
                                                {webinar.host_title && (
                                                    <div className="text-white/40 text-xs">{webinar.host_title}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div>
                                            {webinar.price === 0 ? (
                                                <span className="text-2xl font-bold text-green-400">FREE</span>
                                            ) : (
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-white">
                                                        {formatCurrency(webinar.price)}
                                                    </span>
                                                    {webinar.original_price && webinar.original_price > webinar.price && (
                                                        <span className="text-sm text-white/40 line-through">
                                                            {formatCurrency(webinar.original_price)}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="text-xs text-white/40 mt-1">
                                                {webinar.available_slots} slots available
                                            </div>
                                        </div>
                                        <Link
                                            href={`/webinar/${webinar.slug}`}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && webinars.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Webinars</h3>
                        <p className="text-white/50">Check back soon for new learning opportunities!</p>
                    </div>
                )}

                {/* View All Button */}
                {webinars.length > 3 && (
                    <div className="text-center mt-12">
                        <Link href="/webinars" className="btn btn-secondary">
                            View All Webinars
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
