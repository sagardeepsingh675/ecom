'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'

export default function NewWebinar() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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
        meeting_platform: 'zoom',
        status: 'draft',
        is_featured: false,
    })

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked :
                    type === 'number' ? Number(value) : value
            }

            // Auto-generate slug from title
            if (name === 'title') {
                newData.slug = generateSlug(value)
            }

            return newData
        })
        setError('')
    }

    const handleImageChange = (field: string) => (url: string) => {
        setFormData(prev => ({ ...prev, [field]: url }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const supabase = createClient()

            // Exclude duration_minutes as it's not in the database schema
            const { duration_minutes, ...dataToInsert } = formData

            const { error: insertError } = await supabase
                .from('webinars')
                .insert({
                    ...dataToInsert,
                    available_slots: formData.total_slots,
                })

            if (insertError) throw insertError

            router.push('/admin/webinars')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create webinar')
        } finally {
            setLoading(false)
        }
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
                <h2 className="text-2xl font-bold text-white mb-6">Create New Webinar</h2>

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
                                placeholder="e.g., Master Digital Marketing in 2024"
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
                                placeholder="master-digital-marketing-2024"
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
                            placeholder="Brief description for cards and previews"
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
                            placeholder="Detailed description of the webinar"
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
                                placeholder="e.g., John Doe"
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
                                placeholder="e.g., Digital Marketing Expert"
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

                    {/* Pricing */}
                    <div className="grid md:grid-cols-3 gap-6">
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
                            <p className="text-white/30 text-xs mt-1">Set 0 for free webinar</p>
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
                            <p className="text-white/30 text-xs mt-1">For showing discount</p>
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
                    </div>

                    {/* Other Options */}
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

                        <div className="form-group flex items-center pt-8">
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
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Webinar'
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
