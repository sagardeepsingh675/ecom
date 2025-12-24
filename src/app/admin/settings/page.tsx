'use client'

import { useEffect, useState, useRef } from 'react'

interface SiteSettings {
    id?: string
    site_name: string
    site_description: string
    logo_url: string | null
    favicon_url: string | null
    email: string
    phone: string
    address: string
    facebook_url: string | null
    twitter_url: string | null
    instagram_url: string | null
    linkedin_url: string | null
    youtube_url: string | null
    // GST/Tax Settings
    company_name: string
    gst_enabled: boolean
    gst_number: string
    gst_rate: number
}

const defaultSettings: SiteSettings = {
    site_name: 'WebinarPro',
    site_description: '',
    logo_url: null,
    favicon_url: null,
    email: '',
    phone: '',
    address: '',
    facebook_url: null,
    twitter_url: null,
    instagram_url: null,
    linkedin_url: null,
    youtube_url: null,
    // GST defaults
    company_name: '',
    gst_enabled: false,
    gst_number: '',
    gst_rate: 18,
}

// Simple inline image upload component
function SimpleImageUpload({
    value,
    onChange,
    label,
    hint
}: {
    value: string | null
    onChange: (url: string | null) => void
    label: string
    hint: string
}) {
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        if (!file) return
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'branding')

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            if (res.ok && data.url) {
                onChange(data.url)
            }
        } catch (err) {
            console.error('Upload error:', err)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <label className="form-label mb-2 block">{label}</label>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />

            {value ? (
                <div className="relative w-full h-24 rounded-lg border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                    <img src={value} alt={label} className="max-h-full max-w-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="p-2 rounded bg-white/20 hover:bg-white/30 text-white text-xs"
                        >
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="p-2 rounded bg-red-500/50 hover:bg-red-500/70 text-white text-xs"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-24 rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center gap-1 transition-colors"
                >
                    {uploading ? (
                        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    ) : (
                        <>
                            <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-white/50 text-xs">Click to upload</span>
                        </>
                    )}
                </button>
            )}
            <p className="text-xs text-white/40 mt-1">{hint}</p>
        </div>
    )
}

export default function AdminSettings() {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings')
                const data = await res.json()

                if (data.settings) {
                    setSettings({ ...defaultSettings, ...data.settings })
                }
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({
            ...settings,
            [e.target.name]: e.target.value || null
        })
        setSuccess(false)
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setSaving(true)
        setError('')
        setSuccess(false)

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save settings')
            }

            if (data.settings) {
                setSettings({ ...defaultSettings, ...data.settings })
            }
            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Site Settings</h2>
                <p className="text-white/50">Configure your website settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Settings */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">General</h3>
                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">Site Name</label>
                            <input
                                type="text"
                                name="site_name"
                                value={settings.site_name || ''}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Site Description</label>
                            <textarea
                                name="site_description"
                                value={settings.site_description || ''}
                                onChange={handleChange}
                                rows={2}
                                className="form-input resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Branding</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <SimpleImageUpload
                            value={settings.logo_url}
                            onChange={(url) => setSettings({ ...settings, logo_url: url })}
                            label="Logo"
                            hint="Recommended: 200x50px, PNG or SVG"
                        />
                        <SimpleImageUpload
                            value={settings.favicon_url}
                            onChange={(url) => setSettings({ ...settings, favicon_url: url })}
                            label="Favicon"
                            hint="Recommended: 32x32px, PNG or ICO"
                        />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={settings.email || ''}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={settings.phone || ''}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group md:col-span-2">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={settings.address || ''}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                {/* GST / Tax Settings */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Tax / GST Settings</h3>
                            <p className="text-white/50 text-sm">Configure GST for invoices (prices are inclusive of tax)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.gst_enabled}
                                onChange={(e) => {
                                    setSettings({ ...settings, gst_enabled: e.target.checked })
                                    setSuccess(false)
                                    setError('')
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>

                    {settings.gst_enabled && (
                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                            <div className="form-group md:col-span-2">
                                <label className="form-label">Company/Business Name</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={settings.company_name || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Your registered business name"
                                />
                                <p className="text-xs text-white/40 mt-1">This will appear on invoices</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">GST Number (GSTIN)</label>
                                <input
                                    type="text"
                                    name="gst_number"
                                    value={settings.gst_number || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 22AAAAA0000A1Z5"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    name="gst_rate"
                                    value={settings.gst_rate || 18}
                                    onChange={(e) => {
                                        setSettings({ ...settings, gst_rate: parseFloat(e.target.value) || 0 })
                                        setSuccess(false)
                                        setError('')
                                    }}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="form-input"
                                />
                                <p className="text-xs text-white/40 mt-1">Standard GST rate is 18%</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Social Links */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Social Media Links</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Facebook</label>
                            <input
                                type="url"
                                name="facebook_url"
                                value={settings.facebook_url || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Twitter</label>
                            <input
                                type="url"
                                name="twitter_url"
                                value={settings.twitter_url || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://twitter.com/..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instagram</label>
                            <input
                                type="url"
                                name="instagram_url"
                                value={settings.instagram_url || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">LinkedIn</label>
                            <input
                                type="url"
                                name="linkedin_url"
                                value={settings.linkedin_url || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://linkedin.com/..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">YouTube</label>
                            <input
                                type="url"
                                name="youtube_url"
                                value={settings.youtube_url || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Settings saved successfully!
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Settings'
                    )}
                </button>
            </form>
        </div>
    )
}
