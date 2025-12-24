'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'

export default function EditService({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        short_description: '',
        description: '',
        price: 0,
        original_price: 0,
        features: [] as string[],
        icon_url: '',
        image_url: '',
        is_active: true,
        is_featured: false,
        display_order: 0,
    })
    const [featureInput, setFeatureInput] = useState('')

    useEffect(() => {
        fetchService()
    }, [id])

    const fetchService = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error

            if (data) {
                setFormData({
                    name: data.name || '',
                    slug: data.slug || '',
                    short_description: data.short_description || '',
                    description: data.description || '',
                    price: data.price || 0,
                    original_price: data.original_price || 0,
                    features: data.features || [],
                    icon_url: data.icon_url || '',
                    image_url: data.image_url || '',
                    is_active: data.is_active ?? true,
                    is_featured: data.is_featured || false,
                    display_order: data.display_order || 0,
                })
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load service')
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

    const addFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }))
            setFeatureInput('')
        }
    }

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const supabase = createClient()

            const { error: updateError } = await supabase
                .from('services')
                .update({
                    ...formData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)

            if (updateError) throw updateError

            router.push('/admin/services')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update service')
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
                <Link href="/admin/services" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Services
                </Link>
            </div>

            <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Edit Service</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Service Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
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

                    {/* Service Images */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <ImageUpload
                            value={formData.icon_url}
                            onChange={handleImageChange('icon_url')}
                            folder="services"
                            label="Service Icon"
                            aspectRatio="square"
                        />

                        <ImageUpload
                            value={formData.image_url}
                            onChange={handleImageChange('image_url')}
                            folder="services"
                            label="Service Image"
                            aspectRatio="video"
                        />
                    </div>

                    {/* Features */}
                    <div className="form-group">
                        <label className="form-label">Features</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                className="form-input flex-1"
                                placeholder="Add a feature..."
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                className="btn btn-secondary"
                            >
                                Add
                            </button>
                        </div>
                        {formData.features.length > 0 && (
                            <ul className="space-y-2">
                                {formData.features.map((feature, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                        <span className="text-white/80 text-sm">{feature}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
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
                            <label className="form-label">Display Order</label>
                            <input
                                type="number"
                                name="display_order"
                                value={formData.display_order}
                                onChange={handleChange}
                                min="0"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex gap-8">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-white">Active</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={formData.is_featured}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-white">Featured</span>
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
                        <Link href="/admin/services" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
