'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useService } from '@/hooks/useServices'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const { service, loading } = useService(slug)
    const { user } = useAuth()
    const router = useRouter()
    const [purchasing, setPurchasing] = useState(false)

    const handlePurchase = () => {
        if (!user) {
            router.push(`/login?redirect=/service/${slug}/checkout`)
            return
        }
        router.push(`/service/${slug}/checkout`)
    }

    if (loading) {
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
                        <p className="text-white/60 mb-6">This service doesn't exist or is no longer available.</p>
                        <Link href="/#services" className="btn btn-primary">Browse Services</Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    const features = service.features || []
    const discount = service.original_price ? Math.round(((service.original_price - service.price) / service.original_price) * 100) : 0

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#0a0a0f] pt-20 pb-16">
                <div className="container mx-auto px-6 py-12">
                    {/* Breadcrumb */}
                    <nav className="mb-8">
                        <ol className="flex items-center gap-2 text-sm text-white/50">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li>/</li>
                            <li><Link href="/#services" className="hover:text-white transition-colors">Services</Link></li>
                            <li>/</li>
                            <li className="text-white">{service.name}</li>
                        </ol>
                    </nav>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header */}
                            <div>
                                {service.is_featured && (
                                    <span className="badge badge-primary mb-4">Featured</span>
                                )}
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    {service.name}
                                </h1>
                                <p className="text-lg text-white/70">
                                    {service.short_description}
                                </p>
                            </div>

                            {/* Image */}
                            {service.image_url && (
                                <div className="rounded-2xl overflow-hidden">
                                    <img
                                        src={service.image_url}
                                        alt={service.name}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}

                            {/* Description */}
                            <div className="glass-card p-8">
                                <h2 className="text-xl font-semibold text-white mb-4">About This Service</h2>
                                <div className="prose prose-invert max-w-none text-white/70">
                                    {service.description?.split('\n').map((para, i) => (
                                        <p key={i} className="mb-4">{para}</p>
                                    )) || <p>Detailed description coming soon.</p>}
                                </div>
                            </div>

                            {/* Features */}
                            {features.length > 0 && (
                                <div className="glass-card p-8">
                                    <h2 className="text-xl font-semibold text-white mb-6">What's Included</h2>
                                    <ul className="space-y-4">
                                        {features.map((feature: string, index: number) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-white/80">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Pricing Card */}
                        <div className="lg:col-span-1">
                            <div className="glass-card p-6 sticky top-28">
                                {/* Price */}
                                <div className="text-center mb-6">
                                    {discount > 0 && (
                                        <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium mb-3">
                                            {discount}% OFF
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-4xl font-bold text-white">
                                            {formatCurrency(service.price)}
                                        </span>
                                        {service.original_price && service.original_price > service.price && (
                                            <span className="text-xl text-white/40 line-through">
                                                {formatCurrency(service.original_price)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    className="btn btn-primary btn-lg w-full mb-4"
                                >
                                    {purchasing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Get Started
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                {/* Guarantee */}
                                <div className="flex items-center justify-center gap-2 text-white/50 text-sm mb-6">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Secure Payment
                                </div>

                                <div className="space-y-3 pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-white/70 text-sm">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Instant Access
                                    </div>
                                    <div className="flex items-center gap-2 text-white/70 text-sm">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Expert Support
                                    </div>
                                    <div className="flex items-center gap-2 text-white/70 text-sm">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Money-back Guarantee
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
