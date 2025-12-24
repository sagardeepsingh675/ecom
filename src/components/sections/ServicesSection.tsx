'use client'

import Link from 'next/link'
import { useFeaturedServices } from '@/hooks/useServices'
import { formatCurrency, calculateDiscount } from '@/lib/utils'

export default function ServicesSection() {
    const { services, loading, error } = useFeaturedServices()

    return (
        <section id="services" className="section relative bg-[#0a0a0f]">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="badge badge-primary mb-4">🚀 Our Services</span>
                    <h2 className="section-title">
                        Accelerate Your <span className="gradient-text">Growth</span>
                    </h2>
                    <p className="section-subtitle">
                        Comprehensive packages designed to boost your sales and transform your business
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                )}

                {/* Services Grid */}
                {!loading && !error && services.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className={`glass-card p-8 relative group animate-slide-up ${index === 1 ? 'lg:scale-105 lg:z-10 border-indigo-500/30' : ''
                                    }`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Popular Badge */}
                                {index === 1 && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="badge badge-primary px-4 py-1.5">
                                            ⭐ Most Popular
                                        </span>
                                    </div>
                                )}

                                {/* Service Header */}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
                                    <p className="text-white/50 text-sm">{service.short_description}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white">
                                            {formatCurrency(service.price)}
                                        </span>
                                        {service.original_price && service.original_price > service.price && (
                                            <span className="text-lg text-white/40 line-through">
                                                {formatCurrency(service.original_price)}
                                            </span>
                                        )}
                                    </div>
                                    {service.original_price && service.original_price > service.price && (
                                        <span className="text-sm text-green-400">
                                            Save {formatCurrency(service.original_price - service.price)} ({calculateDiscount(service.original_price, service.price)}% off)
                                        </span>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {(service.features as string[]).map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-white/70">
                                            <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Link
                                    href={`/service/${service.slug}`}
                                    className={`btn w-full ${index === 1 ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    Get Started
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {/* Custom Package CTA */}
                <div className="mt-16 text-center glass-card p-8 max-w-2xl mx-auto animate-fade-in">
                    <h3 className="text-2xl font-bold text-white mb-3">Need a Custom Solution?</h3>
                    <p className="text-white/50 mb-6">
                        Let us create a tailored package that perfectly fits your business needs and goals.
                    </p>
                    <Link href="#contact" className="btn btn-outline">
                        Contact Us
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    )
}
