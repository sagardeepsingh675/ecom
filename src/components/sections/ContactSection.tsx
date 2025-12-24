'use client'

import { useState } from 'react'
import { useContactForm } from '@/hooks/useContactForm'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function ContactSection() {
    const { settings } = useSiteSettings()
    const { submitForm, loading, success, error, reset } = useContactForm()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await submitForm(formData)
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        } catch {
            // Error is handled by the hook
        }
    }

    return (
        <section id="contact" className="section relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

            <div className="container mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column - Info */}
                    <div className="lg:sticky lg:top-32">
                        <span className="badge badge-primary mb-4">📬 Get In Touch</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Let's Start a <span className="gradient-text">Conversation</span>
                        </h2>
                        <p className="text-white/60 text-lg mb-8">
                            Have questions about our webinars or services? We're here to help!
                            Fill out the form and we'll get back to you within 24 hours.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-6 mb-8">
                            {settings?.email && (
                                <a
                                    href={`mailto:${settings.email}`}
                                    className="flex items-center gap-4 p-4 glass-card group hover:border-indigo-500/30"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-white/50 text-sm">Email us at</div>
                                        <div className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                                            {settings.email}
                                        </div>
                                    </div>
                                </a>
                            )}

                            {settings?.phone && (
                                <a
                                    href={`tel:${settings.phone}`}
                                    className="flex items-center gap-4 p-4 glass-card group hover:border-indigo-500/30"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-white/50 text-sm">Call us at</div>
                                        <div className="text-white font-medium group-hover:text-green-400 transition-colors">
                                            {settings.phone}
                                        </div>
                                    </div>
                                </a>
                            )}

                            {settings?.address && (
                                <div className="flex items-center gap-4 p-4 glass-card">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-white/50 text-sm">Visit us at</div>
                                        <div className="text-white font-medium">{settings.address}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Response Time */}
                        <div className="flex items-center gap-3 text-white/50 text-sm">
                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Average response time: <strong className="text-white">2 hours</strong></span>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="glass-card p-8">
                        {success ? (
                            <div className="text-center py-12 animate-scale-in">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                                <p className="text-white/60 mb-6">
                                    Thank you for reaching out. We'll get back to you within 24 hours.
                                </p>
                                <button onClick={reset} className="btn btn-primary">
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name & Email Row */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label htmlFor="name" className="form-label">
                                            Full Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">
                                            Email Address <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                {/* Phone & Subject Row */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="subject" className="form-label">
                                            Subject
                                        </label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="form-input"
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="Webinar Inquiry">Webinar Inquiry</option>
                                            <option value="Service Package">Service Package</option>
                                            <option value="Payment Issue">Payment Issue</option>
                                            <option value="Technical Support">Technical Support</option>
                                            <option value="Partnership">Partnership</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="form-group">
                                    <label htmlFor="message" className="form-label">
                                        Message <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us how we can help you..."
                                        required
                                        rows={5}
                                        className="form-input form-textarea"
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary btn-lg w-full"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
