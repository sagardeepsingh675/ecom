'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'

export default function EditWebinar({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        short_description: '',
        description: '',
        webinar_date: '',
        start_time: '10:00',
        duration_minutes: 60,
        host_name: '',
        host_title: '',
        host_image_url: '',
        thumbnail_url: '',
        banner_url: '',
        price: 0,
        original_price: 0,
        total_slots: 100,
        available_slots: 100,
        meeting_platform: 'zoom',
        meeting_link: '',
        status: 'draft',
        is_featured: false,
    })

    useEffect(() => {
        fetchWebinar()
    }, [id])

    const fetchWebinar = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('webinars')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error

            if (data) {
                setFormData({
                    title: data.title || '',
                    slug: data.slug || '',
                    short_description: data.short_description || '',
                    description: data.description || '',
                    webinar_date: data.webinar_date || '',
                    start_time: data.start_time || '10:00',
                    duration_minutes: data.duration_minutes || 60,
                    host_name: data.host_name || '',
                    host_title: data.host_title || '',
                    host_image_url: data.host_image_url || '',
                    thumbnail_url: data.thumbnail_url || '',
                    banner_url: data.banner_url || '',
                    price: data.price || 0,
                    original_price: data.original_price || 0,
                    total_slots: data.total_slots || 100,
                    available_slots: data.available_slots || 100,
                    meeting_platform: data.meeting_platform || 'zoom',
                    meeting_link: data.meeting_link || '',
                    status: data.status || 'draft',
                    is_featured: data.is_featured || false,
                })
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load webinar')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? Number(value) : value
        }))
        setError('')
    }

    const handleImageChange = (field: string) => (url: string) => {
        setFormData(prev => ({ ...prev, [field]: url }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const supabase = createClient()

            // Exclude duration_minutes as it's not in the database schema
            const { duration_minutes, ...dataToUpdate } = formData

            const { error: updateError } = await supabase
                .from('webinars')
                .update({
                    ...dataToUpdate,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)

            if (updateError) throw updateError

            router.push('/admin/webinars')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update webinar')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <Link href="/admin/webinars" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Webinars
                </Link>
            </div>

            <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Edit Webinar</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="form-group md:col-span-2">
                            <label className="form-label">Webinar Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">URL Slug *</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Short Description</label>
                        <input
                            type="text"
                            name="short_description"
                            value={formData.short_description}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="form-input resize-none"
                        />
                    </div>

                    {/* Schedule */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input
                                type="date"
                                name="webinar_date"
                                value={formData.webinar_date}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Start Time *</label>
                            <input
                                type="time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Duration (minutes)</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                min="15"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Host Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Host Name *</label>
                            <input
                                type="text"
                                name="host_name"
                                value={formData.host_name}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Host Title</label>
                            <input
                                type="text"
                                name="host_title"
                                value={formData.host_title}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Host Image Upload */}
                    <ImageUpload
                        value={formData.host_image_url}
                        onChange={handleImageChange('host_image_url')}
                        folder="hosts"
                        label="Host Image"
                        aspectRatio="square"
                    />

                    {/* Webinar Images */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <ImageUpload
                            value={formData.thumbnail_url}
                            onChange={handleImageChange('thumbnail_url')}
                            folder="webinars"
                            label="Thumbnail Image"
                            aspectRatio="video"
                        />

                        <ImageUpload
                            value={formData.banner_url}
                            onChange={handleImageChange('banner_url')}
                            folder="webinars"
                            label="Banner Image"
                            aspectRatio="video"
                        />
                    </div>

                    {/* Pricing & Slots */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="form-group">
                            <label className="form-label">Price (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Original Price (₹)</label>
                            <input
                                type="number"
                                name="original_price"
                                value={formData.original_price}
                                onChange={handleChange}
                                min="0"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Total Slots</label>
                            <input
                                type="number"
                                name="total_slots"
                                value={formData.total_slots}
                                onChange={handleChange}
                                min="1"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Available Slots</label>
                            <input
                                type="number"
                                name="available_slots"
                                value={formData.available_slots}
                                onChange={handleChange}
                                min="0"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Meeting Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Meeting Platform</label>
                            <select
                                name="meeting_platform"
                                value={formData.meeting_platform}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="zoom">Zoom</option>
                                <option value="google_meet">Google Meet</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Meeting Link</label>
                            <input
                                type="url"
                                name="meeting_link"
                                value={formData.meeting_link}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Featured */}
                    <div className="form-group">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={formData.is_featured}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-white">Feature this webinar on homepage</span>
                        </label>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
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
                                'Save Changes'
                            )}
                        </button>
                        <Link href="/admin/webinars" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
