'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        full_name: user?.user_metadata?.full_name || '',
        phone: user?.user_metadata?.phone || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError('')
        setSuccess(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            const supabase = createClient()

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.full_name,
                    phone: formData.phone,
                }
            })

            if (updateError) throw updateError

            // Also update users table
            if (user) {
                await supabase
                    .from('users')
                    .update({
                        full_name: formData.full_name,
                        phone: formData.phone,
                    })
                    .eq('id', user.id)
            }

            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl">
            <div className="glass-card p-8">
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                        {formData.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">{formData.full_name || 'User'}</h2>
                        <p className="text-white/50">{user?.email}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="form-input opacity-50 cursor-not-allowed"
                        />
                        <p className="text-white/30 text-xs mt-1">Email cannot be changed</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="full_name" className="form-label">Full Name</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
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

                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Profile updated successfully!
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Save Changes
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Account Info */}
            <div className="glass-card p-6 mt-6">
                <h3 className="font-semibold text-white mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-white/50">Account created</span>
                        <span className="text-white">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : '-'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/50">Last sign in</span>
                        <span className="text-white">
                            {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : '-'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
