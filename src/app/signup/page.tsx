'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function SignupPage() {
    const router = useRouter()
    const { settings } = useSiteSettings()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validate passwords match
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.full_name,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed')
            }

            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0f0f1a]" />

            {/* Animated orbs */}
            <div className="glow-orb glow-orb-primary w-96 h-96 -top-48 -left-48 animate-pulse-glow" />
            <div className="glow-orb glow-orb-secondary w-80 h-80 -bottom-40 -right-40 animate-pulse-glow" />
            <div className="glow-orb glow-orb-accent w-64 h-64 top-1/2 right-0 animate-pulse-glow" />

            {/* Signup Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold text-white">
                        {settings?.site_name || 'WebinarPro'}
                    </span>
                </Link>

                {/* Card */}
                <div className="glass-card p-8">
                    {success ? (
                        // Success State
                        <div className="text-center py-8 animate-scale-in">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Check Your Email!</h2>
                            <p className="text-white/60 mb-6">
                                We've sent a confirmation link to<br />
                                <span className="text-white font-medium">{formData.email}</span>
                            </p>
                            <p className="text-white/40 text-sm mb-6">
                                Click the link in the email to verify your account and start learning!
                            </p>
                            <Link href="/login" className="btn btn-primary">
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        // Signup Form
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                                <p className="text-white/50">Start your learning journey today</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Full Name */}
                                <div className="form-group">
                                    <label htmlFor="full_name" className="form-label">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        required
                                        className="form-input"
                                        autoComplete="name"
                                    />
                                </div>

                                {/* Email */}
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        className="form-input"
                                        autoComplete="email"
                                    />
                                </div>

                                {/* Password */}
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="form-input"
                                        autoComplete="new-password"
                                    />
                                    <p className="text-white/30 text-xs mt-1">Minimum 6 characters</p>
                                </div>

                                {/* Confirm Password */}
                                <div className="form-group">
                                    <label htmlFor="confirm_password" className="form-label">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirm_password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="form-input"
                                        autoComplete="new-password"
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-slide-up">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                {/* Terms */}
                                <p className="text-white/30 text-xs text-center">
                                    By creating an account, you agree to our{' '}
                                    <Link href="/terms" className="text-indigo-400 hover:underline">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>
                                </p>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-[#0a0a0f]/50 text-white/40">or</span>
                                </div>
                            </div>

                            {/* Login Link */}
                            <p className="text-center text-white/50">
                                Already have an account?{' '}
                                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-white/40 hover:text-white/60 text-sm transition-colors inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
