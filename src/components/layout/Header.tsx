'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const { settings } = useSiteSettings()
    const { user, loading, signOut } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSignOut = async () => {
        await signOut()
        setDropdownOpen(false)
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5'
                : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        {settings?.logo_url ? (
                            <img
                                src={settings.logo_url}
                                alt={settings.site_name || 'Logo'}
                                className="h-10 w-10 object-contain rounded-xl"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        <span className="text-xl font-bold text-white">
                            {settings?.site_name || 'WebinarPro'}
                        </span>
                    </Link>


                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/#webinars" className="text-white/70 hover:text-white transition-colors">
                            Webinars
                        </Link>
                        <Link href="/#services" className="text-white/70 hover:text-white transition-colors">
                            Services
                        </Link>
                        <Link href="/#testimonials" className="text-white/70 hover:text-white transition-colors">
                            Testimonials
                        </Link>
                        <Link href="/faq" className="text-white/70 hover:text-white transition-colors">
                            FAQ
                        </Link>
                        <Link href="/#contact" className="text-white/70 hover:text-white transition-colors">
                            Contact
                        </Link>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {loading ? (
                            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        ) : user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-white/80 text-sm max-w-[120px] truncate">
                                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                    </span>
                                    <svg className={`w-4 h-4 text-white/50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-xl z-20">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/dashboard/webinars"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                My Webinars
                                            </Link>
                                            <Link
                                                href="/dashboard/profile"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </Link>
                                            <div className="my-1 border-t border-white/10" />
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="text-white/70 hover:text-white transition-colors font-medium">
                                    Log in
                                </Link>
                                <Link href="/signup" className="btn btn-primary btn-sm">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10 animate-slide-up">
                        <nav className="flex flex-col gap-4">
                            <Link href="/#webinars" className="text-white/70 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                                Webinars
                            </Link>
                            <Link href="/#services" className="text-white/70 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                                Services
                            </Link>
                            <Link href="/#testimonials" className="text-white/70 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                                Testimonials
                            </Link>
                            <Link href="/faq" className="text-white/70 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                                FAQ
                            </Link>
                            <Link href="/#contact" className="text-white/70 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                                Contact
                            </Link>

                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                {user ? (
                                    <>
                                        <Link href="/dashboard" className="btn btn-secondary flex-1" onClick={() => setMobileMenuOpen(false)}>
                                            Dashboard
                                        </Link>
                                        <button onClick={handleSignOut} className="btn btn-primary flex-1">
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="btn btn-secondary flex-1" onClick={() => setMobileMenuOpen(false)}>
                                            Log in
                                        </Link>
                                        <Link href="/signup" className="btn btn-primary flex-1" onClick={() => setMobileMenuOpen(false)}>
                                            Sign up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
